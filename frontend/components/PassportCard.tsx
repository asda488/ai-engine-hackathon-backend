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
    <div className="max-w-md mx-auto animate-bounce-in">
      {/* Card */}
      <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${
        isReady
          ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600'
          : 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
      }`}>
        {/* Decorative circle */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />

        {/* Header */}
        <div className="relative z-10 px-8 pt-8 pb-6 text-white text-center">
          <div className="text-xs uppercase tracking-widest font-bold text-white/60 mb-4">ShiftPass · Digital Credential</div>

          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-3xl font-black text-white shadow-xl">
              {initials}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg border-2 border-white ${
              isReady ? 'bg-emerald-400' : 'bg-amber-400'
            }`}>
              {isReady ? '✓' : '!'}
            </div>
          </div>

          <h1 className="text-2xl font-black text-white">{passport.volunteer_name}</h1>
          <p className="text-white/70 text-sm font-medium mt-1">{passport.role}</p>
        </div>

        {/* Status badge */}
        <div className="relative z-10 mx-8 mb-6">
          <div className="glass rounded-2xl px-4 py-3 text-center">
            <span className="text-white font-bold text-sm tracking-wider">
              {isReady ? '✅ SHIFT READY' : '⚠️ TRAINING REQUIRED'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mx-8 mb-6 grid grid-cols-3 gap-3">
          {[
            { value: `${passport.readiness_score}%`, label: 'Readiness', icon: '🎯' },
            { value: `${passport.xp}`, label: 'XP Earned', icon: '⚡' },
            { value: `${passport.score ?? passport.readiness_score}%`, label: 'Score', icon: '🏆' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="glass rounded-2xl p-3 text-center">
              <div className="text-lg mb-0.5">{icon}</div>
              <div className="text-white font-black text-lg leading-tight">{value}</div>
              <div className="text-white/50 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        {passport.skills.length > 0 && (
          <div className="relative z-10 mx-8 mb-6">
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-3">Verified Skills</p>
            <div className="flex flex-wrap gap-2">
              {passport.skills.map((skill, i) => (
                <span key={i} className="glass rounded-full px-3 py-1 text-white text-xs font-semibold">
                  {skillEmoji(skill)} {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 px-8 pb-8">
          <p className="text-center text-white/40 text-xs mb-4">
            Issued {new Date(passport.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {showShare && (
            <button
              onClick={handleShare}
              className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105"
            >
              🔗 Share My ShiftPass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
