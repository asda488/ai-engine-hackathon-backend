'use client';

interface Volunteer {
  name: string;
  email?: string;
  role: string;
  score: number;
  xp?: number;
  status: string;
}

interface VolunteerTableProps {
  volunteers: Volunteer[];
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

export default function VolunteerTable({ volunteers }: VolunteerTableProps) {
  if (volunteers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4 animate-bounce">👻</div>
        <p className="text-gray-400 font-medium">No volunteers yet — share a training link!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-widest text-gray-400 border-b-2 border-gray-100">
            <th className="pb-4 pr-4">Volunteer</th>
            <th className="pb-4 pr-4">Role</th>
            <th className="pb-4 pr-4">Score</th>
            <th className="pb-4 pr-4">XP</th>
            <th className="pb-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v, i) => {
            const color = avatarColors[i % avatarColors.length];
            return (
              <tr key={i} className="border-b border-gray-50 hover:bg-violet-50/30 transition-colors group">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0`}>
                      {getInitials(v.name)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{v.name}</div>
                      {v.email && <div className="text-xs text-gray-400">{v.email}</div>}
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold">
                    {v.role}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          v.score >= 70
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`}
                        style={{ width: `${Math.min(v.score, 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-800 tabular-nums">{v.score}%</span>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <span className="font-black text-violet-600">⚡ {v.xp ?? '—'}</span>
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                    v.status === 'SHIFT READY'
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                  }`}>
                    {v.status === 'SHIFT READY' ? '✅' : '⚠️'} {v.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
