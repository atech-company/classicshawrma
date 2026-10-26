import { ArrowDown, ArrowUpLeft, ArrowUpRight, MapPin, PhoneCall, Search, Sparkles, Utensils } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { HomeQuickAdd } from "@/components/home-quick-add";
import { MenuDisplayControls } from "@/components/menu-display-controls";
import { brand } from "@/lib/brand";
import { api } from "@/lib/api";
import { demoBrand, demoCategories, demoMenuItems, demoRestaurant, withCatalogMenuItem, withCatalogRestaurant } from "@/lib/demo-data";
import { formatMoney, localized } from "@/lib/utils";
import type { Category, MenuItem } from "@/lib/types";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const isArabic = locale === "ar";
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tn = await getTranslations("nav");
  const tm = await getTranslations("menu");

  let restaurant = demoRestaurant;
  let categories = demoCategories;
  let menuItems = demoMenuItems;

  try {
    const [liveRestaurant, liveCategories, liveItems] = await Promise.all([
      api.getRestaurant(),
      api.getCategories(),
      api.getMenu(),
    ]);
    restaurant = withCatalogRestaurant(liveRestaurant);
    categories = liveCategories.length ? liveCategories : demoCategories;
    menuItems = liveItems.length ? liveItems.map(withCatalogMenuItem) : demoMenuItems;
  } catch {
    // The captured catalog keeps the homepage useful while the API is offline.
  }

  const intro = localized(restaurant, locale, "intro") || t("subtitle");
  const address = localized(restaurant, locale, "address");
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const featuredDish = menuItems.find((item) => item.image_url) ?? demoMenuItems[0];
  const heroSlides = menuItems.filter((item) => item.image_url).slice(0, 6).map((item) => ({
    src: item.image_url!,
    alt: localized(item, locale, "name"),
  }));
  const searchTerm = query.toLocaleLowerCase(locale);
  const filteredItems = query
    ? menuItems.filter((item) => {
      const category = item.category ?? categories.find((entry) => entry.id === item.category_id);
      const haystack = [item.name_en, item.name_ar, item.description_en, item.description_ar, category?.name_en, category?.name_ar]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(locale);
      return haystack.includes(searchTerm);
    })
    : menuItems;
  const menuGroups: { category: Category; items: MenuItem[] }[] = categories.map((category) => ({
    category,
    items: filteredItems.filter((item) => item.category
      ? item.category.slug === category.slug
      : item.category_id === category.id),
  })).filter((group) => !query || group.items.length > 0);

  return (
    <div className="overflow-hidden">
      <section className="hero-stage relative isolate overflow-hidden">
        <div className="hero-photo absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${restaurant.hero_image_url || demoRestaurant.hero_image_url}")` }} />
        <HeroSlideshow images={heroSlides} label={isArabic ? "صور من قائمة المطعم" : "Classic Shawarma food photos"} />
        <div className="hero-wash absolute inset-0" />
        <div className="hero-grain absolute inset-0" />
        <div className="pointer-events-none absolute -end-28 top-32 h-80 w-80 rounded-full bg-orange-400/20 blur-[110px]" />

        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 pb-16 pt-28 text-white md:px-10 lg:min-h-[680px] lg:grid-cols-[1fr_.8fr]">
          <div className="relative z-10 max-w-2xl" dir={isArabic ? "rtl" : "ltr"}>
            <div className="glass-pill mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white/90 animate-[fadeUp_0.7s_ease_both]">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{demoBrand.tagline}</span>
              <span className="mx-1 h-1 w-1 rounded-full bg-white/50" />
              <span>{isArabic ? "الحازمية، لبنان" : "Hazmieh, Lebanon"}</span>
            </div>
            <h1 className="max-w-2xl font-display text-5xl leading-[1.05] tracking-[-0.045em] drop-shadow-lg animate-[fadeUp_0.8s_ease_both] md:text-7xl lg:text-[82px]">
              {isArabic ? <>شاورما <span className="text-[#ffd59a]">على أصولها.</span></> : <>A little Beirut<br /><span className="text-[#ffd59a]">in every bite.</span></>}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/80 animate-[fadeUp_1s_ease_both] md:text-lg">{intro}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3 animate-[fadeUp_1.1s_ease_both]">
              <a href="#menu-catalog" className="cta-glow group inline-flex items-center gap-3 rounded-full bg-[#c45d3a] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_36px_rgba(196,93,58,.32)] transition hover:-translate-y-0.5 hover:bg-[#a9472c]">
                {isArabic ? "تصفّح القائمة" : "Explore the menu"}<Arrow className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              {restaurant.phone && <a href={`tel:${restaurant.phone}`} dir="ltr" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.08] px-5 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:bg-white/[0.15]"><PhoneCall className="h-4 w-4" />{isArabic ? "اتصل للطلب" : "Call to order"}</a>}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/75">
              <span className="flex items-center gap-2"><Utensils className="h-3.5 w-3.5 text-amber-300" />{isArabic ? `${categories.length} فئة` : `${categories.length} categories`}</span>
              <span className="hidden h-4 w-px bg-white/25 sm:block" />
              <span>{isArabic ? `${menuItems.length} صنفاً · الأسعار بالليرة اللبنانية` : `${menuItems.length} menu items · prices in LBP`}</span>
            </div>
          </div>

          <Link href={`/menu/${featuredDish.slug}`} className="hero-side-card group relative mx-auto block w-full max-w-[390px] animate-[floatIn_1.2s_cubic-bezier(.2,.75,.25,1)_both] lg:ms-auto lg:me-3">
            <div className="relative aspect-[.88] overflow-hidden rounded-[2rem] border border-white/30 shadow-[0_30px_100px_rgba(0,0,0,.45)]">
              {featuredDish.image_url && <Image src={featuredDish.image_url} alt={localized(featuredDish, locale, "name")} fill sizes="(max-width: 1024px) 90vw, 390px" className="object-cover transition duration-700 group-hover:scale-[1.04]" priority />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/10" />
              <div className="absolute start-5 top-5 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-white backdrop-blur-xl">{isArabic ? "من قائمتنا" : "A taste of our menu"}</div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7" dir={isArabic ? "rtl" : "ltr"}>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#ffd59a]">{localized(featuredDish.category ?? demoCategories[0], locale, "name")}</p>
                <h2 className="mt-2 font-display text-2xl leading-tight md:text-3xl">{localized(featuredDish, locale, "name")}</h2>
                {featuredDish.price > 0 && <p className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-bold backdrop-blur-xl">{formatMoney(featuredDish.price, restaurant.currency, restaurant.currency_decimals)}</p>}
              </div>
            </div>
            <span className="glass-float absolute -bottom-4 -start-4 rounded-2xl px-4 py-3 text-xs font-semibold text-white shadow-2xl md:-start-8">{isArabic ? "طازج وشهيّ دائماً" : "Always Classic, Always Yummy"}</span>
          </Link>
        </div>
        <a href="#menu-catalog" className="absolute bottom-5 start-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[.28em] text-white/55 transition hover:text-white md:flex"><span>{isArabic ? "اكتشف القائمة" : "DISCOVER THE MENU"}</span><ArrowDown className="h-3.5 w-3.5" /></a>
      </section>

      <section id="menu-catalog" className="mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end" dir={isArabic ? "rtl" : "ltr"}>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">{isArabic ? "اختاروا على ذوقكم" : "MADE FOR YOUR APPETITE"}</p>
            <h2 className="font-display text-4xl tracking-tight md:text-5xl">{t("categories")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">{isArabic ? "من أول لقمة لآخر رشفة، كل قائمتنا بمكان واحد." : "From the first bite to the last sip, discover the whole menu in one place."}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto" dir={isArabic ? "rtl" : "ltr"}>
            <form method="get" action="" role="search" className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input name="q" defaultValue={query} placeholder={isArabic ? "ابحث في القائمة..." : "Search the full menu..."} aria-label={isArabic ? "ابحث في القائمة" : "Search the menu"} className="w-full rounded-full border border-white/80 bg-white/70 py-3 ps-11 pe-5 text-sm shadow-sm outline-none backdrop-blur-xl transition placeholder:text-muted/75 focus:border-accent/50 focus:ring-4 focus:ring-accent/10" />
            </form>
            {query ? <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-white/60 px-5 py-3 text-sm font-semibold text-accent shadow-sm backdrop-blur transition hover:border-accent hover:bg-accent hover:text-white">{isArabic ? "مسح البحث" : "Clear search"}</Link> : <Link href="/menu" className="group inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-white/60 px-5 py-3 text-sm font-semibold text-accent shadow-sm backdrop-blur transition hover:border-accent hover:bg-accent hover:text-white">{tn("menu")}<Arrow className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>}
          </div>
        </div>

        <MenuDisplayControls locale={locale}>
        {!query && <nav aria-label={isArabic ? "فئات القائمة" : "Menu categories"} className="menu-category-rail sticky top-[76px] z-20 -mx-5 mb-12 flex gap-2 overflow-x-auto border-y border-white/60 bg-[#f6f1e9]/90 px-5 py-3 backdrop-blur-xl md:top-24 md:mx-0 md:rounded-2xl md:border md:px-4">
          {menuGroups.map(({ category, items }) => (
            <a key={category.id} href={`#category-${category.slug}`} className="shrink-0 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent">
              {localized(category, locale, "name")}<span className="ms-2 text-xs text-muted">{items.length}</span>
            </a>
          ))}
        </nav>}

        {query && <p className="mb-8 text-sm text-muted" dir={isArabic ? "rtl" : "ltr"}>{isArabic ? `نتائج البحث عن «${query}» · ${filteredItems.length} صنف` : `Results for “${query}” · ${filteredItems.length} items`}</p>}

        {menuGroups.length === 0 ? <div className="rounded-3xl border border-white/70 bg-white/45 p-12 text-center text-muted backdrop-blur-xl">{query ? tm("searchEmpty") : tm("empty")}</div> : <div className="space-y-14">
          {menuGroups.map(({ category, items }) => (
            <section key={category.id} id={`category-${category.slug}`} className="scroll-mt-40">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#6f4c32]/10 pb-4" dir={isArabic ? "rtl" : "ltr"}>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-accent">{isArabic ? "من قائمتنا" : "FROM OUR MENU"}</p>
                  <h3 className="font-display text-2xl md:text-3xl">{localized(category, locale, "name")}</h3>
                </div>
                <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-muted">{items.length} {isArabic ? "أصناف" : "items"}</span>
              </div>

              {items.length ? (
                <div className="menu-display-grid grid gap-3 md:gap-4">
                  {items.map((item) => (
                    <article key={item.id} className="home-menu-card group flex min-h-[126px] items-center gap-4 rounded-2xl border border-white/75 bg-white/55 p-3 shadow-[0_10px_28px_rgba(66,43,25,.045)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/85 hover:shadow-[0_18px_40px_rgba(66,43,25,.09)] sm:gap-5 sm:p-4" dir={isArabic ? "rtl" : "ltr"}>
                      <Link href={`/menu/${item.slug}`} aria-label={localized(item, locale, "name")} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#392419,#a9552c)] sm:h-28 sm:w-28">
                        {item.image_url ? <Image src={item.image_url} alt={localized(item, locale, "name")} fill sizes="112px" loading="lazy" className="object-cover transition duration-500 group-hover:scale-105" /> : <Image src={brand.logo} alt="Classic Shawarma" fill sizes="112px" loading="lazy" className="bg-white object-contain p-1" />}
                      </Link>
                      <div className="min-w-0 flex-1 py-1">
                        <Link href={`/menu/${item.slug}`} className="block">
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <h4 className="font-display text-lg leading-snug text-foreground sm:text-xl">{localized(item, locale, "name")}</h4>
                            <span className="shrink-0 rounded-full bg-[#f8e9dd] px-3 py-1.5 text-xs font-bold text-accent">{item.price > 0 ? formatMoney(item.price, restaurant.currency, restaurant.currency_decimals) : (isArabic ? "السعر عند الطلب" : "Price on request")}</span>
                          </div>
                          {(localized(item, locale, "description") || !item.is_available) && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{!item.is_available ? (isArabic ? "غير متاح حالياً" : "Currently unavailable") : localized(item, locale, "description")}</p>}
                        </Link>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Link href={`/menu/${item.slug}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">{isArabic ? "التفاصيل" : "Details"}<Arrow className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
                          <HomeQuickAdd item={item} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-white/70 bg-white/40 p-5 text-sm text-muted">{isArabic ? "لا توجد أصناف متاحة حالياً." : "No items are available in this category right now."}</p>
              )}
            </section>
          ))}
        </div>}
        </MenuDisplayControls>
      </section>

      <section className="relative px-5 pb-24 md:px-10 md:pb-28">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1.05fr_.95fr]" dir={isArabic ? "rtl" : "ltr"}>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#281a12] p-8 text-white shadow-[0_24px_90px_rgba(45,28,16,.17)] md:p-11">
            <div className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full bg-[#d16e37]/25 blur-[80px]" />
            <p className="relative mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#ffd59a]">{isArabic ? "نحن هنا" : "COME FIND US"}</p>
            <h2 className="relative font-display text-3xl md:text-4xl">{t("contact")}</h2>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="relative mt-5 flex items-start gap-3 text-sm leading-6 text-white/70 transition hover:text-white"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[#ffd59a]" /><span>{address}</span></a>
            {restaurant.phone && <a href={`tel:${restaurant.phone}`} dir="ltr" className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"><PhoneCall className="h-4 w-4 text-[#ffd59a]" />{restaurant.phone}</a>}
          </div>
          <div className="glass-panel flex flex-col justify-between rounded-[2rem] p-8 md:p-11">
            <div><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">{isArabic ? "على كيفك" : "YOUR NEXT BITE"}</p><h2 className="font-display text-3xl md:text-4xl">{isArabic ? "جاهز تطلب؟" : "Ready when you are."}</h2><p className="mt-4 max-w-md text-sm leading-7 text-muted">{intro}</p></div>
            <Link href="/menu" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_36px_rgba(196,93,58,.23)] transition hover:-translate-y-0.5 hover:bg-accent-dark">{tn("orderNow")}<Arrow className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
