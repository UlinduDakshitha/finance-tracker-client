"use client";

import { useEffect, useState } from "react";
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
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    API.get<DashboardData>("/dashboard/summary").then((res) =>
      setData(res.data),
    );
  }, []);

  if (!data) return <div>Loading...</div>;

  const pieData: CategoryExpense[] = data.expenseByCategory || [];
  const monthlyData: MonthlyTrend[] = data.monthlyTrend || [];
  const usagePercent = data.budgetUsagePercent ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Income</p>
          <h2 className="text-2xl font-bold">{data.totalIncome}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Expense</p>
          <h2 className="text-2xl font-bold">{data.totalExpense}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Balance</p>
          <h2 className="text-2xl font-bold">{data.balance}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Budget Usage</p>
          <h2 className="text-2xl font-bold">{usagePercent.toFixed(2)}%</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Expense by Category</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_: CategoryExpense, index: number) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Monthly Income vs Expense
          </h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#000000" />
                <Bar dataKey="expense" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Budget vs Actual Spending
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${usagePercent > 100 ? "bg-red-500" : "bg-blue-500"}`}
              style={{
                width: `${Math.min(usagePercent, 100)}%`,
              }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Current Month Budget: {data.currentMonthBudget}
          </p>
          <p className="text-sm text-gray-600">
            Current Month Expense: {data.currentMonthExpense}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {(data.recentTransactions || []).map((tx: Transaction) => (
              <div key={tx.id} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">{tx.title}</p>
                  <p className="text-sm text-gray-500">
                    {tx.categoryName} • {tx.type} • {tx.transactionDate}
                  </p>
                </div>
                <p className="font-bold">{tx.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
