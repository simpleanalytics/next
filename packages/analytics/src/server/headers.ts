import type { AnalyticsEvent, IgnoredMetrics } from "./interfaces";

export function parseViewportWidth(headers: Headers) {
  const width = headers.get("Sec-CH-Viewport-Width") ?? headers.get("Viewport-Width");

  return width ? Number.parseInt(width, 10) : undefined;
}

export function parseViewportHeight(headers: Headers) {
  const height = headers.get("Sec-CH-Viewport-Height") ?? headers.get("Viewport-Height");
  
  return height ? Number.parseInt(height, 10) : undefined;
}

export function parseLanguage(headers: Headers) {
  return headers.get("Sec-CH-Lang") ?? headers.get("Lang") ?? undefined;
}

export function parseTimezone(headers: Headers) {
  return headers.get("X-Vercel-IP-Timezone") ?? headers.get("CloudFront-Viewer-Time-Zone") ?? undefined;
}

export function parseUserAgent(headers: Headers) {
  return headers.get("User-Agent") ?? "";
}

export function parseHeaders(headers: Headers, ignoredMetrics: IgnoredMetrics) {
  return {
    ua: !ignoredMetrics.userAgent ? parseUserAgent(headers) : "",

    viewport_width: !ignoredMetrics.viewportSize ? parseViewportWidth(headers) : undefined,
    viewport_height: !ignoredMetrics.viewportSize ? parseViewportHeight(headers) : undefined,

    language: !ignoredMetrics.language ? parseLanguage(headers) : undefined,
    timezone: !ignoredMetrics.timezone ? parseTimezone(headers) : undefined,
  } satisfies Partial<AnalyticsEvent>;
}
