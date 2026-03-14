'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';

interface Topic {
  id: number;
  title: string;
  summary: string;
  key_points: string[];
  category: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  knowledge: 'bg-purple-100 text-purple-700',
  safety: 'bg-red-100 text-red-700',
  operations: 'bg-green-100 text-green-700',
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
    async function load() {
      try {
        const [trainingData, quizData] = await Promise.all([
          api.getTraining(id),
          api.getQuizWithAnswers(id),
        ]);
        setTraining(trainingData);
        setQuiz(quizData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-600">Loading training module...</p>
        </div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Training module not found.</p>
          <Link href="/employer" className="text-blue-600 hover:underline mt-2 block">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/employer" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Training Preview</h1>
            <p className="text-gray-500 text-sm mt-1">Module ID: {id}</p>
          </div>

          {/* Share link */}
          <div className="flex items-center gap-3">
            <div className="bg-white border rounded-lg px-3 py-2 text-sm text-gray-500 max-w-xs truncate">
              {volunteerLink}
            </div>
            <button
              onClick={copyLink}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? '✅ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{training.topics?.length ?? 0}</div>
            <div className="text-sm text-gray-500">Topics</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">{quiz?.questions?.length ?? 0}</div>
            <div className="text-sm text-gray-500">Quiz Questions</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">70%</div>
            <div className="text-sm text-gray-500">Pass Threshold</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'topics' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Topics ({training.topics?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Quiz ({quiz?.questions?.length ?? 0} questions)
          </button>
        </div>

        {/* Topics tab */}
        {activeTab === 'topics' && (
          <div className="space-y-4">
            {training.topics?.map((topic, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${categoryColors[topic.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {topic.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{topic.summary}</p>
                {topic.key_points?.length > 0 && (
                  <ul className="space-y-1">
                    {topic.key_points.map((point, j) => (
                      <li key={j} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span> {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quiz tab */}
        {activeTab === 'quiz' && quiz && (
          <div className="space-y-4">
            {quiz.questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-gray-400 font-medium">Q{i + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${categoryColors[q.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {q.category}
                  </span>
                </div>
                <p className="text-gray-900 font-medium mb-3">{q.question}</p>
                <ul className="space-y-1 mb-3">
                  {q.options.map((opt, j) => (
                    <li key={j} className={`text-sm px-3 py-1.5 rounded-lg ${j === q.correct_index ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-600'}`}>
                      {j === q.correct_index ? '✅ ' : ''}{opt}
                    </li>
                  ))}
                </ul>
                {q.explanation && (
                  <p className="text-xs text-gray-400 italic">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
