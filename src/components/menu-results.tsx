"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MenuCard } from "@/components/menu-card";
import type { MenuItem } from "@/lib/types";

const PAGE_SIZE = 12;

export function MenuResults({
  items,
  currency,
  decimals,
  locale,
}: {
  items: MenuItem[];
  currency: string;
  decimals: number;
  locale: string;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleItems = items.slice(0, visibleCount);
  const remaining = items.length - visibleItems.length;
  const isArabic = locale === "ar";

  return (
    <section aria-label={isArabic ? "نتائج القائمة" : "Menu results"}>
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted" aria-live="polite">
        <span>{isArabic ? "الأصناف المعروضة" : "Showing items"}</span>
        <span dir="ltr">{visibleItems.length} / {items.length}</span>
      </div>
      <div className="menu-display-grid grid gap-6">
        {visibleItems.map((item) => (
          <MenuCard key={item.id} item={item} currency={currency} decimals={decimals} />
        ))}
      </div>
      {remaining > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, items.length))}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-accent/20 bg-white/70 px-6 py-3 text-sm font-bold text-accent shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:bg-white"
          >
            {isArabic ? `عرض المزيد · ${remaining} متبقية` : `Show more · ${remaining} left`}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
