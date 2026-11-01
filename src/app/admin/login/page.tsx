"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="admin-card w-full max-w-md space-y-5 p-8">
        <div className="flex items-start gap-3">
          <span className="brand-mark relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-accent/15 bg-white shadow-[0_7px_18px_rgba(211,75,43,.16)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logo} alt="" className="h-full w-full object-contain" />
            <span className="pointer-events-none absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </span>
          <div>
            <h1 className="font-display text-3xl tracking-tight">Admin login</h1>
            <p className="mt-1 text-sm text-muted">Classic Shawarma dashboard</p>
          </div>
        </div>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-muted">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-muted">Password</span>
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
      </form>
    </div>
  );
}
