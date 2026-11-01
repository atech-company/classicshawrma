"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/items", label: "Menu items" },
  { href: "/admin/settings", label: "Settings" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    api
      .adminMe(token)
      .then((me) => {
        setUser(me.name);
        setReady(true);
      })
      .catch(() => {
        clearAdminToken();
        router.replace("/admin/login");
      });
  }, [router]);

  async function logout() {
    const token = getAdminToken();
    if (token) {
      try {
        await api.adminLogout(token);
      } catch {
        /* ignore */
      }
    }
    clearAdminToken();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen">
      <header className="site-header sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
        <div className="header-inner mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/75 bg-[#fffdf9]/75 px-3 py-2.5 shadow-[0_8px_30px_rgba(63,43,27,.07)] backdrop-blur-2xl sm:gap-4 sm:px-4 md:px-6">
          <Link
            href="/admin"
            aria-label="Classic Shawarma admin home"
            className="header-brand group flex min-w-0 shrink-0 items-center gap-2.5 font-display text-base tracking-tight text-foreground md:text-lg"
          >
            <span className="brand-mark relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-accent/15 bg-white shadow-[0_7px_18px_rgba(211,75,43,.16)] transition group-hover:-rotate-3 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logo} alt="" className="h-full w-full object-contain" />
              <span className="brand-mark-sparkle pointer-events-none absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
            </span>
            <span className="min-w-0 leading-tight">
              Classic <span className="text-accent">Shawarma</span>
              <span className="header-brand-caption mt-0.5 block font-sans text-[9px] font-bold uppercase tracking-[.17em] text-muted">
                Admin · {user}
              </span>
            </span>
          </Link>

          <nav className="admin-nav flex max-w-full flex-1 items-center gap-1 overflow-x-auto pb-0.5 sm:gap-1.5 md:justify-end md:gap-2">
            {links.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "admin-nav-link shrink-0 rounded-full px-3 py-2 text-xs font-semibold tracking-wide transition sm:text-sm",
                    active ? "admin-pill-active" : "text-foreground/75 hover:bg-white/70 hover:text-accent"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={logout}
              className="admin-logout-btn inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-white/70 px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent/40 hover:text-accent sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="admin-main mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
