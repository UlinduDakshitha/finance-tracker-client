"use client";

import { useEffect, useState } from "react";
import API from "@/services/api";

type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    API.get("/dashboard/summary").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded">Income: {data.totalIncome}</div>
        <div className="border p-4 rounded">Expense: {data.totalExpense}</div>
        <div className="border p-4 rounded">Balance: {data.balance}</div>
      </div>
    </div>
  );
}
