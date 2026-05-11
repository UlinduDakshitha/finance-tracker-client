"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white border-b">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded bg-red-500 text-white"
      >
        Logout
      </button>
    </header>
  );
}