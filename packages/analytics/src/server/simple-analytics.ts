import "server-only";

import type {
  AnalyticsEvent,
  AnalyticsPageview,
  TrackingOptions,
  HeaderOnlyContext,
  ServerContext,
} from "./interfaces";
import {
  isBuildTime,
  isProduction,
  isDoNotTrackEnabled,
  parseRequest,
  isEnhancedBotDetectionEnabled,
} from "./utils";
import { parseHeaders } from "./headers";
import { parseUtmParameters } from "./utm";

type TrackEventOptions = TrackingOptions & (ServerContext | HeaderOnlyContext);

export async function trackEvent(
  eventName: string,
  options: TrackEventOptions,
) {
  const hostname = options?.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  if (!hostname) {
    return;
  }

  const headers =
    "request" in options ? options.request.headers : options.headers;

  if (isDoNotTrackEnabled(headers) && !options.collectDnt) {
    return;
  }

  const payload: AnalyticsEvent = {
    type: "event",
    hostname,
    event: eventName,
    metadata: options.metadata,
    ...parseHeaders(headers, options.ignoreMetrics),
  };

  if (isBuildTime() || !isProduction()) {
    return;
  }

  // Only show a warning in production.
  if (!hostname) {
    console.log("No hostname provided for Simple Analytics, event not tracked");
    return;
  }

  const response = await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers.has("X-Forwarded-For") &&
        isEnhancedBotDetectionEnabled(options) && {
          "X-Forwarded-For": headers.get("X-Forwarded-For")!,
        }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
      console.error(
        `Failed to track event: ${response.status}`,
        await response.json(),
      );
    } catch (error) {
      console.error(`Failed to track event: ${response.status}`);
    }
  }
}

const PROXY_PATHS = /^\/(proxy\.js|auto-events\.js|simple\/.*)$/;

type TrackPageviewOptions = TrackingOptions & ServerContext;

export async function trackPageview(options: TrackPageviewOptions) {
  const hostname = options?.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  if (!hostname) {
    return;
  }

  // We don't record non-GET requests
  if ("request" in options && options.request.method !== "GET") {
    return;
  }

  const { path, searchParams } =
    "path" in options ? options : parseRequest(options.request);
  const headers =
    "headers" in options ? options.headers : options.request.headers;

  // We don't record non-navigation requests
  if (headers.get("Sec-Fetch-Mode") !== "navigate") {
    return;
  }

  if (isDoNotTrackEnabled(headers) && !options.collectDnt) {
    return;
  }

  if (PROXY_PATHS.test(path)) {
    return;
  }

  const payload: AnalyticsPageview = {
    type: "pageview",
    hostname,
    event: "pageview",
    path,
    ...parseHeaders(headers, options.ignoreMetrics),
    ...(searchParams && !options.ignoreMetrics?.utm
      ? parseUtmParameters(searchParams, {
          strictUtm: options.strictUtm ?? true,
        })
      : {}),
  };

  if (isBuildTime() || !isProduction()) {
    return;
  }

  // Only show a warning in production.
  if (!hostname) {
    console.log(
      "No hostname provided for Simple Analytics, pageview not tracked",
    );
    return;
  }

  const response = await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers.has("X-Forwarded-For") &&
        isEnhancedBotDetectionEnabled(options) && {
          "X-Forwarded-For": headers.get("X-Forwarded-For")!,
        }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
      console.error(
        `Failed to track pageview: ${response.status}`,
        await response.json(),
      );
    } catch (error) {
      console.error(`Failed to track pageview: ${response.status}`);
    }
  }
}
