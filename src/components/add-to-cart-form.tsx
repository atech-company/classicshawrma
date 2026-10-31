"use client";

import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import type { MenuItem, Restaurant } from "@/lib/types";
import { formatMoney, localized } from "@/lib/utils";

export function AddToCartForm({
  item,
  restaurant,
}: {
  item: MenuItem;
  restaurant: Restaurant;
}) {
  const t = useTranslations("item");
  const locale = useLocale();
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const variants = item.variants ?? [];
  const groups = item.modifier_groups ?? [];
  const [variantId, setVariantId] = useState<number | undefined>(
    variants[0]?.id
  );
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const unitPrice = useMemo(() => {
    let price = item.price;
    const variant = variants.find((v) => v.id === variantId);
    if (variant) price += variant.price_adjustment;
    for (const group of groups) {
      for (const id of selected[group.id] ?? []) {
        const opt = group.options.find((o) => o.id === id);
        if (opt) price += opt.price_adjustment;
      }
    }
    return price;
  }, [item.price, variants, variantId, groups, selected]);

  function toggleOption(groupId: number, optionId: number, max: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (max === 1) return { ...prev, [groupId]: [optionId] };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  function submit() {
    setError("");
    if (variants.length > 0 && !variantId) {
      setError("Select a variant");
      return;
    }
    for (const group of groups) {
      const count = (selected[group.id] ?? []).length;
      const min = group.is_required ? Math.max(1, group.min_selections) : group.min_selections;
      if (count < min || count > group.max_selections) {
        setError(`Check selections for ${localized(group, locale, "name")}`);
        return;
      }
    }

    const variant = variants.find((v) => v.id === variantId);
    const optionIds = Object.values(selected).flat();
    const labelsEn: string[] = [];
    const labelsAr: string[] = [];
    for (const group of groups) {
      for (const id of selected[group.id] ?? []) {
        const opt = group.options.find((o) => o.id === id);
        if (opt) {
          labelsEn.push(opt.name_en);
          labelsAr.push(opt.name_ar);
        }
      }
    }

    addItem({
      menu_item_id: item.id,
      slug: item.slug,
      name_en: item.name_en,
      name_ar: item.name_ar,
      image_url: item.image_url,
      unit_price: unitPrice,
      quantity,
      variant_id: variantId,
      variant_label_en: variant?.name_en,
      variant_label_ar: variant?.name_ar,
      modifier_option_ids: optionIds,
      modifier_labels_en: labelsEn,
      modifier_labels_ar: labelsAr,
      notes: notes || undefined,
    });
    router.push("/cart");
  }

  if (!item.is_available) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Sold out
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {variants.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t("variant")}</legend>
          <div className="space-y-2">
            {variants.map((v) => (
              <label
                key={v.id}
                className="custom-option flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="variant"
                    checked={variantId === v.id}
                    onChange={() => setVariantId(v.id)}
                  />
                  {localized(v, locale, "name")}
                </span>
                <span className="text-sm text-muted">
                  {v.price_adjustment >= 0 ? "+" : ""}
                  {formatMoney(
                    v.price_adjustment,
                    restaurant.currency,
                    restaurant.currency_decimals
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {groups.map((group) => (
        <fieldset key={group.id}>
          <legend className="mb-2 text-sm font-semibold">
            {localized(group, locale, "name")}
            {group.is_required ? " *" : ""}
          </legend>
          <div className="space-y-2">
            {group.options.map((opt) => (
              <label
                key={opt.id}
                className="custom-option flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <input
                    type={group.max_selections === 1 ? "radio" : "checkbox"}
                    name={`group-${group.id}`}
                    checked={(selected[group.id] ?? []).includes(opt.id)}
                    onChange={() =>
                      toggleOption(group.id, opt.id, group.max_selections)
                    }
                  />
                  {localized(opt, locale, "name")}
                </span>
                <span className="text-sm text-muted">
                  {opt.price_adjustment >= 0 ? "+" : ""}
                  {formatMoney(
                    opt.price_adjustment,
                    restaurant.currency,
                    restaurant.currency_decimals
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div>
        <label className="mb-2 block text-sm font-semibold">{t("quantity")}</label>
        <input
          type="number"
          min={1}
          max={50}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-24 rounded-xl border border-border bg-surface px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">{t("notes")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={submit}
        className="add-to-cart-submit inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(198,79,43,.23)] transition hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-[0_16px_34px_rgba(198,79,43,.3)] active:translate-y-0 active:scale-[.99]"
      >
        <ShoppingBag className="h-4 w-4" />{t("add")} ·{" "}
        {formatMoney(
          unitPrice * quantity,
          restaurant.currency,
          restaurant.currency_decimals
        )}
      </button>
    </div>
  );
}
