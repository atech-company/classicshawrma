"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ItemCustomizationsEditor,
  type ModifierGroupDraft,
  type VariantDraft,
} from "@/components/admin/item-customizations-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import type { Category, MenuItem } from "@/lib/types";

export default function AdminEditItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [image, setImage] = useState<File | null>(null);
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [visible, setVisible] = useState(true);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [groups, setGroups] = useState<ModifierGroupDraft[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    Promise.all([
      api.adminGetItem(token, Number(params.id)),
      api.adminCategories(token),
    ])
      .then(([found, cats]) => {
        setItem(found);
        setCategories(cats);
        setCategoryId(String(found.category_id));
        setNameEn(found.name_en);
        setNameAr(found.name_ar);
        setDescriptionEn(found.description_en ?? "");
        setDescriptionAr(found.description_ar ?? "");
        setPrice(String(found.price));
        setSortOrder(String(found.sort_order ?? 0));
        setFeatured(found.is_featured);
        setAvailable(found.is_available);
        setVisible(found.is_visible);
        setVariants(
          (found.variants ?? []).map((v) => ({
            name_en: v.name_en,
            name_ar: v.name_ar,
            price_adjustment: v.price_adjustment,
            is_active: v.is_active,
          }))
        );
        setGroups(
          (found.modifier_groups ?? []).map((g) => ({
            name_en: g.name_en,
            name_ar: g.name_ar,
            is_required: g.is_required,
            min_selections: g.min_selections,
            max_selections: g.max_selections,
            options: (g.options ?? []).map((o) => ({
              name_en: o.name_en,
              name_ar: o.name_ar,
              price_adjustment: o.price_adjustment,
              is_active: o.is_active,
            })),
          }))
        );
      })
      .catch(() => router.replace("/admin/items"));
  }, [params.id, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token || !item) return;
    setError("");
    try {
      const form = new FormData();
      form.append("category_id", categoryId);
      form.append("name_en", nameEn);
      form.append("name_ar", nameAr);
      form.append("description_en", descriptionEn);
      form.append("description_ar", descriptionAr);
      form.append("price", String(Math.round(Number(price) || 0)));
      form.append("sort_order", String(Math.max(0, Math.round(Number(sortOrder) || 0))));
      form.append("is_featured", featured ? "1" : "0");
      form.append("is_available", available ? "1" : "0");
      form.append("is_visible", visible ? "1" : "0");
      form.append("variants", JSON.stringify(variants));
      form.append("modifier_groups", JSON.stringify(groups));
      if (image) form.append("image", image);
      await api.adminSaveItem(token, form, item.id);
      setMessage("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  if (!item) {
    return (
      <AdminShell>
        <p className="text-sm text-[#6b645c]">Loading item…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Edit item</h1>
      <form
        onSubmit={onSubmit}
        className="mt-6 grid max-w-4xl gap-3 rounded-2xl border border-[#e4ddd3] bg-white p-5 md:grid-cols-2"
      >
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm md:col-span-2"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_en}
            </option>
          ))}
        </select>
        <Input required value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Name EN" />
        <Input required value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="Name AR" dir="rtl" />
        <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
        <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" />
        <Input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <label className="grid gap-1 text-sm text-[#6b645c]">
          Display order within category
          <Input type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </label>
        <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          Available
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Visible on website
        </label>

        <ItemCustomizationsEditor
          variants={variants}
          groups={groups}
          onVariantsChange={setVariants}
          onGroupsChange={setGroups}
        />

        <Button type="submit">Save changes</Button>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}
      </form>
    </AdminShell>
  );
}
