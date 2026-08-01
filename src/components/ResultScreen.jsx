import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Frown, Users, LogOut, RefreshCcw, Skull, CheckCircle } from 'lucide-react';
import { ROLE_INFO, TEAMS } from '../utils/gameLogic';

export default function ResultScreen({ room, currentPlayerId, onPlayAgain, onLeaveRoom }) {
  const winner = room?.winner; // 'human' | 'monster'
  const players = room?.players || {};
  const currentPlayer = players[currentPlayerId];
  const isHost = currentPlayer?.isHost;

  const playerList = Object.values(players);

  // Check if current player won
  const checkPlayerWin = () => {
    if (!currentPlayer) return false;
    const myRole = currentPlayer.role;
    const myTeam = ROLE_INFO[myRole]?.team;
    
    if (winner === TEAMS.HUMAN) {
      // Humans win
      return myTeam === TEAMS.HUMAN;
    } else if (winner === TEAMS.MONSTER) {
      // Monsters win
      // Werewolves and Psycho win if monsters win
      return myTeam === TEAMS.MONSTER || myRole === 'psycho';
    }
    return false;
  };

  const didIWin = checkPlayerWin();

  return (
    <div className="flex flex-col justify-between min-h-screen px-4 py-8">
      {/* Header Result Display */}
      <div className="w-full max-w-md mx-auto text-center mt-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-4 rounded-full bg-prison-dark border border-prison-iron mb-4"
        >
          {didIWin ? (
            <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
          ) : (
            <Frown className="w-12 h-12 text-red-500 animate-pulse" />
          )}
        </motion.div>

        <h1 className={`text-4xl font-extrabold tracking-wider uppercase creepster-font ${
          winner === TEAMS.HUMAN ? 'text-prison-safe text-glow-safe' : 'text-prison-danger text-glow-red'
        }`}>
          {winner === TEAMS.HUMAN ? 'Prison Secured' : 'Monster Dominion'}
        </h1>
        <p className="text-xs uppercase tracking-widest text-gray-400 mt-2">
          {winner === TEAMS.HUMAN 
            ? 'All monsters were identified and eliminated.' 
            : 'Monsters have taken control of the cell blocks.'}
        </p>

        {/* Personalized win/lose badge */}
        <div className="mt-4 inline-block">
          <span className={`text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${
            didIWin 
              ? 'bg-prison-safe/10 border border-prison-safe/30 text-prison-safe' 
              : 'bg-red-950/40 border border-red-500/20 text-red-400'
          }`}>
            {didIWin ? '★ YOU SURVIVED & WON ★' : '💀 YOU WERE ELIMINATED & LOST'}
          </span>
        </div>
      </div>

      {/* Roles Revealed Grid */}
      <div className="flex-1 w-full max-w-md mx-auto my-6 p-5 rounded-2xl glass-panel metal-border flex flex-col justify-start">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-prison-iron/40 pb-2 mb-4 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-red-500" />
          <span>True Identities Revealed</span>
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[250px] pr-1">
          {playerList.map((player) => {
            const roleDetails = ROLE_INFO[player.role];
            const isMe = player.id === currentPlayerId;
            const won = (winner === TEAMS.HUMAN && roleDetails?.team === TEAMS.HUMAN) ||
                        (winner === TEAMS.MONSTER && (roleDetails?.team === TEAMS.MONSTER || player.role === 'psycho'));

            return (
              <div 
                key={player.id}
                className={`p-3 rounded-lg border flex items-center justify-between bg-prison-dark/70 ${
                  player.role === 'werewolf'
                    ? 'border-red-950 bg-red-950/5'
                    : 'border-prison-iron/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {player.alive ? (
                    <CheckCircle className="w-4 h-4 text-prison-safe shrink-0" />
                  ) : (
                    <Skull className="w-4 h-4 text-red-800 shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold truncate text-white ${isMe ? 'underline' : ''}`}>
                      {player.name} {isMe && '(You)'}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono uppercase">
                      {!player.alive ? 'SOLITARY' : 'ALIVE'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                    player.role === 'werewolf' 
                      ? 'bg-red-950/60 border border-red-500/20 text-red-500' 
                      : player.role === 'psycho'
                      ? 'bg-purple-950/60 border border-purple-500/20 text-purple-400'
                      : 'bg-blue-950/60 border border-blue-500/20 text-blue-400'
                  }`}>
                    <span>{roleDetails?.emoji}</span>
                    <span>{roleDetails?.name}</span>
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    won ? 'bg-prison-safe/10 text-prison-safe border border-prison-safe/25' : 'bg-red-950/20 text-red-400 border border-red-900/20'
                  }`}>
                    {won ? 'WIN' : 'LOSS'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restart / CTA Actions */}
      <div className="w-full max-w-md mx-auto space-y-3">
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-lg bg-prison-danger hover:bg-red-500 border border-red-500/20 text-white font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-95"
          >
            <RefreshCcw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Restart Sentence</span>
          </button>
        ) : (
          <div className="w-full py-3.5 bg-prison-dark border border-prison-iron/40 text-center rounded-lg">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono animate-pulse">
              Waiting for Warden to restart sentence...
            </span>
          </div>
        )}
        <button
          onClick={onLeaveRoom}
          className="w-full py-2.5 rounded-lg bg-prison-metal/50 hover:bg-prison-metal text-gray-400 hover:text-white border border-prison-iron/40 text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Prison Yard</span>
        </button>
      </div>
    </div>
  );
}
