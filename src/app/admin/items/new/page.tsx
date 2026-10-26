"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { Category } from "@/lib/types";

export default function AdminNewItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [groups, setGroups] = useState<ModifierGroupDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    api.adminCategories(token)
      .then(setCategories)
      .catch(() => setError("Could not load categories."))
      .finally(() => setCategoriesLoaded(true));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getAdminToken();
    if (!token || !categoryId) return;
    setSaving(true);
    setError("");

    try {
      const form = new FormData();
      form.append("category_id", categoryId);
      form.append("name_en", nameEn);
      form.append("name_ar", nameAr);
      form.append("description_en", descriptionEn);
      form.append("description_ar", descriptionAr);
      form.append("price", String(Math.round(Number(price) || 0)));
      if (sortOrder.trim()) {
        form.append("sort_order", String(Math.max(0, Math.round(Number(sortOrder) || 0))));
      }
      form.append("is_featured", featured ? "1" : "0");
      form.append("is_available", available ? "1" : "0");
      form.append("is_visible", "1");
      form.append("variants", JSON.stringify(variants));
      form.append("modifier_groups", JSON.stringify(groups));
      if (image) form.append("image", image);
      await api.adminSaveItem(token, form);
      router.push("/admin/items");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <Link href="/admin/items" className="text-sm font-semibold text-[#c45c26] hover:underline">
        ← Back to items
      </Link>
      <div className="mt-3">
        <h1 className="font-display text-3xl">Add menu item</h1>
        <p className="mt-1 text-sm text-[#6b645c]">Create a new item for the restaurant menu.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid max-w-4xl gap-3 rounded-2xl border border-[#e4ddd3] bg-white p-5 md:grid-cols-2"
      >
        <label className="grid gap-1 text-sm text-[#6b645c] md:col-span-2">
          Category
          <select
            required
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm text-[#211d19]"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name_en}</option>
            ))}
          </select>
        </label>
        <Input required placeholder="Name (EN)" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
        <Input required placeholder="Name (AR)" value={nameAr} onChange={(event) => setNameAr(event.target.value)} dir="rtl" />
        <Textarea placeholder="Description (EN)" value={descriptionEn} onChange={(event) => setDescriptionEn(event.target.value)} />
        <Textarea placeholder="Description (AR)" value={descriptionAr} onChange={(event) => setDescriptionAr(event.target.value)} dir="rtl" />
        <label className="grid gap-1 text-sm text-[#6b645c]">
          Price (integer)
          <Input required type="number" min={0} value={price} onChange={(event) => setPrice(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm text-[#6b645c]">
          Display order in category (optional)
          <Input type="number" min={0} placeholder="Add to end automatically" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm text-[#6b645c] md:col-span-2">
          Item photo (optional)
          <Input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} />
          Available
        </label>

        <ItemCustomizationsEditor
          variants={variants}
          groups={groups}
          onVariantsChange={setVariants}
          onGroupsChange={setGroups}
        />

        {categoriesLoaded && categories.length === 0 && (
          <p className="text-sm text-[#6b645c] md:col-span-2">
            Create a category before adding menu items.
          </p>
        )}
        {error && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}
        <Button type="submit" disabled={saving || categories.length === 0} className="w-fit md:col-span-2">
          {saving ? "Saving…" : "Create item"}
        </Button>
      </form>
    </AdminShell>
  );
}
