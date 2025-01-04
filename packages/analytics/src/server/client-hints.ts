import type { IgnoredMetrics } from "./interfaces";

export function parseViewportWidth(headers: Headers) {
  return headers.get("Sec-CH-Viewport-Width") ?? headers.get("Viewport-Width");
}

export function parseViewportHeight(headers: Headers) {
  return headers.get("Sec-CH-Viewport-Height") ?? headers.get("Viewport-Height");
}

export function parseLanguage(headers: Headers) {
  return headers.get("Sec-CH-Lang") ?? headers.get("Lang");
}

export function collectFromHeaders(headers: Headers, ignoredMetrics: IgnoredMetrics) {
  return {
    viewport_width: !ignoredMetrics.viewportSize ? parseViewportWidth(headers) : undefined,
    viewport_height: !ignoredMetrics.viewportSize ? parseViewportHeight(headers) : undefined,

    language: !ignoredMetrics.language ? parseLanguage(headers) : undefined,
  }
}
