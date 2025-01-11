import type { NextConfig } from "next";

interface WithSimpleAnalyticsOptions {
  hostname?: string;
  nextConfig?: NextConfig;
}

export function withSimpleAnalytics(options: WithSimpleAnalyticsOptions): NextConfig {
  const hostname = options.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

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
  };

  return { ...options.nextConfig, ...nextAnalyticsConfig };
}
