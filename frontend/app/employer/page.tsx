'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { getEmployerSession } from '../../lib/session';
import VolunteerTable from '../../components/VolunteerTable';

const ROLES = ['Bartender', 'Server', 'Security', 'Steward', 'Cashier', 'Supervisor'];

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
  const [employerId, setEmployerId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getEmployerSession();
    setEmployerId(session.id);
    api.getEmployerVolunteers(session.id)
      .then(setVolunteers)
      .catch(() => {
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
      const uploadResult = await api.uploadDocument(file, employerId);

      setLoadingStatus('AI is generating your training module... (~15s)');
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

  const shiftReady = volunteers.filter((v) => v.status === 'SHIFT READY').length;
  const avgScore = volunteers.length > 0
    ? Math.round(volunteers.reduce((s, v) => s + v.score, 0) / volunteers.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl animate-float">🏢</div>
            <div>
              <h1 className="text-3xl font-black text-white">Employer Dashboard</h1>
              <p className="text-white/50 text-sm">Generate AI training modules and track your crew</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: volunteers.length, label: 'Total Volunteers', icon: '👥', gradient: 'from-violet-500 to-purple-600' },
            { value: shiftReady, label: 'Shift Ready', icon: '✅', gradient: 'from-emerald-500 to-teal-600' },
            { value: `${avgScore}%`, label: 'Avg. Score', icon: '🎯', gradient: 'from-pink-500 to-rose-600' },
          ].map(({ value, label, icon, gradient }) => (
            <div key={label} className={`bg-gradient-to-br ${gradient} rounded-3xl p-5 shadow-xl card-hover`}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-white/70 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Upload section */}
          <div className="glass rounded-3xl p-6 shadow-2xl animate-slide-up">
            <h2 className="text-lg font-black text-white mb-1">Generate Training Module</h2>
            <p className="text-white/50 text-xs mb-5">Upload a staff handbook PDF and let AI do the rest</p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center mb-4 cursor-pointer transition-all ${
                dragging
                  ? 'border-violet-400 bg-violet-500/20 scale-[1.02]'
                  : file
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
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
                  <div className="text-4xl mb-2 animate-bounce-in">📄</div>
                  <p className="font-bold text-emerald-300">{file.name}</p>
                  <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2 animate-float">📂</div>
                  <p className="text-white/60 text-sm font-medium">Drag & drop a PDF or TXT</p>
                  <p className="text-white/30 text-xs mt-1">or click to browse</p>
                </>
              )}
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white/15 transition-all"
            >
              <option value="" className="bg-slate-800">Select role...</option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-slate-800">{r}</option>
              ))}
            </select>

            {error && (
              <p className="text-red-400 text-sm mb-3 flex items-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || !file || !role}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-2xl hover:opacity-90 disabled:opacity-30 transition-all font-bold shadow-lg btn-glow"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span> {loadingStatus || 'Processing...'}
                </span>
              ) : (
                '✨ Generate Training'
              )}
            </button>
          </div>

          {/* Quick tips */}
          <div className="space-y-4">
            <div className="glass rounded-3xl p-5 shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-white font-bold mb-3">🚀 How it works</h3>
              <div className="space-y-3">
                {[
                  { icon: '📤', text: 'Upload your staff handbook or SOP doc' },
                  { icon: '🤖', text: 'AI extracts key training topics automatically' },
                  { icon: '📝', text: '10 quiz questions generated per role' },
                  { icon: '🔗', text: 'Share the link — volunteers train & get certified' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <span className="text-white/60 text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Volunteers table */}
        <div className="glass rounded-3xl p-6 shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-black text-white mb-5">
            👥 Volunteers
            <span className="ml-2 text-sm font-medium text-white/40">({volunteers.length})</span>
          </h2>
          <VolunteerTable volunteers={volunteers} />
        </div>
      </div>
    </div>
  );
}
