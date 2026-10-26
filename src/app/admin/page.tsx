"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/utils";

type Stats = {
  orders_today: number;
  pending_orders: number;
  confirmed_orders: number;
  completed_orders: number;
  sales_today: number;
  sales_period: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    const load = () =>
      api.adminDashboard(token).then(setStats).catch(() => null);
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const cards = [
    { label: "Orders today", value: stats?.orders_today ?? 0 },
    { label: "Pending", value: stats?.pending_orders ?? 0 },
    { label: "Confirmed", value: stats?.confirmed_orders ?? 0 },
    { label: "Completed", value: stats?.completed_orders ?? 0 },
    {
      label: "Sales today",
      value: formatMoney(stats?.sales_today ?? 0, "LBP", 0),
    },
  ];

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-[#6b645c]">
        Live stats refresh every 15 seconds.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#e4ddd3] bg-white p-5"
          >
            <p className="text-sm text-[#6b645c]">{card.label}</p>
            <p className="mt-2 font-display text-3xl">{card.value}</p>
          </div>
        ))}
      </div>
      {!stats && (
        <p className="mt-6 text-sm text-[#6b645c]">Loading metrics…</p>
      )}
    </AdminShell>
  );
}
