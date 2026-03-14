'use client';

interface Breakdown {
  knowledge: number;
  safety: number;
  operations: number;
}

interface ReadinessChartProps {
  breakdown: Breakdown;
  overall: number;
}

const categories = [
  { key: 'knowledge' as const, label: 'Knowledge', icon: '🧠', gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-100', text: 'text-violet-700' },
  { key: 'safety' as const, label: 'Safety', icon: '🛡️', gradient: 'from-rose-500 to-red-600', light: 'bg-rose-100', text: 'text-rose-700' },
  { key: 'operations' as const, label: 'Operations', icon: '⚙️', gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-100', text: 'text-emerald-700' },
];

export default function ReadinessChart({ breakdown, overall }: ReadinessChartProps) {
  const isGood = overall >= 70;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-violet-50 rounded-full" />

      <h3 className="font-black text-gray-800 mb-6 text-lg relative z-10">📊 Readiness Breakdown</h3>

      {/* Overall score */}
      <div className="text-center mb-8 relative z-10">
        <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br ${
          isGood ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-orange-500'
        } shadow-xl mb-3`}>
          <div>
            <div className="text-3xl font-black text-white leading-none">{overall}%</div>
          </div>
        </div>
        <div className="text-sm font-semibold text-gray-500">Overall Readiness</div>
        <div className={`text-xs mt-1 font-bold ${isGood ? 'text-emerald-500' : 'text-amber-500'}`}>
          {isGood ? '🎉 Above pass threshold!' : '📚 Keep practicing'}
        </div>
      </div>

      {/* Per-category bars */}
      <div className="space-y-5 relative z-10">
        {categories.map(({ key, label, icon, gradient, light, text }) => {
          const score = breakdown[key] ?? 0;
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <span className={`${light} ${text} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
                  {icon} {label}
                </span>
                <span className="text-sm font-black text-gray-700">{score}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${gradient} h-3 rounded-full transition-all duration-700 shadow-sm`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
