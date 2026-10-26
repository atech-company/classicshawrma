"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "out_for_delivery", "cancelled"],
  ready: ["out_for_delivery", "completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const token = getAdminToken();
    if (!token) return;
    const data = await api.adminOrder(token, Number(params.id));
    setOrder(data);
  }

  useEffect(() => {
    load().catch(() => router.replace("/admin/orders"));
    const id = setInterval(() => load().catch(() => null), 10000);
    return () => clearInterval(id);
  }, [params.id, router]);

  async function updateStatus(status: string) {
    const token = getAdminToken();
    if (!token || !order?.id) return;
    setError("");
    try {
      const updated = await api.adminUpdateOrderStatus(token, order.id, {
        status,
        cancel_reason: status === "cancelled" ? cancelReason || "Cancelled by admin" : undefined,
      });
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  function printReceipt() {
    window.print();
  }

  if (!order) {
    return (
      <AdminShell>
        <p className="text-sm text-[#6b645c]">Loading order…</p>
      </AdminShell>
    );
  }

  const transitions = NEXT[order.status] ?? [];

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-3 print:block">
        <div>
          <h1 className="font-display text-3xl">{order.order_number}</h1>
          <p className="mt-1 text-sm capitalize text-[#6b645c]">
            {order.status.replaceAll("_", " ")} · {order.order_type}
          </p>
        </div>
        <button
          type="button"
          onClick={printReceipt}
          className="rounded-full border border-[#e4ddd3] bg-white px-4 py-2 text-sm print:hidden"
        >
          Print receipt
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e4ddd3] bg-white p-5 text-sm">
          <h2 className="font-semibold">Customer</h2>
          <p className="mt-2">{order.customer_name}</p>
          <p dir="ltr">{order.customer_phone}</p>
          {order.delivery_address && (
            <p className="mt-2">{order.delivery_address}</p>
          )}
          {order.delivery_instructions && (
            <p className="mt-1 text-[#6b645c]">{order.delivery_instructions}</p>
          )}
          {order.customer_notes && (
            <p className="mt-2">Notes: {order.customer_notes}</p>
          )}
        </section>

        <section className="rounded-2xl border border-[#e4ddd3] bg-white p-5 text-sm">
          <h2 className="font-semibold">Payment</h2>
          <p className="mt-2">
            {order.payment_method} · {order.payment_status}
          </p>
          <p className="mt-2">Subtotal: {formatMoney(order.subtotal, "LBP", 0)}</p>
          <p>Fees: {formatMoney(order.fees, "LBP", 0)}</p>
          <p className="mt-1 text-base font-semibold">
            Total: {formatMoney(order.total, "LBP", 0)}
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e4ddd3] bg-white p-5">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between gap-3 border-b border-[#f0ebe3] py-2">
              <div>
                <p>
                  {item.quantity}× {item.item_name_en}
                </p>
                {item.notes && (
                  <p className="text-[#6b645c]">{item.notes}</p>
                )}
              </div>
              <p>{formatMoney(item.line_total, "LBP", 0)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e4ddd3] bg-white p-5 print:hidden">
        <h2 className="font-semibold">Update status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {transitions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => updateStatus(status)}
              className="rounded-full bg-[#c45c26] px-4 py-2 text-sm font-semibold capitalize text-white"
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
        {transitions.includes("cancelled") && (
          <input
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Cancel reason"
            className="mt-3 w-full max-w-md rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm"
          />
        )}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </section>
    </AdminShell>
  );
}
