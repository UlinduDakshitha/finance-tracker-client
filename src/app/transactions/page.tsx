"use client";

import { useEffect, useState } from "react";
import API from "@/services/api";
import axios from "axios";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  categoryName: string;
  type: string;
  transactionDate: string;
  note?: string;
};

type FormState = {
  title: string;
  amount: string;
  categoryName: string;
  type: string;
  transactionDate: string;
  note: string;
};

const emptyForm: FormState = {
  title: "",
  amount: "",
  categoryName: "",
  type: "EXPENSE",
  transactionDate: "",
  note: "",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatAmount = (value: number) => `Rs ${value.toLocaleString("en-LK")}`;

  const totalIncome = transactions
    .filter((tx) => tx.type === "INCOME")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpense;

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchTransactions();
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingId) {
        await API.put(`/transactions/${editingId}`, payload);
      } else {
        await API.post("/transactions", payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchTransactions();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Failed to save transaction"
        : "Failed to save transaction";

      alert(
        typeof message === "string" ? message : "Failed to save transaction",
      );
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setForm({
      title: tx.title,
      amount: String(tx.amount),
      categoryName: tx.categoryName,
      type: tx.type,
      transactionDate: tx.transactionDate,
      note: tx.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;

    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
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
    setForm(emptyForm);
    setEditingId(null);
  };

  const filterByType = async () => {
    try {
      const res = await API.get(`/transactions/filter/type?type=${filterType}`);
      setTransactions(res.data);
    } catch {
      alert("Type filter failed");
    }
  };

  const filterByCategory = async () => {
    try {
      const res = await API.get(
        `/transactions/filter/category?categoryName=${filterCategory}`,
      );
      setTransactions(res.data);
    } catch {
      alert("Category filter failed");
    }
  };

  const filterByDate = async () => {
    try {
      const res = await API.get(
        `/transactions/filter/date?startDate=${startDate}&endDate=${endDate}`,
      );
      setTransactions(res.data);
    } catch {
      alert("Date filter failed");
    }
  };

  const resetFilters = () => {
    setFilterType("");
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
    fetchTransactions();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-zinc-50 to-blue-50 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-transparent to-cyan-500/10" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Transactions workspace
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                  Track every rupee with clarity.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Add, filter, and review your spending and income in one
                  polished view with quick actions and readable insights.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:min-w-105">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    Income
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-950">
                    {formatAmount(totalIncome)}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
                    Expense
                  </p>
                  <p className="mt-1 text-lg font-bold text-rose-950">
                    {formatAmount(totalExpense)}
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
                    Balance
                  </p>
                  <p
                    className={`mt-1 text-lg font-bold ${balance >= 0 ? "text-sky-950" : "text-rose-700"}`}
                  >
                    {formatAmount(Math.abs(balance))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Smart Filters
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Narrow down transactions by type, category, or date range.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
            >
              Reset all
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            />

            <select
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="INCOME">INCOME</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={filterByType}
              className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 active:scale-[0.98]"
            >
              Filter Type
            </button>
            <button
              onClick={filterByCategory}
              className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100 active:scale-[0.98]"
            >
              Filter Category
            </button>
            <button
              onClick={filterByDate}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100 active:scale-[0.98]"
            >
              Filter Date
            </button>
          </div>
        </section>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-200 bg-white/95 p-6 shadow-sm sm:p-7"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                {editingId ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Keep entries consistent so reports and filters stay useful.
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {editingId ? "Editing mode" : "New entry mode"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Category Name"
              value={form.categoryName}
              onChange={(e) =>
                setForm({ ...form, categoryName: e.target.value })
              }
            />
            <select
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="INCOME">INCOME</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              type="date"
              value={form.transactionDate}
              onChange={(e) =>
                setForm({ ...form, transactionDate: e.target.value })
              }
            />
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 md:col-span-2"
              placeholder="Note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-linear-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98]">
              {editingId ? "Update Transaction" : "Add Transaction"}
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

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 sm:px-7">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Transaction Feed
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Review recent activity in a cleaner table layout.
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {transactions.length} records
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-190">
              <thead className="bg-zinc-50/90 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <div className="mx-auto max-w-sm rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10">
                        <p className="text-base font-semibold text-zinc-950">
                          No transactions yet
                        </p>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                          Add your first income or expense above to start
                          building a clean financial history.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-zinc-100/80 transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-zinc-950">
                        {tx.title}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold ${tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {tx.categoryName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tx.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {tx.transactionDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[0.98]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.98]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
