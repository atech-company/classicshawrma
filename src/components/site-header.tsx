"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ShoppingBag } from "lucide-react";
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
      pathname === href ? "text-accent" : "text-foreground/80"
    );

  return (
    <header className="site-header sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border border-white/75 bg-[#fffdf9]/75 px-4 py-3 shadow-[0_8px_30px_rgba(63,43,27,.07)] backdrop-blur-2xl md:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 font-display text-base tracking-tight text-foreground md:text-lg">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-[0_6px_16px_rgba(224,103,42,.16)] transition group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logo} alt="" className="h-full w-full object-contain" />
          </span>
          <span>Classic <span className="text-accent">Shawarma</span></span>
        </Link>
        <nav className="flex items-center gap-3 md:gap-7">
          <Link href="/" className={linkClass("/")}>
            {t("home")}
          </Link>
          <Link href="/menu" className={linkClass("/menu")}>
            {t("menu")}
          </Link>
          <Link href="/cart" aria-label={t("cart")} className={cn(linkClass("/cart"), "relative inline-flex items-center gap-1.5")}>
            <ShoppingBag className="h-4 w-4 md:hidden" />
            <span className="hidden md:inline">{t("cart")}</span>
            {count > 0 && (
              <span className="absolute -end-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white shadow-sm">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={pathname || "/"}
            locale={other}
            className="rounded-full border border-border/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
          >
            {t("language")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
