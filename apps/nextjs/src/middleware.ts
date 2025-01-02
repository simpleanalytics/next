import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { simpleAnalytics } from "@simpleanalytics/next/server";

const client = simpleAnalytics({
  hostname: "simpleanalytics-next.vercel.app",
});

export function middleware(req: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    client.trackEvent("hello from middleware", {
      path: req.nextUrl.pathname,
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
