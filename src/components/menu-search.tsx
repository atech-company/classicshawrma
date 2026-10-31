"use client";

import { useRouter } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

export function MenuSearch({
  initialQuery,
  placeholder,
  category,
  filter,
  sort,
  locale,
}: {
  initialQuery: string;
  placeholder: string;
  category: string;
  filter: string;
  sort: string;
  locale: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => setQ(initialQuery), [initialQuery]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (filter && filter !== "all") params.set("filter", filter);
    if (sort && sort !== "recommended") params.set("sort", sort);
    router.push(params.toString() ? `/menu?${params}` : "/menu");
  }

  return (
    <form onSubmit={onSubmit} role="search" className="menu-search-form mt-6 flex w-full items-center gap-2 rounded-full border border-white/80 bg-white/75 py-1.5 ps-4 pe-2 shadow-sm backdrop-blur-xl transition focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10 md:mt-0 md:max-w-sm">
      <Search className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={locale === "ar" ? "ابحث عن طبق أو مكوّن" : "Search dishes and ingredients"}
        className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted/75"
      />
      <button type="submit" className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-white transition hover:bg-accent-dark">{locale === "ar" ? "ابحث" : "Search"}</button>
    </form>
  );
}
