"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
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
      <h1 className="font-display text-3xl">Categories</h1>
      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-3 rounded-2xl border border-[#e4ddd3] bg-white p-5 md:grid-cols-2"
      >
        <h2 className="md:col-span-2 font-semibold">
          {editing ? `Edit ${editing.name_en}` : "New category"}
        </h2>
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

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e4ddd3] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f6f3ee] text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6b645c]">
                  No categories yet. Create your first one above.
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id} className="border-t border-[#e4ddd3]">
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <div>{cat.name_en}</div>
                    <div className="text-[#6b645c]" dir="rtl">
                      {cat.name_ar}
                    </div>
                  </td>
                  <td className="px-4 py-3">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.items_count ?? 0}</td>
                  <td className="px-4 py-3">
                    {cat.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button type="button" onClick={() => startEdit(cat)} className="text-[#c45c26]">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleActive(cat)} className="text-[#6b645c]">
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
    </AdminShell>
  );
}
