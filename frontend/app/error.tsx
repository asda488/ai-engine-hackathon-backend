'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[ShiftPass] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-6">
      <div className="text-center glass rounded-3xl p-10 max-w-sm animate-bounce-in">
        <div className="text-5xl mb-4">💥</div>
        <h2 className="text-2xl font-black text-white mb-2">Something went wrong</h2>
        <p className="text-white/50 text-sm mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all btn-glow"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
