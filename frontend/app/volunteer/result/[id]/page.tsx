'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import ReadinessChart from '../../../../components/ReadinessChart';

interface QuizResult {
  score: number;
  passed: boolean;
  readiness_score: number;
  breakdown: { knowledge: number; safety: number; operations: number };
  xp: number;
  passport_id: string;
  volunteer_name?: string;
  role?: string;
}

export default function QuizResult() {
  const params = useParams();
  const passportId = Array.isArray(params.id) ? params.id[0] : params.id as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('quizResult');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.passport_id === passportId) {
          setResult(parsed);
          setLoading(false);
          sessionStorage.removeItem('quizResult');
          return;
        }
      } catch {
        // ignore
      }
    }

    api.getPassportById(passportId)
      .then((data) => {
        setResult({
          score: data.score ?? data.readiness_score,
          passed: data.status === 'SHIFT READY',
          readiness_score: data.readiness_score,
          breakdown: data.breakdown ?? { knowledge: 0, safety: 0, operations: 0 },
          xp: data.xp,
          passport_id: passportId,
          volunteer_name: data.volunteer_name,
          role: data.role,
        });
      })
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [passportId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 to-indigo-900">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin-slow">⚙️</div>
          <p className="text-white/60 font-medium">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 to-indigo-900">
        <div className="text-center glass rounded-3xl p-8">
          <div className="text-4xl mb-3">😢</div>
          <p className="text-white mb-4">Could not load results.</p>
          <Link href="/volunteer" className="text-violet-300 hover:text-white text-sm font-medium">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 flex items-center justify-center ${
      result.passed
        ? 'bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900'
        : 'bg-gradient-to-br from-red-900 via-rose-900 to-orange-900'
    }`}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 right-10 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float ${result.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <div className={`absolute bottom-10 left-10 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float ${result.passed ? 'bg-teal-400' : 'bg-orange-400'}`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Pass/Fail banner */}
        <div className="glass rounded-3xl p-8 text-center animate-bounce-in shadow-2xl">
          <div className="text-7xl mb-4 animate-bounce">
            {result.passed ? '🎉' : '😤'}
          </div>
          <h1 className={`text-5xl font-black mb-2 ${result.passed ? 'text-emerald-300' : 'text-red-300'}`}>
            {result.passed ? 'PASSED!' : 'NOT YET'}
          </h1>
          {result.volunteer_name && (
            <p className="text-white/60 text-sm mb-3">
              {result.volunteer_name} · {result.role}
            </p>
          )}
          <div className={`text-6xl font-black mb-2 ${result.passed ? 'text-white' : 'text-white/80'}`}>
            {result.score}%
          </div>
          <p className="text-white/50 text-sm">
            {result.passed
              ? '🎯 You scored above the 70% pass threshold.'
              : '📚 You need 70% to pass. Review the training and try again.'}
          </p>
        </div>

        {/* XP card */}
        <div className="glass rounded-3xl p-6 text-center shadow-xl animate-slide-up">
          <p className="text-white/50 text-sm font-medium mb-1">XP Earned</p>
          <p className="text-5xl font-black text-yellow-300">⚡ +{result.xp}</p>
          <p className="text-white/30 text-xs mt-1">Keep levelling up!</p>
        </div>

        {/* Readiness breakdown */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <ReadinessChart breakdown={result.breakdown} overall={result.readiness_score} />
        </div>

        {/* CTA */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {result.passed ? (
            <Link
              href={`/passport/${passportId}`}
              className="block w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center px-6 py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl btn-glow-green"
            >
              🎫 View Your ShiftPass
            </Link>
          ) : (
            <Link
              href="/volunteer"
              className="block w-full glass border border-white/20 text-white text-center px-6 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              🔄 Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
