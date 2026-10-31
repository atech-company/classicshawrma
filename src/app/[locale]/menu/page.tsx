import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MenuSearch } from "@/components/menu-search";
import { MenuBrowseTools } from "@/components/menu-browse-tools";
import { MenuResults } from "@/components/menu-results";
import { MenuDisplayControls } from "@/components/menu-display-controls";
import { api } from "@/lib/api";
import { demoCategories, demoMenuItems, demoRestaurant, withCatalogMenuItem, withCatalogRestaurant } from "@/lib/demo-data";
import { localized } from "@/lib/utils";

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; filter?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const { q, category, filter: rawFilter, sort: rawSort } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("menu");
  const filter = rawFilter === "available" || rawFilter === "featured" ? rawFilter : "all";
  const sort = rawSort === "price-low" || rawSort === "price-high" || rawSort === "name" ? rawSort : "recommended";

  let restaurant = demoRestaurant;
  let categories = demoCategories;
  let items = demoMenuItems;
  let usingDemoItems = true;

  try {
    const [liveRestaurant, liveCategories, liveItems] = await Promise.all([
      api.getRestaurant(),
      api.getCategories(),
      api.getMenu({ q, category }),
    ]);
    restaurant = withCatalogRestaurant(liveRestaurant);
    categories = liveCategories.length ? liveCategories : demoCategories;
    usingDemoItems = liveItems.length === 0;
    items = usingDemoItems ? demoMenuItems : liveItems.map(withCatalogMenuItem);
  } catch {
    // Keep browsing and searching available while the API is offline.
  }

  if (usingDemoItems) {
    items = items.filter((item) => {
      const categoryMatches = !category || item.category?.slug === category;
      const term = q?.trim().toLocaleLowerCase();
      const categoryName = item.category ? `${item.category.name_en} ${item.category.name_ar}` : "";
      const queryMatches = !term || `${item.name_en} ${item.name_ar} ${item.description_en ?? ""} ${item.description_ar ?? ""} ${categoryName}`.toLocaleLowerCase().includes(term);
      return categoryMatches && queryMatches;
    });
  }

  const resultCount = items.length;
  const availableCount = items.filter((item) => item.is_available).length;
  const featuredCount = items.filter((item) => item.is_featured).length;
  const visibleItems = items.filter((item) => {
    if (filter === "available") return item.is_available;
    if (filter === "featured") return item.is_featured;
    return true;
  });
  const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
  visibleItems.sort((a, b) => {
    if (sort === "price-low") {
      if (!a.price && !b.price) return 0;
      if (!a.price) return 1;
      if (!b.price) return -1;
      return a.price - b.price;
    }
    if (sort === "price-high") {
      if (!a.price && !b.price) return 0;
      if (!a.price) return 1;
      if (!b.price) return -1;
      return b.price - a.price;
    }
    if (sort === "name") {
      return collator.compare(locale === "ar" ? a.name_ar : a.name_en, locale === "ar" ? b.name_ar : b.name_en);
    }
    return Number(b.is_featured) - Number(a.is_featured)
      || Number(b.is_available) - Number(a.is_available)
      || (a.sort_order ?? a.id) - (b.sort_order ?? b.id);
  });

  const categoryOptions = categories.map((cat) => ({
    slug: cat.slug,
    label: localized(cat, locale, "name"),
    count: cat.items_count ?? demoMenuItems.filter((item) => item.category?.slug === cat.slug).length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
      <div className="menu-page-intro mb-9 rounded-[2rem] border border-white/75 bg-white/45 px-7 py-8 shadow-[0_20px_70px_rgba(72,47,28,.07)] backdrop-blur-xl md:flex md:items-end md:justify-between md:px-10 md:py-10">
        <div><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">{locale === "ar" ? "محضّر طازجاً كل يوم" : "FRESH FROM OUR KITCHEN"}</p><h1 className="font-display text-4xl tracking-tight md:text-5xl">{t("title")}</h1><p className="mt-3 text-sm text-muted">{locale === "ar" ? "ابحثوا عن طبق أو مكوّن، ثم صفّوا النتائج حسب ذوقكم." : "Search dishes or ingredients, then narrow things down to your taste."}</p></div>
        <MenuSearch initialQuery={q ?? ""} placeholder={t("search")} category={category ?? ""} filter={filter} sort={sort} locale={locale} />
      </div>

      <MenuBrowseTools
        locale={locale}
        query={q?.trim() ?? ""}
        category={category ?? ""}
        filter={filter}
        sort={sort}
        categories={categoryOptions}
        resultCount={resultCount}
        availableCount={availableCount}
        featuredCount={featuredCount}
      />

      <MenuDisplayControls locale={locale}>
        {visibleItems.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/70 bg-white/45 p-8 text-center text-muted backdrop-blur-xl sm:p-12">
            <p>{filter === "all" ? t("empty") : (locale === "ar" ? "لا توجد نتائج لهذه التصفية. جرّبوا خياراً آخر." : "No items match this filter. Try another option.")}</p>
            <Link href="/menu" className="mt-4 inline-flex rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-white transition hover:bg-accent-dark">{locale === "ar" ? "عرض كل الأصناف" : "Show all items"}</Link>
          </div>
        ) : (
          <div className="mt-8">
            <MenuResults
              key={`${locale}:${q ?? ""}:${category ?? ""}:${filter}:${sort}`}
              items={visibleItems}
              currency={restaurant?.currency ?? "LBP"}
              decimals={restaurant?.currency_decimals ?? 0}
              locale={locale}
            />
          </div>
        )}
      </MenuDisplayControls>
    </div>
  );
}
