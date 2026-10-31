"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { brand } from "@/lib/brand";
import { formatMoney, localized } from "@/lib/utils";
import { HomeQuickAdd } from "@/components/home-quick-add";

export function MenuCard({
  item,
  currency,
  decimals,
}: {
  item: MenuItem;
  currency: string;
  decimals: number;
}) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const name = localized(item, locale, "name");
  const description = localized(item, locale, "description");

  return (
    <article className="menu-card group relative flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-white/80 bg-white/65 shadow-[0_12px_34px_rgba(66,43,25,.07)] backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_54px_rgba(66,43,25,.13)]">
      <Link href={`/menu/${item.slug}`} aria-label={name} className="menu-card-image-link block">
        <div className="menu-card-image relative aspect-[1.18] overflow-hidden bg-[linear-gradient(135deg,#392419,#a9552c)]">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.07]"
            />
          ) : (
            <Image
              src={brand.logo}
              alt="Classic Shawarma"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="bg-white object-contain p-5"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#25160e]/35 via-transparent to-white/5 opacity-80 transition-opacity group-hover:opacity-55" />
          {item.is_featured && <span className="absolute start-4 top-4 rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-white shadow-sm backdrop-blur-xl">{locale === "ar" ? "من قائمتنا" : "FROM OUR MENU"}</span>}
          {!item.is_available && <span className="absolute end-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-xl">{t("unavailable")}</span>}
        </div>
      </Link>
      <div className="menu-card-body flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/menu/${item.slug}`} className="min-w-0 font-display text-lg leading-snug text-foreground transition-colors hover:text-accent md:text-xl">{name}</Link>
          <p className="menu-card-price shrink-0 rounded-full bg-[#f8e9dd] px-3 py-1.5 text-xs font-bold text-accent">
            {item.price > 0 ? formatMoney(item.price, currency, decimals) : t("priceOnRequest")}
          </p>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted">{description || (locale === "ar" ? "محضّر طازجاً بمكونات مختارة." : "Freshly prepared with carefully chosen ingredients.")}</p>
        <div className="menu-card-actions mt-auto flex items-center justify-between gap-2 border-t border-black/[.06] pt-3">
          <Link href={`/menu/${item.slug}`} className="inline-flex items-center gap-1 text-xs font-bold text-foreground transition-colors hover:text-accent"><span>{locale === "ar" ? "التفاصيل" : "Details"}</span><ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
          <HomeQuickAdd item={item} />
        </div>
      </div>
    </article>
  );
}
