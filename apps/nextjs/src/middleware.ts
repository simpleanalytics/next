import { NextRequest, NextFetchEvent, NextResponse } from "next/server";
import { trackPageview } from "@simpleanalytics/next/server";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  // Perform the pageview tracking call to Simple Analytics in the background
  event.waitUntil(trackPageview({ request }));

  const response = NextResponse.next()

  console.log("middleware", response.status, response.statusText);

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
