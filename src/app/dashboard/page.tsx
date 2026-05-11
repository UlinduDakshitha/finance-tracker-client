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
    API.get<DashboardSummary>("/dashboard/summary").then((res) =>
      setData(res.data),
    );
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          Income: {data.totalIncome}
        </div>
        <div className="bg-white p-4 rounded shadow">
          Expense: {data.totalExpense}
        </div>
        <div className="bg-white p-4 rounded shadow">
          Balance: {data.balance}
        </div>
      </div>
    </div>
  );
}
