import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MenuCard } from "@/components/menu-card";
import { MenuSearch } from "@/components/menu-search";
import { MenuDisplayControls } from "@/components/menu-display-controls";
import { api } from "@/lib/api";
import { demoCategories, demoMenuItems, demoRestaurant, withCatalogMenuItem, withCatalogRestaurant } from "@/lib/demo-data";
import { cn, localized } from "@/lib/utils";

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { q, category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("menu");

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
      const queryMatches = !term || `${item.name_en} ${item.name_ar} ${item.description_en ?? ""} ${item.description_ar ?? ""}`.toLocaleLowerCase().includes(term);
      return categoryMatches && queryMatches;
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
      <div className="mb-9 rounded-[2rem] border border-white/75 bg-white/45 px-7 py-8 shadow-[0_20px_70px_rgba(72,47,28,.07)] backdrop-blur-xl md:flex md:items-end md:justify-between md:px-10 md:py-10">
        <div><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-accent">{locale === "ar" ? "محضّر طازجاً كل يوم" : "FRESH FROM OUR KITCHEN"}</p><h1 className="font-display text-4xl tracking-tight md:text-5xl">{t("title")}</h1><p className="mt-3 text-sm text-muted">{locale === "ar" ? "اختاروا المفضل عندكم، ونحن نهتم بالباقي." : "Find your new favorite. We’ll take it from here."}</p></div>
        <MenuSearch initialQuery={q ?? ""} placeholder={t("search")} />
      </div>

      <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/menu"
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur transition",
            !category
              ? "border-accent bg-accent text-white"
              : "border-white/80 bg-white/55 hover:border-accent hover:bg-white/90"
          )}
        >
          {t("all")}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/menu?category=${cat.slug}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur transition",
              category === cat.slug
                ? "border-accent bg-accent text-white"
                : "border-white/80 bg-white/55 hover:border-accent hover:bg-white/90"
            )}
          >
            {localized(cat, locale, "name")}
          </Link>
        ))}
      </div>

      <MenuDisplayControls locale={locale}>
        {items.length === 0 ? (
          <p className="mt-12 rounded-3xl border border-white/70 bg-white/45 p-12 text-center text-muted backdrop-blur-xl">{t("empty")}</p>
        ) : (
          <div className="menu-display-grid mt-8 grid gap-6">
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                currency={restaurant?.currency ?? "LBP"}
                decimals={restaurant?.currency_decimals ?? 0}
              />
            ))}
          </div>
        )}
      </MenuDisplayControls>
    </div>
  );
}
