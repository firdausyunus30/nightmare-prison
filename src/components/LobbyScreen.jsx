import React from 'react';
import { motion } from 'framer-motion';
import { Users, LogOut, Play, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { getRoleDistribution, ROLE_INFO } from '../utils/gameLogic';

export default function LobbyScreen({ roomCode, players, currentPlayerId, onStartGame, onLeaveRoom, onToggleLobbyReady }) {
  const playerList = Object.values(players || {});
  const currentPlayer = players?.[currentPlayerId];
  const isHost = currentPlayer?.isHost;
  const numPlayers = playerList.length;

  // Calculate projected roles based on player count
  const projectedRoles = getRoleDistribution(numPlayers);
  const roleCounts = projectedRoles.reduce((acc, r) => {
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room Code copied to clipboard: ' + roomCode);
  };

  const minPlayers = 3;
  const readyCount = playerList.filter(p => p.lobbyReady).length;
  const allReady = playerList.length >= minPlayers && readyCount === playerList.length;
  const canStart = allReady;
  const isCurrentPlayerReady = currentPlayer?.lobbyReady || false;

  return (
    <div className="flex flex-col justify-between min-h-screen px-4 py-6">
      {/* Header section with leaving option */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-prison-dark text-xs border border-prison-iron/40 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Leave Cell</span>
        </button>
        <div className="flex items-center gap-1 text-[10px] tracking-wider text-gray-500 uppercase font-mono">
          <span className="w-2 h-2 rounded-full bg-prison-safe animate-pulse"></span>
          <span>Synced with Yard</span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-md mx-auto space-y-6">
        
        {/* Room Code Box */}
        <div className="w-full text-center p-6 rounded-2xl glass-panel metal-border box-glow-red relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-600/30 blur-sm"></div>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Prison Yard Code</p>
          <h2 
            onClick={handleCopyCode}
            className="text-4xl font-extrabold tracking-widest text-white cursor-pointer font-mono hover:text-red-500 transition-colors inline-block select-all"
            title="Click to copy room code"
          >
            {roomCode}
          </h2>
          <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-wider">Tap code to copy invitation link</p>
        </div>

        {/* Players List Container */}
        <div className="w-full flex-1 flex flex-col p-5 rounded-2xl glass-panel metal-border">
          <div className="flex items-center justify-between border-b border-prison-iron/40 pb-3 mb-4">
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              <span>Inmates Joined ({numPlayers})</span>
            </h3>
            {numPlayers < 5 && (
              <span className="text-[9px] text-yellow-500/80 px-2 py-0.5 rounded bg-yellow-950/30 border border-yellow-500/20 font-mono">
                Min: 3 for debug
              </span>
            )}
          </div>

          {/* List of Names */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] pr-1">
            {playerList.map((player) => {
              const isMe = player.id === currentPlayerId;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                    isMe 
                      ? 'bg-prison-blood/25 border-red-500/40 shadow-[inset_0_1px_3px_rgba(220,38,38,0.1)]' 
                      : 'bg-prison-dark/60 border-prison-iron/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${player.disconnected ? 'bg-gray-600' : 'bg-prison-safe animate-pulse'}`}></span>
                    <span className={`text-sm ${isMe ? 'font-bold text-white' : 'text-gray-300'} ${player.disconnected ? 'line-through text-gray-600' : ''}`}>
                      {player.name}
                    </span>
                    {isMe && <span className="text-[9px] text-red-400 font-mono uppercase bg-red-950/50 px-1 border border-red-500/20 rounded">You</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {player.isHost && (
                      <span className="text-[9px] font-semibold text-red-500 uppercase border border-red-500/30 bg-red-950/40 px-1.5 py-0.5 rounded tracking-wide font-mono">
                        Warden
                      </span>
                    )}
                    {player.lobbyReady && (
                      <span className="text-[9px] font-bold bg-prison-safe/20 text-prison-safe border border-prison-safe/40 px-1.5 py-0.5 rounded uppercase tracking-wide animate-pulse">
                        ✓ Ready
                      </span>
                    )}
                    {player.disconnected && (
                      <span className="text-[9px] font-semibold text-gray-500 uppercase border border-gray-600 bg-gray-950/50 px-1.5 py-0.5 rounded tracking-wide font-mono">
                        DC
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Projected Roles Breakdown Info Panel */}
        <div className="w-full p-4 rounded-xl bg-prison-dark/40 border border-prison-iron/20 text-xs">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-500" /> Expected Role Roster
          </h4>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-mono">
            {Object.entries(roleCounts).map(([role, count]) => {
              const info = ROLE_INFO[role];
              return (
                <div key={role} className="flex items-center gap-1 bg-prison-metal/40 px-2 py-1 rounded border border-prison-iron/10">
                  <span className="text-xs">{info?.emoji}</span>
                  <span className="uppercase text-gray-300 font-sans font-medium">{info?.name.split(' ')[0]}</span>
                  <span className="text-red-500 ml-auto font-bold">x{count}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="w-full max-w-md mx-auto mt-6 space-y-3">
        {/* Non-host: Ready toggle button */}
        {!isHost && (
          <button
            onClick={onToggleLobbyReady}
            className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border uppercase tracking-widest active:scale-95 ${
              isCurrentPlayerReady
                ? 'bg-prison-safe/20 border-prison-safe/50 text-prison-safe hover:bg-prison-safe/10'
                : 'bg-prison-blood hover:bg-prison-danger border-red-500/20 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.35)]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isCurrentPlayerReady ? '✓ Ready — Cancel' : 'Confirm Ready'}</span>
          </button>
        )}

        {/* Host: Start button */}
        {isHost && (
          <div className="space-y-2">
            {/* Ready progress */}
            <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
              <span className="uppercase tracking-wider">Inmate readiness</span>
              <span className={`font-bold font-mono ${ allReady ? 'text-prison-safe' : 'text-yellow-500' }`}>
                {readyCount} / {numPlayers} ready
              </span>
            </div>
            <div className="w-full h-1 bg-prison-iron/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-prison-safe transition-all duration-500 rounded-full"
                style={{ width: numPlayers > 0 ? `${(readyCount / numPlayers) * 100}%` : '0%' }}
              />
            </div>

            {!canStart && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {numPlayers < minPlayers
                    ? `Minimum ${minPlayers} inmates required.`
                    : 'Waiting for all inmates to confirm ready.'}
                </span>
              </div>
            )}
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="w-full py-3 rounded-lg bg-prison-danger hover:bg-red-500 border border-red-500/20 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.25)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none uppercase tracking-widest"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Lock down prison</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
