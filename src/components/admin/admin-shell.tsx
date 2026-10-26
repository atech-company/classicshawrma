"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/items", label: "Menu items" },
  { href: "/admin/settings", label: "Settings" },
];

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
      <div className="flex min-h-screen items-center justify-center text-sm text-[#6b645c]">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
      <aside className="border-b border-[#e4ddd3] bg-white md:w-60 md:border-b-0 md:border-e">
        <div className="px-5 py-5">
          <p className="font-display text-lg">Classic Shawarma</p>
          <p className="text-xs text-[#6b645c]">Admin · {user}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm whitespace-nowrap",
                pathname === link.href ||
                  (link.href !== "/admin" && pathname.startsWith(link.href))
                  ? "bg-[#c45c26] text-white"
                  : "hover:bg-[#f6f3ee]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mx-3 mb-4 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          Log out
        </button>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
