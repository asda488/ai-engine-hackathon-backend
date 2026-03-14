import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI-Powered Workforce Onboarding for Events
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Train and certify temporary workers with ShiftPass
        </p>
        <div className="space-x-4">
          <Link href="/employer" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            I'm an Employer
          </Link>
          <Link href="/volunteer" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            I'm a Volunteer
          </Link>
        </div>
      </div>
    </div>
  );
}