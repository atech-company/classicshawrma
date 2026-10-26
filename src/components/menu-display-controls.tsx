"use client";

import { LayoutGrid, List } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type Layout = "grid" | "list";

const STORAGE_KEY = "classic-menu-display";

export function MenuDisplayControls({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const [layout, setLayout] = useState<Layout>("grid");
  const [columns, setColumns] = useState(3);
  const [ready, setReady] = useState(false);
  const isArabic = locale === "ar";

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const preference = JSON.parse(saved) as { layout?: Layout; columns?: number };
        if (preference.layout === "grid" || preference.layout === "list") {
          setLayout(preference.layout);
        }
        if ([2, 3, 4].includes(preference.columns ?? 0)) {
          setColumns(preference.columns!);
        }
      }
    } catch {
      // Ignore invalid or unavailable browser storage and keep the defaults.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ layout, columns }));
    } catch {
      // Keep the controls usable when browser storage is unavailable.
    }
  }, [layout, columns, ready]);

  return (
    <div
      className="menu-display"
      data-layout={layout}
      data-columns={columns}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/45 p-3 shadow-sm backdrop-blur-xl">
        <span className="px-2 text-xs font-semibold uppercase tracking-[.12em] text-muted">
          {isArabic ? "طريقة العرض" : "View menu"}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-black/5 bg-white/70 p-1" role="group" aria-label={isArabic ? "طريقة عرض الأصناف" : "Item layout"}>
            <button
              type="button"
              aria-pressed={layout === "grid"}
              onClick={() => setLayout("grid")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${layout === "grid" ? "bg-accent text-white shadow-sm" : "text-muted hover:bg-white"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {isArabic ? "شبكة" : "Grid"}
            </button>
            <button
              type="button"
              aria-pressed={layout === "list"}
              onClick={() => setLayout("list")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${layout === "list" ? "bg-accent text-white shadow-sm" : "text-muted hover:bg-white"}`}
            >
              <List className="h-3.5 w-3.5" />
              {isArabic ? "قائمة" : "List"}
            </button>
          </div>
          {layout === "grid" && (
            <div className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/70 p-1" role="group" aria-label={isArabic ? "عدد الأصناف في الصف" : "Items per row"}>
              <span className="px-2 text-[11px] font-medium text-muted">{isArabic ? "أعمدة" : "Columns"}</span>
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={columns === count}
                  onClick={() => setColumns(count)}
                  className={`h-8 min-w-8 rounded-full px-2 text-xs font-bold transition ${columns === count ? "bg-[#2d2018] text-white" : "text-muted hover:bg-white"}`}
                >
                  {count}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
