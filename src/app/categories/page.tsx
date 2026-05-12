"use client";

import { useEffect, useState } from "react";
import API from "@/services/api";
import axios from "axios";

type Category = {
  id: number;
  name: string;
  type: string;
};

type FormState = {
  name: string;
  type: string;
};

const emptyForm: FormState = {
  name: "",
  type: "EXPENSE",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const totalIncomeCategories = categories.filter(
    (category) => category.type === "INCOME",
  ).length;
  const totalExpenseCategories = categories.filter(
    (category) => category.type === "EXPENSE",
  ).length;

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchCategories();
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, form);
      } else {
        await API.post("/categories", form);
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Something went wrong";
      alert(message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-zinc-50 to-blue-50 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-transparent to-cyan-500/10" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Category organization
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                  Keep income and expense groups organized.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Create meaningful categories, assign the right type, and keep
                  your reports easier to understand at a glance.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-bold text-zinc-950">
                    {categories.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Income
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-950">
                    {totalIncomeCategories}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Expense
                  </p>
                  <p className="mt-1 text-lg font-bold text-rose-950">
                    {totalExpenseCategories}
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
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Use short, clear names so category reporting stays readable.
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {editingId ? "Editing mode" : "New category"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Category Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <select
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="INCOME">INCOME</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-linear-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98]">
              {editingId ? "Update Category" : "Add Category"}
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

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 sm:px-7">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Category List
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Review and manage your category groups below.
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {categories.length} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-160">
              <thead className="bg-zinc-50/90 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-14 text-center">
                      <div className="mx-auto max-w-sm rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10">
                        <p className="text-base font-semibold text-zinc-950">
                          No categories yet
                        </p>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                          Add your first income or expense category to make
                          budgeting and reporting cleaner.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-zinc-100/80 transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-zinc-950">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${category.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                        >
                          {category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-[0.98]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
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
