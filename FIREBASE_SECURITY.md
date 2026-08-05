# Nightmare Prison: multiplayer security plan

## Important

The current client-hosted version is suitable for trusted friends only. A browser cannot keep a secret that it has received. Do **not** try to solve this by hiding role badges in the UI.

## Required production architecture

1. Enable Firebase **Anonymous Authentication** and use `auth.uid` as the player ID.
2. Keep `rooms/{roomId}` public-only: player name, alive/disconnected status, phase, timer, story, and public chat.
3. Keep each player's role, vote, action, protection history, and investigation results at `privateRooms/{roomId}/players/{uid}`.
4. Realtime Database rules must allow that private node to be read by its owner and a trusted server only—not by arbitrary clients or the host browser.
5. Use Cloud Functions with the Firebase Admin SDK to assign roles, accept actions/votes, resolve a phase, and write the public outcome atomically.
6. Send wolf teammate names only in the private record of a werewolf. Do not publish a `role` field in the public room.

## Why Cloud Functions are needed

Rules can restrict reads and basic writes, but cannot safely calculate a vote, select a random victim, or prove that a client is allowed to advance a timer. Those actions must run in a trusted environment.

## Suggested private record

```json
{
  "role": "werewolf",
  "wolfTeammateIds": ["uid_of_other_wolf"],
  "actionTarget": null,
  "vote": null,
  "lastProtectedId": null,
  "investigations": {}
}
```

Deploy this architecture before sharing the game publicly. Until then, treat every player as capable of inspecting the room data.
