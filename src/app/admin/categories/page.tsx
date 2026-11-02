"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { WidgetCard } from "@/components/admin/widget-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const token = getAdminToken();
    if (!token) return;
    const data = await api.adminCategories(token);
    setCategories(data);
  }

  useEffect(() => {
    load().catch(() => null);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token) return;
    const form = new FormData();
    form.append("name_en", nameEn);
    form.append("name_ar", nameAr);
    form.append("description_en", descriptionEn);
    form.append("description_ar", descriptionAr);
    form.append("is_active", "1");
    if (image) form.append("image", image);
    await api.adminSaveCategory(token, form, editing?.id);
    setMessage(editing ? "Category updated." : "Category created.");
    setEditing(null);
    setNameEn("");
    setNameAr("");
    setDescriptionEn("");
    setDescriptionAr("");
    setImage(null);
    await load();
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setNameEn(cat.name_en);
    setNameAr(cat.name_ar);
    setDescriptionEn(cat.description_en ?? "");
    setDescriptionAr(cat.description_ar ?? "");
  }

  async function toggleActive(cat: Category) {
    const token = getAdminToken();
    if (!token) return;
    const form = new FormData();
    form.append("name_en", cat.name_en);
    form.append("name_ar", cat.name_ar);
    form.append("is_active", cat.is_active ? "0" : "1");
    await api.adminSaveCategory(token, form, cat.id);
    await load();
  }

  async function remove(cat: Category) {
    if (!confirm(`Delete ${cat.name_en}?`)) return;
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.adminDeleteCategory(token, cat.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= categories.length) return;
    const next = [...categories];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setCategories(next);
    const token = getAdminToken();
    if (!token) return;
    try {
      const res = await api.adminReorderCategories(
        token,
        next.map((c) => c.id)
      );
      const data =
        res && typeof res === "object" && "data" in res
          ? (res as { data: Category[] }).data
          : next;
      setCategories(Array.isArray(data) ? data : next);
      setMessage("Order saved.");
    } catch {
      await load();
      setMessage("Could not save order.");
    }
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">Categories</h1>
      <WidgetCard title={editing ? `Edit ${editing.name_en}` : "New category"} accent="purple" className="mt-6">
      <form
        onSubmit={onSubmit}
        className="grid gap-3 md:grid-cols-2"
      >
        <Input
          required
          placeholder="Name (EN)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
        />
        <Input
          required
          placeholder="Name (AR)"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          dir="rtl"
        />
        <Textarea
          placeholder="Description (EN)"
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
        />
        <Textarea
          placeholder="Description (AR)"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          dir="rtl"
        />
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="md:col-span-2"
        />
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">{editing ? "Save" : "Create"}</Button>
          {editing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setNameEn("");
                setNameAr("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        {message && <p className="md:col-span-2 text-sm text-green-700">{message}</p>}
      </form>
      </WidgetCard>

      <WidgetCard title="Category list" accent="green" className="mt-8" bodyClassName="!p-0">
      <div className="admin-table-wrap !border-0 !shadow-none !rounded-none">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--admin-muted)]">
                  No categories yet. Create your first one above.
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === categories.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        ↓
                      </Button>
                    </div>
                  </td>
                  <td>
                    <div>{cat.name_en}</div>
                    <div className="text-[var(--admin-muted)]" dir="rtl">
                      {cat.name_ar}
                    </div>
                  </td>
                  <td>{cat.slug}</td>
                  <td>{cat.items_count ?? 0}</td>
                  <td>
                    {cat.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="space-x-2">
                    <button type="button" onClick={() => startEdit(cat)} className="admin-link">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleActive(cat)} className="text-[var(--admin-muted)]">
                      {cat.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button type="button" onClick={() => remove(cat)} className="text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </WidgetCard>
    </AdminShell>
  );
}
