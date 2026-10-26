import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const EXPECTED_UUID =
  process.env.NEXT_PUBLIC_RESTAURANT_UUID ??
  "54ac0973-bcbf-467a-a7f9-6e29127167c7";

export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const id = searchParams.get("id");
  if (id && pathname === "/") {
    const locale = routing.defaultLocale;
    const url = request.nextUrl.clone();
    if (id !== EXPECTED_UUID) {
      url.pathname = `/${locale}/invalid-qr`;
      url.search = "";
      return NextResponse.redirect(url);
    }
    url.pathname = `/${locale}`;
    url.searchParams.delete("id");
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
