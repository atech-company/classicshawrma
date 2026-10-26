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
    <div lang="en" dir="ltr" className="min-h-screen bg-[#f3f1ec] text-[#1a1714]">
      {children}
    </div>
  );
}
