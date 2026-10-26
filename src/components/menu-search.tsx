"use client";

import { useRouter } from "@/i18n/navigation";
import { FormEvent, useState } from "react";

export function MenuSearch({
  initialQuery,
  placeholder,
}: {
  initialQuery: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(params.toString() ? `/menu?${params}` : "/menu");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 w-full md:mt-0 md:max-w-sm">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/80 bg-white/70 px-5 py-3 text-sm shadow-sm outline-none backdrop-blur-xl transition placeholder:text-muted/75 focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
      />
    </form>
  );
}
