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
    // Try sessionStorage first (set by training page immediately after submission)
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
        // ignore parse errors, fall through to API
      }
    }

    // Fallback: fetch from API (page refresh or direct link)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-2">Could not load results.</p>
          <Link href="/volunteer" className="text-blue-600 hover:underline text-sm">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Pass/Fail banner */}
        <div className={`rounded-2xl p-8 text-center shadow-md ${
          result.passed ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="text-6xl mb-3">{result.passed ? '🎉' : '❌'}</div>
          <h1 className={`text-4xl font-bold mb-2 ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
            {result.passed ? 'PASS' : 'FAIL'}
          </h1>
          {result.volunteer_name && (
            <p className="text-gray-600 mb-1">{result.volunteer_name} · {result.role}</p>
          )}
          <p className="text-2xl font-semibold text-gray-800">{result.score}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {result.passed
              ? 'You scored above the 70% pass threshold.'
              : 'You need 70% to pass. Review the training and try again.'}
          </p>
        </div>

        {/* XP */}
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-1">XP Earned</p>
          <p className="text-4xl font-bold text-purple-600">+{result.xp}</p>
        </div>

        {/* Readiness breakdown */}
        <ReadinessChart breakdown={result.breakdown} overall={result.readiness_score} />

        {/* CTA */}
        {result.passed ? (
          <Link
            href={`/passport/${passportId}`}
            className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            View Your ShiftPass
          </Link>
        ) : (
          <Link
            href="/volunteer"
            className="block w-full bg-gray-600 text-white text-center px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            Try Again
          </Link>
        )}
      </div>
    </div>
  );
}
