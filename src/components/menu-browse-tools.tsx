"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { ArrowDownWideNarrow, Check, SlidersHorizontal } from "lucide-react";

type CategoryOption = { slug: string; label: string; count: number };
type MenuFilter = "all" | "available" | "featured";
type MenuSort = "recommended" | "price-low" | "price-high" | "name";

export function MenuBrowseTools({
  locale,
  query,
  category,
  filter,
  sort,
  categories,
  resultCount,
  availableCount,
  featuredCount,
}: {
  locale: string;
  query: string;
  category: string;
  filter: MenuFilter;
  sort: MenuSort;
  categories: CategoryOption[];
  resultCount: number;
  availableCount: number;
  featuredCount: number;
}) {
  const isArabic = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();

  function navigate(next: { category?: string; filter?: MenuFilter; sort?: MenuSort }) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const nextCategory = next.category ?? category;
    const nextFilter = next.filter ?? filter;
    const nextSort = next.sort ?? sort;
    if (nextCategory) params.set("category", nextCategory);
    if (nextFilter !== "all") params.set("filter", nextFilter);
    if (nextSort !== "recommended") params.set("sort", nextSort);
    const suffix = params.toString();
    router.push(suffix ? `${pathname}?${suffix}` : pathname);
  }

  const filterOptions: { value: MenuFilter; label: string; shortLabel: string; count: number }[] = [
    { value: "all", label: isArabic ? "كل الأصناف" : "All items", shortLabel: isArabic ? "الكل" : "All", count: resultCount },
    { value: "available", label: isArabic ? "متوفر الآن" : "Available now", shortLabel: isArabic ? "متوفر" : "Available", count: availableCount },
    { value: "featured", label: isArabic ? "اختياراتنا" : "House favorites", shortLabel: isArabic ? "مختارة" : "Favorites", count: featuredCount },
  ];

  return (
    <section className="menu-browse-tools mb-5 rounded-2xl border border-white/75 bg-white/50 p-3 shadow-sm backdrop-blur-xl sm:p-4" aria-label={isArabic ? "تصفية وترتيب القائمة" : "Filter and sort the menu"}>
      <nav aria-label={isArabic ? "تصفّح حسب الفئة" : "Browse by category"} className="category-filter-rail -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-2">
        <button
          type="button"
          onClick={() => navigate({ category: "" })}
          aria-current={!category ? "page" : undefined}
          className={`menu-filter-chip shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${!category ? "is-active" : ""}`}
        >
          {isArabic ? "الكل" : "All"}
        </button>
        {categories.map((item) => (
          <button
            type="button"
            key={item.slug}
            onClick={() => navigate({ category: item.slug })}
            aria-current={category === item.slug ? "page" : undefined}
            className={`menu-filter-chip shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${category === item.slug ? "is-active" : ""}`}
          >
            {item.label}<span className="ms-1.5 opacity-60">{item.count}</span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-3 border-t border-[#6f4c32]/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-muted">
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span>{isArabic ? "اعثروا على ما تحبون" : "Find your kind of good"}</span>
          <span className="hidden text-muted/60 sm:inline">·</span>
          <span className="hidden sm:inline">{isArabic ? `${resultCount} نتيجة` : `${resultCount} results`}</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex max-w-full flex-nowrap gap-1 rounded-full border border-black/5 bg-white/65 p-1" role="group" aria-label={isArabic ? "تصفية الأصناف" : "Filter items"}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => navigate({ filter: option.value })}
                aria-pressed={filter === option.value}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-2 text-[10px] font-semibold whitespace-nowrap transition sm:gap-1.5 sm:px-3 sm:text-[11px] ${filter === option.value ? "bg-[#2d2018] text-white shadow-sm" : "text-muted hover:bg-white"}`}
              >
                {filter === option.value && <Check className="h-3 w-3" />}
                <span className="sm:hidden">{option.shortLabel}</span><span className="hidden sm:inline">{option.label}</span><span className="opacity-60">{option.count}</span>
              </button>
            ))}
          </div>

          <label className="flex shrink-0 items-center gap-2 rounded-full border border-black/5 bg-white/65 px-3 py-1.5 text-[11px] font-semibold text-muted">
            <ArrowDownWideNarrow className="h-3.5 w-3.5 text-accent" />
            <span>{isArabic ? "ترتيب" : "Sort"}</span>
            <select
              value={sort}
              onChange={(event) => navigate({ sort: event.target.value as MenuSort })}
              aria-label={isArabic ? "ترتيب القائمة" : "Sort menu items"}
              className="max-w-32 cursor-pointer bg-transparent py-1 text-xs font-bold text-foreground outline-none"
            >
              <option value="recommended">{isArabic ? "الموصى بها" : "Recommended"}</option>
              <option value="price-low">{isArabic ? "السعر: من الأقل" : "Price: low to high"}</option>
              <option value="price-high">{isArabic ? "السعر: من الأعلى" : "Price: high to low"}</option>
              <option value="name">{isArabic ? "الاسم" : "Name"}</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
