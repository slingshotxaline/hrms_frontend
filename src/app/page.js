import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-8">HRMS Portal</h1>
      <p className="text-xl mb-8">Enterprise Human Resource Management System</p>
      <div className="flex space-x-4">
        <Link href="/login" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
          Login to Portal
        </Link>
      </div>
    </div>
  );
}
