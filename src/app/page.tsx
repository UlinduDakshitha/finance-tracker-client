import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="max-w-2xl p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Finance Tracker</h1>
        <p className="mb-6 text-gray-600">
          Personal finance tracker dashboard and tools.
        </p>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-black text-white rounded"
          >
            Dashboard
          </Link>
          <Link href="/login" className="px-4 py-2 border rounded">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 border rounded">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
