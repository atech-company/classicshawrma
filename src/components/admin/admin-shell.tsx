"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Tags,
  UtensilsCrossed,
  Home,
  Bell,
} from "lucide-react";
import { api } from "@/lib/api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/items", label: "Menu" },
  { href: "/admin/settings", label: "Settings" },
];

const sideLinks = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/items", label: "Menu items", icon: UtensilsCrossed },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
        setEmail(me.email);
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
      <div className="admin-app flex min-h-screen items-center justify-center text-sm text-[var(--admin-muted)]">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="admin-app min-h-screen px-2 py-3 sm:px-4 sm:py-5 lg:px-6">
      <div className="admin-frame mx-auto max-w-[1600px]">
        <div className="admin-panel">
          <header className="admin-topnav">
            <button
              type="button"
              className="admin-icon-btn lg:hidden"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="admin-tabs hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex lg:gap-2">
              {tabs.map((tab) => {
                const active = isActive(pathname, tab.href, tab.exact);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("admin-tab", active && "is-active")}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              <button type="button" className="admin-icon-btn" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
              <button type="button" className="admin-icon-btn hidden sm:inline-flex" aria-label="Apps">
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button type="button" className="admin-icon-btn relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="admin-bell-dot" />
              </button>
              <div className="admin-profile hidden items-center gap-2 sm:flex">
                <span className="admin-avatar" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.logo} alt="" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold text-[var(--admin-text)]">{user}</p>
                  <p className="truncate text-[11px] text-[var(--admin-muted)]">{email || "Admin"}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="admin-icon-btn"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={logout}
                className="admin-icon-btn sm:hidden"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="admin-body">
            <aside className={cn("admin-sidebar", menuOpen && "is-open")}>
              {sideLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(pathname, link.href, link.exact);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    aria-label={link.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn("admin-side-link", active && "is-active")}
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
                className="admin-side-link mt-auto"
              >
                <LogOut className="h-[22px] w-[22px]" />
              </button>
            </aside>

            <main className="admin-content">{children}</main>
          </div>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="admin-backdrop lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
