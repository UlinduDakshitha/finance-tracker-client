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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Register</h1>
          <p className="text-sm text-zinc-500">
            Create your account to track income, expenses, and budgets.
          </p>
        </div>
        <input
          className="w-full rounded-lg border border-zinc-200 p-3 outline-none transition focus:border-black"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-200 p-3 outline-none transition focus:border-black"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-200 p-3 outline-none transition focus:border-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full rounded-lg bg-black p-3 font-medium text-white transition hover:bg-zinc-800 hover:cursor-pointer">
          Register
        </button>
        <p className="text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-black underline-offset-4 hover:underline hover:cursor-pointer"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
