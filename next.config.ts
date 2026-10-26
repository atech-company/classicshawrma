import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/storage/**" },
      { protocol: "https", hostname: "classicshwarma.atechleb.com", pathname: "/storage/**" },
      {
        protocol: "https",
        hostname: "ccptvqjhtddwkwfhgrfr.supabase.co",
        pathname: "/storage/v1/object/public/restoimages/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
