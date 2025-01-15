import type { NextConfig } from "next";

interface ClientHints {
  viewport?: boolean;
  language?: boolean;
}

function parseClientHints(clientHints?: ClientHints) {
  const values: string[] = [];

  if (clientHints?.viewport !== false) {
    values.push("Viewport-Width", "Viewport-Height");
  }

  if (clientHints?.language !== false) {
    values.push("Lang");
  }

  if (values.length === 0) {
    return undefined;
  }

  return values.join(", ");
}

interface WithSimpleAnalyticsOptions {
  hostname?: string;
  clientHints?: ClientHints;
  nextConfig?: NextConfig;
}

export function withSimpleAnalytics(options: WithSimpleAnalyticsOptions): NextConfig {
  const hostname = options.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  const clientHints = parseClientHints(options.clientHints);

  const nextAnalyticsConfig: NextConfig = {
    async rewrites() {
      return [
        {
          source: "/proxy.js",
          destination: `https://simpleanalyticsexternal.com/proxy.js?hostname=${hostname}&path=/simple`,
        },
        {
          source: "/auto-events.js",
          destination: "https://scripts.simpleanalyticscdn.com/auto-events.js",
        },
        {
          source: "/simple/:match*",
          destination: "https://queue.simpleanalyticscdn.com/:match*",
        },
      ];
    },
    ...(clientHints ? {
      async headers() {
        return [
          {
            source: "/",
            headers: [
              {
                key: "Accept-CH",
                value: clientHints,
              },
            ],
          },
          {
            source: "/([^_].*)",
            headers: [
              {
                key: "Accept-CH",
                value: clientHints,
              },
            ],
          },
        ]
      }
    } : {}),
  };

  return { ...options.nextConfig, ...nextAnalyticsConfig };
}
