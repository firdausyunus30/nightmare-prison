import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();
const db = getDatabase();

const ROLES = ['werewolf', 'fortune_teller', 'knight', 'shaman', 'psycho', 'citizen'];
const now = () => Date.now();
const assertAuth = request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  return request.auth.uid;
};
const roomPath = roomId => `rooms/${roomId}`;
const privatePath = roomId => `privateRooms/${roomId}/players`;
const randomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const shuffled = items => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[next]] = [copy[next], copy[index]];
  }
  return copy;
};

function rolesFor(count, options) {
  const selected = [];
  for (const role of ROLES) {
    const amount = Math.max(0, Number(options.roles?.[role]) || 0);
    for (let index = 0; index < amount && selected.length < count; index += 1) selected.push(role);
  }
  while (selected.length < count) selected.push('citizen');
  return shuffled(selected);
}

function validateOptions(options = {}) {
  const min = Number(options.minPlayers) || 3;
  const max = Number(options.maxPlayers) || 10;
  const wolves = Number(options.roles?.werewolf) || 0;
  const total = Object.values(options.roles || {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  if (min < 3 || max > 15 || min > max || wolves < 1 || wolves >= min / 2 || total > min) {
    throw new HttpsError('invalid-argument', 'Invalid game configuration.');
  }
}

export const createRoom = onCall(async request => {
  const uid = assertAuth(request);
  const name = String(request.data?.name || '').trim().slice(0, 12);
  if (!name) throw new HttpsError('invalid-argument', 'Nickname is required.');
  validateOptions(request.data?.gameOptions);
  let roomId = randomCode();
  while ((await db.ref(roomPath(roomId)).get()).exists()) roomId = randomCode();
  await db.ref(roomPath(roomId)).set({
    hostId: uid, status: 'lobby', phase: 'night', dayNumber: 1, timerEnd: 0, story: '', winner: null,
    gameOptions: request.data.gameOptions,
    players: { [uid]: { id: uid, name, alive: true, disconnected: false, isHost: true, lobbyReady: true } }
  });
  return { roomId };
});

export const joinRoom = onCall(async request => {
  const uid = assertAuth(request);
  const roomId = String(request.data?.roomId || '').toUpperCase();
  const name = String(request.data?.name || '').trim().slice(0, 12);
  const snap = await db.ref(roomPath(roomId)).get();
  if (!snap.exists()) throw new HttpsError('not-found', 'Room not found.');
  const room = snap.val();
  if (room.status !== 'lobby' && !room.players?.[uid]) throw new HttpsError('failed-precondition', 'Game already started.');
  if (room.players?.[uid]) {
    await db.ref(`${roomPath(roomId)}/players/${uid}/disconnected`).set(false);
    return { roomId };
  }
  if (!name) throw new HttpsError('invalid-argument', 'Nickname is required.');
  if (Object.keys(room.players || {}).length >= room.gameOptions.maxPlayers) throw new HttpsError('resource-exhausted', 'Room is full.');
  if (Object.values(room.players || {}).some(player => player.name.toLowerCase() === name.toLowerCase() && !player.disconnected)) throw new HttpsError('already-exists', 'Nickname is already in use.');
  await db.ref(`${roomPath(roomId)}/players/${uid}`).set({ id: uid, name, alive: true, disconnected: false, isHost: false, lobbyReady: false });
  return { roomId };
});

export const startGame = onCall(async request => {
  const uid = assertAuth(request);
  const roomId = String(request.data?.roomId || '').toUpperCase();
  const roomSnap = await db.ref(roomPath(roomId)).get();
  const room = roomSnap.val();
  if (!room || room.hostId !== uid || room.status !== 'lobby') throw new HttpsError('permission-denied', 'Only the host can start this lobby.');
  const players = room.players || {};
  const connected = Object.values(players).filter(player => !player.disconnected);
  if (connected.length < room.gameOptions.minPlayers || connected.some(player => !player.lobbyReady)) throw new HttpsError('failed-precondition', 'Not all players are ready.');
  const assigned = rolesFor(connected.length, room.gameOptions);
  const privatePlayers = {};
  const wolves = connected.filter((_, index) => assigned[index] === 'werewolf').map(player => player.id);
  connected.forEach((player, index) => {
    privatePlayers[player.id] = { role: assigned[index], actionTarget: null, vote: null, lastProtectedId: null, investigations: {}, wolfTeammateIds: assigned[index] === 'werewolf' ? wolves.filter(id => id !== player.id) : [] };
  });
  const publicPlayers = Object.fromEntries(Object.entries(players).map(([id, player]) => [id, { ...player, alive: true, lobbyReady: false }]));
  await db.ref().update({
    [`${roomPath(roomId)}/players`]: publicPlayers, [`${roomPath(roomId)}/status`]: 'role_reveal',
    [`${roomPath(roomId)}/timerEnd`]: now() + (room.gameOptions.roleRevealSeconds || 15) * 1000,
    [`${roomPath(roomId)}/story`]: '', [`${roomPath(roomId)}/winner`]: null, [`${roomPath(roomId)}/chat`]: null,
    [privatePath(roomId)]: privatePlayers
  });
  return { ok: true };
});
