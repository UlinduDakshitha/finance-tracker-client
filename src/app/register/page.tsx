"use client";

import { useState } from "react";
import API from "@/services/api";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      router.replace("/dashboard");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Register failed"
        : "Register failed";

      alert(typeof message === "string" ? message : "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-900 via-zinc-800 to-black px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-700 bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Get Started</h1>
          <p className="text-sm text-zinc-400">
            Create your account to start tracking finances
          </p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            Full Name
          </label>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            Email Address
          </label>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            Password
          </label>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Register Button */}
        <button className="w-full rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-blue-500/50 active:scale-95 duration-200">
          Create Account
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900/80 text-zinc-400">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <Link
          href="/login"
          className="block text-center px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-white font-medium transition hover:bg-zinc-700/50 active:scale-95 duration-200"
        >
          Sign In
        </Link>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500">
          By creating an account, you agree to our Terms of Service
        </p>
      </form>
    </div>
  );
}
