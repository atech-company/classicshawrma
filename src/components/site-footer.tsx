"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, Facebook, Instagram, MapPin, PhoneCall } from "lucide-react";
import { Link } from "@/i18n/navigation";
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
  const isArabic = locale === "ar";
  const address = restaurant ? localized(restaurant, locale, "address") : null;

  return (
    <footer className="site-footer relative mt-8 overflow-hidden border-t border-white/10 bg-[#241912] text-[#f6f1e9]">
      <div className="footer-glow pointer-events-none absolute -end-20 -top-28 h-72 w-72 rounded-full bg-[#d16e37]/20 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        <div className="footer-grid grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_1fr_.8fr] lg:gap-12">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3 font-display text-2xl text-white">
              <span className="footer-brand-mark flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg transition group-hover:-rotate-3 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brand.logo} alt="" className="h-full w-full object-contain" />
              </span>{name}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">{brand.tagline}</p>
            <Link href="/menu" className="footer-order-link mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-accent-dark">{isArabic ? "اطلبوا الآن" : "Order something good"}<ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>

          <div>
            <h2 className="footer-heading">{isArabic ? "استكشف" : "Explore"}</h2>
            <nav className="mt-4 grid gap-3 text-sm" aria-label={isArabic ? "روابط الموقع" : "Site links"}>
              <Link href="/" className="footer-link">{isArabic ? "الرئيسية" : "Home"}</Link>
              <Link href="/menu" className="footer-link">{isArabic ? "القائمة" : "Full menu"}</Link>
              <Link href="/categories" className="footer-link">{isArabic ? "فئات القائمة" : "Browse categories"}</Link>
              <Link href="/cart" className="footer-link">{isArabic ? "سلة الطلب" : "Your cart"}</Link>
            </nav>
          </div>

          <div>
            <h2 className="footer-heading">{isArabic ? "زورونا" : "Find us"}</h2>
            <div className="mt-4 grid gap-3 text-sm text-white/65">
              {address && <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="footer-link flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#f39a5d]" /><span>{address}</span></a>}
              {restaurant?.phone && <a className="footer-link inline-flex items-center gap-2.5" href={`tel:${restaurant.phone}`} dir="ltr"><PhoneCall className="h-4 w-4 text-[#f39a5d]" />{restaurant.phone}</a>}
              {restaurant?.phone_secondary && <a className="footer-link inline-flex items-center gap-2.5" href={`tel:${restaurant.phone_secondary}`} dir="ltr"><PhoneCall className="h-4 w-4 text-[#f39a5d]" />{restaurant.phone_secondary}</a>}
              {!address && !restaurant?.phone && <p className="text-white/45">{isArabic ? "تفاصيل التواصل قريباً." : "Contact details coming soon."}</p>}
            </div>
          </div>

          <div>
            <h2 className="footer-heading">{isArabic ? "تابعونا" : "Follow along"}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {restaurant?.facebook_url && <a href={restaurant.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" className="footer-social-link"><Facebook className="h-4 w-4" /><span>Facebook</span></a>}
              {restaurant?.instagram_url && <a href={restaurant.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="footer-social-link"><Instagram className="h-4 w-4" /><span>Instagram</span></a>}
              {!restaurant?.facebook_url && !restaurant?.instagram_url && <a href={brand.facebook} target="_blank" rel="noreferrer" className="footer-social-link"><Facebook className="h-4 w-4" /><span>Facebook</span></a>}
            </div>
          </div>
        </div>

        <div className="footer-bottom mt-11 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {name}. {t("rights")}</p>
          <p>{isArabic ? "لبنان · نكهة بيروت" : "Made with a little Beirut fire."}</p>
        </div>
      </div>
    </footer>
  );
}
