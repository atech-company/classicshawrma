"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { WidgetCard } from "@/components/admin/widget-card";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [orderType, setOrderType] = useState("");

  async function load() {
    const token = getAdminToken();
    if (!token) return;
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (status) params.status = status;
    if (orderType) params.order_type = orderType;
    const res = await api.adminOrders(token, params);
    setOrders(res.data ?? []);
  }

  useEffect(() => {
    load().catch(() => null);
    const id = setInterval(() => load().catch(() => null), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">Orders</h1>
      <p className="mt-1 text-sm text-[var(--admin-muted)]">Auto-refreshes every 10 seconds.</p>

      <WidgetCard title="Filters" accent="blue" className="mt-6">
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search number or phone"
            className="admin-input max-w-xs"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="admin-select max-w-[12rem]"
          >
            <option value="">All statuses</option>
            {[
              "pending",
              "confirmed",
              "preparing",
              "ready",
              "out_for_delivery",
              "completed",
              "cancelled",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="admin-select max-w-[11rem]"
          >
            <option value="">All types</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
          <button
            type="button"
            onClick={() => load().catch(() => null)}
            className="admin-btn-primary"
          >
            Filter
          </button>
        </div>
      </WidgetCard>

      <WidgetCard title="All orders" accent="green" className="mt-6" bodyClassName="!p-0">
        <div className="admin-table-wrap !border-0 !shadow-none !rounded-none">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--admin-muted)]">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.public_reference}>
                    <td>
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-xs text-[var(--admin-muted)]">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : ""}
                      </div>
                    </td>
                    <td>
                      <div>{order.customer_name}</div>
                      <div dir="ltr" className="text-[var(--admin-muted)]">
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="capitalize">{order.order_type}</td>
                    <td>
                      <span className="admin-badge">
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>{formatMoney(order.total, "LBP", 0)}</td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="admin-link">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </WidgetCard>
    </AdminShell>
  );
}
