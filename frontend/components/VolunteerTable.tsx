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

export default function VolunteerTable({ volunteers }: VolunteerTableProps) {
  if (volunteers.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No volunteers have completed training yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Role</th>
            <th className="pb-3 pr-4">Score</th>
            <th className="pb-3 pr-4">XP</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4 font-medium text-gray-900">{v.name}</td>
              <td className="py-3 pr-4 text-gray-600">{v.role}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${v.score >= 70 ? 'bg-green-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(v.score, 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-700">{v.score}%</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-purple-700 font-medium">{v.xp ?? '—'}</td>
              <td className="py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  v.status === 'SHIFT READY'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {v.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
