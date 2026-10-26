"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
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
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-[#6b645c]">Auto-refreshes every 10 seconds.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search number or phone"
          className="rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm"
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
          className="rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="takeaway">Takeaway</option>
          <option value="delivery">Delivery</option>
        </select>
        <button
          type="button"
          onClick={() => load().catch(() => null)}
          className="rounded-full bg-[#c45c26] px-4 py-2 text-sm font-semibold text-white"
        >
          Filter
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e4ddd3] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f6f3ee] text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6b645c]">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.public_reference} className="border-t border-[#e4ddd3]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.order_number}</div>
                    <div className="text-xs text-[#6b645c]">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{order.customer_name}</div>
                    <div dir="ltr" className="text-[#6b645c]">
                      {order.customer_phone}
                    </div>
                  </td>
                  <td className="px-4 py-3">{order.order_type}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#f6f3ee] px-2 py-1 text-xs capitalize">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatMoney(order.total, "LBP", 0)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[#c45c26]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
