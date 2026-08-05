import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileWarning, Siren, Skull } from 'lucide-react';

export default function FinaleScreen({ story, onReveal }) {
  return (
    <div className="min-h-screen px-4 py-8 flex flex-col justify-between overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(127,29,29,0.28),transparent_42%)] pointer-events-none" />

      <div className="w-full max-w-md mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex p-4 rounded-full bg-red-950/40 border border-red-500/30 text-red-500 box-glow-red"
        >
          <Siren className="w-10 h-10 animate-pulse" />
        </motion.div>
        <p className="mt-5 text-[10px] font-mono tracking-[0.35em] uppercase text-red-400">Final moonrise</p>
        <h1 className="mt-2 text-4xl creepster-font tracking-wider text-white text-glow-red uppercase">Dawn Reveals the Truth</h1>
        <p className="mt-3 text-xs tracking-widest uppercase text-gray-500">The village falls silent. Hear the last report.</p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55 }}
        className="w-full max-w-md mx-auto relative p-5 rounded-2xl glass-panel-blood metal-border box-glow-red"
      >
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-red-500/20">
          <FileWarning className="w-5 h-5 text-red-500" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-300">Village chronicle</span>
        </div>
        <div className="flex gap-3">
          <Skull className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <p className="text-sm leading-7 text-gray-200 italic">{story || 'Mist settles over the cottages. Somewhere in the dark pines, the final truth waits to be uncovered.'}</p>
        </div>
        <p className="mt-5 text-[10px] leading-relaxed text-gray-500 uppercase tracking-wider">
          Roles are still sealed. One final verdict remains.
        </p>
      </motion.section>

      <div className="w-full max-w-md mx-auto relative">
        <button
          onClick={onReveal}
          className="w-full py-3.5 rounded-xl bg-moon-danger hover:bg-red-500 border border-red-400/30 text-white font-bold text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 box-glow-red active:scale-95"
        >
          Open the final verdict <ChevronRight className="w-5 h-5" />
        </button>
        <p className="mt-3 text-center text-[9px] uppercase tracking-widest text-gray-600">Tap when everyone is ready</p>
      </div>
    </div>
  );
}
