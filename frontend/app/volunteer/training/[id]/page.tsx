'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import TrainingSlide from '../../../../components/TrainingSlide';
import QuizQuestion from '../../../../components/QuizQuestion';

interface Slide {
  title: string;
  content: string;
  key_points?: string[];
}

interface Question {
  id: number;
  question: string;
  options: string[];
  category: string;
}

type Phase = 'training' | 'quiz' | 'submitting';

export default function VolunteerTraining() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id as string;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [phase, setPhase] = useState<Phase>('training');

  const [quizId, setQuizId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loadingTraining, setLoadingTraining] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTraining() {
      try {
        const data = await api.getTraining(id);
        setSlides(data.slides ?? []);
      } catch {
        setError('Failed to load training module. Check the Training ID and try again.');
      } finally {
        setLoadingTraining(false);
      }
    }
    loadTraining();
  }, [id]);

  const handleNextSlide = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setLoadingQuiz(true);
      try {
        const data = await api.getQuiz(id);
        // getQuiz now returns { quiz_id, questions } — quiz_id is the actual quizzes.id
        setQuizId(data.quiz_id);
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
        setPhase('quiz');
      } catch {
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoadingQuiz(false);
      }
    }
  };

  const handleAnswer = (index: number) => {
    const next = [...answers];
    next[currentQuestion] = index;
    setAnswers(next);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const unanswered = answers.findIndex((a) => a === -1);
    if (unanswered !== -1) {
      setCurrentQuestion(unanswered);
      return;
    }

    setPhase('submitting');
    try {
      const payload = answers.map((selected_option, question_id) => ({ question_id, selected_option }));
      const result = await api.submitQuiz('volunteer-1', quizId, payload);
      sessionStorage.setItem('quizResult', JSON.stringify(result));
      router.push(`/volunteer/result/${result.passport_id}`);
    } catch {
      setError('Failed to submit quiz. Please try again.');
      setPhase('quiz');
    }
  };

  if (loadingTraining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📚</div>
          <p className="text-gray-600">Loading your training module...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">Go back</button>
        </div>
      </div>
    );
  }

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-600">Scoring your quiz and generating your passport...</p>
        </div>
      </div>
    );
  }

  if (loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📝</div>
          <p className="text-gray-600">Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {phase === 'training' && slides.length > 0 && (
        <TrainingSlide
          slide={slides[currentSlide]}
          current={currentSlide}
          total={slides.length}
          onNext={handleNextSlide}
        />
      )}

      {phase === 'quiz' && questions.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{answers.filter((a) => a !== -1).length} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <QuizQuestion
            question={questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            total={questions.length}
            selected={answers[currentQuestion]}
            onSelect={handleAnswer}
          />

          <div className="flex justify-between mt-4">
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="px-4 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            <div className="flex-1" />
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                disabled={answers[currentQuestion] === -1}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 text-sm font-medium"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={answers.filter((a) => a !== -1).length < questions.length}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 text-sm font-medium"
              >
                Submit Quiz
              </button>
            )}
          </div>

          <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                  i === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[i] !== -1
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
