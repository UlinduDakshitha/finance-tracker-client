"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-black text-white p-6 flex flex-col">
      <div>
        <h1 className="text-2xl font-bold mb-8">Finance Tracker</h1>

        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className="block hover:text-gray-300 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className="block hover:text-gray-300 transition"
          >
            Transactions
          </Link>
          <Link
            href="/budgets"
            className="block hover:text-gray-300 transition"
          >
            Budgets
          </Link>
          <Link
            href="/categories"
            className="block hover:text-gray-300 transition"
          >
            Categories
          </Link>
        </nav>
      </div>
    </aside>
  );
}
