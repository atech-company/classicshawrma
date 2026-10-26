"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { Restaurant } from "@/lib/types";
import { formatMoney, localized } from "@/lib/utils";
import { demoRestaurant, withCatalogRestaurant } from "@/lib/restaurant-defaults";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"takeaway" | "delivery">("takeaway");
  const [address, setAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    api
      .getRestaurant()
      .then((r) => {
        setRestaurant(withCatalogRestaurant(r));
        if (r.takeaway_enabled) setOrderType("takeaway");
        else if (r.delivery_enabled) setOrderType("delivery");
      })
      .catch(() => setRestaurant(demoRestaurant));
  }, []);

  const fees = useMemo(() => {
    if (!restaurant || orderType !== "delivery") return 0;
    return restaurant.delivery_fee;
  }, [restaurant, orderType]);

  const total = subtotal() + fees;
  const currency = restaurant?.currency ?? "LBP";
  const decimals = restaurant?.currency_decimals ?? 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    setError("");
    try {
      const order = await api.createOrder(
        {
          customer_name: name,
          customer_phone: phone,
          order_type: orderType,
          delivery_address: orderType === "delivery" ? address : null,
          delivery_instructions: deliveryNotes || null,
          customer_notes: notes || null,
          payment_method:
            orderType === "delivery" ? "cash_delivery" : "cash_pickup",
          items: items.map((line) => ({
            menu_item_id: line.menu_item_id,
            quantity: line.quantity,
            variant_id: line.variant_id ?? null,
            modifier_option_ids: line.modifier_option_ids,
            notes: line.notes ?? null,
          })),
        },
        crypto.randomUUID()
      );
      clear();
      router.push(`/order/${order.public_reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return <div className="mx-auto max-w-3xl px-5 py-24 text-muted">…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="glass-panel rounded-[2rem] p-10">
          <p className="font-display text-2xl">{t("title")}</p>
          <p className="mt-3 text-sm text-muted">{locale === "ar" ? "لا توجد أصناف في السلة بعد." : "There are no items in your cart yet."}</p>
          <Link href="/menu" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white">{locale === "ar" ? "تصفح القائمة" : "Browse menu"}</Link>
        </div>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-white/80 bg-white/65 px-4 py-3 text-sm outline-none backdrop-blur-xl transition placeholder:text-muted/70 focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:px-10 md:py-16 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-[2rem] p-6 md:p-9">
        <div className="mb-2"><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">{locale === "ar" ? "خطوة أخيرة" : "JUST ONE MORE STEP"}</p><h1 className="font-display text-4xl tracking-tight">{t("title")}</h1></div>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">{t("name")}</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">{t("phone")}</span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            dir="ltr"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t("orderType")}</legend>
          <div className="flex flex-wrap gap-3">
            {restaurant?.takeaway_enabled && (
              <label className={`rounded-full border px-4 py-2.5 text-sm transition ${orderType === "takeaway" ? "border-accent bg-accent/10 text-accent" : "border-white/80 bg-white/60"}`}>
                <input
                  type="radio"
                  className="me-2"
                  checked={orderType === "takeaway"}
                  onChange={() => setOrderType("takeaway")}
                />
                {t("takeaway")}
              </label>
            )}
            {restaurant?.delivery_enabled && (
              <label className={`rounded-full border px-4 py-2.5 text-sm transition ${orderType === "delivery" ? "border-accent bg-accent/10 text-accent" : "border-white/80 bg-white/60"}`}>
                <input
                  type="radio"
                  className="me-2"
                  checked={orderType === "delivery"}
                  onChange={() => setOrderType("delivery")}
                />
                {t("delivery")}
              </label>
            )}
          </div>
        </fieldset>
        {orderType === "delivery" && (
          <>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">{t("address")}</span>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={fieldClass}
                rows={3}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">{t("deliveryNotes")}</span>
              <input
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className={fieldClass}
              />
            </label>
          </>
        )}
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">{t("notes")}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={fieldClass}
            rows={3}
          />
        </label>
        <p className="text-sm text-muted">
          {t("payment")}:{" "}
          {orderType === "delivery" ? t("cashDelivery") : t("cashPickup")}
        </p>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(196,93,58,.24)] transition hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting ? t("placing") : t("place")}
        </button>
      </form>

      <aside className="glass-panel h-fit rounded-[2rem] p-6 md:sticky md:top-28">
        <p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-accent">{locale === "ar" ? "ملخص الطلب" : "ORDER SUMMARY"}</p>
        <ul className="space-y-3 text-sm">
          {items.map((line) => (
            <li key={line.key} className="flex justify-between gap-3">
              <span>
                {line.quantity}× {localized(line, locale, "name")}
              </span>
              <span>
                {formatMoney(line.unit_price * line.quantity, currency, decimals)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal(), currency, decimals)}</span>
          </div>
          {fees > 0 && (
            <div className="flex justify-between">
              <span>{t("fees")}</span>
              <span>{formatMoney(fees, currency, decimals)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>{t("total")}</span>
            <span>{formatMoney(total, currency, decimals)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
