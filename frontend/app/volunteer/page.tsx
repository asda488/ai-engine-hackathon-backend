'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VolunteerHome() {
  const router = useRouter();
  const [trainingId, setTrainingId] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    const id = trainingId.trim();
    if (!id) {
      setError('Please enter a Training ID.');
      return;
    }
    router.push(`/volunteer/training/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl mb-4 animate-bounce-in">🎟️</div>
          <h1 className="text-4xl font-black text-white mb-2">ShiftPass</h1>
          <p className="text-white/70 text-sm">Complete your training. Earn your passport. Get to work.</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-white mb-1">Start Training 🚀</h2>
          <p className="text-white/60 text-sm mb-6">
            Enter the Training ID your employer shared with you.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Training ID
              </label>
              <input
                type="text"
                value={trainingId}
                onChange={(e) => { setTrainingId(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="e.g. a1b2c3d4-..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all text-sm"
              />
              {error && (
                <p className="text-red-300 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-white text-emerald-700 py-3 rounded-xl hover:bg-emerald-50 transition-all font-bold text-base btn-glow-green"
            >
              Begin Training ✨
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-6 grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: '📚', label: 'Learn Topics', color: 'from-violet-500 to-purple-600' },
            { icon: '📝', label: 'Take Quiz', color: 'from-pink-500 to-rose-600' },
            { icon: '🎫', label: 'Get Passport', color: 'from-amber-400 to-orange-500' },
          ].map(({ icon, label, color }, i) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-center card-hover shadow-lg`} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="text-2xl mb-1 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{icon}</div>
              <div className="text-white text-xs font-semibold">{label}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
