# Simple Analytics for Next.js

## Installation

To install the package, run:

```bash
npm install @simpleanalytics/next
```

## Usage

### Update your Next.js config to enable client-side analytics

To enable client-side tracking and to ensure the Simple Analytics script you must add the Next.js plugin `withSimpleAnalytics` from `@simpleanalytics/next` in your Next.js config (`next.config.ts`):

```typescript
import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = withSimpleAnalytics({
  domain: process.env.VERCEL_PROJECT_PRODUCTION_URL!, // Shuould be set to the domain of your Next.js application.
  nextConfig: { /* the rest of your Next.js config */ }
});

export default nextConfig;
```

### Include the analytics script

The client-side analytics component, `SimpleAnalytics`, imports the Simple Analytics tracking script:

```typescript
import { SimpleAnalytics } from "@simpleanalytics/next/client";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SimpleAnalytics
          settings={{ hostname: "simpleanalytics-next.vercel.app" }}
        />
      </body>
    </html>
  );
}
```

### Tracking events and pageviews on the client

The React hook, `useSimpleAnalytics`, provides methods `trackEvent` and `trackPageview` for programmatically tracking events or pageviews in client components. Requires the `<SimpleAnalytics />` component to be present on the page or layout.

```typescript
"use client";

import { useSimpleAnalytics } from "@simpleanalytics/next/client";
import { useState } from "react";

export default function Page() {
  const { trackEvent } = useSimpleAnalytics();

  return (
    <div>
      <button
        onClick={() => {
          trackEvent("clicked");
        }}
      >
        increment
      </button>
    </div>
  );
}
```

### Tracking events and pageviews using the server-side client

The server-side client, `simpleAnalytics`, allows tracking events and pageviews in Server Components, Route Handlers and the Edge Middleware. It provides methods `trackEvent` and `trackPageview` to track events and pageviews:

```typescript
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { simpleAnalytics } from "@simpleanalytics/next/server";

const client = simpleAnalytics({
  hostname: "simpleanalytics-next.vercel.app",
});

export function middleware(req: NextRequest, event: NextFetchEvent) {
  // Perform the call in the background (see: https://nextjs.org/docs/app/building-your-application/routing/middleware#waituntil-and-nextfetchevent)
  event.waitUntil(
    client.trackEvent("hello from the middleware", {
      path: req.nextUrl.pathname,
    }),
  );

  return NextResponse.next();
}
```

