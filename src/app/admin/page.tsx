"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { WidgetCard } from "@/components/admin/widget-card";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import type { Category, Order } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

type Stats = {
  orders_today: number;
  pending_orders: number;
  confirmed_orders: number;
  completed_orders: number;
  sales_today: number;
  sales_period: number;
};

type Period = "day" | "week" | "month" | "year";

const STATUS_COLORS = {
  pending: "#ffa940",
  confirmed: "#6670c4",
  kitchen: "#e23d73",
  completed: "#72bf6f",
};

function startOfPeriod(period: Period) {
  const now = new Date();
  const d = new Date(now);
  if (period === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setFullYear(d.getFullYear() - 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function inPeriod(iso: string | undefined, from: Date) {
  if (!iso) return false;
  return new Date(iso) >= from;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kpiIndex, setKpiIndex] = useState(0);
  const [period, setPeriod] = useState<Period>("month");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;

    const load = async () => {
      try {
        const [dash, orderRes, cats] = await Promise.all([
          api.adminDashboard(token),
          api.adminOrders(token, { per_page: "200" }),
          api.adminCategories(token),
        ]);
        setStats(dash);
        setOrders(orderRes.data ?? []);
        setCategories(cats);
      } catch {
        /* keep previous */
      }
    };

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const kpis = useMemo(
    () => [
      {
        key: "sales",
        label: "Sales today",
        value: formatMoney(stats?.sales_today ?? 0, "LBP", 0),
        tone: "purple" as const,
        hint: "Excludes cancelled",
      },
      {
        key: "orders",
        label: "Orders today",
        value: String(stats?.orders_today ?? 0),
        tone: "blue" as const,
        hint: "All statuses",
      },
      {
        key: "pending",
        label: "Pending now",
        value: String(stats?.pending_orders ?? 0),
        tone: "teal" as const,
        hint: "Needs attention",
      },
    ],
    [stats]
  );

  const activeKpi = kpis[kpiIndex] ?? kpis[0];

  const ordersChart = useMemo(() => {
    const days = 30;
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    for (const order of orders) {
      if (!order.created_at || order.status === "cancelled") continue;
      const key = order.created_at.slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([date, count]) => ({
      date,
      label: new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      count,
    }));
  }, [orders]);

  const periodFrom = useMemo(() => startOfPeriod(period), [period]);

  const periodOrders = useMemo(
    () => orders.filter((o) => inPeriod(o.created_at, periodFrom)),
    [orders, periodFrom]
  );

  const statusMix = useMemo(() => {
    const pending = periodOrders.filter((o) => o.status === "pending").length;
    const confirmed = periodOrders.filter((o) => o.status === "confirmed").length;
    const kitchen = periodOrders.filter((o) =>
      ["preparing", "ready", "out_for_delivery"].includes(o.status)
    ).length;
    const completed = periodOrders.filter((o) => o.status === "completed").length;
    const rows = [
      { key: "pending", name: "Pending", value: pending, color: STATUS_COLORS.pending },
      { key: "confirmed", name: "Confirmed", value: confirmed, color: STATUS_COLORS.confirmed },
      { key: "kitchen", name: "In kitchen", value: kitchen, color: STATUS_COLORS.kitchen },
      { key: "completed", name: "Completed", value: completed, color: STATUS_COLORS.completed },
    ];
    const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
    return {
      rows: rows.map((row) => ({ ...row, pct: Math.round((row.value / total) * 100) })),
      total: rows.reduce((sum, row) => sum + row.value, 0),
      sales: periodOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + (o.total ?? 0), 0),
    };
  }, [periodOrders]);

  const typeBars = useMemo(() => {
    const takeaway = periodOrders.filter((o) => o.order_type === "takeaway").length;
    const delivery = periodOrders.filter((o) => o.order_type === "delivery").length;
    const cancelled = periodOrders.filter((o) => o.status === "cancelled").length;
    return [
      { name: "Takeaway", value: takeaway, fill: "#72bf6f" },
      { name: "Delivery", value: delivery, fill: "#6670c4" },
      { name: "Cancelled", value: cancelled, fill: "#e23d73" },
    ];
  }, [periodOrders]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 6),
    [orders]
  );

  const categoryBars = useMemo(() => {
    const sorted = [...categories]
      .map((c) => ({
        name: c.name_en.length > 10 ? `${c.name_en.slice(0, 9)}…` : c.name_en,
        full: c.name_en,
        value: c.items_count ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
    const max = Math.max(...sorted.map((r) => r.value), 1);
    const shades = ["#5b2de8", "#6b3ee8", "#7b61d9", "#8f7ae0", "#a994ea", "#c2b4f2", "#d9d0f7"];
    return sorted.map((row, index) => ({
      ...row,
      width: Math.max(18, Math.round((row.value / max) * 100)),
      fill: shades[index] ?? "#d9d0f7",
      darkText: index >= 4,
    }));
  }, [categories]);

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">Live restaurant metrics · refreshes every 15s</p>
        </div>
      </div>

      <div className="admin-dash-grid">
        <WidgetCard
          title="Highlights"
          accent="green"
          className="admin-area-kpi"
          headerRight={
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="admin-icon-btn !h-8 !w-8"
                aria-label="Previous highlight"
                onClick={() => setKpiIndex((i) => (i - 1 + kpis.length) % kpis.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="admin-icon-btn !h-8 !w-8"
                aria-label="Next highlight"
                onClick={() => setKpiIndex((i) => (i + 1) % kpis.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        >
          <div
            className="admin-kpi-card"
            data-tone={activeKpi.tone === "purple" ? undefined : activeKpi.tone}
          >
            <p className="relative z-[1] text-sm text-white/80">{activeKpi.label}</p>
            <p className="relative z-[1] mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{activeKpi.value}</p>
            <p className="relative z-[1] mt-6 text-xs text-white/70">{activeKpi.hint}</p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8e4f8]">
              <div
                className="h-full rounded-full bg-[#2d4cf0] transition-all"
                style={{ width: `${((kpiIndex + 1) / kpis.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--admin-muted)]">
              {kpiIndex + 1} / {kpis.length}
            </span>
          </div>
        </WidgetCard>

        <WidgetCard
          title="Order flow"
          accent="teal"
          className="admin-area-orders"
          headerRight={<span>Last 30 days</span>}
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--admin-muted)]">
            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[#1e9bf0]" />
            Closed / non-cancelled orders
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ordersChart}>
                <defs>
                  <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e9bf0" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1e9bf0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: "#9aa0b4", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
                <YAxis allowDecimals={false} tick={{ fill: "#9aa0b4", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "none", background: "#2d3142", color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="count" stroke="#1e9bf0" strokeWidth={2} fill="url(#ordersFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>

        <WidgetCard
          title="Status mix"
          accent="red"
          className="admin-area-income"
          headerRight={
            <div className="flex gap-2 text-xs">
              {(["day", "week", "month", "year"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={
                    period === p
                      ? "font-semibold capitalize text-[var(--admin-accent-red)] underline underline-offset-4"
                      : "capitalize text-[var(--admin-muted)]"
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-52 w-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusMix.rows}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statusMix.rows.map((row) => (
                      <Cell key={row.key} fill={row.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-sm text-[var(--admin-text)]">Total</p>
                <p className="text-lg font-bold text-[var(--admin-green)]">{statusMix.total}</p>
                <p className="text-xs font-semibold text-[var(--admin-accent-red)]">
                  {formatMoney(statusMix.sales, "LBP", 0)}
                </p>
              </div>
            </div>
            <ul className="w-full space-y-2 text-sm">
              {statusMix.rows.map((row) => (
                <li key={row.key} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: row.color }} />
                  <span className="flex-1 text-[var(--admin-text)]">{row.name}</span>
                  <span className="font-semibold text-[var(--admin-muted)]">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </WidgetCard>

        <WidgetCard
          title="Status overview"
          accent="purple"
          className="admin-area-overview"
          headerRight={
            <Link href="/admin/orders" className="admin-link text-xs">
              See all
            </Link>
          }
        >
          <ul className="space-y-4">
            {statusMix.rows.map((row) => (
              <li key={row.key} className="grid grid-cols-[48px_1fr_auto] items-center gap-3">
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl text-xs font-bold text-white"
                  style={{ background: row.color }}
                >
                  {row.pct}%
                </span>
                <div>
                  <p className="text-sm font-semibold">{row.name}</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#eceef5]">
                    <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">{row.value}</span>
              </li>
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard title="Order types" accent="green" className="admin-area-payment">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeBars}>
                <XAxis dataKey="name" tick={{ fill: "#9aa0b4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#9aa0b4", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {typeBars.map((row) => (
                    <Cell key={row.name} fill={row.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>

        <WidgetCard title="Recent orders" accent="green" className="admin-area-txs">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--admin-muted)]">No orders yet.</p>
          ) : (
            <ul className="space-y-2.5 text-xs">
              {recentOrders.map((order) => {
                const up = order.status === "completed" || order.status === "confirmed";
                return (
                  <li key={order.public_reference} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <Link href={`/admin/orders/${order.id}`} className="min-w-0 truncate font-medium text-[var(--admin-text)] hover:text-[var(--admin-blue)]">
                      {order.order_number}
                      <span className="ms-1 font-normal text-[var(--admin-muted)]">{order.customer_name}</span>
                    </Link>
                    <span className="tabular-nums text-[var(--admin-indigo)]">{order.id}</span>
                    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${up ? "text-[var(--admin-up)]" : "text-[var(--admin-down)]"}`}>
                      {formatMoney(order.total, "LBP", 0)}
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard title="Categories" accent="yellow" className="admin-area-hist">
          {categoryBars.length === 0 ? (
            <p className="text-sm text-[var(--admin-muted)]">No categories yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {categoryBars.map((row) => (
                <li key={row.full} title={`${row.full}: ${row.value} items`}>
                  <div
                    className="flex h-7 items-center justify-between rounded-md px-2 text-xs font-semibold"
                    style={{
                      width: `${row.width}%`,
                      background: row.fill,
                      color: row.darkText ? "#2d3142" : "#fff",
                      minWidth: "4.5rem",
                    }}
                  >
                    <span className="truncate">{row.name}</span>
                    <span>{row.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>
    </AdminShell>
  );
}
