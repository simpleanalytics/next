import type { NextConfig } from "next";

interface ClientHints {
  viewport?: boolean;
  language?: boolean;
}

function parseClientHints(clientHints?: ClientHints) {
  const values: string[] = [];

  if (clientHints?.viewport !== false) {
    values.push(
      "Sec-CH-Viewport-Width",
      "Sec-CH-Viewport-Height",
      "Viewport-Width",
    );
  }

  if (clientHints?.language !== false) {
    values.push("Sec-CH-Lang", "Lang");
  }

  if (values.length === 0) {
    return undefined;
  }

  return values.join(", ");
}

interface WithSimpleAnalyticsOptions {
  hostname?: string;
  clientHints?: ClientHints;
}

export function withSimpleAnalytics(
  nextConfig: NextConfig,
  options?: WithSimpleAnalyticsOptions,
): NextConfig {
  const hostname = options?.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  const clientHints = parseClientHints(options?.clientHints);

  const nextAnalyticsConfig: NextConfig = {
    async rewrites() {
      const existingRewrites = await nextConfig.rewrites?.();

      const rewrites = [
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

      if (!existingRewrites) {
        return rewrites;
      }

      if (Array.isArray(existingRewrites)) {
        return existingRewrites.concat(rewrites);
      }

      return {
        beforeFiles: existingRewrites.beforeFiles,
        afterFiles: existingRewrites.afterFiles.concat(rewrites),
        fallback: existingRewrites.fallback,
      };
    },
    ...(clientHints
      ? {
          async headers() {
            const existingHeaders = await nextConfig?.headers?.();

            const headers = [
              {
                source: "/",
                headers: [
                  {
                    key: "Accept-CH",
                    value: clientHints,
                  },
                  {
                    key: "Vary",
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
                  {
                    key: "Vary",
                    value: clientHints,
                  },
                ],
              },
            ];

            if (!existingHeaders) {
              return headers;
            }

            return existingHeaders.concat(headers);
          },
        }
      : {}),
  };

  return { ...nextConfig, ...nextAnalyticsConfig };
}
