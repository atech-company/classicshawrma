import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Classic Shawarma",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en" dir="ltr" className="admin-root min-h-screen">
      {children}
    </div>
  );
}
