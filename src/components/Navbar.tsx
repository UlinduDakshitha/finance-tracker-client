"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  email: string;
};

function decodeTokenProfile(token: string): Profile {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return { name: "User", email: "" };
    }

    const parsed = JSON.parse(atob(payload)) as {
      name?: string;
      email?: string;
      sub?: string;
      username?: string;
    };

    const email = parsed.email || parsed.sub || "";
    const name =
      parsed.name || parsed.username || (email ? email.split("@")[0] : "User");

    return {
      name,
      email,
    };
  } catch {
    return { name: "User", email: "" };
  }
}

export default function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    name: "User",
    email: "",
  });

  useEffect(() => {
    const loadProfile = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setProfile(decodeTokenProfile(token));
      }
    };

    loadProfile();

    // Listen for token updates from settings page
    window.addEventListener("tokenUpdated", loadProfile);
    return () => window.removeEventListener("tokenUpdated", loadProfile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 bg-white border-b">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview and account controls</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-full border px-4 py-2 bg-gray-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-sm font-semibold">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">
              {profile.email}
            </p>
            {profile.name && (
              <p className="text-xs text-gray-500">{profile.name}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 font-medium text-white transition hover:bg-red-600 hover:cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
