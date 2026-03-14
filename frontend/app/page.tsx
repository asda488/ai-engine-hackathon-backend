import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 animate-gradient flex items-center justify-center overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-spin-slow" />

      <div className="text-center relative z-10 px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 animate-slide-up">
          <span className="text-yellow-300 text-sm animate-float">✨</span>
          <span className="text-white/80 text-sm font-medium">AI-Powered Event Workforce Platform</span>
        </div>

        {/* Logo */}
        <div className="text-7xl mb-6 animate-bounce-in">🎟️</div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl font-black text-white mb-4 leading-tight">
          Shift
          <span className="text-gradient-gold">Pass</span>
        </h1>

        <p className="text-xl text-white/70 mb-12 max-w-lg mx-auto leading-relaxed">
          Train smarter. Certify faster. Get your crew <span className="text-pink-300 font-semibold">shift-ready</span> in minutes.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/employer"
            className="group relative bg-white text-violet-900 px-8 py-4 rounded-2xl font-bold text-lg btn-glow hover:bg-violet-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              🏢 I'm an Employer
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </span>
          </Link>
          <Link
            href="/volunteer"
            className="group relative glass border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors btn-glow-green"
          >
            <span className="flex items-center gap-2">
              🙋 I'm a Volunteer
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </span>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[
            { value: '⚡️', label: '15s Training Gen' },
            { value: '🎯', label: 'AI Quiz Builder' },
            { value: '🛂', label: 'Digital Passport' },
          ].map(({ value, label }) => (
            <div key={label} className="glass rounded-xl p-4 text-center card-hover">
              <div className="text-2xl mb-1">{value}</div>
              <div className="text-white/60 text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
