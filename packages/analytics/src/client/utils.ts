import type { SimpleAnalyticsProps } from "./simple-analytics";

export function parseDataProps(settings?: SimpleAnalyticsProps) {
  if (!process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME) {
    console.error("No hostname provided for Simple Analytics");
    return {};
  }

  if (!settings) {
    return {
      "data-hostname": process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME,
    };
  }

  const metrics = settings.ignoreMetrics
    ? Object.entries(settings.ignoreMetrics)
        .filter(([_, value]) => value)
        .map(([key]) => `${key}`)
        .join(",")
    : undefined;

  return {
    "data-auto-collect": settings.autoCollect,
    "data-collect-dnt": settings.collectDnt,
    "data-hostname":
      settings.hostname ?? process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME,
    "data-mode": settings.mode,
    "data-ignore-metrics": metrics === "" ? undefined : metrics,
    "data-ignore-pages": settings.ignorePages?.join(","),
    "data-allow-params": settings.allowParams?.join(","),
    "data-non-unique-params": settings.nonUniqueParams?.join(","),
    "data-strict-utm": settings.strictUtm,
  };
}
