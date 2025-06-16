"use client";

import * as React from "react";
import Script from "next/script";
import type { AnalyticsMetadata } from "../interfaces";
import { parseDataProps } from "./utils";

export interface SimpleAnalyticsProps {
  autoCollect?: boolean;
  collectDnt?: boolean;
  hostname?: string;
  mode?: "dash";
  ignoreMetrics?: {
    referrer?: boolean;
    utm?: boolean;
    country?: boolean;
    session?: boolean;
    timeonpage?: boolean;
    scrolled?: boolean;
    useragent?: boolean;
    screensize?: boolean;
    viewportsize?: boolean;
    language?: boolean;
  };
  ignorePages?: string[];
  allowParams?: string[];
  nonUniqueParams?: string[];
  strictUtm?: boolean;
}

export const SimpleAnalytics = (props: SimpleAnalyticsProps) => {
  const dataProps = parseDataProps(props);

  return (
    <React.Suspense fallback={null}>
      <Script {...dataProps} src="/proxy.js" />
    </React.Suspense>
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
