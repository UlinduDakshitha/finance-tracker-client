"use client";

import { useEffect, useState } from "react";
import API from "@/services/api";
import axios from "axios";

type Budget = {
  id: number;
  categoryName: string;
  amount: number;
  period: string;
  month: number;
  year: number;
  spentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  status: string;
};

type FormState = {
  categoryName: string;
  amount: string;
  period: string;
  month: string;
  year: string;
};

const emptyForm: FormState = {
  categoryName: "",
  amount: "",
  period: "MONTHLY",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const formatCurrency = (value: number) =>
    `Rs ${value.toLocaleString("en-LK")}`;

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spentAmount,
    0,
  );
  const totalRemaining = budgets.reduce(
    (sum, budget) => sum + budget.remainingAmount,
    0,
  );

  const fetchBudgets = async () => {
    try {
      const res = await API.get("/budgets");
      setBudgets(res.data);
    } catch {
      alert("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchBudgets();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        month: Number(form.month),
        year: Number(form.year),
      };

      if (editingId) {
        await API.put(`/budgets/${editingId}`, payload);
      } else {
        await API.post("/budgets", payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchBudgets();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.response?.data ||
          "Failed to save budget"
        : "Failed to save budget";
      alert(typeof message === "string" ? message : "Failed to save budget");
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setForm({
      categoryName: budget.categoryName,
      amount: String(budget.amount),
      period: budget.period,
      month: String(budget.month),
      year: String(budget.year),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this budget?")) return;

    try {
      await API.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.response?.data || "Delete failed"
        : "Delete failed";
      alert(typeof message === "string" ? message : "Delete failed");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-zinc-50 to-emerald-50 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 via-transparent to-cyan-500/10" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Budget planning
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                  Control spending with clear budget goals.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Create monthly budgets, watch progress in real time, and keep
                  every category easy to understand.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:min-w-105">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Total Budget
                  </p>
                  <p className="mt-1 text-lg font-bold text-blue-950">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Spent
                  </p>
                  <p className="mt-1 text-lg font-bold text-rose-950">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Remaining
                  </p>
                  <p
                    className={`mt-1 text-lg font-bold ${totalRemaining >= 0 ? "text-emerald-950" : "text-rose-700"}`}
                  >
                    {formatCurrency(Math.abs(totalRemaining))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-200 bg-white/95 p-6 shadow-sm sm:p-7"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                {editingId ? "Edit Budget" : "Add Budget"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Keep each category tightly scoped so spending is easier to
                review.
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {editingId ? "Editing mode" : "New budget"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Category Name"
              value={form.categoryName}
              onChange={(e) =>
                setForm({ ...form, categoryName: e.target.value })
              }
            />

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            <select
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
            >
              <option value="MONTHLY">MONTHLY</option>
            </select>

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              type="number"
              placeholder="Month"
              min="1"
              max="12"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              type="number"
              placeholder="Year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-linear-to-r from-emerald-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.98]">
              {editingId ? "Update Budget" : "Add Budget"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-zinc-200 bg-white/80 px-6 py-14 text-center shadow-sm">
              <div className="mx-auto max-w-sm">
                <h3 className="text-lg font-semibold text-zinc-950">
                  No budgets yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Add a budget above to start tracking category limits, spending
                  progress, and remaining amounts.
                </p>
              </div>
            </div>
          ) : (
            budgets.map((budget) => (
              <div
                key={budget.id}
                className="group rounded-3xl border border-zinc-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {budget.month}/{budget.year}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-zinc-950">
                      {budget.categoryName}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${budget.status === "EXCEEDED" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {budget.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-zinc-50 px-3 py-3">
                    <p className="text-xs font-medium text-zinc-500">Budget</p>
                    <p className="mt-1 font-semibold text-zinc-950">
                      {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 px-3 py-3">
                    <p className="text-xs font-medium text-zinc-500">Spent</p>
                    <p className="mt-1 font-semibold text-zinc-950">
                      {formatCurrency(budget.spentAmount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 px-3 py-3">
                    <p className="text-xs font-medium text-zinc-500">Left</p>
                    <p
                      className={`mt-1 font-semibold ${budget.remainingAmount > 0 ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      {formatCurrency(Math.abs(budget.remainingAmount))}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>Progress</span>
                    <span>{budget.progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${budget.status === "EXCEEDED" ? "bg-rose-500" : budget.progressPercent > 75 ? "bg-amber-500" : "bg-cyan-500"}`}
                      style={{
                        width: `${Math.min(budget.progressPercent, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="flex-1 rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-[0.98]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="flex-1 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.98]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
