import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Compass, CheckCircle2 } from 'lucide-react';
import { ROLE_INFO } from '../utils/gameLogic';

export default function RoleReveal({ role, timerEnd, name, wolfTeammates = [] }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const info = ROLE_INFO[role];

  useEffect(() => {
    if (!timerEnd) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((timerEnd - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [timerEnd]);

  // Determine card styles based on team
  const getCardStyle = () => {
    if (role === 'werewolf') {
      return {
        background: 'linear-gradient(135deg, #450a0a 0%, #09090b 100%)',
        border: '2px solid #ef4444',
        shadow: '0 0 30px rgba(239, 68, 68, 0.4)',
        textColor: 'text-red-500',
        glowClass: 'text-glow-red'
      };
    }
    if (role === 'psycho') {
      return {
        background: 'linear-gradient(135deg, #3b0764 0%, #09090b 100%)',
        border: '2px solid #a855f7',
        shadow: '0 0 30px rgba(168, 85, 247, 0.4)',
        textColor: 'text-purple-400',
        glowClass: ''
      };
    }
    // Humans (fortune_teller, knight, shaman, citizen)
    return {
      background: 'linear-gradient(135deg, #0f172a 0%, #09090b 100%)',
      border: '2px solid #3b82f6',
      shadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      textColor: 'text-blue-400',
      glowClass: ''
    };
  };

  const cardStyle = getCardStyle();

  return (
    <div className="flex flex-col justify-between min-h-screen px-4 py-8">
      {/* Top Timer Panel */}
      <div className="w-full max-w-md mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-gray-500">Lockdown Commencing</p>
        <div className="text-3xl font-black text-white font-mono mt-1 text-glow-red animate-pulse">
          {timeLeft}s
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Memorize your identity before cells close</p>
      </div>

      {/* 3D Card Flip Container */}
      <div className="flex-1 flex items-center justify-center py-6 w-full max-w-sm mx-auto">
        <div 
          className="relative w-full aspect-[2/3] max-w-[280px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full duration-500"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Card Back (Unrevealed) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-2xl metal-texture p-6 flex flex-col justify-between items-center shadow-2xl border border-red-950/40"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-full flex items-center justify-between opacity-50 border-b border-prison-iron/40 pb-2">
                <span className="text-[9px] font-mono text-gray-500">NP_CLASSIFIED</span>
                <span className="text-[9px] font-mono text-gray-500">{name}</span>
              </div>

              <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
                {/* Creepy eye / prison lock icon */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-2 border-prison-iron bg-prison-dark">
                  <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping"></div>
                  <ShieldAlert className="w-10 h-10 text-red-700 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold tracking-widest text-white uppercase creepster-font text-glow-red">
                  Prisoner Card
                </h3>
              </div>

              <div className="w-full text-center py-2 bg-red-950/20 rounded-lg border border-red-500/10 animate-pulse">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-semibold">
                  Tap to uncover role
                </p>
              </div>
            </div>

            {/* Card Front (Revealed) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between shadow-2xl"
              style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)',
                background: cardStyle.background,
                border: cardStyle.border,
                boxShadow: cardStyle.shadow
              }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-gray-500 tracking-wider">ROLE ASSIGNED</span>
                  <span className="text-xs font-bold text-white">{name}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  info?.team === 'monster' 
                    ? 'bg-red-950/60 text-red-500 border border-red-500/30' 
                    : info?.team === 'neutral'
                    ? 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                    : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                }`}>
                  {info?.team}
                </span>
              </div>

              {/* Role Body */}
              <div className="flex flex-col items-center justify-center my-auto text-center space-y-3 py-4">
                <span className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  {info?.emoji}
                </span>
                <h2 className={`text-3xl font-extrabold tracking-wider uppercase creepster-font ${cardStyle.textColor} ${cardStyle.glowClass}`}>
                  {info?.name}
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed max-w-[220px]">
                  {info?.description}
                </p>
              </div>

              {/* Abilities & Goal Section */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-mono">OBJECTIVE:</span>
                  <span className="text-[10px] text-gray-200 leading-normal block">{info?.objective}</span>
                </div>
                {role === 'werewolf' && wolfTeammates.length > 0 && (
                  <div className="bg-red-950/30 p-2.5 rounded-lg border border-red-500/20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-red-400 block font-mono">PACKMATES:</span>
                    <span className="text-[10px] text-gray-100 leading-normal block">
                      {wolfTeammates.join(', ')}
                    </span>
                  </div>
                )}
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-mono">NIGHT ABILITY:</span>
                  <span className="text-[10px] text-red-400 leading-normal block font-semibold">{info?.nightAbility}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Helper Bottom Banner */}
      <div className="w-full max-w-sm mx-auto text-center">
        {!isFlipped ? (
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 animate-pulse">
            <Compass className="w-4 h-4 text-red-500" />
            <span>Make sure no one is looking over your shoulder!</span>
          </p>
        ) : (
          <p className="text-xs text-prison-safe flex items-center justify-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Role memorized. Tap card again to hide it.</span>
          </p>
        )}
      </div>
    </div>
  );
}
