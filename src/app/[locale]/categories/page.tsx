import Image from "next/image";
import { ArrowUpLeft, ArrowUpRight, Utensils } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { brand } from "@/lib/brand";
import {
  demoCategories,
  demoMenuItems,
  demoRestaurant,
  withCatalogMenuItem,
  withCatalogRestaurant,
} from "@/lib/demo-data";
import { localized } from "@/lib/utils";
import type { Category, MenuItem } from "@/lib/types";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  setRequestLocale(locale);

  let categories: Category[] = demoCategories;
  let items: MenuItem[] = demoMenuItems;
  let restaurant = demoRestaurant;

  try {
    const [liveRestaurant, liveCategories, liveItems] = await Promise.all([
      api.getRestaurant(),
      api.getCategories(),
      api.getMenu(),
    ]);
    restaurant = withCatalogRestaurant(liveRestaurant);
    categories = liveCategories.length ? liveCategories : demoCategories;
    items = liveItems.length ? liveItems.map(withCatalogMenuItem) : demoMenuItems;
  } catch {
    // Keep the categories page useful when the restaurant API is offline.
  }

  const activeCategories = categories
    .filter((category) => category.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => {
      const categoryItems = items.filter((item) =>
        item.category?.slug === category.slug || item.category_id === category.id,
      );
      return {
        category,
        count: category.items_count ?? categoryItems.length,
        image: category.image_url || categoryItems.find((item) => item.image_url)?.image_url || null,
        examples: categoryItems.slice(0, 2),
      };
    });
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const itemCount = activeCategories.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <main className="categories-page mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-10 md:pb-28 md:pt-16" dir={isArabic ? "rtl" : "ltr"}>
      <section className="categories-page-hero relative mb-8 overflow-hidden rounded-[2rem] border border-white/75 px-6 py-9 shadow-[0_20px_70px_rgba(72,47,28,.07)] backdrop-blur-xl sm:px-9 sm:py-11 md:mb-10 md:px-12 md:py-14">
        <div className="relative z-[1] max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.24em] text-accent">
            <Utensils className="h-3.5 w-3.5" />
            {isArabic ? "طازج من مطبخنا" : "FRESH FROM OUR KITCHEN"}
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {isArabic ? "كل الأصناف،" : "Find your next"} <span className="text-accent">{isArabic ? "على ذوقكم." : "favorite."}</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {isArabic
              ? `اكتشفوا ${activeCategories.length} فئة من الشاورما والمشاوي والمقبلات والمزيد.`
              : `Explore ${activeCategories.length} delicious categories, from our signature shawarma to mezze, grills, and something sweet.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/80 bg-white/65 px-4 py-2 text-xs font-bold text-foreground/80 shadow-sm">
              {activeCategories.length} {isArabic ? "فئة" : "categories"}
            </span>
            <span className="rounded-full border border-white/80 bg-white/65 px-4 py-2 text-xs font-bold text-foreground/80 shadow-sm">
              {itemCount} {isArabic ? "صنفاً" : "menu items"}
            </span>
            <Link href="/menu" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white shadow-[0_10px_24px_rgba(198,79,43,.2)] transition hover:-translate-y-0.5 hover:bg-accent-dark">
              {isArabic ? "تصفّح القائمة كاملة" : "Browse full menu"}<Arrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="categories-hero-mark pointer-events-none absolute -bottom-14 end-4 hidden h-64 w-64 items-center justify-center rounded-full border border-accent/10 bg-white/20 md:flex">
          <div className="absolute inset-5 rounded-full border border-accent/10" />
          <div className="relative h-32 w-32 overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-xl">
            <Image src={brand.logo} alt="" fill sizes="128px" className="object-contain" />
          </div>
        </div>
      </section>

      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.22em] text-accent">{isArabic ? "اختاروا مزاجكم" : "PICK YOUR CRAVING"}</p>
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{isArabic ? "تصفّحوا حسب الفئة" : "Browse all categories"}</h2>
        </div>
        <span className="hidden text-xs font-semibold text-muted sm:block">{isArabic ? `${itemCount} صنفاً طازجاً` : `${itemCount} fresh menu items`}</span>
      </div>

      <div className="categories-page-grid grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {activeCategories.map(({ category, count, image, examples }, index) => (
          <Link
            key={category.id}
            href={`/menu?category=${encodeURIComponent(category.slug)}`}
            className="category-page-card group relative isolate flex min-h-48 flex-col justify-end overflow-hidden rounded-[1.4rem] border border-white/75 bg-[#291a12] p-4 text-white shadow-[0_12px_32px_rgba(55,34,18,.1)] sm:min-h-56 sm:p-5 md:min-h-64"
            style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }}
          >
            {image ? (
              <Image src={image} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" loading="lazy" className="category-page-card-image object-cover" />
            ) : (
              <Image src={brand.logo} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" loading="lazy" className="category-page-card-image bg-white object-contain p-10" />
            )}
            <span className="category-page-card-shade absolute inset-0" />
            <span className="absolute start-3 top-3 rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-[10px] font-bold backdrop-blur-lg sm:start-4 sm:top-4">
              {count} {isArabic ? "أصناف" : count === 1 ? "item" : "items"}
            </span>
            <span className="category-page-card-arrow absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-black/20 backdrop-blur-md transition sm:end-4 sm:top-4">
              <Arrow className="h-4 w-4" />
            </span>
            <span className="relative z-[1]">
              <span className="block font-display text-xl leading-tight sm:text-2xl">{localized(category, locale, "name")}</span>
              {localized(category, locale, "description") && (
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-white/75">{localized(category, locale, "description")}</span>
              )}
              {examples.length > 0 && (
                <span className="mt-2 hidden text-[10px] font-medium text-white/65 sm:block">
                  {examples.map((item) => localized(item, locale, "name")).join(" · ")}
                </span>
              )}
              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#ffd59a]">
                {isArabic ? "اكتشفوا الفئة" : "Explore category"}<Arrow className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="font-display text-xl">{isArabic ? `تبحثون عن صنف محدد من ${localized(restaurant, locale, "name")}؟` : `Looking for one specific item from ${localized(restaurant, locale, "name")}?`}</h2>
          <p className="mt-1 text-sm text-muted">{isArabic ? "افتحوا القائمة الكاملة وابحثوا بالاسم أو الوصف." : "Open the full menu and search by name or description."}</p>
        </div>
        <Link href="/menu" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-accent/25 bg-white/70 px-5 py-3 text-sm font-bold text-accent transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white">
          {isArabic ? "الذهاب إلى القائمة" : "Go to menu"}<Arrow className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
