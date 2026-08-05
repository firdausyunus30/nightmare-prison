import React, { useState, useEffect, useRef } from 'react';
import { getDbRef, isFirebaseConfigured } from './firebase';
import { set, get, update, push, remove, onValue, onDisconnect } from 'firebase/database';
import { getRoleDistribution, resolveNightPhase, resolveVotingPhase, checkWinner, validateGameOptions } from './utils/gameLogic';
import { startNightAmbience, startDayAmbience, startLobbyAmbience, stopAllAmbience, playWolfHowl, playVoteSting, playDeathSound } from './utils/useAudio';

import LandingPage from './components/LandingPage';
import LobbyScreen from './components/LobbyScreen';
import RoleReveal from './components/RoleReveal';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

// Get or create unique player ID
let playerId = sessionStorage.getItem('nightmare_prison_player_id');
if (!playerId) {
  playerId = 'p_' + Math.random().toString(36).substring(2, 9);
  sessionStorage.setItem('nightmare_prison_player_id', playerId);
}

export default function App() {
  const [dbConfigured] = useState(isFirebaseConfigured());
  const [roomCode, setRoomCode] = useState(() => sessionStorage.getItem('nightmare_prison_room_code') || '');
  const [nickname, setNickname] = useState(() => sessionStorage.getItem('nightmare_prison_nickname') || '');
  const [room, setRoom] = useState(null);
  const lastPhaseRef = useRef(null);
  const lastStatusRef = useRef(null);
  const transitionInFlightRef = useRef(false);

  // Auto-subscribe to room changes if roomCode is stored on load
  useEffect(() => {
    if (!dbConfigured || !roomCode) return;

    const roomRef = getDbRef(`rooms/${roomCode}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoom(data);
        
        // Setup disconnect hooks if we are in this room
        if (data.players?.[playerId]) {
          const playerDcRef = getDbRef(`rooms/${roomCode}/players/${playerId}/disconnected`);
          onDisconnect(playerDcRef).set(true);
        }
      } else {
        // Room was disbanded
        handleExitRoom();
      }
    }, (err) => {
      console.error("Firebase Room Listener Error:", err);
      console.error("Lost connection to room.");
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, dbConfigured]);

  // Audio: react to phase/status transitions
  useEffect(() => {
    if (!room) return;
    const newPhase = room.phase;
    const newStatus = room.status;

    if (newStatus === 'lobby' && lastStatusRef.current !== 'lobby') {
      startLobbyAmbience();
    } else if (newStatus === 'role_reveal' && lastStatusRef.current !== 'role_reveal') {
      stopAllAmbience();
    } else if (newStatus === 'playing') {
      if (newPhase === 'night' && lastPhaseRef.current !== 'night') {
        startNightAmbience();
        setTimeout(() => playWolfHowl(), 1500);
      } else if (newPhase === 'day' && lastPhaseRef.current !== 'day') {
        startDayAmbience();
      } else if (newPhase === 'voting' && lastPhaseRef.current !== 'voting') {
        playVoteSting();
      }
    } else if (newStatus === 'game_over' && lastStatusRef.current !== 'game_over') {
      stopAllAmbience();
      setTimeout(() => playDeathSound(), 400);
    }

    lastPhaseRef.current = newPhase;
    lastStatusRef.current = newStatus;
  }, [room?.phase, room?.status]);

  // Host creates a room
  const handleCreateRoom = async (name, gameOptions) => {
    if (!dbConfigured) return;
    
    // Generate room code (5 letters, uppercase)
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    const roomRef = getDbRef(`rooms/${code}`);
    const hostData = {
      id: playerId,
      name,
      alive: true,
      isHost: true,
      disconnected: false,
      role: null,
      actionTarget: null,
      vote: null
    };

    try {
      await set(roomRef, {
        hostId: playerId,
        status: 'lobby', // 'lobby' | 'role_reveal' | 'playing' | 'game_over'
        phase: 'night',
        dayNumber: 1,
        timerEnd: 0,
        story: '',
      winner: null,
      gameOptions,
        players: {
          [playerId]: hostData
        }
      });

      // Save credentials locally
      setNickname(name);
      setRoomCode(code);
      sessionStorage.setItem('nightmare_prison_nickname', name);
      sessionStorage.setItem('nightmare_prison_room_code', code);
    } catch (err) {
      console.error(err);
      throw new Error("Failed to write to database. Check database security rules.");
    }
  };

  // Join an existing room
  const handleJoinRoom = async (name, code) => {
    if (!dbConfigured) return;

    const roomRef = getDbRef(`rooms/${code}`);
    
    try {
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        throw new Error("Cell block not found. Double check your code.");
      }
      
      const roomData = snapshot.val();
      
      // If game has started, only allow reconnection
      if (roomData.status !== 'lobby') {
        if (roomData.players && roomData.players[playerId]) {
          // Reconnecting!
          await update(getDbRef(`rooms/${code}/players/${playerId}`), {
            disconnected: false
          });
          setNickname(roomData.players[playerId].name);
          setRoomCode(code);
          sessionStorage.setItem('nightmare_prison_nickname', roomData.players[playerId].name);
          sessionStorage.setItem('nightmare_prison_room_code', code);
          return;
        } else {
          throw new Error("Prison lockdown in progress. You cannot join mid-sentence.");
        }
      }

      const maxPlayers = roomData.gameOptions?.maxPlayers || 10;
      if (Object.keys(roomData.players || {}).length >= maxPlayers && !roomData.players?.[playerId]) {
        throw new Error(`This prison is full (${maxPlayers} players maximum).`);
      }

      // Check name duplication among connected players
      const nameExists = Object.values(roomData.players || {}).some(
        p => p.name.toLowerCase() === name.toLowerCase() && p.id !== playerId && !p.disconnected
      );
      if (nameExists) {
        throw new Error("Nickname is already registered in this cell block.");
      }

      // Join player
      const playerData = {
        id: playerId,
        name,
        alive: true,
        isHost: roomData.hostId === playerId,
        disconnected: false,
        role: null,
        actionTarget: null,
        vote: null
      };

      await set(getDbRef(`rooms/${code}/players/${playerId}`), playerData);
      
      // Save credentials locally
      setNickname(name);
      setRoomCode(code);
      sessionStorage.setItem('nightmare_prison_nickname', name);
      sessionStorage.setItem('nightmare_prison_room_code', code);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Clean-up and leave room
  const handleExitRoom = () => {
    if (roomCode) {
      // If we are host in lobby, delete the room. Otherwise, remove our player record
      if (room?.status === 'lobby') {
        if (room.hostId === playerId) {
          remove(getDbRef(`rooms/${roomCode}`));
        } else {
          remove(getDbRef(`rooms/${roomCode}/players/${playerId}`));
        }
      } else if (room) {
        // If the game is in progress, mark us as disconnected
        update(getDbRef(`rooms/${roomCode}/players/${playerId}`), {
          disconnected: true
        });
      }
    }

    setRoom(null);
    setRoomCode('');
    sessionStorage.removeItem('nightmare_prison_room_code');
  };

  // Start the game (Host only)
  const handleStartGame = async () => {
    if (!room || room.hostId !== playerId) return;

    const playersList = Object.values(room.players || {});
    const numPlayers = playersList.length;
    const options = room.gameOptions || {};
    const minPlayers = options.minPlayers || 3;

    const optionsError = validateGameOptions(options);
    if (optionsError) throw new Error(optionsError);

    if (numPlayers < minPlayers) {
      throw new Error(`At least ${minPlayers} players are required to start.`);
    }

    // Distribute roles
    const roles = getRoleDistribution(numPlayers, options);
    const updatedPlayers = { ...room.players };

    playersList.forEach((p, index) => {
      updatedPlayers[p.id] = {
        ...updatedPlayers[p.id],
        role: roles[index],
        alive: true,
        actionTarget: null,
        vote: null,
        lastProtectedId: null,
        lobbyReady: false
      };
    });

    const updates = {};
    updates[`rooms/${roomCode}/players`] = updatedPlayers;
    updates[`rooms/${roomCode}/status`] = 'role_reveal';
    updates[`rooms/${roomCode}/timerEnd`] = Date.now() + (options.roleRevealSeconds || 15) * 1000;
    updates[`rooms/${roomCode}/chat`] = null; // Clear old chats
    updates[`rooms/${roomCode}/story`] = '';
    updates[`rooms/${roomCode}/winner`] = null;
    updates[`rooms/${roomCode}/dayNumber`] = 1;

    await update(getDbRef(), updates);
  };

  // Resolve and trigger phase transitions
  const triggerNextPhase = async () => {
    if (!room || transitionInFlightRef.current) return;
    transitionInFlightRef.current = true;

    try {

    const currentStatus = room.status;
    const currentPhase = room.phase;
    const currentPlayers = room.players;
    const updates = {};

    if (currentStatus === 'role_reveal') {
      // Transition from role reveal to night phase
      updates[`rooms/${roomCode}/status`] = 'playing';
      updates[`rooms/${roomCode}/phase`] = 'night';
      updates[`rooms/${roomCode}/timerEnd`] = Date.now() + (room.gameOptions?.nightSeconds || 35) * 1000;
    } else if (currentStatus === 'playing') {
      if (currentPhase === 'night') {
        // Night -> Day
        const resolution = resolveNightPhase(currentPlayers);
        const nextWinner = checkWinner(resolution.updatedPlayers);

        if (nextWinner) {
          updates[`rooms/${roomCode}/status`] = 'game_over';
          updates[`rooms/${roomCode}/winner`] = nextWinner;
          updates[`rooms/${roomCode}/players`] = resolution.updatedPlayers;
          updates[`rooms/${roomCode}/story`] = resolution.story;
        } else {
          updates[`rooms/${roomCode}/phase`] = 'day';
          updates[`rooms/${roomCode}/players`] = resolution.updatedPlayers;
          updates[`rooms/${roomCode}/story`] = resolution.story;
          updates[`rooms/${roomCode}/timerEnd`] = Date.now() + (room.gameOptions?.daySeconds || 60) * 1000;
        }
      } else if (currentPhase === 'day') {
        // Day -> Voting
        updates[`rooms/${roomCode}/phase`] = 'voting';
        updates[`rooms/${roomCode}/timerEnd`] = Date.now() + (room.gameOptions?.votingSeconds || 35) * 1000;
        
        // Reset readyToVote for all players
        const updatedPlayers = { ...currentPlayers };
        Object.keys(updatedPlayers).forEach(pid => {
          updatedPlayers[pid].readyToVote = false;
        });
        updates[`rooms/${roomCode}/players`] = updatedPlayers;
      } else if (currentPhase === 'voting') {
        // Voting -> Night (or game over)
        const resolution = resolveVotingPhase(currentPlayers);
        const nextWinner = checkWinner(resolution.updatedPlayers);

        if (nextWinner) {
          updates[`rooms/${roomCode}/status`] = 'game_over';
          updates[`rooms/${roomCode}/winner`] = nextWinner;
          updates[`rooms/${roomCode}/players`] = resolution.updatedPlayers;
          updates[`rooms/${roomCode}/story`] = resolution.announcedText;
        } else {
          updates[`rooms/${roomCode}/phase`] = 'night';
          updates[`rooms/${roomCode}/dayNumber`] = (room.dayNumber || 1) + 1;
          updates[`rooms/${roomCode}/players`] = resolution.updatedPlayers;
          updates[`rooms/${roomCode}/story`] = resolution.announcedText;
          updates[`rooms/${roomCode}/timerEnd`] = Date.now() + (room.gameOptions?.nightSeconds || 35) * 1000;
        }
      }
    }

      await update(getDbRef(), updates);
    } finally {
      transitionInFlightRef.current = false;
    }
  };

  // Host client checking timer expirations
  useEffect(() => {
    if (!room || room.hostId !== playerId || room.status === 'lobby' || room.status === 'game_over') return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (room.timerEnd && now >= room.timerEnd) {
        triggerNextPhase();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room]);

  // Host client checking if everyone has submitted actions (early transition helper)
  useEffect(() => {
    if (!room || room.hostId !== playerId || room.status !== 'playing') return;

    if (room.phase === 'night') {
      const activeRolesWhoMustAct = Object.values(room.players).filter(p => {
        if (!p.alive || p.disconnected) return false;
        if (['werewolf', 'fortune_teller', 'knight'].includes(p.role)) {
          return !p.actionTarget;
        }
        if (p.role === 'shaman') {
          // Shaman only acts if there are dead players
          const deadCount = Object.values(room.players).filter(pl => !pl.alive).length;
          return deadCount > 0 ? !p.actionTarget : false;
        }
        return false;
      });

      if (activeRolesWhoMustAct.length === 0) {
        triggerNextPhase();
      }
    } else if (room.phase === 'voting') {
      const activeVotersWhoMustVote = Object.values(room.players).filter(p => p.alive && !p.disconnected && !p.vote);
      if (activeVotersWhoMustVote.length === 0) {
        triggerNextPhase();
      }
    } else if (room.phase === 'day') {
      const alivePlayersList = Object.values(room.players).filter(p => p.alive && !p.disconnected);
      const readyPlayers = alivePlayersList.filter(p => p.readyToVote);
      if (readyPlayers.length === alivePlayersList.length && alivePlayersList.length > 0) {
        triggerNextPhase();
      }
    }
  }, [room]);

  // Submit Night Action
  const handleActionSubmit = async (targetId) => {
    if (!roomCode) return;
    await update(getDbRef(`rooms/${roomCode}/players/${playerId}`), {
      actionTarget: targetId
    });
  };

  // Submit Vote
  const handleVoteSubmit = async (voteTargetId) => {
    if (!roomCode) return;
    await update(getDbRef(`rooms/${roomCode}/players/${playerId}`), {
      vote: voteTargetId
    });
  };

  // Toggle Ready to Vote (during day discussion)
  const handleToggleReadyToVote = async () => {
    if (!roomCode || !room) return;
    const isReady = room.players?.[playerId]?.readyToVote || false;
    await update(getDbRef(`rooms/${roomCode}/players/${playerId}`), {
      readyToVote: !isReady
    });
  };

  // Toggle Lobby Ready (before game starts)
  const handleToggleLobbyReady = async () => {
    if (!roomCode || !room) return;
    const isReady = room.players?.[playerId]?.lobbyReady || false;
    await update(getDbRef(`rooms/${roomCode}/players/${playerId}`), {
      lobbyReady: !isReady
    });
  };

  // Send Chat Message
  const handleSendMessage = async (text) => {
    if (!roomCode) return;
    const chatRef = getDbRef(`rooms/${roomCode}/chat`);
    await push(chatRef, {
      senderId: playerId,
      senderName: nickname,
      text,
      timestamp: Date.now()
    });
  };

  // Restart sentence (Host only)
  const handlePlayAgain = async () => {
    if (!room || room.hostId !== playerId) return;

    const resetPlayers = {};
    Object.values(room.players).forEach(p => {
      resetPlayers[p.id] = {
        id: p.id,
        name: p.name,
        alive: true,
        isHost: p.isHost,
        disconnected: p.disconnected,
        role: null,
        actionTarget: null,
        vote: null,
        lobbyReady: false
      };
    });

    const updates = {};
    updates[`rooms/${roomCode}/status`] = 'lobby';
    updates[`rooms/${roomCode}/players`] = resetPlayers;
    updates[`rooms/${roomCode}/chat`] = null;
    updates[`rooms/${roomCode}/story`] = '';
    updates[`rooms/${roomCode}/winner`] = null;
    updates[`rooms/${roomCode}/phase`] = 'night';
    updates[`rooms/${roomCode}/dayNumber`] = 1;
    updates[`rooms/${roomCode}/timerEnd`] = 0;

    await update(getDbRef(), updates);
  };

  // Manual transition override by Host
  const handleTransitionPhase = async () => {
    if (!room || room.hostId !== playerId) return;
    await triggerNextPhase();
  };

  // Router for Screens
  const renderScreen = () => {
    if (!roomCode || !room) {
      return (
        <LandingPage 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom}
          connectionUnavailable={!dbConfigured}
        />
      );
    }

    switch (room.status) {
      case 'lobby':
        return (
          <LobbyScreen
            roomCode={roomCode}
            players={room.players}
            gameOptions={room.gameOptions}
            currentPlayerId={playerId}
            onStartGame={handleStartGame}
            onLeaveRoom={handleExitRoom}
            onToggleLobbyReady={handleToggleLobbyReady}
          />
        );
      case 'role_reveal':
        return (
          <RoleReveal
            role={room.players?.[playerId]?.role}
            name={nickname}
            timerEnd={room.timerEnd}
            wolfTeammates={room.players?.[playerId]?.role === 'werewolf'
              ? Object.values(room.players)
                .filter(player => player.id !== playerId && player.role === 'werewolf')
                .map(player => player.name)
              : []}
          />
        );
      case 'playing':
        return (
          <GameScreen
            roomCode={roomCode}
            room={room}
            currentPlayerId={playerId}
            onActionSubmit={handleActionSubmit}
            onVoteSubmit={handleVoteSubmit}
            onSendMessage={handleSendMessage}
            onTransitionPhase={handleTransitionPhase}
            onToggleReadyToVote={handleToggleReadyToVote}
          />
        );
      case 'game_over':
        return (
          <ResultScreen
            room={room}
            currentPlayerId={playerId}
            onPlayAgain={handlePlayAgain}
            onLeaveRoom={handleExitRoom}
          />
        );
      default:
        return (
          <LandingPage 
            onCreateRoom={handleCreateRoom} 
            onJoinRoom={handleJoinRoom}
            connectionUnavailable={!dbConfigured}
          />
        );
    }
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col justify-between">
      {renderScreen()}
    </div>
  );
}
