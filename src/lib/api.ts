import type { Category, MenuItem, Order, Restaurant } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const RESTAURANT_UUID =
  process.env.NEXT_PUBLIC_RESTAURANT_UUID ??
  "54ac0973-bcbf-467a-a7f9-6e29127167c7";

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Restaurant-Id", RESTAURANT_UUID);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let payload: ApiError = { message: res.statusText };
    try {
      payload = await res.json();
    } catch {
      /* ignore */
    }
    const err = new Error(payload.message ?? "Request failed") as Error & {
      status: number;
      errors?: Record<string, string[]>;
    };
    err.status = res.status;
    err.errors = payload.errors;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function unwrap<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const api = {
  getRestaurant: async () =>
    unwrap(await request<Restaurant | { data: Restaurant }>("/restaurant")),

  getCategories: async () =>
    unwrap(await request<Category[] | { data: Category[] }>("/categories")),

  getMenu: async (params?: { q?: string; featured?: boolean; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.featured) qs.set("featured", "1");
    if (params?.category) qs.set("category", params.category);
    const suffix = qs.toString() ? `?${qs}` : "";
    return unwrap(await request<MenuItem[] | { data: MenuItem[] }>(`/menu${suffix}`));
  },

  getMenuItem: async (slug: string) =>
    unwrap(await request<MenuItem | { data: MenuItem }>(`/menu/${slug}`)),

  createOrder: async (
    body: Record<string, unknown>,
    idempotencyKey: string
  ) =>
    unwrap(
      await request<Order | { data: Order }>("/orders", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Idempotency-Key": idempotencyKey },
      })
    ),

  getOrder: async (reference: string) =>
    unwrap(
      await request<Order | { data: Order }>(`/orders/${reference}`)
    ),

  adminLogin: (email: string, password: string) =>
    request<{ token: string; user: { id: number; name: string; email: string } }>(
      "/admin/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  adminMe: (token: string) =>
    request<{ id: number; name: string; email: string }>("/admin/me", {}, token),

  adminLogout: (token: string) =>
    request<{ message: string }>("/admin/logout", { method: "POST" }, token),

  adminDashboard: (token: string) =>
    request<{
      orders_today: number;
      pending_orders: number;
      confirmed_orders: number;
      completed_orders: number;
      sales_today: number;
      sales_period: number;
    }>("/admin/dashboard", {}, token),

  adminCategories: async (token: string) =>
    unwrap(
      await request<Category[] | { data: Category[] }>(
        "/admin/categories",
        {},
        token
      )
    ),

  adminSaveCategory: (token: string, form: FormData, id?: number) => {
    if (id) {
      form.append("_method", "PUT");
      return request(`/admin/categories/${id}`, { method: "POST", body: form }, token);
    }
    return request("/admin/categories", { method: "POST", body: form }, token);
  },

  adminDeleteCategory: (token: string, id: number) =>
    request(`/admin/categories/${id}`, { method: "DELETE" }, token),

  adminItems: async (
    token: string,
    params?: { q?: string; page?: number; per_page?: number; visible?: boolean }
  ) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.visible !== undefined) qs.set("visible", params.visible ? "1" : "0");
    const suffix = qs.toString() ? `?${qs}` : "";
    return request<{ data: MenuItem[]; meta?: unknown }>(
      `/admin/items${suffix}`,
      {},
      token
    );
  },

  adminSaveItem: (token: string, form: FormData, id?: number) => {
    if (id) {
      form.append("_method", "PUT");
      return request(`/admin/items/${id}`, { method: "POST", body: form }, token);
    }
    return request("/admin/items", { method: "POST", body: form }, token);
  },

  adminDeleteItem: (token: string, id: number) =>
    request(`/admin/items/${id}`, { method: "DELETE" }, token),

  adminGetItem: async (token: string, id: number) =>
    unwrap(
      await request<MenuItem | { data: MenuItem }>(`/admin/items/${id}`, {}, token)
    ),

  adminOrders: (token: string, params?: Record<string, string>) => {
    const qs = new URLSearchParams(params);
    const suffix = qs.toString() ? `?${qs}` : "";
    return request<{ data: Order[]; meta?: unknown }>(
      `/admin/orders${suffix}`,
      {},
      token
    );
  },

  adminOrder: async (token: string, id: number) =>
    unwrap(await request<Order | { data: Order }>(`/admin/orders/${id}`, {}, token)),

  adminUpdateOrderStatus: async (
    token: string,
    id: number,
    body: { status: string; note?: string; cancel_reason?: string }
  ) =>
    unwrap(
      await request<Order | { data: Order }>(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }, token)
    ),

  adminRestaurant: async (token: string) =>
    unwrap(
      await request<Restaurant | { data: Restaurant }>(
        "/admin/restaurant",
        {},
        token
      )
    ),

  adminSaveRestaurant: (token: string, form: FormData) =>
    request("/admin/restaurant", { method: "POST", body: form }, token),

  adminReorderCategories: (token: string, order: number[]) =>
    request("/admin/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ order }),
    }, token),
};
