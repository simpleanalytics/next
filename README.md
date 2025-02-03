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
