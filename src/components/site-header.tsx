"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ArrowUpRight, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const other = locale === "ar" ? "en" : "ar";

  const linkClass = (href: string) =>
    cn(
      "text-sm tracking-wide transition-colors hover:text-accent",
      (href === "/menu" ? pathname.startsWith("/menu") : pathname === href)
        ? "text-accent"
        : "text-foreground/80"
    );

  return (
    <header className="site-header sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="header-inner mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[1.4rem] border border-white/75 bg-[#fffdf9]/75 px-3 py-2.5 shadow-[0_8px_30px_rgba(63,43,27,.07)] backdrop-blur-2xl sm:gap-4 sm:px-4 md:px-6">
        <Link href="/" className="header-brand group flex min-w-0 shrink-0 items-center gap-2.5 font-display text-base tracking-tight text-foreground md:text-lg">
          <span className="brand-mark relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#c64f2b]/15 bg-white shadow-[0_7px_18px_rgba(198,79,43,.14)] transition group-hover:-rotate-3 group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logo} alt="" className="h-full w-full object-contain" />
            <span className="brand-mark-sparkle pointer-events-none absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white"><Sparkles className="h-2.5 w-2.5" /></span>
          </span>
          <span className="min-w-0 leading-tight">Classic <span className="text-accent">Shawarma</span><span className="header-brand-caption mt-0.5 block font-sans text-[9px] font-bold uppercase tracking-[.17em] text-muted">{locale === "ar" ? "مشاوي على أصولها" : "Beirut grill house"}</span></span>
        </Link>
        <nav className="header-nav flex items-center gap-1 sm:gap-2 md:gap-3">
          <Link href="/" className={cn("header-nav-link", linkClass("/"))}>
            {t("home")}
          </Link>
          <Link href="/menu" className={cn("header-nav-link", linkClass("/menu"))}>
            {t("menu")}
          </Link>
          <Link href="/categories" className={cn("header-nav-link header-categories-link hidden lg:inline-flex", linkClass("/categories"))}>
            {locale === "ar" ? "الأصناف" : "Categories"}
          </Link>
          <Link href="/cart" aria-label={t("cart")} className={cn("header-cart-link", linkClass("/cart"), "relative inline-flex items-center gap-1.5")}>
            <ShoppingBag className="h-[18px] w-[18px]" />
            <span className="hidden md:inline">{t("cart")}</span>
            {count > 0 && (
              <span className="header-cart-count absolute -end-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white shadow-sm">
                {count}
              </span>
            )}
          </Link>
          <Link href="/menu" className="header-order-cta hidden items-center gap-1.5 rounded-full bg-[#c64f2b] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_22px_rgba(198,79,43,.23)] transition hover:-translate-y-0.5 hover:bg-[#a83b20] lg:inline-flex">
            {t("orderNow")}<ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={pathname || "/"}
            locale={other}
            aria-label={t("language")}
            title={t("language")}
            className="header-language rounded-full border border-border/80 bg-white/60 px-3 py-2 text-[11px] font-bold text-muted transition hover:border-accent hover:text-accent"
          >
            <span className="header-language-full">{t("language")}</span>
            <span className="header-language-short" aria-hidden="true">{locale === "ar" ? "EN" : "AR"}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
