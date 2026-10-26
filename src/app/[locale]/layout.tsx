import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { api } from "@/lib/api";
import { SiteFooter } from "@/components/site-footer";
import { demoRestaurant, withCatalogRestaurant } from "@/lib/restaurant-defaults";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  let restaurant = demoRestaurant;
  try {
    restaurant = withCatalogRestaurant(await api.getRestaurant());
  } catch {
    restaurant = demoRestaurant;
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="min-h-screen">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter restaurant={restaurant} locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
