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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎟️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ShiftPass</h1>
          <p className="text-gray-600">Complete your training and earn your workforce passport.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Start Training</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter the Training ID shared by your employer to begin your onboarding module.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training ID
              </label>
              <input
                type="text"
                value={trainingId}
                onChange={(e) => { setTrainingId(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="e.g. a1b2c3d4-..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Begin Training
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📚', label: 'Learn Topics' },
            { icon: '📝', label: 'Take Quiz' },
            { icon: '🎫', label: 'Get Passport' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-white bg-opacity-60 rounded-xl p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs text-gray-600 font-medium">{label}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
