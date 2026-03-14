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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎫</div>
          <p className="text-gray-600">Loading passport...</p>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error || 'Passport not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
      <PassportCard passport={{ ...passport, id: passportId }} showShare={true} />
    </div>
  );
}
