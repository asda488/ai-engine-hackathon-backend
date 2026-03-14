'use client';

interface Passport {
  id: string;
  volunteer_name: string;
  role: string;
  skills: string[];
  readiness_score: number;
  score?: number;
  xp: number;
  status: string;
  issued_at: string;
}

interface PassportCardProps {
  passport: Passport;
  showShare?: boolean;
}

const skillEmojis: Record<string, string> = {
  default: '✅',
  safety: '🛡️',
  service: '🍽️',
  bar: '🍺',
  communication: '💬',
  operations: '⚙️',
  hygiene: '🧼',
  emergency: '🚨',
};

function skillEmoji(skill: string): string {
  const lower = skill.toLowerCase();
  for (const [key, emoji] of Object.entries(skillEmojis)) {
    if (lower.includes(key)) return emoji;
  }
  return skillEmojis.default;
}

export default function PassportCard({ passport, showShare = true }: PassportCardProps) {
  const isReady = passport.status === 'SHIFT READY';
  const initials = passport.volunteer_name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ url: window.location.href, title: `${passport.volunteer_name}'s ShiftPass` });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header band */}
      <div className={`h-3 ${isReady ? 'bg-green-500' : 'bg-amber-400'}`} />

      <div className="p-8">
        {/* Avatar + name */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow">
            {initials}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{passport.volunteer_name}</h1>
          <p className="text-gray-500">{passport.role}</p>
        </div>

        {/* Status badge */}
        <div className={`px-4 py-2 rounded-lg text-center font-semibold mb-6 ${
          isReady ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {isReady ? '✅' : '⚠️'} {passport.status}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{passport.readiness_score}%</div>
            <div className="text-xs text-gray-500 mt-1">Readiness</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{passport.xp}</div>
            <div className="text-xs text-gray-500 mt-1">XP</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{passport.score ?? passport.readiness_score}%</div>
            <div className="text-xs text-gray-500 mt-1">Score</div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Verified Skills</h3>
          <div className="flex flex-wrap gap-2">
            {passport.skills.map((skill, i) => (
              <span key={i} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {skillEmoji(skill)} {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Issued date */}
        <p className="text-center text-xs text-gray-400 mb-4">
          Issued {new Date(passport.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {showShare && (
          <button
            onClick={handleShare}
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Share Passport
          </button>
        )}
      </div>
    </div>
  );
}
