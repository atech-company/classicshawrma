import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { api } from "@/lib/api";
import { demoRestaurant, findDemoMenuItem, withCatalogMenuItem, withCatalogRestaurant } from "@/lib/demo-data";
import { formatMoney, localized } from "@/lib/utils";
import { brand } from "@/lib/brand";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("item");

  let item = findDemoMenuItem(slug);
  let restaurant = demoRestaurant;
  try {
    const [liveItem, liveRestaurant] = await Promise.all([
      api.getMenuItem(slug),
      api.getRestaurant(),
    ]);
    item = liveItem ? withCatalogMenuItem(liveItem) : item;
    restaurant = withCatalogRestaurant(liveRestaurant);
  } catch {
    // Demo items remain orderable while the API is being set up.
  }

  if (!item || !restaurant) notFound();

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-10 md:py-16 lg:grid-cols-2 lg:items-center">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#2a221c,#4a3428)] shadow-[0_30px_80px_rgba(66,43,25,.16)]">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={localized(item, locale, "name")}
            loading="lazy"
            decoding="async"
            className="aspect-[1.08] w-full object-cover"
          />
        ) : (
          <div className="relative aspect-square w-full bg-white">
            <Image
              src={brand.logo}
              alt="Classic Shawarma"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              className="object-contain p-8"
            />
          </div>
        )}
      </div>
      <div className="rounded-[2rem] border border-white/75 bg-white/50 p-7 shadow-[0_20px_70px_rgba(72,47,28,.07)] backdrop-blur-xl md:p-10">
        <Link href="/menu" className="text-sm font-semibold text-muted transition hover:text-accent">
          ← {t("back")}
        </Link>
        <h1 className="mt-5 font-display text-4xl tracking-tight md:text-5xl">
          {localized(item, locale, "name")}
        </h1>
        <p className="mt-4 inline-flex rounded-full bg-[#f8e9dd] px-4 py-2 text-base font-bold text-accent">
          {item.price > 0 ? formatMoney(item.price, restaurant.currency, restaurant.currency_decimals) : t("priceOnRequest")}
        </p>
        {localized(item, locale, "description") && (
          <p className="mt-5 text-muted leading-7">
            {localized(item, locale, "description")}
          </p>
        )}
        {item.price > 0 ? <div className="mt-8"><AddToCartForm item={item} restaurant={restaurant} /></div> : restaurant.phone ? <a href={`tel:${restaurant.phone}`} dir="ltr" className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-accent-dark">{t("priceOnRequest")} · {restaurant.phone}</a> : null}
      </div>
    </div>
  );
}
