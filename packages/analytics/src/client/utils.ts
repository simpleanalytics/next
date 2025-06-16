import type { SimpleAnalyticsProps } from "./simple-analytics";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

export function isProduction() {
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV === "1") {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  if (!process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return true;
  }

  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

function isBuildTime() {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}

export function parseDataProps(settings?: SimpleAnalyticsProps) {
  if (!isProduction()) {
    return {};
  }

  // if (!process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME) {
  //   console.log("No hostname provided for Simple Analytics");
  //   return {};
  // }

  const metrics = settings?.ignoreMetrics
    ? Object.entries(settings.ignoreMetrics)
        .filter(([_, value]) => value)
        .map(([key]) => `${key}`)
        .join(",")
    : undefined;

  return {
    "data-auto-collect": settings?.autoCollect,
    "data-collect-dnt": settings?.collectDnt,
    "data-hostname":
      settings?.hostname ?? process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME,
    "data-mode": settings?.mode,
    "data-ignore-metrics": metrics === "" ? undefined : metrics,
    "data-ignore-pages": settings?.ignorePages?.join(","),
    "data-allow-params": settings?.allowParams?.join(","),
    "data-non-unique-params": settings?.nonUniqueParams?.join(","),
    "data-strict-utm": settings?.strictUtm,
  };
}
