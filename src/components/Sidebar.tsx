"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-black text-white p-6 flex flex-col">
      <div>
        <h1 className="text-2xl font-bold mb-8">Finance Tracker</h1>

        <nav className="space-y-4">
          <Link href="/dashboard" className="block hover:text-gray-300 transition">
            Dashboard
          </Link>
          <Link href="/transactions" className="block hover:text-gray-300 transition">
            Transactions
          </Link>
          <Link href="/budgets" className="block hover:text-gray-300 transition">
            Budgets
          </Link>
          <Link href="/categories" className="block hover:text-gray-300 transition">
            Categories
          </Link>
        </nav>
      </div>

      <div className="mt-auto">
        <Link href="/settings" className="flex items-center gap-2 hover:text-gray-300 transition text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>
    </aside>
  );
}