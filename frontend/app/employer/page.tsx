'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import VolunteerTable from '../../components/VolunteerTable';

const ROLES = ['Bartender', 'Server', 'Security', 'Steward', 'Cashier', 'Supervisor'];
const EMPLOYER_ID = 'employer-1'; // Replace with real auth session in production

interface Volunteer {
  name: string;
  email: string;
  role: string;
  score: number;
  xp: number;
  status: string;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getEmployerVolunteers(EMPLOYER_ID)
      .then(setVolunteers)
      .catch(() => {
        // Seed data fallback for demo
        setVolunteers([
          { name: 'Alex Turner', email: 'alex@demo.com', role: 'Bartender', score: 90, xp: 190, status: 'SHIFT READY' },
          { name: 'Jamie Chen', email: 'jamie@demo.com', role: 'Bartender', score: 74, xp: 174, status: 'SHIFT READY' },
          { name: 'Sam Reid', email: 'sam@demo.com', role: 'Bartender', score: 55, xp: 155, status: 'TRAINING REQUIRED' },
        ]);
      });
  }, []);

  const handleUpload = async () => {
    if (!file || !role) {
      setError('Please select a file and a role.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      setLoadingStatus('Uploading document...');
      const uploadResult = await api.uploadDocument(file, EMPLOYER_ID);

      setLoadingStatus('AI is generating your training module... (this takes ~15s)');
      const trainingResult = await api.generateTraining(uploadResult.document_id, role);

      router.push(`/employer/training/${trainingResult.training_module_id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith('.pdf') || dropped.name.endsWith('.txt'))) {
      setFile(dropped);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-500 mt-1">Upload your handbook and generate AI training modules for your team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate Training Module</h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-colors cursor-pointer ${
                dragging ? 'border-blue-400 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <>
                  <div className="text-3xl mb-2">📄</div>
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📂</div>
                  <p className="text-gray-600 text-sm">Drag & drop a PDF or TXT file here</p>
                  <p className="text-gray-400 text-xs mt-1">or click to browse</p>
                </>
              )}
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select role...</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={handleUpload}
              disabled={loading || !file || !role}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span> {loadingStatus || 'Processing...'}
                </span>
              ) : (
                'Generate Training'
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Volunteers</p>
              <p className="text-3xl font-bold text-gray-900">{volunteers.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Shift Ready</p>
              <p className="text-3xl font-bold text-green-600">
                {volunteers.filter((v) => v.status === 'SHIFT READY').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Avg. Readiness Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {volunteers.length > 0
                  ? Math.round(volunteers.reduce((s, v) => s + v.score, 0) / volunteers.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Volunteers table */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Volunteers</h2>
          <VolunteerTable volunteers={volunteers} />
        </div>
      </div>
    </div>
  );
}
