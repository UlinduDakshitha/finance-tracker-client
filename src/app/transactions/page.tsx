"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    categoryName: "",
    type: "EXPENSE",
    transactionDate: "",
    note: "",
  });

  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await API.get<Transaction[]>("/transactions");
      setTransactions(res.data);
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchTransactions();
    }, 0);

    return () => clearTimeout(t);
  }, [fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.post("/transactions", {
        ...form,
        amount: Number(form.amount),
      });

      setForm({
        title: "",
        amount: "",
        categoryName: "",
        type: "EXPENSE",
        transactionDate: "",
        note: "",
      });

      fetchTransactions();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Failed to create transaction"
        : "Failed to create transaction";

      alert(
        typeof message === "string" ? message : "Failed to create transaction",
      );
    }
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

  const filterByType = async () => {
    try {
      const res = await API.get<Transaction[]>(
        `/transactions/filter/type?type=${encodeURIComponent(filterType)}`,
      );
      setTransactions(res.data);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Filter failed"
        : "Filter failed";

      alert(typeof message === "string" ? message : "Filter failed");
    }
  };

  const filterByCategory = async () => {
    try {
      const res = await API.get<Transaction[]>(
        `/transactions/filter/category?categoryName=${encodeURIComponent(
          filterCategory,
        )}`,
      );
      setTransactions(res.data);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Filter failed"
        : "Filter failed";

      alert(typeof message === "string" ? message : "Filter failed");
    }
  };

  const filterByDate = async () => {
    try {
      const res = await API.get<Transaction[]>(
        `/transactions/filter/date?startDate=${encodeURIComponent(
          startDate,
        )}&endDate=${encodeURIComponent(endDate)}`,
      );
      setTransactions(res.data);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data ||
          "Filter failed"
        : "Filter failed";

      alert(typeof message === "string" ? message : "Filter failed");
    }
  };

  const resetFilters = () => {
    setFilterType("");
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
    void fetchTransactions();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
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

        <button className="bg-black text-white px-4 py-2 rounded">
          Add Transaction
        </button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Filters</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="border p-2 rounded"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>

          <input
            className="border p-2 rounded"
            placeholder="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />

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

          <button
            type="button"
            onClick={filterByType}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            By Type
          </button>

          <button
            type="button"
            onClick={filterByCategory}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            By Category
          </button>

          <button
            type="button"
            onClick={filterByDate}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            By Date
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="bg-gray-600 text-white px-3 py-1 rounded"
          >
            Reset
          </button>
        </div>
      </div>

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
                <td className="p-3">
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
