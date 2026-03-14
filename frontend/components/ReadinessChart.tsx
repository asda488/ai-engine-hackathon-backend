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
  { key: 'knowledge' as const, label: 'Knowledge', color: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
  { key: 'safety' as const, label: 'Safety', color: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' },
  { key: 'operations' as const, label: 'Operations', color: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
];

export default function ReadinessChart({ breakdown, overall }: ReadinessChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-gray-800 mb-4">Readiness Breakdown</h3>

      {/* Overall */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-blue-600 mb-1">{overall}%</div>
        <div className="text-sm text-gray-500">Overall Readiness Score</div>
      </div>

      {/* Per-category bars */}
      <div className="space-y-4">
        {categories.map(({ key, label, color, light, text }) => {
          const score = breakdown[key] ?? 0;
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${light} ${text}`}>
                  {label}
                </span>
                <span className="text-sm font-medium text-gray-700">{score}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`${color} h-2.5 rounded-full transition-all duration-700`}
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
