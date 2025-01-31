import "server-only";

import { AnalyticsEvent, AnalyticsPageview, HeaderOnlyContext, ServerContext } from "./interfaces";
import type { AnalyticsMetadata } from "../interfaces";
import { isDoNotTrackEnabled, parseRequest } from "./utils";
import { parseHeaders } from "./headers";
import { parseUtmParameters } from "./utm";

type TrackEventOptions = {
  hostname?: string | undefined;
  collectDnt?: boolean | undefined;
  metadata?: AnalyticsMetadata;
} & (ServerContext | HeaderOnlyContext);

export async function trackEvent(
  eventName: string,
  options: TrackEventOptions,
) {
  const hostname = options.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  if (!hostname) {
    console.error("No hostname provided for Simple Analytics");
    return;
  }

  const headers = "request" in options ? options.request.headers : options.headers;

  if (isDoNotTrackEnabled(headers) && !options.collectDnt) {
    console.log("Do not track enabled, not tracking event");
    return;
  }

  const payload: AnalyticsEvent = {
    type: "event",
    hostname,
    event: eventName,
    metadata: options.metadata,
    ...(parseHeaders(headers, {})),
  };

  console.log("Tracking event", payload);

  const response = await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

type TrackPageviewOptions = {
  hostname?: string | undefined;
  metadata?: AnalyticsMetadata;
  collectDnt?: boolean | undefined;
} & ServerContext;

export async function trackPageview(options: TrackPageviewOptions) {
  const hostname = options.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  if (!hostname) {
    console.error("No hostname provided for Simple Analytics");
    return;
  }

  // We don't record non-GET requests
  if ("request" in options && options.request.method !== "GET") {
    return;
  }

  const { path, searchParams } = "path" in options ? options : parseRequest(options.request);
  const headers = "headers" in options ? options.headers : options.request.headers;

  if (isDoNotTrackEnabled(headers) && !options.collectDnt) {
    console.log("Do not track enabled, not tracking pageview");
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
    ...(parseHeaders(headers, {})),
    ...(searchParams ? parseUtmParameters(searchParams, { strictUtm: false }) : {}),
  };

  console.log("Tracking pageview", payload);

  const response = await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
