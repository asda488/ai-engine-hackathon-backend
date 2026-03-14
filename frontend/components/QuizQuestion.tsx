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

const categoryColors: Record<string, string> = {
  knowledge: 'bg-purple-100 text-purple-700',
  safety: 'bg-red-100 text-red-700',
  operations: 'bg-green-100 text-green-700',
};

export default function QuizQuestion({ question, questionNumber, total, selected, onSelect }: QuizQuestionProps) {
  const badgeClass = categoryColors[question.category] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">Question {questionNumber} of {total}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${badgeClass}`}>
          {question.category}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-5">{question.question}</h3>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <label
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={i}
                checked={isSelected}
                onChange={() => onSelect(i)}
                className="mt-0.5 accent-blue-600"
              />
              <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
