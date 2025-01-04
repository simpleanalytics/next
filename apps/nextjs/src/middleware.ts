import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { trackEvent } from "@simpleanalytics/next/server";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    trackEvent("hello from middleware", {
      request,
    }),
  );

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
