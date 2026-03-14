'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { getVolunteerSession, saveVolunteerSession } from '../../../../lib/session';
import TrainingSlide from '../../../../components/TrainingSlide';
import QuizQuestion from '../../../../components/QuizQuestion';

interface Slide { title: string; content: string; key_points?: string[]; }
interface Question { id: number; question: string; options: string[]; category: string; }
type Phase = 'training' | 'identity' | 'quiz' | 'submitting';

export default function VolunteerTraining() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id as string;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [phase, setPhase] = useState<Phase>('training');

  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Identity form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identityError, setIdentityError] = useState('');

  const [loadingTraining, setLoadingTraining] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTraining(id)
      .then((data) => setSlides(data.slides ?? []))
      .catch(() => setError('Training module not found. Check the ID and try again.'))
      .finally(() => setLoadingTraining(false));

    // Pre-fill from stored session
    const session = getVolunteerSession();
    if (session) { setName(session.name); setEmail(session.email); }
  }, [id]);

  const handleNextSlide = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Check if we already have identity
      const session = getVolunteerSession();
      if (session?.name && session?.email) {
        await loadQuiz();
      } else {
        setPhase('identity');
      }
    }
  };

  const handleIdentitySubmit = async () => {
    if (!name.trim()) { setIdentityError('Please enter your name.'); return; }
    if (!email.trim() || !email.includes('@')) { setIdentityError('Please enter a valid email.'); return; }
    saveVolunteerSession(name, email);
    setIdentityError('');
    await loadQuiz();
  };

  const loadQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const data = await api.getQuiz(id);
      setQuizId(data.quiz_id);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(-1));
      setPhase('quiz');
    } catch {
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSubmitQuiz = async () => {
    const unanswered = answers.findIndex((a) => a === -1);
    if (unanswered !== -1) { setCurrentQuestion(unanswered); return; }

    const session = getVolunteerSession();
    if (!session) { setError('Session expired. Please refresh.'); return; }

    setPhase('submitting');
    try {
      const payload = answers.map((selected_option, question_id) => ({ question_id, selected_option }));
      const result = await api.submitQuiz(session.id, session.name, session.email, quizId, payload);
      sessionStorage.setItem('quizResult', JSON.stringify(result));
      router.push(`/volunteer/result/${result.passport_id}`);
    } catch {
      setError('Failed to submit quiz. Please try again.');
      setPhase('quiz');
    }
  };

  // ── Loading / error screens ──────────────────────────────────────────────
  const bgClass = "min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900";

  if (loadingTraining || loadingQuiz) {
    return (
      <div className={`${bgClass} flex items-center justify-center`}>
        <div className="text-center glass rounded-3xl p-12">
          <div className="text-5xl mb-4 animate-bounce">{loadingTraining ? '📚' : '📝'}</div>
          <p className="text-white/70 font-medium">{loadingTraining ? 'Loading your training...' : 'Preparing quiz...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${bgClass} flex items-center justify-center p-6`}>
        <div className="text-center glass rounded-3xl p-10 max-w-sm">
          <div className="text-5xl mb-4">😵</div>
          <p className="text-white mb-5 font-medium">{error}</p>
          <button onClick={() => router.back()} className="text-violet-300 hover:text-white text-sm font-medium transition-colors">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'submitting') {
    return (
      <div className={`${bgClass} flex items-center justify-center`}>
        <div className="text-center glass rounded-3xl p-12">
          <div className="text-5xl mb-4 animate-spin-slow">⚙️</div>
          <p className="text-white font-bold text-lg mb-1">Scoring your quiz...</p>
          <p className="text-white/50 text-sm">Generating your ShiftPass</p>
        </div>
      </div>
    );
  }

  // ── Identity capture ─────────────────────────────────────────────────────
  if (phase === 'identity') {
    return (
      <div className={`${bgClass} flex items-center justify-center p-6`}>
        <div className="w-full max-w-md animate-bounce-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">👋</div>
            <h2 className="text-2xl font-black text-white">Almost there!</h2>
            <p className="text-white/60 text-sm mt-1">Tell us who you are before the quiz</p>
          </div>
          <div className="glass rounded-3xl p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Turner"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleIdentitySubmit()}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all text-sm"
                />
              </div>
              {identityError && (
                <p className="text-red-300 text-sm flex items-center gap-1">⚠️ {identityError}</p>
              )}
              <button
                onClick={handleIdentitySubmit}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg btn-glow"
              >
                Start Quiz 🎯
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Training slides ──────────────────────────────────────────────────────
  if (phase === 'training') {
    return (
      <div className={`${bgClass} p-6 md:p-10`}>
        {slides.length > 0 ? (
          <TrainingSlide
            slide={slides[currentSlide]}
            current={currentSlide}
            total={slides.length}
            onNext={handleNextSlide}
          />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-white/60">No slides found in this module.</p>
          </div>
        )}
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  return (
    <div className={`${bgClass} p-6 md:p-10`}>
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span className="font-medium">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="font-bold">{answers.filter((a) => a !== -1).length} answered</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((answers.filter((a) => a !== -1).length) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <QuizQuestion
          question={questions[currentQuestion]}
          questionNumber={currentQuestion + 1}
          total={questions.length}
          selected={answers[currentQuestion]}
          onSelect={(i) => { const next = [...answers]; next[currentQuestion] = i; setAnswers(next); }}
        />

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          {currentQuestion > 0 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="px-5 py-2.5 glass border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
            >
              ← Previous
            </button>
          ) : <div />}

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={answers[currentQuestion] === -1}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl disabled:opacity-30 font-bold text-sm hover:opacity-90 transition-all shadow-lg"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={answers.filter((a) => a !== -1).length < questions.length}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl disabled:opacity-30 font-bold text-sm hover:opacity-90 transition-all shadow-lg btn-glow-green"
            >
              Submit Quiz 🎯
            </button>
          )}
        </div>

        {/* Question dot map */}
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                i === currentQuestion
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg scale-110'
                  : answers[i] !== -1
                  ? 'bg-emerald-500/40 text-emerald-200 border border-emerald-400/30'
                  : 'bg-white/10 text-white/40 hover:bg-white/20'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
