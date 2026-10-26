"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "./types";

type CartState = {
  items: CartLine[];
  addItem: (line: Omit<CartLine, "key"> & { key?: string }) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (line) => {
        const key =
          line.key ??
          [
            line.menu_item_id,
            line.variant_id ?? "nv",
            [...line.modifier_option_ids].sort().join("-") || "nm",
            line.notes ?? "",
          ].join(":");

        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? { ...i, quantity: i.quantity + line.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...line, key }] };
        });
      },
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) =>
                  i.key === key ? { ...i, quantity } : i
                ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((n, i) => n + i.unit_price * i.quantity, 0),
    }),
    { name: "classic-shawarma-cart" }
  )
);
