import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function InvalidQrPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("invalidQr");

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <div className="glass-panel rounded-[2rem] p-10 md:p-14">
      <h1 className="font-display text-4xl">{t("title")}</h1>
      <p className="mt-4 text-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
      >
        Classic Shawarma
      </Link>
      </div>
    </div>
  );
}
