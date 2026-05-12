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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Transactions</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage and track all your transactions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            placeholder="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />

          <select
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>

          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            placeholder="mm/dd/yyyy"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            placeholder="mm/dd/yyyy"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={filterByType}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition hover:bg-blue-700 active:scale-95 shadow-sm"
          >
            Filter Type
          </button>
          <button
            onClick={filterByCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition hover:bg-blue-700 active:scale-95 shadow-sm"
          >
            Filter Category
          </button>
          <button
            onClick={filterByDate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition hover:bg-blue-700 active:scale-95 shadow-sm"
          >
            Filter Date
          </button>
          <button
            onClick={resetFilters}
            className="bg-zinc-400 text-white px-4 py-2 rounded-lg font-medium transition hover:bg-zinc-500 active:scale-95 shadow-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-zinc-900">
          {editingId ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            placeholder="Category Name"
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
          />
          <select
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm bg-white"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            type="date"
            value={form.transactionDate}
            onChange={(e) =>
              setForm({ ...form, transactionDate: e.target.value })
            }
          />
          <input
            className="border border-zinc-200 px-4 py-2 rounded-lg outline-none transition focus:border-black focus:shadow-sm"
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <button className="bg-black text-white px-6 py-2 rounded-lg font-medium transition hover:bg-zinc-800 active:scale-95 shadow-sm">
            {editingId ? "Update Transaction" : "Add Transaction"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-zinc-400 text-white px-6 py-2 rounded-lg font-medium transition hover:bg-zinc-500 active:scale-95 shadow-sm"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-zinc-100 hover:bg-zinc-50 transition"
              >
                <td className="px-6 py-3 text-sm text-zinc-900">{tx.title}</td>
                <td className="px-6 py-3 text-sm text-zinc-900">{tx.amount}</td>
                <td className="px-6 py-3 text-sm text-zinc-600">
                  {tx.categoryName}
                </td>
                <td className="px-6 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-zinc-600">
                  {tx.transactionDate}
                </td>
                <td className="px-6 py-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(tx)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition hover:bg-blue-600 active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition hover:bg-red-600 active:scale-95"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
