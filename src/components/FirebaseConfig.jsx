import React, { useState } from 'react';
import { saveFirebaseConfig } from '../firebase';
import { ShieldAlert, Database, Key, HelpCircle, ArrowRight } from 'lucide-react';

export default function FirebaseConfig({ onConfigured }) {
  const [apiKey, setApiKey] = useState('');
  const [databaseURL, setDatabaseURL] = useState('');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!apiKey || !databaseURL || !projectId) {
      setError('All fields are required.');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim(),
      authDomain: `${projectId.trim()}.firebaseapp.com`,
      storageBucket: `${projectId.trim()}.appspot.com`,
    };

    const isInit = saveFirebaseConfig(config);
    if (isInit) {
      setSuccess(true);
      setTimeout(() => {
        onConfigured();
      }, 1500);
    } else {
      setError('Failed to initialize Firebase with these settings. Check console for details.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md p-6 rounded-2xl glass-panel metal-border border-red-900/30 box-glow-red">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-red-950/50 border border-red-500/30 text-red-500 mb-3 animate-pulse">
            <Database className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider creepster-font text-red-500 text-glow-red uppercase">
            Database Setup
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            Satu Malam Bulan Purnama uses Firebase Realtime Database to sync the village in real time. Configure your project below.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="text-moon-safe text-lg font-semibold mb-2">✓ Connection Established</div>
            <p className="text-gray-400 text-xs">Entering the village under the full moon...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-red-500" /> Firebase API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-moon-dark border border-moon-iron focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Database className="w-3 h-3 text-red-500" /> Database URL
              </label>
              <input
                type="text"
                value={databaseURL}
                onChange={(e) => setDatabaseURL(e.target.value)}
                placeholder="https://your-app-default-rtdb.firebaseio.com"
                className="w-full bg-moon-dark border border-moon-iron focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-red-500" /> Project ID
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-moon-game-123"
                className="w-full bg-moon-dark border border-moon-iron focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-lg bg-moon-blood hover:bg-moon-danger border border-red-500/20 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95"
            >
              <span>Connect Database</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-moon-iron/40 pt-4 text-center">
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-red-400/80 hover:text-red-400 underline transition-colors"
          >
            Don't have a Firebase project? Create one here
          </a>
          <p className="text-[9px] text-gray-500 mt-2 font-mono">
            Ensure Realtime Database read/write rules are set to "true" for testing.
          </p>
        </div>
      </div>
    </div>
  );
}
