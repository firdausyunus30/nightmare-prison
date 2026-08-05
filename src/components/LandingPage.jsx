import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, User, Key, ServerCrash, SlidersHorizontal, Users, Clock, Sparkles, Minus, Plus } from 'lucide-react';
import { validateGameOptions } from '../utils/gameLogic';

const DEFAULT_OPTIONS = {
  minPlayers: 3,
  maxPlayers: 8,
  roleRevealSeconds: 15,
  nightSeconds: 35,
  daySeconds: 60,
  votingSeconds: 35,
  roles: {
    werewolf: 1,
    fortune_teller: 1,
    knight: 0,
    shaman: 0,
    psycho: 0,
    citizen: 1,
  },
};

const ROLE_FIELDS = [
  ['werewolf', 'Werewolf'],
  ['fortune_teller', 'Fortune Teller'],
  ['knight', 'Knight'],
  ['shaman', 'Shaman'],
  ['psycho', 'Psycho'],
  ['citizen', 'Citizen'],
];

const PHASE_FIELDS = [
  ['roleRevealSeconds', 'Role reveal'],
  ['nightSeconds', 'Night'],
  ['daySeconds', 'Discussion'],
  ['votingSeconds', 'Voting'],
];

/** Mobile-friendly +/- stepper — no typing, no leading zeros */
function Stepper({ value, min, max, step = 1, onChange, disabled }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const dec = () => !disabled && onChange(clamp(value - step));
  const inc = () => !disabled && onChange(clamp(value + step));

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Decrease"
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-moon-dark border border-moon-iron text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none touch-manipulation"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-11 text-center text-base font-bold font-mono text-white tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Increase"
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-moon-dark border border-moon-iron text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none touch-manipulation"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function LandingPage({ onCreateRoom, onJoinRoom, connectionUnavailable }) {
  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameOptions, setGameOptions] = useState(DEFAULT_OPTIONS);

  const setOption = (key, value) => {
    setGameOptions((prev) => ({ ...prev, [key]: value }));
  };

  const setRoleCount = (role, value) => {
    setGameOptions((prev) => ({
      ...prev,
      roles: { ...prev.roles, [role]: value },
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!nickname.trim()) {
      setError('Nickname is required.');
      return;
    }

    setLoading(true);
    try {
      const optionsError = validateGameOptions(gameOptions);
      if (optionsError) {
        setError(optionsError);
        setLoading(false);
        return;
      }
      await onCreateRoom(nickname.trim(), gameOptions);
    } catch (err) {
      setError(err.message || 'Failed to create room.');
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Nickname is required.');
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length < 5) {
      setError('A valid 5-6 character room code is required.');
      return;
    }

    setLoading(true);
    try {
      await onJoinRoom(nickname.trim(), roomCode.trim().toUpperCase());
    } catch (err) {
      setError(err.message || 'Failed to join room.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-moon-dark border border-moon-iron focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl px-4 py-3.5 text-base text-white placeholder-gray-600 outline-none transition-all';

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-6 pb-10">
      {/* Main Brand Section */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-wider creepster-font text-red-600 text-glow-red animate-flicker uppercase">
            Satu Malam
          </h1>
          <h1 className="text-3xl md:text-4xl font-black tracking-widest text-white mt-1 border-b border-red-950 pb-2 uppercase">
            Bulan Purnama
          </h1>
          <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mt-3">
            Werewolf • Village Under the Full Moon
          </p>
        </motion.div>

        {/* Tab Controls — large tap targets */}
        <div className="w-full grid grid-cols-2 gap-2 mb-4 p-1.5 bg-moon-darkest border border-moon-iron/50 rounded-2xl">
          <button
            type="button"
            onClick={() => { setActiveTab('join'); setError(''); }}
            className={`py-3.5 text-sm font-semibold rounded-xl transition-all touch-manipulation ${
              activeTab === 'join'
                ? 'bg-moon-blood text-white border border-red-500/20 shadow-[0_0_10px_rgba(127,29,29,0.3)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Join Village
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('create'); setError(''); }}
            className={`py-3.5 text-sm font-semibold rounded-xl transition-all touch-manipulation ${
              activeTab === 'create'
                ? 'bg-moon-blood text-white border border-red-500/20 shadow-[0_0_10px_rgba(127,29,29,0.3)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Create Village
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="w-full p-5 sm:p-6 rounded-2xl glass-panel metal-border box-glow-red relative overflow-hidden min-h-[290px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-950/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'join' ? (
              <motion.form
                key="join-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleJoin}
                className="space-y-5 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-500" /> Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.substring(0, 12))}
                      placeholder="Enter your name"
                      autoComplete="nickname"
                      enterKeyHint="next"
                      className={inputClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-red-500" /> Room Code
                    </label>
                    <input
                      type="text"
                      inputMode="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6))}
                      placeholder="e.g. D9X3F"
                      enterKeyHint="go"
                      className={`${inputClass} font-mono tracking-[0.35em] text-center text-lg`}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <ServerCrash className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 rounded-xl bg-moon-blood hover:bg-moon-danger border border-red-500/20 text-white font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 touch-manipulation active:scale-[0.98]"
                >
                  <span>{loading ? 'Entering Village...' : 'Enter Village'}</span>
                  {!loading && <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="create-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleCreate}
                className="space-y-5 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-500" /> Host Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.substring(0, 12))}
                      placeholder="Enter host name"
                      autoComplete="nickname"
                      className={inputClass}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="p-3.5 rounded-xl bg-moon-dark/40 border border-moon-iron/20 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" /> Game setup
                    </div>

                    {/* Player counts — full-width steppers */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3 py-1">
                        <span className="text-sm text-gray-300 flex items-center gap-1.5 min-w-0">
                          <Users className="w-4 h-4 text-red-500 shrink-0" />
                          Min players
                        </span>
                        <Stepper
                          value={gameOptions.minPlayers}
                          min={3}
                          max={15}
                          disabled={loading}
                          onChange={(v) => setOption('minPlayers', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 py-1">
                        <span className="text-sm text-gray-300 flex items-center gap-1.5 min-w-0">
                          <Users className="w-4 h-4 text-red-500 shrink-0" />
                          Player limit
                        </span>
                        <Stepper
                          value={gameOptions.maxPlayers}
                          min={3}
                          max={15}
                          disabled={loading}
                          onChange={(v) => setOption('maxPlayers', v)}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-red-500" /> Special characters
                      </p>
                      <div className="space-y-2">
                        {ROLE_FIELDS.map(([role, label]) => (
                          <div
                            key={role}
                            className="flex items-center justify-between gap-3 bg-moon-metal/40 px-3 py-2 rounded-xl border border-moon-iron/20"
                          >
                            <span className="text-sm text-gray-300">{label}</span>
                            <Stepper
                              value={gameOptions.roles[role]}
                              min={0}
                              max={5}
                              disabled={loading}
                              onChange={(v) => setRoleCount(role, v)}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-600 mt-2 leading-relaxed">
                        Citizens have no night power. Empty slots are also filled with Citizens.
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-500" /> Phase duration (seconds)
                      </p>
                      <div className="space-y-2">
                        {PHASE_FIELDS.map(([field, label]) => (
                          <div key={field} className="flex items-center justify-between gap-3 py-0.5">
                            <span className="text-sm text-gray-300">{label}</span>
                            <Stepper
                              value={gameOptions[field]}
                              min={10}
                              max={300}
                              step={5}
                              disabled={loading}
                              onChange={(v) => setOption(field, v)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <ServerCrash className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {connectionUnavailable && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
                    Multiplayer connection is unavailable. Please check the server configuration.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 rounded-xl bg-moon-blood hover:bg-moon-danger border border-red-500/20 text-white font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 touch-manipulation active:scale-[0.98]"
                >
                  <span>{loading ? 'Preparing Village...' : 'Create Village'}</span>
                  {!loading && <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="text-center mt-6">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          Recommended: 5–10 villagers
        </p>
        <p className="text-[9px] text-gray-700 mt-1 font-mono">
          Made for mobile browsers • Play together locally
        </p>
      </div>
    </div>
  );
}
