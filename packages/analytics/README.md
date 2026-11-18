# Simple Analytics for Next.js

This package provides a simple way to add privacy-friendly pageview and event tracking using Simple Analytics to your Next.js application.

## Documentation

You can find the full documentation for this package at [simpleanalytics-next-docs.vercel.app](https://simpleanalytics-next-docs.vercel.app).

## Installation

To install the package, run:

```bash
npm i @simpleanalytics/next
```

## Usage

### Configure environment variables

You need to pass the website domain you have added to the [Simple Analytics dashboard](https://dashboard.simpleanalytics.com/) as an environment variable:

```txt
NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME=example.com
SIMPLE_ANALYTICS_HOSTNAME=example.com
```

### Update your Next.js config to enable client-side analytics

To enable client-side tracking and to ensure the Simple Analytics script you must add the Next.js plugin `withSimpleAnalytics` from `@simpleanalytics/next` in your Next.js config (`next.config.ts`):

```typescript
import { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = {
  /* the rest of your Next.js config */
};

export default withSimpleAnalytics(nextConfig);
```

### Include the analytics script

The client-side analytics component, `SimpleAnalytics`, imports the Simple Analytics tracking script:

```tsx
import { SimpleAnalytics } from "@simpleanalytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SimpleAnalytics />
      </body>
    </html>
  );
}
```

### Tracking events

#### Usage in client components

To start tracking programmatically tracking events in client components use the `trackEvent` function.
This requires the `<SimpleAnalytics />` component to be present on the page or layout.

```tsx
"use client";

import { trackEvent } from "@simpleanalytics/next";
import { useState } from "react";

export default function Page() {
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

#### Usage in Server Actions

To track events in server actions, use the `trackEvent` function from `@simpleanalytics/next/server`.
This function requires you to pass the request headers that can be obtained using `headers`.

```typescript
"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { trackEvent } from "@simpleanalytics/next/server";

export async function exampleAction() {
  // Add your logic here...

  after(async () => {
    await trackEvent("event_in_example_action", {
      headers: await headers(),
    });
  });

  return { success: true };
}
```

### Server-side collection (beta)

AI agents and robots request your pages without running the script, so the script cannot count them. With server-side collection, `trackRequest` reports each page request your Next.js server receives to Simple Analytics, which decides whether an AI agent, a robot or a person made it. Requests from people are discarded, because the script already counts them.

AI agents appear in your reports and count toward your usage. Robots stay hidden by default and do not count toward your usage. The beta covers how we classify and show this data.

#### Set it up with an AI agent

Using Claude Code, Codex, Cursor or another AI agent? Ask it, with your website's hostname in Simple Analytics instead of `example.com`:

```txt
Set up Simple Analytics server-side collection for example.com, follow https://docs.simpleanalytics.com/server-side-collection.md
```

The guide has the agent use `trackRequest` from this package and test the setup without storing anything.

#### Set it up yourself

Server-side collection is off until you turn it on. Set these environment variables for your production deployment, and remove the second one to turn it off again:

```txt
SIMPLE_ANALYTICS_HOSTNAME=example.com
SIMPLE_ANALYTICS_SERVER_SIDE_COLLECTION=1
```

Then call `trackRequest` in `proxy.ts` (`middleware.ts` before Next.js 16), next to your project's `app` or `pages` folder. If the file already exists, add the `event.waitUntil` line to the top of its function.

```typescript
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { trackRequest } from "@simpleanalytics/next/server";

// Before Next.js 16: name the file middleware.ts and the function middleware.
export function proxy(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(trackRequest({ request }));

  return NextResponse.next();
}
```

`event.waitUntil` lets the page respond without waiting for the report. If your file has a `matcher`, make sure it matches every page you want counted.

See [server-side collection](https://simpleanalytics-next-docs.vercel.app/docs/server-side-collection) in the documentation for what it reports, all options and how to check your setup with test mode.
