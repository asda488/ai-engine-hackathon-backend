'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import PassportCard from '../../../components/PassportCard';

export default function PassportPage() {
  const params = useParams();
  const passportId = Array.isArray(params.id) ? params.id[0] : params.id as string;

  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPassportById(passportId)
      .then(setPassport)
      .catch(() => setError('Passport not found.'))
      .finally(() => setLoading(false));
  }, [passportId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎫</div>
          <p className="text-white/60 font-medium">Loading passport...</p>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 to-indigo-900">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-white/70">{error || 'Passport not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" style={{ animationDelay: '1s' }} />
      <div className="relative z-10 w-full">
        <PassportCard passport={{ ...passport, id: passportId }} showShare={true} />
      </div>
    </div>
  );
}
