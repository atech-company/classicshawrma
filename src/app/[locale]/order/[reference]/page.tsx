import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { LiveOrderStatus } from "@/components/live-order-status";
import { formatMoney } from "@/lib/utils";
import { withCatalogRestaurant } from "@/lib/restaurant-defaults";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>;
}) {
  const { locale, reference } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("order");

  let order = null;
  let restaurant = null;
  try {
    [order, restaurant] = await Promise.all([
      api.getOrder(reference),
      api.getRestaurant(),
    ]);
    restaurant = withCatalogRestaurant(restaurant);
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="glass-panel rounded-[2rem] p-10 md:p-14">
          <h1 className="font-display text-3xl">{t("notFound")}</h1>
        </div>
      </div>
    );
  }

  const currency = restaurant?.currency ?? "LBP";
  const decimals = restaurant?.currency_decimals ?? 0;
  const whatsappNumber = restaurant?.phone?.replace(/\D/g, "") ?? "";
  const whatsappMessage = [
    t("whatsappGreeting"),
    `${t("number")}: ${order.order_number}`,
    `${t("customer")}: ${order.customer_name}`,
    `${t("phone")}: ${order.customer_phone}`,
    `${t("type")}: ${locale === "ar" ? (order.order_type === "delivery" ? "توصيل" : "استلام") : (order.order_type === "delivery" ? "Delivery" : "Takeaway")}`,
    "",
    ...((order.items ?? []).map((item) => `${item.quantity}× ${locale === "ar" ? item.item_name_ar : item.item_name_en} — ${formatMoney(item.line_total, currency, decimals)}`)),
    `${t("total")}: ${formatMoney(order.total, currency, decimals)}`,
    ...(order.delivery_address ? [`${t("deliveryAddress")}: ${order.delivery_address}`] : []),
    ...(order.customer_notes ? [`${t("orderNotes")}: ${order.customer_notes}`] : []),
  ].join("\n");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <div className="glass-panel rounded-[2rem] p-7 md:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("thanks")}</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">{t("title")}</h1>
      <div className="mt-8 space-y-3 rounded-2xl border border-white/80 bg-white/45 p-6 text-sm backdrop-blur-xl">
        <Row label={t("number")} value={order.order_number} />
        <Row label={t("type")} value={locale === "ar" ? (order.order_type === "delivery" ? "توصيل" : "استلام") : (order.order_type === "delivery" ? "Delivery" : "Takeaway")} />
        <Row label={t("payment")} value={`${order.payment_method === "cash_delivery" ? t("cashDelivery") : t("cashPickup")} · ${t("paymentPending")}`} />
        <Row
          label={t("total")}
          value={formatMoney(order.total, currency, decimals)}
        />
      </div>
      <LiveOrderStatus
        reference={order.public_reference}
        initialStatus={order.status}
        initialHistory={order.status_histories ?? []}
        orderType={order.order_type}
      />
      {whatsappNumber && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,211,102,.22)] transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"><MessageCircle className="h-4 w-4" />{t("whatsapp")}</a>}
      <h2 className="mt-10 font-display text-2xl">{t("items")}</h2>
      <ul className="mt-4 space-y-3">
        {(order.items ?? []).map((item) => (
          <li
            key={item.id}
            className="flex justify-between rounded-xl border border-white/80 bg-white/55 px-4 py-3 text-sm backdrop-blur-xl"
          >
            <span>
              {item.quantity}×{" "}
              {locale === "ar" ? item.item_name_ar : item.item_name_en}
            </span>
            <span>{formatMoney(item.line_total, currency, decimals)}</span>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
