"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { withCatalogMenuItem } from "@/lib/demo-data";
import type { Category, MenuItem } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const SEARCH_STOP_WORDS = new Set(["and", "with", "the", "for", "of", "a", "an", "l"]);

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/(\d)[.,](?=\d)/g, "$1")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/(?<=\d)(?=\p{L})/gu, " ")
    .trim();
}

function searchScore(item: MenuItem, query: string, categories: Category[]) {
  const terms = normalizeSearchText(query)
    .split(/\s+/)
    .filter((term) => term.length > 1 && !SEARCH_STOP_WORDS.has(term));
  if (!terms.length) return 0;

  const catalogItem = withCatalogMenuItem(item);
  const category = categories.find((entry) => entry.id === item.category_id);
  const searchableText = normalizeSearchText([
    item.name_en,
    item.name_ar,
    item.description_en ?? "",
    item.description_ar ?? "",
    catalogItem.name_en,
    catalogItem.description_en ?? "",
    category?.name_en ?? "",
    category?.name_ar ?? "",
  ].join(" "));
  const matches = terms.filter((term) => searchableText.includes(term)).length;
  return matches >= Math.ceil(terms.length / 2) ? matches : 0;
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [listCategoryId, setListCategoryId] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    const [cats, res] = await Promise.all([
      api.adminCategories(token),
      api.adminItems(token, { per_page: 500 }),
    ]);
    setCategories(cats);
    setItems(res.data ?? []);
  }, []);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  async function toggleSoldOut(item: MenuItem) {
    const token = getAdminToken();
    if (!token) return;
    const form = new FormData();
    form.append("category_id", String(item.category_id));
    form.append("name_en", item.name_en);
    form.append("name_ar", item.name_ar);
    form.append("price", String(item.price));
    form.append("is_available", item.is_available ? "0" : "1");
    form.append("is_featured", item.is_featured ? "1" : "0");
    form.append("is_visible", item.is_visible ? "1" : "0");
    await api.adminSaveItem(token, form, item.id);
    await load();
  }

  async function toggleVisibility(item: MenuItem) {
    const token = getAdminToken();
    if (!token) return;
    const form = new FormData();
    form.append("is_visible", item.is_visible ? "0" : "1");
    await api.adminSaveItem(token, form, item.id);
    await load();
  }

  async function remove(item: MenuItem) {
    if (!confirm(`Delete ${item.name_en}?`)) return;
    const token = getAdminToken();
    if (!token) return;
    await api.adminDeleteItem(token, item.id);
    await load();
  }

  const filteredItems = items
    .map((item) => ({ item, score: searchScore(item, q, categories) }))
    .filter(({ item, score }) => {
    const matchesCategory = !listCategoryId || String(item.category_id) === listCategoryId;
    const matchesVisibility = visibilityFilter === "all" ||
      (visibilityFilter === "visible" ? item.is_visible : !item.is_visible);
      return matchesCategory && matchesVisibility && (!q.trim() || score > 0);
    })
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Menu items</h1>
        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search names, descriptions, Arabic, or category…"
            aria-label="Search menu items"
          />
          {q ? <Button type="button" variant="outline" onClick={() => setQ("")}>Clear</Button> : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e4ddd3] bg-white p-4">
        <label className="grid gap-1 text-xs font-medium text-[#6b645c]">
          Category
          <select
            value={listCategoryId}
            onChange={(e) => setListCategoryId(e.target.value)}
            className="min-w-48 rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm text-[#211d19]"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name_en}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-[#6b645c]">
          Website display
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="min-w-40 rounded-xl border border-[#e4ddd3] px-3 py-2 text-sm text-[#211d19]"
          >
            <option value="all">All items</option>
            <option value="visible">Shown on website</option>
            <option value="hidden">Hidden from website</option>
          </select>
        </label>
        <p className="ml-auto text-sm text-[#6b645c]">{filteredItems.length} items · Lower display order appears first in its category.</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Manage items</h2>
          <p className="mt-1 text-sm text-[#6b645c]">Search, filter, edit, and control website visibility.</p>
        </div>
        <Link href="/admin/items/new" className="inline-flex items-center rounded-full bg-[#c45c26] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9a451c]">
          + Add item
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e4ddd3] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f6f3ee] text-left">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category / order</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6b645c]">
                  No items match these filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-[#e4ddd3]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name_en}</div>
                    <div className="text-[#6b645c]" dir="rtl">
                      {item.name_ar}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6b645c]">
                    <div>{categories.find((category) => category.id === item.category_id)?.name_en ?? "Uncategorized"}</div>
                    <div className="text-xs">Order {item.sort_order ?? 0}</div>
                  </td>
                  <td className="px-4 py-3">{formatMoney(item.price, "LBP", 0)}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => toggleVisibility(item)} className={item.is_visible ? "text-green-700" : "text-[#8a8177]"}>
                      {item.is_visible ? "Shown · Hide" : "Hidden · Show"}
                    </button>
                    {item.is_featured ? <div className="text-xs text-[#c45c26]">Featured</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => toggleSoldOut(item)} className="text-[#6b645c]">
                      {item.is_available ? "Available · Mark sold out" : "Sold out · Make available"}
                    </button>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Link href={`/admin/items/${item.id}`} className="text-[#c45c26]">
                      Edit
                    </Link>
                    <button type="button" onClick={() => remove(item)} className="text-red-700">
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
