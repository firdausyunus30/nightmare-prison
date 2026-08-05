import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon, Sun, Vote, Send, Skull, MessageSquare, Zap, Sparkles
} from 'lucide-react';
import ActionModal from './ActionModal';
import { ROLE_INFO } from '../utils/gameLogic';

export default function GameScreen({ 
  room, 
  currentPlayerId, 
  onActionSubmit, 
  onVoteSubmit, 
  onSendMessage, 
  onTransitionPhase,
  onToggleReadyToVote 
}) {
  const [messageText, setMessageText] = useState('');
  const [selectedVoteId, setSelectedVoteId] = useState(null);
  const [localInvestigated, setLocalInvestigated] = useState({}); // targetId -> role (for Fortune Teller)
  const [localCommuned, setLocalCommuned] = useState({}); // targetId -> role (for Shaman)
  const [lastPhase, setLastPhase] = useState('night');
  const [lastActionTarget, setLastActionTarget] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const chatEndRef = useRef(null);

  const players = room?.players || {};
  const currentPlayer = players[currentPlayerId];
  const isHost = currentPlayer?.isHost;
  const alivePlayers = Object.values(players).filter(p => p.alive);
  const aliveConnected = alivePlayers.filter(p => !p.disconnected);
  const isMeAlive = currentPlayer?.alive;
  const votedCount = aliveConnected.filter(p => p.vote !== null && p.vote !== undefined).length;

  // Track phase transitions to log investigative results privately
  useEffect(() => {
    if (room?.phase) {
      if (room.phase !== lastPhase) {
        // If transitioning from night to day, inspect the player's last action target
        if (lastPhase === 'night' && room.phase === 'day' && lastActionTarget) {
          const target = players[lastActionTarget];
          if (target) {
            if (currentPlayer?.role === 'fortune_teller') {
              setLocalInvestigated(prev => ({ ...prev, [lastActionTarget]: target.role }));
            } else if (currentPlayer?.role === 'shaman') {
              setLocalCommuned(prev => ({ ...prev, [lastActionTarget]: target.role }));
            }
          }
        }
        if (room.phase === 'voting') {
          setSelectedVoteId(null);
        }
        setLastPhase(room.phase);
      }
      // Keep track of actionTarget while we are in night
      if (room.phase === 'night' && currentPlayer?.actionTarget) {
        setLastActionTarget(currentPlayer.actionTarget);
      }
    }
  }, [room?.phase, currentPlayer?.actionTarget, lastPhase, players, currentPlayer?.role, lastActionTarget]);

  // Countdown timer calculation
  useEffect(() => {
    if (!room?.timerEnd) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((room.timerEnd - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [room?.timerEnd]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.chat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !isMeAlive) return;
    onSendMessage(messageText.trim());
    setMessageText('');
  };

  const handleVoteSubmit = () => {
    if (!selectedVoteId || !isMeAlive) return;
    onVoteSubmit(selectedVoteId);
  };

  // Chat message array
  const chatMessages = room?.chat ? Object.values(room.chat).sort((a, b) => a.timestamp - b.timestamp) : [];

  // Classic Werewolf atmospheric phase titles
  const getPhaseHeader = () => {
    switch (room?.phase) {
      case 'night':
        return {
          title: 'NIGHT FALLS',
          sub: 'The full moon rises. Special roles act in secret.',
          icon: <Moon className="w-5 h-5 text-red-500 animate-pulse" />,
          color: 'border-red-950 bg-red-950/10',
          timerLabel: 'Night'
        };
      case 'day':
        return {
          title: 'VILLAGE CHAT',
          sub: 'Discuss freely. Ready up when the council should begin.',
          icon: <Sun className="w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '8s' }} />,
          color: 'border-yellow-950 bg-yellow-950/10',
          timerLabel: 'Discussion'
        };
      case 'voting':
        return {
          title: 'THE VILLAGE RAISES ITS VOICES',
          sub: 'Chat stays open. Change your vote until the host ends the council.',
          icon: <Vote className="w-5 h-5 text-red-500 animate-bounce" />,
          color: 'border-red-950 bg-moon-blood/10',
          timerLabel: 'Suggested'
        };
      case 'result':
        return {
          title: 'DAWN REVEALS THE TRUTH',
          sub: 'The council\'s verdict is spoken aloud.',
          icon: <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />,
          color: 'border-yellow-950 bg-yellow-950/10',
          timerLabel: 'Reveal'
        };
      default:
        return { title: 'PLAYING', sub: '', icon: null, color: '', timerLabel: 'Timer' };
    }
  };

  const headerInfo = getPhaseHeader();

  const timerDisplay = () => {
    if (room?.phase === 'day' && timeLeft === 0) return 'READY';
    if (room?.phase === 'voting' && timeLeft === 0) return '—';
    return `${timeLeft}s`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Game Bar */}
      <div className={`p-4 border-b ${headerInfo.color} transition-colors duration-500`}>
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {headerInfo.icon}
            <div className="min-w-0">
              <h2 className="text-xs font-black tracking-widest text-white uppercase font-mono truncate">
                Day {room?.dayNumber || 1} • {headerInfo.title}
              </h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-snug">{headerInfo.sub}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block">{headerInfo.timerLabel}</span>
            <span className="text-xl font-bold font-mono text-white text-glow-red">
              {timerDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* Dead Player Warning Banner */}
      {!isMeAlive && (
        <div className="bg-red-950/80 border-b border-red-500/20 text-center py-2 text-xs text-red-400 font-bold uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
          <Skull className="w-4 h-4" />
          <span>Among the Spirits (Spectator)</span>
        </div>
      )}

      {/* Main Grid View */}
      <div className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-start space-y-4 overflow-y-auto">
        
        {/* Story Section — morning & vote reveal */}
        {['day', 'result'].includes(room?.phase) && room?.story && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl glass-panel-blood border-red-950 text-xs text-gray-200 leading-relaxed italic relative"
          >
            <div className="absolute top-0 right-3 transform -translate-y-1/2 bg-moon-blood text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-red-500/20 font-mono">
              Dawn Reveals the Truth
            </div>
            {room.story}
          </motion.div>
        )}

        {/* Shaman commune / Fortune teller private log dashboards */}
        {isMeAlive && currentPlayer?.role === 'fortune_teller' && Object.keys(localInvestigated).length > 0 && (
          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/10 text-[10px]">
            <p className="font-bold text-blue-400 uppercase tracking-wider mb-1">👁️ The Seer&apos;s Visions:</p>
            <div className="grid grid-cols-2 gap-1.5 font-mono">
              {Object.entries(localInvestigated).map(([tid, role]) => (
                <div key={tid} className="bg-black/30 px-2 py-0.5 rounded flex justify-between border border-blue-500/5">
                  <span className="text-gray-400 font-sans">{players[tid]?.name}</span>
                  <span className={role === 'werewolf' ? 'text-red-500 font-bold' : 'text-moon-safe font-bold'}>
                    {role === 'werewolf' ? 'MONSTER' : 'HUMAN'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isMeAlive && currentPlayer?.role === 'shaman' && Object.keys(localCommuned).length > 0 && (
          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/10 text-[10px]">
            <p className="font-bold text-purple-400 uppercase tracking-wider mb-1">💀 Voices of the Dead:</p>
            <div className="grid grid-cols-2 gap-1.5 font-mono">
              {Object.entries(localCommuned).map(([tid, role]) => (
                <div key={tid} className="bg-black/30 px-2 py-0.5 rounded flex justify-between border border-purple-500/5">
                  <span className="text-gray-400 font-sans">{players[tid]?.name}</span>
                  <span className="text-purple-400 font-bold uppercase">{ROLE_INFO[role]?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Villager Directory */}
        <div className="p-4 rounded-xl glass-panel metal-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-moon-iron/40 pb-2 mb-3 flex items-center justify-between">
            <span>Villagers ({alivePlayers.length} Alive)</span>
            <span className="text-[9px] font-mono font-medium text-gray-500">FULL MOON</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {Object.values(players).map((p) => {
              const isCurrent = p.id === currentPlayerId;
              const isTargeted = room?.phase === 'night' && p.id === currentPlayer?.actionTarget;
              const isInvestigated = localInvestigated[p.id];
              const isCommuned = localCommuned[p.id];
              const isReadyToVote = p.readyToVote;
              
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                    !p.alive
                      ? 'bg-black/20 border-moon-iron/10 opacity-40'
                      : isCurrent
                      ? 'bg-moon-metal/80 border-red-500/30'
                      : 'bg-moon-dark/80 border-moon-iron/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!p.alive ? (
                      <Skull className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-moon-safe animate-pulse shrink-0"></span>
                    )}
                    <span className={`text-xs truncate font-medium ${!p.alive ? 'line-through text-gray-600' : 'text-gray-300'} ${isCurrent ? 'font-bold text-white' : ''}`}>
                      {p.name}
                    </span>
                  </div>

                  {/* Private badge logs overlays — no who-voted-whom during voting */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isCurrent && (
                      <span className="text-[8px] font-bold bg-moon-blood text-white px-1.5 py-0.2 rounded font-mono uppercase border border-red-500/20">
                        {ROLE_INFO[currentPlayer.role]?.emoji} {ROLE_INFO[currentPlayer.role]?.name.split(' ')[0]}
                      </span>
                    )}
                    {p.alive && room?.phase === 'day' && isReadyToVote && (
                      <span className="text-[8px] font-bold bg-moon-safe/25 text-moon-safe border border-moon-safe/40 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        Ready
                      </span>
                    )}
                    {isTargeted && (
                      <span className="text-[8px] bg-red-950 text-red-500 border border-red-500/30 font-bold px-1 rounded animate-pulse uppercase">Target</span>
                    )}
                    {isInvestigated && (
                      <span className="text-xs" title={`Investigated: ${isInvestigated}`}>👁️</span>
                    )}
                    {isCommuned && (
                      <span className="text-xs" title={`Communed: ${isCommuned}`}>💀</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Phase Control Panels */}

        {/* A. Night Phase Content */}
        {room?.phase === 'night' && (
          <div className="flex-1 flex flex-col justify-center">
            {isMeAlive ? (
              // Active Night Ability Role
              ['werewolf', 'fortune_teller', 'knight', 'shaman'].includes(currentPlayer?.role) ? (
                <ActionModal
                  role={currentPlayer.role}
                  players={players}
                  currentPlayerId={currentPlayerId}
                  lastProtectedId={currentPlayer.lastProtectedId}
                  onActionSubmit={onActionSubmit}
                />
              ) : (
                // Passive Citizen or Psycho Role
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-2xl glass-panel text-center space-y-4 border border-moon-iron/40"
                >
                  <div className="w-16 h-16 rounded-full bg-moon-dark border border-moon-iron flex items-center justify-center mx-auto box-glow-red animate-pulse">
                    <Moon className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-md font-extrabold tracking-widest text-white uppercase font-sans">Sleep Beneath the Moon</h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-[240px] mx-auto italic">
                    &quot;The village doors are barred. Somewhere in the forest, claws scrape bark and eyes gleam. Rest if you can — dawn will tell who remains.&quot;
                  </p>
                  <div className="text-[10px] text-gray-600 uppercase tracking-widest animate-pulse font-mono font-medium">
                    No Night Action Required
                  </div>
                </motion.div>
              )
            ) : (
              // Spectator dead night panel
              <div className="text-center py-8 text-xs text-gray-500 uppercase tracking-widest italic animate-pulse">
                You drift among the spirits. The wolves are choosing their prey...
              </div>
            )}
          </div>
        )}

        {/* Result Phase — vote / dawn reveal only */}
        {room?.phase === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl glass-panel-blood text-center space-y-3"
          >
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
            <h3 className="text-sm font-black tracking-[0.2em] text-white uppercase">Dawn Reveals the Truth</h3>
            <p className="text-xs text-gray-300 leading-relaxed italic">{room.story}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">
              Night will fall again soon...
            </p>
          </motion.div>
        )}

        {/* B. Day / Voting — Village Chat */}
        {['day', 'voting'].includes(room?.phase) && (
          <div className="flex-1 flex flex-col glass-panel metal-border rounded-xl h-[300px] overflow-hidden">
            {/* Chat header */}
            <div className="bg-black/30 px-3 py-2 border-b border-moon-iron/30 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-yellow-500" /> Village Chat
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            </div>

            {/* Ready to Vote status bar */}
            {room?.phase === 'day' && isMeAlive && (
              <div className="bg-moon-metal/50 px-3 py-2 border-b border-moon-iron/30 flex items-center justify-between gap-2 shrink-0">
                <div className="text-[10px] text-gray-400">
                  {currentPlayer?.readyToVote ? (
                    <span className="text-moon-safe font-bold">✓ Ready for Council</span>
                  ) : (
                    <span>Still discussing...</span>
                  )}
                  <span className="text-[9px] text-gray-500 block">
                    {Object.values(players).filter(p => p.alive && p.readyToVote).length} / {alivePlayers.length} villagers ready
                  </span>
                </div>
                <button
                  onClick={onToggleReadyToVote}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    currentPlayer?.readyToVote
                      ? 'bg-yellow-950/30 border-yellow-600/40 text-yellow-400 hover:bg-yellow-900/20'
                      : 'bg-moon-blood hover:bg-moon-danger text-white border-red-500/20 hover:shadow-[0_0_8px_rgba(220,38,38,0.3)]'
                  }`}
                >
                  {currentPlayer?.readyToVote ? 'Cancel Ready' : 'Ready to Vote'}
                </button>
              </div>
            )}

            {/* Chat message listing */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-[10px] text-gray-600 uppercase tracking-widest italic">
                  The square is quiet. Speak below.
                </div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMe = msg.senderId === currentPlayerId;
                  const isSenderAlive = players[msg.senderId]?.alive;
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <span className="text-[9px] text-gray-500 px-1 mb-0.5">
                        {msg.senderName} {!isSenderAlive && '💀'}
                      </span>
                      <div 
                        className={`p-2.5 rounded-lg text-xs leading-normal font-sans border ${
                          isMe 
                            ? 'bg-moon-blood/20 border-red-500/20 text-white rounded-tr-none' 
                            : 'bg-moon-dark/70 border-moon-iron/40 text-gray-300 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat inputs */}
            {isMeAlive ? (
              <form 
                onSubmit={handleSendMessage}
                className="p-2 border-t border-moon-iron/30 bg-black/40 flex items-center gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value.substring(0, 80))}
                  placeholder="Speak to the village..."
                  className="flex-1 bg-moon-dark border border-moon-iron focus:border-red-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2 rounded-lg bg-moon-blood hover:bg-moon-danger border border-red-500/10 text-white transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                </button>
              </form>
            ) : (
              <div className="p-2 border-t border-moon-iron/30 bg-black/40 text-center text-[10px] text-gray-600 uppercase tracking-widest italic shrink-0">
                The dead may listen, but cannot speak.
              </div>
            )}
          </div>
        )}

        {/* C. Voting Phase Content */}
        {room?.phase === 'voting' && (
          <div className="flex-1 flex flex-col justify-center space-y-3">
            {isMeAlive ? (
              <div className="p-4 rounded-xl glass-panel metal-border flex flex-col max-h-[85vh]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 border-b border-moon-iron/40 pb-2 mb-1">
                  The Village Raises Its Voices
                </h4>
                <p className="text-[9px] text-gray-500 mb-3">
                  Votes stay secret. You may change your choice until the host reveals the verdict.
                </p>

                {/* Vote Candidates */}
                <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1">
                  {/* Skip Vote Option */}
                  <button
                    onClick={() => setSelectedVoteId('skip')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                      selectedVoteId === 'skip'
                        ? 'bg-yellow-950/30 border-yellow-600/40 text-yellow-400 font-bold'
                        : 'bg-moon-dark/70 border-moon-iron/30 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedVoteId === 'skip' ? 'bg-yellow-500' : 'bg-transparent border border-gray-600'}`}></span>
                      <span>Spare everyone tonight</span>
                    </div>
                  </button>

                  {/* Active Players */}
                  {alivePlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedVoteId(player.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                        selectedVoteId === player.id
                          ? 'bg-moon-blood/35 border-red-500/50 text-white font-bold'
                          : 'bg-moon-dark/70 border-moon-iron/30 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedVoteId === player.id ? 'bg-red-500' : 'bg-transparent border border-gray-600'}`}></span>
                        <span>{player.name} {player.id === currentPlayerId && '(You)'}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleVoteSubmit}
                  disabled={!selectedVoteId}
                  className="w-full mt-4 py-2.5 rounded-lg bg-moon-blood hover:bg-moon-danger text-white font-bold text-xs uppercase tracking-wider border border-red-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none hover:shadow-[0_0_12px_rgba(220,38,38,0.3)] active:scale-95"
                >
                  {currentPlayer?.vote ? 'Change Your Vote' : 'Cast Your Vote'}
                </button>
                {currentPlayer?.vote && (
                  <p className="text-[9px] text-moon-safe text-center mt-2 uppercase tracking-wider">
                    Your ballot is cast — you may still change it
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-500 uppercase tracking-widest italic animate-pulse">
                The spirits cannot vote. Wait for the verdict...
              </div>
            )}

            {/* Host-only: vote progress (count only) + end council */}
            {isHost && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-moon-mist/80 border border-moon-silver/20 text-center">
                  <p className="text-sm font-bold text-white tracking-wide">
                    {votedCount}/{aliveConnected.length} villagers have voted
                  </p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">
                    Ballots are sealed — targets stay hidden
                  </p>
                </div>
                <button
                  onClick={onTransitionPhase}
                  className="w-full py-4 rounded-xl bg-red-800 hover:bg-red-600 border border-red-400/40 text-white font-black text-sm uppercase tracking-[0.18em] transition-all box-glow-red"
                >
                  End the Council
                  <span className="block text-[10px] font-semibold tracking-[0.12em] opacity-80 mt-1 normal-case">
                    Reveal the Verdict
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Host overrides for debugger testing */}
        {import.meta.env.DEV && isHost && (
          <div className="p-3 rounded-lg bg-moon-dark border border-moon-iron/40 space-y-2">
            <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>Host Overrides (Developer Tools)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {room?.phase === 'night' && (
                <button
                  onClick={() => onTransitionPhase('day')}
                  className="px-2 py-1 rounded bg-moon-blood/30 border border-red-500/20 text-[9px] font-semibold text-white uppercase hover:bg-moon-blood/50 transition-all"
                >
                  Force Dawn
                </button>
              )}
              {room?.phase === 'day' && (
                <button
                  onClick={() => onTransitionPhase('voting')}
                  className="px-2 py-1 rounded bg-moon-blood/30 border border-red-500/20 text-[9px] font-semibold text-white uppercase hover:bg-moon-blood/50 transition-all"
                >
                  Force Vote Stage
                </button>
              )}
              {room?.phase === 'voting' && (
                <button
                  onClick={() => onTransitionPhase('result')}
                  className="px-2 py-1 rounded bg-moon-blood/30 border border-red-500/20 text-[9px] font-semibold text-white uppercase hover:bg-moon-blood/50 transition-all"
                >
                  Force Reveal Verdict
                </button>
              )}
              {room?.phase === 'result' && (
                <button
                  onClick={() => onTransitionPhase('night')}
                  className="px-2 py-1 rounded bg-moon-blood/30 border border-red-500/20 text-[9px] font-semibold text-white uppercase hover:bg-moon-blood/50 transition-all"
                >
                  Force Next Night
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
