'use client';

interface Slide {
  title: string;
  content: string;
  key_points?: string[];
}

interface TrainingSlideProps {
  slide: Slide;
  current: number;
  total: number;
  onNext: () => void;
  nextLabel?: string;
}

export default function TrainingSlide({ slide, current, total, onNext, nextLabel }: TrainingSlideProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Topic {current + 1} of {total}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Slide card */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{slide.title}</h2>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">{slide.content}</p>

        {slide.key_points && slide.key_points.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 uppercase tracking-wide">Key Points</h3>
            <ul className="space-y-1">
              {slide.key_points.map((point, i) => (
                <li key={i} className="text-blue-900 text-sm flex items-start gap-2">
                  <span className="mt-1 text-blue-500">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{current + 1} / {total}</span>
          <button
            onClick={onNext}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {nextLabel ?? (current < total - 1 ? 'Next Topic' : 'Start Quiz')}
          </button>
        </div>
      </div>
    </div>
  );
}
