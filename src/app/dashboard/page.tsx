"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

type CategoryExpense = { categoryName: string; amount: number };
type MonthlyTrend = {
  month: string | number;
  income?: number;
  expense?: number;
};
type Transaction = {
  id: string | number;
  title: string;
  categoryName: string;
  type: string;
  transactionDate: string;
  amount: number | string;
};

type DashboardData = {
  totalIncome?: number;
  totalExpense?: number;
  balance?: number;
  budgetUsagePercent?: number;
  currentMonthBudget?: number;
  currentMonthExpense?: number;
  expenseByCategory?: CategoryExpense[];
  monthlyTrend?: MonthlyTrend[];
  recentTransactions?: Transaction[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    API.get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(() => alert("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const formatCurrency = (value: number) =>
    `Rs ${value.toLocaleString("en-LK")}`;

  if (loading) {
    return <div className="p-6 text-lg">Loading dashboard...</div>;
  }

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4 text-gray-600">
          No financial data yet. Add categories and transactions to see summary
          here.
        </p>
      </div>
    );
  }

  const pieData: CategoryExpense[] = data.expenseByCategory || [];
  const monthlyData: MonthlyTrend[] = data.monthlyTrend || [];
  const usagePercent = data.budgetUsagePercent ?? 0;

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 pb-8">
      {/* Header Section */}
      <div className="bg-white border-b border-zinc-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-zinc-600 mt-1">
                Welcome back! Your financial overview awaits.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-zinc-500">Balance</p>
                <p
                  className={`text-2xl font-bold ${(data.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(data.balance || 0)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Income */}
          <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-200 rounded-full group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-green-700 font-medium text-sm mb-1">
              Total Income
            </p>
            <h2 className="text-3xl font-bold text-green-900">
              {formatCurrency(data.totalIncome || 0)}
            </h2>
            <p className="text-xs text-green-600 mt-2">This month</p>
          </div>
          {/* Total Expense */}
          <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-200 rounded-full group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-red-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-red-700 bg-red-200 px-3 py-1 rounded-full">
                -8%
              </span>
            </div>
            <p className="text-red-700 font-medium text-sm mb-1">
              Total Expense
            </p>
            <h2 className="text-3xl font-bold text-red-900">
              {formatCurrency(data.totalExpense || 0)}
            </h2>
            <p className="text-xs text-red-600 mt-2">This month</p>
          </div>

          {/* Balance */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-200 rounded-full group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${(data.balance ?? 0) >= 0 ? "text-green-700 bg-green-200" : "text-red-700 bg-red-200"}`}
              >
                {(data.balance ?? 0) >= 0 ? "+" : "-"}
                {Math.abs(data.balance || 0) > 100000 ? "↑" : "↓"}
              </span>
            </div>
            <p className="text-blue-700 font-medium text-sm mb-1">
              Available Balance
            </p>
            <h2 className="text-3xl font-bold text-blue-900">
              {formatCurrency(data.balance || 0)}
            </h2>
            <p className="text-xs text-blue-600 mt-2">Liquid cash</p>
          </div>

          {/* Budget Usage */}
          <div
            className={`bg-linear-to-br ${usagePercent > 100 ? "from-orange-50 to-orange-100 border border-orange-200" : "from-purple-50 to-purple-100 border border-purple-200"} p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 ${usagePercent > 100 ? "bg-orange-200" : "bg-purple-200"} rounded-full group-hover:scale-110 transition-transform duration-300`}
              >
                <svg
                  className={`w-6 h-6 ${usagePercent > 100 ? "text-orange-700" : "text-purple-700"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${usagePercent > 100 ? "text-orange-700 bg-orange-200" : "text-purple-700 bg-purple-200"}`}
              >
                {usagePercent > 100 ? "⚠️ Over" : "✓ On track"}
              </span>
            </div>
            <p
              className={`${usagePercent > 100 ? "text-orange-700" : "text-purple-700"} font-medium text-sm mb-1`}
            >
              Budget Usage
            </p>
            <h2
              className={`text-3xl font-bold ${usagePercent > 100 ? "text-orange-900" : "text-purple-900"}`}
            >
              {usagePercent.toFixed(1)}%
            </h2>
            <p
              className={`text-xs ${usagePercent > 100 ? "text-orange-600" : "text-purple-600"} mt-2`}
            >
              {usagePercent > 100 ? "Over budget" : "Within limit"}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Expense by Category */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Expense by Category
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Distribution of your spending
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {pieData.length === 0 ? (
              <p className="text-gray-500">No expense data available.</p>
            ) : (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, value }) => `${name}: Rs${value}`}
                      labelLine
                    >
                      {pieData.map((_: CategoryExpense, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Rs${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Monthly Trends
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Income vs Expense over time
                </p>
              </div>
              <div className="flex gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="month" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    formatter={(value) => `Rs${value}`}
                    contentStyle={{
                      backgroundColor: "#f4f4f5",
                      border: "1px solid #e4e4e7",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Budget Progress & Recent Transactions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Budget Progress */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Budget Progress
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Current month spending
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-zinc-700 block">
                      Budget Allocated
                    </span>
                    <span className="text-2xl font-bold text-zinc-900">
                      {formatCurrency(data.currentMonthBudget || 0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-zinc-700 block">
                      Spent
                    </span>
                    <span className="text-2xl font-bold text-zinc-900">
                      {formatCurrency(data.currentMonthExpense || 0)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      usagePercent > 100
                        ? "bg-red-500"
                        : usagePercent > 75
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.min(usagePercent, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {usagePercent.toFixed(1)}% used{" "}
                  {usagePercent > 100
                    ? `(${(usagePercent - 100).toFixed(1)}% over)`
                    : `(${(100 - usagePercent).toFixed(1)}% remaining)`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 p-4 rounded-xl">
                  <p className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wide">
                    Budget
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(data.currentMonthBudget || 0)}
                  </p>
                </div>
                <div
                  className={`bg-linear-to-br ${usagePercent > 100 ? "from-red-50 to-red-100 border border-red-200" : "from-orange-50 to-orange-100 border border-orange-200"} p-4 rounded-xl`}
                >
                  <p
                    className={`text-xs ${usagePercent > 100 ? "text-red-700" : "text-orange-700"} font-semibold mb-1 uppercase tracking-wide`}
                  >
                    Spent
                  </p>
                  <p
                    className={`text-xl font-bold ${usagePercent > 100 ? "text-red-900" : "text-orange-900"}`}
                  >
                    {formatCurrency(data.currentMonthExpense || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Recent Transactions
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Your latest activity
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              {(data.recentTransactions || []).length === 0 ? (
                <p className="text-gray-500">No recent transactions yet.</p>
              ) : (
                (data.recentTransactions || []).map((tx: Transaction) => (
                  <div
                    key={tx.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-semibold">{tx.title}</p>
                      <p className="text-sm text-gray-500">
                        {tx.categoryName} • {tx.type} • {tx.transactionDate}
                      </p>
                    </div>
                    <p className="font-bold">{tx.amount}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
