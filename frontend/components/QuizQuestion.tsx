'use client';

interface Question {
  id: number;
  question: string;
  options: string[];
  category: string;
}

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  total: number;
  selected: number;
  onSelect: (index: number) => void;
}

const categoryConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  knowledge: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-400', icon: '🧠' },
  safety: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-400', icon: '🛡️' },
  operations: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-400', icon: '⚙️' },
};

const optionLabels = ['A', 'B', 'C', 'D'];

export default function QuizQuestion({ question, questionNumber, total, selected, onSelect }: QuizQuestionProps) {
  const cfg = categoryConfig[question.category] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-400', icon: '❓' };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between">
        <span className="text-white/70 text-sm font-medium">Question {questionNumber} of {total}</span>
        <span className={`${cfg.bg} ${cfg.text} text-xs px-3 py-1 rounded-full font-bold capitalize flex items-center gap-1`}>
          {cfg.icon} {question.category}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 leading-snug">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <label
                key={i}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-50 shadow-md scale-[1.02]'
                    : 'border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 hover:scale-[1.01]'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={i}
                  checked={isSelected}
                  onChange={() => onSelect(i)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {optionLabels[i]}
                </div>
                <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-violet-900' : 'text-gray-700'}`}>
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
