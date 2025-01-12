import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { SimpleAnalyticsLogo } from "@/components/simple-analytics-logo";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <SimpleAnalyticsLogo className="size-3" />
        <div>
          <span className="font-space-grotesk">Simple Analytics</span> for Next.js
        </div>
      </>
    ),
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
  ],
};
