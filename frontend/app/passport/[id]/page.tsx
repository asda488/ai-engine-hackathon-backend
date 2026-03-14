'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

export default function Passport() {
  const params = useParams();
  const [passport, setPassport] = useState<any>(null);

  useEffect(() => {
    const loadPassport = async () => {
      const passportData = await api.getPassport(params.id as string);
      setPassport(passportData);
    };
    loadPassport();
  }, [params.id]);

  if (!passport) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            {passport.volunteer_name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <h1 className="text-2xl font-bold">{passport.volunteer_name}</h1>
          <p className="text-gray-600">{passport.role}</p>
        </div>

        <div className="mb-6">
          <div className={`px-4 py-2 rounded text-center font-semibold ${
            passport.status === 'SHIFT READY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {passport.status}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Verified Skills</h3>
          <div className="flex flex-wrap gap-2">
            {passport.skills.map((skill: string, index: number) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Readiness Score</h3>
          <div className="text-3xl font-bold text-center">{passport.readiness_score}%</div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">XP Points</h3>
          <div className="text-2xl font-bold text-center">{passport.xp}</div>
        </div>

        <div className="text-center text-sm text-gray-500">
          Issued: {new Date(passport.issued_at).toLocaleDateString()}
        </div>

        <button
          onClick={() => navigator.share({ url: window.location.href })}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
        >
          Share Passport
        </button>
      </div>
    </div>
  );
}