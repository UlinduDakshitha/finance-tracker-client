"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import API from "@/services/api";

type Profile = {
  name: string;
  email: string;
};

function decodeTokenProfile(token: string): Profile {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return { name: "", email: "" };
    }

    const parsed = JSON.parse(atob(payload)) as {
      name?: string;
      email?: string;
      sub?: string;
      username?: string;
    };

    const email = parsed.email || parsed.sub || "";
    const name =
      parsed.name || parsed.username || (email ? email.split("@")[0] : "");

    return {
      name,
      email,
    };
  } catch {
    return { name: "", email: "" };
  }
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setProfile(decodeTokenProfile(token));
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await API.put<{ token?: string }>("/auth/profile", {
        name: profile.name,
        email: profile.email,
      });

      // Update token if backend returns new one
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        // Trigger storage event to update navbar
        window.dispatchEvent(new Event("tokenUpdated"));
      }

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to update profile"
        : "Failed to update profile";

      setMessage(
        typeof errorMsg === "string" ? errorMsg : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your profile and account settings.
        </p>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-6">
          Profile Information
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Full Name
            </label>
            <input
              className="w-full border border-zinc-200 p-3 rounded-lg outline-none transition focus:border-black"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Email Address
            </label>
            <input
              className="w-full border border-zinc-200 p-3 rounded-lg outline-none transition focus:border-black"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              placeholder="Enter your email address"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium transition hover:bg-zinc-800 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
          Account Information
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-zinc-600">Account Type</p>
            <p className="font-medium text-zinc-900">Personal</p>
          </div>
          <div>
            <p className="text-zinc-600">Member Since</p>
            <p className="font-medium text-zinc-900">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
