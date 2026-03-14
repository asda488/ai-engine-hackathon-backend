'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';

interface Topic {
  id: number; title: string; summary: string; key_points: string[]; category: string;
}
interface Question {
  id: number; question: string; options: string[]; correct_index: number; explanation: string; category: string;
}

const categoryConfig: Record<string, { bg: string; text: string; icon: string }> = {
  knowledge: { bg: 'bg-violet-100', text: 'text-violet-700', icon: '🧠' },
  safety:    { bg: 'bg-rose-100',   text: 'text-rose-700',   icon: '🛡️' },
  operations:{ bg: 'bg-emerald-100',text: 'text-emerald-700',icon: '⚙️' },
};

export default function EmployerTrainingPreview() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id as string;

  const [training, setTraining] = useState<{ topics: Topic[]; slides: any[] } | null>(null);
  const [quiz, setQuiz] = useState<{ quiz_id: string; questions: Question[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'topics' | 'quiz'>('topics');

  useEffect(() => {
    Promise.all([api.getTraining(id), api.getQuizWithAnswers(id)])
      .then(([t, q]) => { setTraining(t); setQuiz(q); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const volunteerLink = typeof window !== 'undefined'
    ? `${window.location.origin}/volunteer/training/${id}`
    : `/volunteer/training/${id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(volunteerLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center">
        <div className="text-center glass rounded-3xl p-12">
          <div className="text-5xl mb-4 animate-spin-slow">⚙️</div>
          <p className="text-white/60 font-medium">Loading training module...</p>
        </div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center">
        <div className="text-center glass rounded-3xl p-10">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-white/70 mb-4">Training module not found.</p>
          <Link href="/employer" className="text-violet-300 hover:text-white text-sm font-medium">← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <Link href="/employer" className="text-violet-400 hover:text-violet-200 text-sm font-medium mb-2 inline-block transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white">Training Preview</h1>
            <p className="text-white/40 text-xs mt-1 font-mono">ID: {id}</p>
          </div>

          {/* Share link */}
          <div className="flex items-center gap-3">
            <div className="glass border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/40 font-mono max-w-xs truncate">
              /volunteer/training/{id.slice(0, 8)}…
            </div>
            <button
              onClick={copyLink}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 btn-glow'
              }`}
            >
              {copied ? '✅ Copied!' : '🔗 Copy Link'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          {[
            { value: training.topics?.length ?? 0, label: 'Topics', icon: '📚', gradient: 'from-violet-500 to-purple-600' },
            { value: quiz?.questions?.length ?? 0, label: 'Quiz Questions', icon: '📝', gradient: 'from-pink-500 to-rose-600' },
            { value: '70%', label: 'Pass Threshold', icon: '🎯', gradient: 'from-emerald-500 to-teal-600' },
          ].map(({ value, label, icon, gradient }) => (
            <div key={label} className={`bg-gradient-to-br ${gradient} rounded-3xl p-5 text-center shadow-xl card-hover`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-white/70 text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['topics', 'quiz'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                  : 'glass text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab === 'topics' ? `📚 Topics (${training.topics?.length ?? 0})` : `📝 Quiz (${quiz?.questions?.length ?? 0})`}
            </button>
          ))}
        </div>

        {/* Topics */}
        {activeTab === 'topics' && (
          <div className="space-y-4">
            {training.topics?.map((topic, i) => {
              const cfg = categoryConfig[topic.category] ?? { bg: 'bg-gray-100', text: 'text-gray-600', icon: '📌' };
              return (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-xl card-hover animate-slide-up">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-black text-gray-900">{topic.title}</h3>
                    <span className={`${cfg.bg} ${cfg.text} text-xs px-3 py-1 rounded-full font-bold capitalize flex items-center gap-1 flex-shrink-0 ml-3`}>
                      {cfg.icon} {topic.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{topic.summary}</p>
                  {topic.key_points?.length > 0 && (
                    <ul className="space-y-1.5">
                      {topic.key_points.map((point, j) => (
                        <li key={j} className="text-sm text-gray-500 flex items-start gap-2">
                          <span className="text-violet-400 mt-0.5 font-bold">•</span> {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quiz */}
        {activeTab === 'quiz' && quiz && (
          <div className="space-y-4">
            {quiz.questions.map((q, i) => {
              const cfg = categoryConfig[q.category] ?? { bg: 'bg-gray-100', text: 'text-gray-600', icon: '❓' };
              return (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-xl card-hover animate-slide-up">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">Q{i + 1}</span>
                    <span className={`${cfg.bg} ${cfg.text} text-xs px-3 py-1 rounded-full font-bold capitalize flex items-center gap-1`}>
                      {cfg.icon} {q.category}
                    </span>
                  </div>
                  <p className="text-gray-900 font-bold mb-4 text-sm">{q.question}</p>
                  <ul className="space-y-2 mb-3">
                    {q.options.map((opt, j) => (
                      <li key={j} className={`text-sm px-4 py-2.5 rounded-xl font-medium ${
                        j === q.correct_index
                          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                          : 'text-gray-500 bg-gray-50'
                      }`}>
                        {j === q.correct_index ? '✅ ' : `${['A','B','C','D'][j]}. `}{opt}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <p className="text-xs text-gray-400 italic bg-gray-50 rounded-xl px-3 py-2">{q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
