"use client";

import { useEffect, useMemo, useState } from "react";
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

type Category = {
  id: number;
  name: string;
  type: string;
};

type FormState = {
  categoryId: string;
  amount: string;
  period: string;
  month: string;
  year: string;
};

const emptyForm: FormState = {
  categoryId: "",
  amount: "",
  period: "MONTHLY",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "EXPENSE"),
    [categories],
  );

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spentAmount,
    0,
  );
  const totalRemaining = budgets.reduce(
    (sum, budget) => sum + budget.remainingAmount,
    0,
  );
  const overBudgetCount = budgets.filter(
    (budget) => budget.status === "EXCEEDED",
  ).length;

  const formatCurrency = (value: number) =>
    `Rs ${value.toLocaleString("en-LK")}`;

  const fetchBudgets = async () => {
    const res = await API.get("/budgets");
    setBudgets(Array.isArray(res.data) ? res.data : res.data?.data || []);
  };

  const fetchCategories = async () => {
    const res = await API.get("/categories");
    setCategories(Array.isArray(res.data) ? res.data : res.data?.data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchBudgets(), fetchCategories()]);
      } catch (error) {
        console.error(error);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        categoryId: Number(formData.categoryId),
        amount: Number(formData.amount),
        period: formData.period,
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (!payload.categoryId || Number.isNaN(payload.categoryId)) {
        alert("Please select a valid expense category");
        return;
      }

      if (editingId) {
        await API.put(`/budgets/${editingId}`, payload);
      } else {
        await API.post("/budgets", payload);
      }

      setFormData(emptyForm);
      setEditingId(null);
      await fetchBudgets();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Failed to save budget"
        : "Failed to save budget";

      alert(typeof message === "string" ? message : "Failed to save budget");
      console.error(error);
    }
  };

  const handleEdit = (budget: Budget) => {
    const matchedCategory = categories.find(
      (category) =>
        category.name === budget.categoryName && category.type === "EXPENSE",
    );

    setEditingId(budget.id);
    setFormData({
      categoryId: matchedCategory ? String(matchedCategory.id) : "",
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
      await fetchBudgets();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Delete failed"
        : "Delete failed";

      alert(typeof message === "string" ? message : "Delete failed");
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-zinc-50 to-emerald-50 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 via-transparent to-cyan-500/10" />
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-24 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Budget planning
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                  Shape your spending with calm, clear budget goals.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Create budgets, track progress, and spot overspending early
                  with a cleaner workspace.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 shadow-sm">
                    {budgets.length} active budgets
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${overBudgetCount > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {overBudgetCount > 0
                      ? `${overBudgetCount} over budget`
                      : "All budgets on track"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:min-w-105">
                <div className="rounded-3xl border border-blue-200 bg-linear-to-br from-blue-50 to-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    Total Budget
                  </p>
                  <p className="mt-2 text-2xl font-black text-blue-950">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
                <div className="rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50 to-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                    Spent
                  </p>
                  <p className="mt-2 text-2xl font-black text-rose-950">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Remaining
                  </p>
                  <p
                    className={`mt-2 text-2xl font-black ${totalRemaining >= 0 ? "text-emerald-950" : "text-rose-700"}`}
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
          className="rounded-4xl border border-zinc-200 bg-white/95 p-6 shadow-sm sm:p-7"
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
            <select
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
            >
              <option value="">Select expense category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              type="number"
              placeholder="Month"
              min="1"
              max="12"
              value={formData.month}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
              required
            />

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
            />

            <select
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 md:col-span-2"
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-linear-to-r from-emerald-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.98]"
            >
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

        {expenseCategories.length === 0 && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
            No EXPENSE categories found. Create one first from the Categories
            page.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.length === 0 ? (
            <div className="col-span-full rounded-4xl border border-dashed border-zinc-200 bg-white/80 px-6 py-14 text-center shadow-sm">
              <div className="mx-auto max-w-sm">
                <h3 className="text-lg font-semibold text-zinc-950">
                  No budgets yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Add your first budget above to start tracking spending in a
                  cleaner, more visual layout.
                </p>
              </div>
            </div>
          ) : (
            budgets.map((budget) => (
              <div
                key={budget.id}
                className="group rounded-4xl border border-zinc-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      {budget.month}/{budget.year}
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-zinc-950">
                      {budget.categoryName}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      A focused monthly plan for this category.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      budget.status === "EXCEEDED"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {budget.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Budget
                    </p>
                    <p className="mt-2 font-bold text-zinc-950">
                      {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Spent
                    </p>
                    <p className="mt-2 font-bold text-zinc-950">
                      {formatCurrency(budget.spentAmount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Left
                    </p>
                    <p
                      className={`mt-2 font-bold ${budget.remainingAmount > 0 ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      {formatCurrency(Math.abs(budget.remainingAmount))}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        budget.status === "EXCEEDED"
                          ? "bg-rose-500"
                          : "bg-linear-to-r from-emerald-500 to-cyan-500"
                      }`}
                      style={{
                        width: `${Math.min(budget.progressPercent, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Progress</span>
                    <span className="font-semibold text-zinc-700">
                      {budget.progressPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(budget)}
                    className="flex-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(budget.id)}
                    className="flex-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
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
