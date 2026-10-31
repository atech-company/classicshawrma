"use client";

import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/utils";

export function MobileCartBar({ locale }: { locale: string }) {
  const t = useTranslations("cart");
  const pathname = usePathname();
  const count = useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const subtotal = useCart((state) => state.items.reduce((total, item) => total + item.unit_price * item.quantity, 0));

  if (count === 0 || pathname === "/cart" || pathname === "/checkout" || pathname.startsWith("/order/")) {
    return null;
  }

  const countLabel = count === 1 ? t("oneItemInCart") : t("itemsInCart", { count });
  const subtotalLabel = formatMoney(subtotal, "LBP", 0);

  return (
    <Link
      href="/cart"
      className="mobile-cart-bar"
      dir={locale === "ar" ? "rtl" : "ltr"}
      aria-label={`${t("viewCart")}: ${countLabel}, ${subtotalLabel}`}
    >
      <span className="mobile-cart-icon" aria-hidden="true">
        <ShoppingBag className="h-5 w-5" />
        <span>{count}</span>
      </span>
      <span className="mobile-cart-summary">
        <span className="mobile-cart-count-label">{countLabel}</span>
        <span className="mobile-cart-subtotal" dir="ltr">{subtotalLabel}</span>
      </span>
      <span className="mobile-cart-action">
        {t("viewCart")}
        <ArrowUpRight aria-hidden="true" className="h-4 w-4 rtl:-scale-x-100" />
      </span>
    </Link>
  );
}
