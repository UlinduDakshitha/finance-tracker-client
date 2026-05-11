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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Budgets</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Budget" : "Add Budget"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Category Name"
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
          />

          <input
            className="border p-2 rounded"
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
          >
            <option value="MONTHLY">MONTHLY</option>
          </select>

          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Month"
            min="1"
            max="12"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
          />

          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <button className="bg-black text-white px-4 py-2 rounded">
            {editingId ? "Update Budget" : "Add Budget"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="bg-white p-4 rounded shadow space-y-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{budget.categoryName}</h3>
              <span
                className={`px-2 py-1 rounded text-white text-sm ${
                  budget.status === "EXCEEDED" ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {budget.status}
              </span>
            </div>

            <p>Budget: {budget.amount}</p>
            <p>Spent: {budget.spentAmount}</p>
            <p>Remaining: {budget.remainingAmount}</p>
            <p>Progress: {budget.progressPercent.toFixed(2)}%</p>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  budget.status === "EXCEEDED" ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{
                  width: `${Math.min(budget.progressPercent, 100)}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-600">
              {budget.month}/{budget.year}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleEdit(budget)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(budget.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
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
