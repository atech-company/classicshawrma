"use client";

import { Check, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import type { MenuItem } from "@/lib/types";

export function HomeQuickAdd({ item }: { item: MenuItem }) {
  const t = useTranslations("item");
  const locale = useLocale();
  const addItem = useCart((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
  }, []);

  if (!item.is_available || item.price <= 0) {
    return null;
  }

  if (item.variants?.length || item.modifier_groups?.length) {
    return <Link href={`/menu/${item.slug}`} className="mt-2 inline-flex items-center rounded-full border border-accent/20 bg-accent/[.06] px-3 py-1.5 text-[11px] font-bold text-accent transition hover:border-accent hover:bg-accent hover:text-white">{t("customize")}</Link>;
  }

  function addToCart() {
    addItem({
      menu_item_id: item.id,
      slug: item.slug,
      name_en: item.name_en,
      name_ar: item.name_ar,
      image_url: item.image_url,
      unit_price: item.price,
      quantity: 1,
      modifier_option_ids: [],
      modifier_labels_en: [],
      modifier_labels_ar: [],
    });
    setAdded(true);
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      aria-label={added ? t("added") : `${t("quickAdd")} ${locale === "ar" ? item.name_ar : item.name_en}`}
      className="mt-2 inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/[.06] px-3 py-1.5 text-[11px] font-bold text-accent transition hover:border-accent hover:bg-accent hover:text-white active:scale-95"
    >
      {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {added ? t("added") : t("quickAdd")}
    </button>
  );
}
