import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, User, Key, ServerCrash, SlidersHorizontal, Users, Clock, Sparkles } from 'lucide-react';
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

export default function LandingPage({ onCreateRoom, onJoinRoom, connectionUnavailable }) {
  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameOptions, setGameOptions] = useState(DEFAULT_OPTIONS);

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

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-8">
      {/* Main Brand Section */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-wider creepster-font text-red-600 text-glow-red animate-flicker uppercase">
            Nightmare
          </h1>
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white mt-1 border-b border-red-950 pb-2 uppercase">
            Prison
          </h1>
          <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mt-3">
            Multiplayer Social Deduction
          </p>
        </motion.div>

        {/* Tab Controls */}
        <div className="w-full grid grid-cols-2 gap-2 mb-4 p-1 bg-prison-darkest border border-prison-iron/50 rounded-xl">
          <button
            onClick={() => { setActiveTab('join'); setError(''); }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'join'
                ? 'bg-prison-blood text-white border border-red-500/20 shadow-[0_0_10px_rgba(127,29,29,0.3)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Join Cell block
          </button>
          <button
            onClick={() => { setActiveTab('create'); setError(''); }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-prison-blood text-white border border-red-500/20 shadow-[0_0_10px_rgba(127,29,29,0.3)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Create Prison
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="w-full p-6 rounded-2xl glass-panel metal-border box-glow-red relative overflow-hidden min-h-[290px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-950/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'join' ? (
              <motion.form
                key="join-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleJoin}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-red-500" /> Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.substring(0, 12))}
                      placeholder="Enter prisoner name"
                      className="w-full bg-prison-dark border border-prison-iron focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-all"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-red-500" /> Room Code
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase().substring(0, 6))}
                      placeholder="e.g. D9X3F"
                      className="w-full bg-prison-dark border border-prison-iron focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-center text-white placeholder-gray-600 outline-none transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-xs flex items-center gap-1.5 mt-2">
                    <ServerCrash className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-4 rounded-lg bg-prison-blood hover:bg-prison-danger border border-red-500/20 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <span>{loading ? 'Entering Cell Block...' : 'Enter Prison'}</span>
                  {!loading && <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="create-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleCreate}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-red-500" /> Host Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.substring(0, 12))}
                      placeholder="Enter host name"
                      className="w-full bg-prison-dark border border-prison-iron focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="p-3 rounded-lg bg-prison-dark/40 border border-prison-iron/20 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" /> Game setup
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] text-gray-400">
                        <span className="flex items-center gap-1 mb-1"><Users className="w-3 h-3" /> Minimum players</span>
                        <input type="number" min="3" max="15" value={gameOptions.minPlayers} onChange={(e) => setGameOptions({ ...gameOptions, minPlayers: Number(e.target.value) })} className="w-full bg-prison-dark border border-prison-iron rounded px-2 py-1.5 text-sm text-white outline-none focus:border-red-600" />
                      </label>
                      <label className="text-[10px] text-gray-400">
                        <span className="flex items-center gap-1 mb-1"><Users className="w-3 h-3" /> Player limit</span>
                        <input type="number" min="3" max="15" value={gameOptions.maxPlayers} onChange={(e) => setGameOptions({ ...gameOptions, maxPlayers: Number(e.target.value) })} className="w-full bg-prison-dark border border-prison-iron rounded px-2 py-1.5 text-sm text-white outline-none focus:border-red-600" />
                      </label>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-red-500" /> Special characters</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLE_FIELDS.map(([role, label]) => (
                          <label key={role} className="flex items-center justify-between gap-2 text-[10px] text-gray-400 bg-prison-metal/40 px-2 py-1.5 rounded border border-prison-iron/20">
                            <span>{label}</span>
                            <input type="number" min="0" max="5" value={gameOptions.roles[role]} onChange={(e) => setGameOptions({ ...gameOptions, roles: { ...gameOptions.roles, [role]: Number(e.target.value) } })} className="w-10 bg-prison-dark border border-prison-iron rounded px-1 py-0.5 text-center text-xs text-white outline-none focus:border-red-600" />
                          </label>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-600 mt-1.5">Citizens have no night power; they can discuss and vote. Any remaining slots are also filled with Citizens.</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock className="w-3 h-3 text-red-500" /> Phase duration (seconds)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[["roleRevealSeconds", "Role reveal"], ["nightSeconds", "Night"], ["daySeconds", "Discussion"], ["votingSeconds", "Voting"]].map(([field, label]) => (
                          <label key={field} className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
                            <span>{label}</span>
                            <input type="number" min="10" max="300" value={gameOptions[field]} onChange={(e) => setGameOptions({ ...gameOptions, [field]: Number(e.target.value) })} className="w-14 bg-prison-dark border border-prison-iron rounded px-1 py-1 text-center text-xs text-white outline-none focus:border-red-600" />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-xs flex items-center gap-1.5 mt-2">
                    <ServerCrash className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {connectionUnavailable && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
                    Multiplayer connection is unavailable. Please check the server configuration.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-4 rounded-lg bg-prison-blood hover:bg-prison-danger border border-red-500/20 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <span>{loading ? 'Securing Yard...' : 'Construct Prison'}</span>
                  {!loading && <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="text-center mt-8">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          Recommended: 5-10 prisoners
        </p>
        <p className="text-[9px] text-gray-700 mt-1 font-mono">
          Made for mobile browsers • Play together locally
        </p>
      </div>
    </div>
  );
}
