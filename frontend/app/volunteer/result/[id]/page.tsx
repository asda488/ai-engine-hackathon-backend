'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function QuizResult() {
  const params = useParams();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Mock result data
    setResult({
      score: 85,
      passed: true,
      readiness_score: 82,
      breakdown: { knowledge: 90, safety: 80, operations: 76 },
      xp: 185,
      passport_id: 'passport-1'
    });
  }, []);

  if (!result) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
        <div className={`text-6xl mb-4 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
          {result.passed ? '✅' : '❌'}
        </div>
        <h1 className="text-3xl font-bold mb-4">
          {result.passed ? 'PASS' : 'FAIL'}
        </h1>
        <p className="text-xl mb-4">Score: {result.score}%</p>
        <p className="text-lg mb-4">Readiness Score: {result.readiness_score}%</p>
        <p className="text-lg mb-4">XP Earned: {result.xp}</p>
        {result.passed && (
          <Link href={`/passport/${result.passport_id}`} className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            View Your ShiftPass
          </Link>
        )}
      </div>
    </div>
  );
}