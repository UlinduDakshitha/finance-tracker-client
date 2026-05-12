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
      (category) => category.name === budget.categoryName && category.type === "EXPENSE",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Budgets</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your monthly budgets and track spending.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm space-y-4"
      >
        <h2 className="text-xl font-semibold text-zinc-900">
          {editingId ? "Edit Budget" : "Add Budget"}
        </h2>

        <div className="space-y-3">
          <select
            className="w-full border border-zinc-200 p-3 rounded-lg outline-none transition focus:border-black"
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
            className="w-full border border-zinc-200 p-3 rounded-lg outline-none transition focus:border-black"
            placeholder="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              className="border border-zinc-200 p-3 rounded-lg outline-none transition focus:border-black"
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
              className="border border-zinc-200 p-3 rounded-lg outline-none transition focus:border-black"
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
            />

            <select
              className="border border-zinc-200 p-3 rounded-lg outline-none transition focus:border-black"
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
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg font-medium transition hover:bg-zinc-800 hover:cursor-pointer"
          >
            {editingId ? "Update Budget" : "Add Budget"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition hover:bg-gray-500 hover:cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {expenseCategories.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No EXPENSE categories found. Create one first from the Categories page.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm space-y-3 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  {budget.categoryName}
                </h3>
                <p className="text-sm text-zinc-500">
                  {budget.month}/{budget.year}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                  budget.status === "EXCEEDED" ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {budget.status}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Budget:</span>
                <span className="font-medium text-zinc-900">
                  ${budget.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Spent:</span>
                <span className="font-medium text-zinc-900">
                  ${budget.spentAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Remaining:</span>
                <span
                  className={`font-medium ${budget.remainingAmount > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${budget.remainingAmount}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    budget.status === "EXCEEDED" ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(budget.progressPercent, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-zinc-500 text-right">
                {budget.progressPercent.toFixed(0)}%
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleEdit(budget)}
                className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg font-medium text-sm transition hover:bg-yellow-600 hover:cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(budget.id)}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm transition hover:bg-red-600 hover:cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}