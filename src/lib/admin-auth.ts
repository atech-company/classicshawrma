"use client";

const KEY = "classic-shawarma-admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(KEY);
}
