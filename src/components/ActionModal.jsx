import React, { useState } from 'react';
import { Eye, Shield, Skull, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ActionModal({ role, players, currentPlayerId, lastProtectedId, onActionSubmit }) {
  const [selectedId, setSelectedId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const playerList = Object.values(players || {});
  const currentPlayer = players?.[currentPlayerId];

  // Determine candidates — classic Werewolf night phrases
  let candidates = [];
  let headerText = '';
  let subText = '';
  let icon = null;

  if (role === 'werewolf') {
    candidates = playerList.filter(p => p.alive && p.id !== currentPlayerId && p.role !== 'werewolf');
    headerText = 'The Wolves Choose Their Prey';
    subText = 'Select a villager to devour tonight. Coordinate with your pack if other wolves share the night.';
    icon = <Skull className="w-6 h-6 text-red-500 animate-pulse" />;
  } else if (role === 'fortune_teller') {
    candidates = playerList.filter(p => p.alive && p.id !== currentPlayerId);
    headerText = 'The Seer Opens Her Eyes';
    subText = 'Peer into a soul. You will learn if they are a Monster or a Human.';
    icon = <Eye className="w-6 h-6 text-blue-400 animate-pulse" />;
  } else if (role === 'knight') {
    candidates = playerList.filter(p => p.alive);
    headerText = 'The Guardian Keeps Watch';
    subText = 'Shield one villager from the wolves tonight. You cannot guard the same person two nights in a row.';
    icon = <Shield className="w-6 h-6 text-emerald-400 animate-pulse" />;
  } else if (role === 'shaman') {
    candidates = playerList.filter(p => !p.alive);
    headerText = 'The Medium Speaks to the Dead';
    subText = 'Commune with a fallen villager. Their true role will be revealed to you alone.';
    icon = <CompassIcon className="w-6 h-6 text-purple-400 animate-pulse" />;
  }

  const handleConfirm = () => {
    if (!selectedId) return;
    onActionSubmit(selectedId);
    setConfirmed(true);
  };

  const isForbidden = (id) => {
    if (role === 'knight' && lastProtectedId && id === lastProtectedId) {
      return true;
    }
    return false;
  };

  if (confirmed || currentPlayer?.actionTarget) {
    const targetName = players?.[currentPlayer?.actionTarget || selectedId]?.name || 'Unknown';
    return (
      <div className="p-6 rounded-2xl glass-panel-blood border-red-500/20 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-moon-safe/10 border border-moon-safe/30 text-moon-safe">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold tracking-wider text-white uppercase">Action Locked In</h3>
        <p className="text-xs text-gray-300">
          You targeted <span className="font-semibold text-red-400">{targetName}</span>.
        </p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">
          Waiting for the night to end...
        </p>
      </div>
    );
  }

  if (role === 'shaman' && candidates.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-moon-iron/40 border border-moon-iron/40 text-gray-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold tracking-wider text-gray-300 uppercase">The Dead Are Silent</h3>
        <p className="text-xs text-gray-400">
          No villagers have fallen yet. There are no spirits to speak with tonight.
        </p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">
          Rest until dawn...
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl glass-panel metal-border box-glow-red flex flex-col max-h-[85vh]">
      {/* Modal Header */}
      <div className="flex items-center gap-3 border-b border-moon-iron/30 pb-3 mb-3">
        {icon}
        <div className="flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">{headerText}</h3>
          <p className="text-[10px] text-gray-400 leading-normal">{subText}</p>
        </div>
      </div>

      {/* Candidate List */}
      <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1 max-h-[220px]">
        {candidates.map((candidate) => {
          const disabled = isForbidden(candidate.id);
          const isSelected = selectedId === candidate.id;
          return (
            <button
              key={candidate.id}
              onClick={() => !disabled && setSelectedId(candidate.id)}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${
                disabled
                  ? 'bg-gray-950/40 border-moon-iron/10 opacity-30 cursor-not-allowed'
                  : isSelected
                  ? 'bg-moon-blood/35 border-red-500/50 text-white shadow-[0_0_10px_rgba(220,38,38,0.15)]'
                  : 'bg-moon-dark/70 border-moon-iron/30 hover:border-moon-iron text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full border ${isSelected ? 'bg-red-500 border-red-400' : 'bg-transparent border-gray-600'}`}></span>
                <span className="text-xs font-semibold">{candidate.name}</span>
              </div>
              {disabled && (
                <span className="text-[8px] uppercase tracking-wider bg-gray-950/80 px-2 py-0.5 rounded border border-moon-iron/30 text-gray-500 font-mono">
                  Forbidden
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Trigger */}
      <button
        onClick={handleConfirm}
        disabled={!selectedId}
        className="w-full mt-4 py-2.5 rounded-lg bg-moon-blood hover:bg-moon-danger text-white font-bold text-xs uppercase tracking-wider border border-red-500/20 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none hover:shadow-[0_0_12px_rgba(220,38,38,0.3)] active:scale-95"
      >
        Confirm Night Action
      </button>
    </div>
  );
}

// Spooky Compass Icon helper
function CompassIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21m-9-6a6 6 0 100 12 6 6 0 000-12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9l-1.5 3 3.5 1.5L12 9z" />
    </svg>
  );
}
