"use client";

import React, { Suspense } from "react";
import Script from "next/script";
import type { AnalyticsSettings, AnalyticsMetadata } from "../interfaces";

function parseDataProps(settings?: AnalyticsSettings) {
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

interface SimpleAnalyticsProps {
  settings?: AnalyticsSettings;
}

export const SimpleAnalytics = (props: SimpleAnalyticsProps) => {
  const dataProps = parseDataProps(props.settings);

  return (
    <Suspense fallback={null}>
      <Script {...dataProps} src="/proxy.js" />
    </Suspense>
  );
};

export function trackEvent(eventName: string, params?: AnalyticsMetadata) {
  // Disable tracking on during SSR
  if (typeof window === "undefined" || !window.sa_event) {
    return;
  }

  return window.sa_event(eventName, params);
}

export function trackPageview(path: string, params?: AnalyticsMetadata) {
  // Disable tracking on during SSR
  if (typeof window === "undefined" || !window.sa_pageview) {
    return;
  }

  return window.sa_pageview(path, params);
}
