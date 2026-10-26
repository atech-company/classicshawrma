"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import { formatMoney, localized } from "@/lib/utils";
import type { Restaurant } from "@/lib/types";
import { demoRestaurant, withCatalogRestaurant } from "@/lib/restaurant-defaults";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, setQuantity, removeItem, subtotal } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.getRestaurant().then((r) => setRestaurant(withCatalogRestaurant(r))).catch(() => setRestaurant(demoRestaurant));
  }, []);

  if (!mounted) {
    return <div className="mx-auto max-w-3xl px-5 py-24 text-muted">…</div>;
  }

  const currency = restaurant?.currency ?? "LBP";
  const decimals = restaurant?.currency_decimals ?? 0;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="glass-panel rounded-[2rem] p-10 md:p-14">
        <h1 className="font-display text-4xl">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("empty")}</p>
        <Link
          href="/menu"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
        >
          {t("browse")}
        </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
      <div className="mb-8"><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">{locale === "ar" ? "مراجعة طلبكم" : "YOUR ORDER"}</p><h1 className="font-display text-4xl tracking-tight md:text-5xl">{t("title")}</h1></div>
      <ul className="mt-8 space-y-4">
        {items.map((line) => (
          <li
            key={line.key}
            className="glass-panel rounded-2xl p-4 transition hover:bg-white/75"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                {line.image_url && <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/60 sm:block">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={line.image_url} alt="" className="h-full w-full object-cover" /></div>}
                <div>
                <h2 className="font-display text-lg">
                  {localized(line, locale, "name")}
                </h2>
                {(line.variant_label_en || line.modifier_labels_en.length > 0) && (
                  <p className="mt-1 text-sm text-muted">
                    {[
                      locale === "ar"
                        ? line.variant_label_ar
                        : line.variant_label_en,
                      ...(locale === "ar"
                        ? line.modifier_labels_ar
                        : line.modifier_labels_en),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {line.notes && (
                  <p className="mt-1 text-xs text-muted">{line.notes}</p>
                )}
                <p className="mt-2 text-sm font-semibold text-accent">
                  {formatMoney(line.unit_price * line.quantity, currency, decimals)}
                </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    setQuantity(line.key, Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-16 rounded-lg border border-white/80 bg-white/70 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={() => removeItem(line.key)}
                  className="text-xs text-red-700 hover:underline"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="glass-panel mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <p className="text-lg font-semibold">
          {t("subtotal")}: {formatMoney(subtotal(), currency, decimals)}
        </p>
        <Link
          href="/checkout"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          {t("checkout")}
        </Link>
      </div>
    </div>
  );
}
