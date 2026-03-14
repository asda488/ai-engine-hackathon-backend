'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';

export default function VolunteerTraining() {
  const params = useParams();
  const router = useRouter();
  const [training, setTraining] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const id = Array.isArray(params.id) ? params.id[0] : params.id as string;

  useEffect(() => {
    const loadTraining = async () => {
      const trainingData = await api.getTraining(id);
      setTraining(trainingData);
    };
    loadTraining();
  }, [id]);

  const nextSlide = () => {
    if (currentSlide < training.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowQuiz(true);
      loadQuiz();
    }
  };

  const loadQuiz = async () => {
    const quizData = await api.getQuiz(params.id as string);
    setQuiz(quizData);
    setAnswers(new Array(quizData.questions.length).fill(-1));
  };

  const submitQuiz = async () => {
    const result = await api.submitQuiz('volunteer-1', quiz.id, answers.map((ans, i) => ({ question_id: i, selected_option: ans })));
    router.push(`/volunteer/result/${result.id}`);
  };

  if (!training) return <div>Loading...</div>;

  if (showQuiz && !quiz) return <div>Loading quiz...</div>;

  if (showQuiz && quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-8">Quiz</h1>
        {quiz.questions.map((question: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow mb-4">
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            {question.options.map((option: string, optIndex: number) => (
              <label key={optIndex} className="block mb-2">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={optIndex}
                  checked={answers[index] === optIndex}
                  onChange={() => {
                    const newAnswers = [...answers];
                    newAnswers[index] = optIndex;
                    setAnswers(newAnswers);
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        ))}
        <button
          onClick={submitQuiz}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          Submit Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">{training.slides[currentSlide].title}</h1>
          <p className="text-gray-700 mb-6">{training.slides[currentSlide].content}</p>
          <div className="flex justify-between items-center">
            <span>{currentSlide + 1} / {training.slides.length}</span>
            <button
              onClick={nextSlide}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {currentSlide < training.slides.length - 1 ? 'Next' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}