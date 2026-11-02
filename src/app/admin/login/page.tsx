"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAdminToken, setAdminToken } from "@/lib/admin-auth";
import { brand } from "@/lib/brand";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAdminToken()) router.replace("/admin");
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.adminLogin(email, password);
      setAdminToken(res.token);
      router.replace("/admin");
    } catch {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-app flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="admin-widget w-full max-w-md">
        <div className="admin-widget-header" style={{ ["--widget-accent" as string]: "var(--admin-accent-purple)" }}>
          <h1 className="admin-widget-title">Admin login</h1>
        </div>
        <div className="admin-widget-body space-y-4">
          <div className="flex items-center gap-3">
            <span className="admin-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logo} alt="" />
            </span>
            <div>
              <p className="font-semibold text-[var(--admin-text)]">Classic Shawarma</p>
              <p className="text-sm text-[var(--admin-muted)]">Dashboard access</p>
            </div>
          </div>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--admin-muted)]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--admin-muted)]">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="admin-btn-primary w-full disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
