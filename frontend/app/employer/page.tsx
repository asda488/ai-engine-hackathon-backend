'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function EmployerDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [volunteers, setVolunteers] = useState<{ name: string; role: string; score: number; status: string }[]>([]);

  useEffect(() => {
    // Load volunteers (mock for now)
    setVolunteers([
      { name: 'Alex Turner', role: 'Bartender', score: 90, status: 'SHIFT READY' },
      { name: 'Jamie Chen', role: 'Bartender', score: 74, status: 'SHIFT READY' },
      { name: 'Sam Reid', role: 'Bartender', score: 55, status: 'TRAINING REQUIRED' },
    ]);
  }, []);

  const handleUpload = async () => {
    if (!file || !role) return;
    setLoading(true);
    try {
      const result = await api.uploadDocument(file, 'employer-1'); // Mock employer ID
      await api.generateTraining(result.document_id, role);
      alert('Training generated successfully!');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Employer Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Document & Generate Training</h2>
        <div className="space-y-4">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
            className="block w-full"
          />
          <select
            value={role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
            className="block w-full p-2 border rounded"
          >
            <option value="">Select Role</option>
            <option value="Bartender">Bartender</option>
            <option value="Server">Server</option>
            <option value="Security">Security</option>
          </select>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Training'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Volunteers</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left">Name</th>
              <th className="text-left">Role</th>
              <th className="text-left">Score</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((volunteer: any, index: number) => (
              <tr key={index} className="border-b">
                <td>{volunteer.name}</td>
                <td>{volunteer.role}</td>
                <td>{volunteer.score}%</td>
                <td>
                  <span className={`px-2 py-1 rounded text-sm ${
                    volunteer.status === 'SHIFT READY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {volunteer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}