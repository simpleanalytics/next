"use client";

import * as React from "react";
import type { AnalyticsMetadata } from "../interfaces";
import { parseDataProps } from "./utils";

export interface SimpleAnalyticsProps {
  domain?: string;
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

function inject(props: SimpleAnalyticsProps) {
  if (typeof window === "undefined") {
    return;
  }

  if (document.getElementById("sa-script")) {
    return;
  }

  if (window.sa_event) {
    return;
  }

  const el = document.createElement("script");
  el.id = "sa-script";
  el.type = "text/javascript";
  el.async = true;
  el.src = props.domain
    ? `https://${props.domain}/latest.js`
    : "https://scripts.simpleanalyticscdn.com/latest.js";

  const dataProps = parseDataProps(props);

  for (const [key, value] of Object.entries(dataProps)) {
    if (value) {
      el.setAttribute(key, value);
    }
  }

  document.head.appendChild(el);
}

export const SimpleAnalytics = (props: SimpleAnalyticsProps) => {
  React.useEffect(() => {
    inject(props);
  }, [props]);

  return null;
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
