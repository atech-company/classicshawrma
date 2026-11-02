import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const storageHosts = [
  "localhost",
  "127.0.0.1",
  "classicshawrma.atechleb.com",
  "classicshwarma.atechleb.com",
] as const;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...storageHosts.flatMap((hostname) => {
        const local = hostname === "localhost" || hostname === "127.0.0.1";
        return [
          {
            protocol: local ? ("http" as const) : ("https" as const),
            hostname,
            ...(local ? { port: "8000" } : {}),
            pathname: "/storage/**",
          },
          {
            protocol: local ? ("http" as const) : ("https" as const),
            hostname,
            ...(local ? { port: "8000" } : {}),
            pathname: "/media/**",
          },
        ];
      }),
      {
        protocol: "https",
        hostname: "ccptvqjhtddwkwfhgrfr.supabase.co",
        pathname: "/storage/v1/object/public/restoimages/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
