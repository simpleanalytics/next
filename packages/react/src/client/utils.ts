import type { SimpleAnalyticsProps } from "./simple-analytics";

export function parseDataProps(settings?: SimpleAnalyticsProps) {
  const metrics = settings?.ignoreMetrics
    ? Object.entries(settings.ignoreMetrics)
        .filter(([_, value]) => value)
        .map(([key]) => `${key}`)
        .join(",")
    : undefined;

  return {
    "data-auto-collect":
      settings?.autoCollect !== undefined
        ? settings.autoCollect
          ? "true"
          : "false"
        : undefined,
    "data-collect-dnt":
      settings?.collectDnt !== undefined
        ? settings.collectDnt
          ? "true"
          : "false"
        : undefined,
    "data-hostname": settings?.hostname,
    "data-mode": settings?.mode,
    "data-ignore-metrics": metrics === "" ? undefined : metrics,
    "data-ignore-pages": settings?.ignorePages?.join(","),
    "data-allow-params": settings?.allowParams?.join(","),
    "data-non-unique-params": settings?.nonUniqueParams?.join(","),
    "data-strict-utm":
      settings?.strictUtm !== undefined
        ? settings.strictUtm
          ? "true"
          : "false"
        : undefined,
  };
}
