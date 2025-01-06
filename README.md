# Simple Analytics for Next.js

## Installation

To install the package, run:

```bash
TODO
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

### Tracking pageviews using Next.js Edge Middleware

The function `trackPageview` can be used in Next.js Edge Middleware to track pageviews:

#### Next.js 14 and later
```typescript
import { type NextRequest, type NextFetchEvent, NextResponse } from "next/server";
import { trackPageview } from "@simpleanalytics/next/server";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  // Perform the call in the background (see: https://nextjs.org/docs/app/building-your-application/routing/middleware#waituntil-and-nextfetchevent)
  event.waitUntil(
    trackPageview({ request })
  );

  return NextResponse.next();
}
```

#### Next.js 13
```typescript
import { type NextRequest, NextResponse } from "next/server";
import { trackPageview } from "@simpleanalytics/next/server";

export async function middleware(request: NextRequest) {
  await trackPageview({ request });

  return NextResponse.next();
}
```

### Tracking events in a server action

#### Next.js 14 and later
```typescript
"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { trackEvent } from "@simpleanalytics/next/server";

export async function exampleAction() {
  // Add your logic here...

  after(async () => {
    await trackEvent("event_in_example_action", {
      // When running on Vercel passing the headers is not necessary.
      headers: await headers(),
    });
  });

  return { success: true };
}
```