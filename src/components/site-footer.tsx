"use client";

import { useTranslations } from "next-intl";
import { Instagram } from "lucide-react";
import type { Restaurant } from "@/lib/types";
import { localized } from "@/lib/utils";
import { brand } from "@/lib/brand";

export function SiteFooter({
  restaurant,
  locale,
}: {
  restaurant: Restaurant | null;
  locale: string;
}) {
  const t = useTranslations("footer");
  const name = restaurant
    ? localized(restaurant, locale, "name")
    : "Classic Shawarma";

  return (
    <footer className="relative mt-8 overflow-hidden border-t border-white/10 bg-[#241912] text-[#f6f1e9]">
      <div className="pointer-events-none absolute -end-20 -top-28 h-72 w-72 rounded-full bg-[#d16e37]/20 blur-[100px]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10 md:py-14">
        <div>
          <p className="flex items-center gap-3 font-display text-2xl">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logo} alt="" className="h-full w-full object-contain" />
            </span>{name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">{brand.tagline}</p>
          {restaurant?.facebook_url && (
            <a
              href={restaurant.facebook_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-white/70 underline-offset-4 hover:text-accent hover:underline"
            >
              Facebook
            </a>
          )}
          {restaurant?.instagram_url && <a href={restaurant.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="mt-3 inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-[#ffae76]"><Instagram className="h-4 w-4" />Instagram</a>}
        </div>
        <div className="text-sm text-white/70">
          {restaurant?.phone && <a className="block transition hover:text-white" href={`tel:${restaurant.phone}`} dir="ltr">{restaurant.phone}</a>}
          {restaurant?.phone_secondary && <a className="mt-1 block transition hover:text-white" href={`tel:${restaurant.phone_secondary}`} dir="ltr">{restaurant.phone_secondary}</a>}
          <p className="mt-5 text-xs text-white/40">
            © {new Date().getFullYear()} {name}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
