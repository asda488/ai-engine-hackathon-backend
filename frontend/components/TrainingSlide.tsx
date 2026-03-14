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

const slideColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-600',
];

export default function TrainingSlide({ slide, current, total, onNext, nextLabel }: TrainingSlideProps) {
  const progress = ((current + 1) / total) * 100;
  const color = slideColors[current % slideColors.length];

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span className="font-medium">Topic {current + 1} of {total}</span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-500 shadow-lg`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-white'
                  : i < current
                  ? 'w-2 h-2 bg-white/60'
                  : 'w-2 h-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden card-hover">
        {/* Color band header */}
        <div className={`bg-gradient-to-r ${color} px-8 py-6`}>
          <div className="text-white/70 text-xs uppercase tracking-widest font-bold mb-2">Topic {current + 1}</div>
          <h2 className="text-2xl font-black text-white leading-tight">{slide.title}</h2>
        </div>

        <div className="p-8">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">{slide.content}</p>

          {slide.key_points && slide.key_points.length > 0 && (
            <div className={`bg-gradient-to-br ${color} p-px rounded-2xl mb-6`}>
              <div className="bg-white rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">🔑 Key Points</h3>
                <ul className="space-y-2">
                  {slide.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-1 w-5 h-5 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {i + 1}
                      </span>
                      <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400 font-medium">{current + 1} / {total}</span>
            <button
              onClick={onNext}
              className={`bg-gradient-to-r ${color} text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all hover:scale-105 shadow-lg flex items-center gap-2`}
            >
              {nextLabel ?? (current < total - 1 ? 'Next Topic' : 'Start Quiz')}
              <span>{current < total - 1 ? '→' : '🎯'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
