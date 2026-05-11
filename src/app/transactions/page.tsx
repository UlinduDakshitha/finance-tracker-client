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
      <h1 className="text-3xl font-bold">Transactions</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>

          <input
            className="border p-2 rounded"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={filterByType}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Filter Type
          </button>
          <button
            onClick={filterByCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Filter Category
          </button>
          <button
            onClick={filterByDate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Filter Date
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Category Name"
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
          <input
            className="border p-2 rounded"
            type="date"
            value={form.transactionDate}
            onChange={(e) =>
              setForm({ ...form, transactionDate: e.target.value })
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <button className="bg-black text-white px-4 py-2 rounded">
            {editingId ? "Update Transaction" : "Add Transaction"}
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

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="p-3">{tx.title}</td>
                <td className="p-3">{tx.amount}</td>
                <td className="p-3">{tx.categoryName}</td>
                <td className="p-3">{tx.type}</td>
                <td className="p-3">{tx.transactionDate}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(tx)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
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
