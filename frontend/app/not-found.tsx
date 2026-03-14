import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-6">
      <div className="text-center animate-bounce-in">
        <div className="text-7xl mb-4 animate-float">🎫</div>
        <h1 className="text-6xl font-black text-white mb-2">404</h1>
        <p className="text-white/50 mb-8">This page doesn't exist.</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all btn-glow inline-block"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
