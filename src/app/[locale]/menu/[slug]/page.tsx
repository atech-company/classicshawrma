import { ArrowLeft, ArrowRight, Flame, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { MenuCard } from "@/components/menu-card";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { brand } from "@/lib/brand";
import { demoMenuItems, demoRestaurant, findDemoMenuItem, withCatalogMenuItem, withCatalogRestaurant } from "@/lib/demo-data";
import { formatMoney, localized } from "@/lib/utils";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isArabic = locale === "ar";
  setRequestLocale(locale);
  const t = await getTranslations("item");

  let item = findDemoMenuItem(slug);
  let restaurant = demoRestaurant;
  let catalogItems = demoMenuItems;
  try {
    const [liveItem, liveRestaurant, liveItems] = await Promise.all([
      api.getMenuItem(slug),
      api.getRestaurant(),
      api.getMenu(),
    ]);
    item = liveItem ? withCatalogMenuItem(liveItem) : item;
    restaurant = withCatalogRestaurant(liveRestaurant);
    catalogItems = liveItems.length ? liveItems.map(withCatalogMenuItem) : demoMenuItems;
  } catch {
    // Keep the captured catalog available while the restaurant API is offline.
  }

  if (!item || !restaurant) notFound();

  const categoryName = item.category ? localized(item.category, locale, "name") : null;
  const relatedItems = catalogItems
    .filter((candidate) => candidate.id !== item.id && candidate.is_available)
    .filter((candidate) => item.category
      ? candidate.category?.slug === item.category.slug || candidate.category_id === item.category_id
      : candidate.is_featured)
    .slice(0, 4);
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;
  const address = localized(restaurant, locale, "address");

  return (
    <div className="product-page mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-10 md:pb-28 md:pt-12">
      <nav aria-label={isArabic ? "مسار التصفح" : "Breadcrumbs"} className="product-breadcrumb mb-7 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
        <Link href="/" className="transition-colors hover:text-accent">{isArabic ? "الرئيسية" : "Home"}</Link>
        <span aria-hidden="true">/</span>
        <Link href="/menu" className="transition-colors hover:text-accent">{t("back")}</Link>
        {categoryName && <><span aria-hidden="true">/</span><Link href={`/menu?category=${item.category?.slug}`} className="transition-colors hover:text-accent">{categoryName}</Link></>}
        <span aria-hidden="true">/</span>
        <span className="max-w-52 truncate text-foreground">{localized(item, locale, "name")}</span>
      </nav>

      <section className="product-detail-grid grid items-start gap-7 lg:grid-cols-[1.06fr_.94fr] lg:gap-10" dir={isArabic ? "rtl" : "ltr"}>
        <div className="product-gallery group relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#271a13] shadow-[0_28px_80px_rgba(59,35,18,.18)]">
          <div className="product-image-stage relative aspect-[1.04] min-h-[300px] overflow-hidden sm:aspect-[1.2] lg:aspect-[.94]">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={localized(item, locale, "name")} loading="eager" decoding="async" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.045]" />
            ) : (
              <div className="relative h-full w-full bg-white"><Image src={brand.logo} alt="Classic Shawarma" fill sizes="(max-width: 1024px) 100vw, 55vw" priority className="object-contain p-12" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#21150e]/55 via-transparent to-black/5" />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
              {item.is_featured ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-black/25 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.13em] text-white shadow-lg backdrop-blur-xl"><Sparkles className="h-3 w-3 text-amber-300" />{isArabic ? "اختيارنا" : "HOUSE FAVORITE"}</span> : <span />}
              <span className={`rounded-full border px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] backdrop-blur-xl ${item.is_available ? "border-emerald-200/40 bg-emerald-950/30 text-emerald-50" : "border-white/30 bg-black/45 text-white"}`}>
                <span className={`me-1.5 inline-block h-1.5 w-1.5 rounded-full ${item.is_available ? "bg-emerald-300" : "bg-white/60"}`} />
                {item.is_available ? (isArabic ? "متوفر الآن" : "AVAILABLE NOW") : t("unavailable")}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
              <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ffd18b]">{categoryName || (isArabic ? "من قائمتنا" : "FROM OUR MENU")}</p><p className="mt-1 font-display text-2xl sm:text-3xl">{localized(item, locale, "name")}</p></div>
              <span className="product-image-stamp hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/10 text-white/90 backdrop-blur-lg sm:flex"><Flame className="h-6 w-6" /></span>
            </div>
          </div>
          <div className="product-image-caption flex items-center justify-between gap-3 px-5 py-3.5 text-[11px] font-semibold text-white/70 sm:px-6">
            <span className="inline-flex items-center gap-2"><Flame className="h-3.5 w-3.5 text-[#ffb45f]" />{isArabic ? "طازج من مطبخنا" : "Fresh from our kitchen"}</span>
            <span>{isArabic ? "كلاسيك شاورما · لبنان" : "Classic Shawarma · Lebanon"}</span>
          </div>
        </div>

        <div className="product-buy-panel rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_22px_70px_rgba(62,40,22,.085)] backdrop-blur-2xl sm:p-8 lg:p-9">
          <Link href="/menu" className="product-back-link inline-flex items-center gap-2 rounded-full border border-black/[.06] bg-white/70 px-3.5 py-2 text-xs font-bold text-muted transition hover:border-accent/25 hover:bg-white hover:text-accent"><BackArrow className="h-3.5 w-3.5" />{isArabic ? "تابع التصفح" : "Continue browsing"}</Link>
          {categoryName && <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[.22em] text-accent">{categoryName}</p>}
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-.035em] text-foreground sm:text-4xl lg:text-[2.8rem]">{localized(item, locale, "name")}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="product-price-chip rounded-full bg-[#f8e9dd] px-4 py-2 text-lg font-extrabold text-accent">{item.price > 0 ? formatMoney(item.price, restaurant.currency, restaurant.currency_decimals) : t("priceOnRequest")}</p>
            <span className="text-xs font-semibold text-muted">{isArabic ? "السعر يتحدث مع خياراتك" : "Price updates with your selections"}</span>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted sm:text-base">{localized(item, locale, "description") || (isArabic ? "اختيار شهيّ من قائمتنا. أضف لمستك الخاصة من الخيارات المتاحة." : "A delicious pick from our menu. Make it your own with the options below.")}</p>

          <div className="product-assurances my-6 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/90 bg-white/65 p-3"><span className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff0e1] text-accent"><Flame className="h-4 w-4" /></span><span className="block text-xs font-bold">{isArabic ? "تحضير طازج" : "Made to order"}</span><span className="mt-1 block text-[10px] text-muted">{isArabic ? "يُحضّر عند الطلب" : "Prepared when you order"}</span></div>
            <div className="rounded-2xl border border-white/90 bg-white/65 p-3"><span className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff0e1] text-accent"><ShieldCheck className="h-4 w-4" /></span><span className="block text-xs font-bold">{isArabic ? "اختياراتك" : "Your way"}</span><span className="mt-1 block text-[10px] text-muted">{isArabic ? "عدّل حسب رغبتك" : "Customize your order"}</span></div>
          </div>

          {item.price > 0 ? <AddToCartForm item={item} restaurant={restaurant} /> : restaurant.phone ? <a href={`tel:${restaurant.phone}`} dir="ltr" className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-accent-dark">{t("priceOnRequest")} · {restaurant.phone}</a> : null}

          {address && <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="product-location-link mt-5 flex items-start gap-2 border-t border-black/[.06] pt-4 text-xs leading-5 text-muted transition hover:text-accent"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{isArabic ? "زورونا في" : "Find us at"} · {address}</span></a>}
        </div>
      </section>

      {relatedItems.length > 0 && (
        <section className="product-related mt-20 md:mt-28">
          <div className="mb-7 flex items-end justify-between gap-4" dir={isArabic ? "rtl" : "ltr"}>
            <div><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.22em] text-accent">{isArabic ? "قد يعجبكم أيضاً" : "ROUND OUT YOUR ORDER"}</p><h2 className="font-display text-3xl tracking-tight sm:text-4xl">{isArabic ? "أصناف مشابهة" : "More to love."}</h2></div>
            {item.category && <Link href={`/menu?category=${item.category.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-accent/20 bg-white/70 px-4 py-2.5 text-xs font-bold text-accent transition hover:-translate-y-0.5 hover:bg-white">{isArabic ? "كل الفئة" : "See category"}<ArrowRight className="h-3.5 w-3.5" /></Link>}
          </div>
          <div className="menu-display-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedItems.map((relatedItem) => <MenuCard key={relatedItem.id} item={relatedItem} currency={restaurant.currency} decimals={restaurant.currency_decimals} />)}
          </div>
        </section>
      )}
    </div>
  );
}
