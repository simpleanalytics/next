import "server-only";

import type { AnalyticsEvent, AnalyticsPageview } from "./interfaces";
import type { AnalyticsMetadata } from "../interfaces";

type ServerContext = { request: Request } | { headers: Headers };

type TrackEventOptions = {
  metadata?: AnalyticsMetadata;
  hostname?: string | undefined;
} & ServerContext;

export async function trackEvent(eventName: string, options: TrackEventOptions) {
  const headers = "request" in options ? options.request.headers : options.headers;

  const hostname = options.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  if (!hostname) {
    console.error("No hostname provided for Simple Analytics");
    return;
  }

  const payload: AnalyticsEvent = {
    type: "event",
    hostname,
    event: eventName,
    metadata: options.metadata,
    ua: headers.get("user-agent") ?? `ServerSide/1.0 (+${hostname})`,
  };

  const response = await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
      console.error(`Failed to track event: ${response.status}`, await response.json());
    }
    catch (error) {
      console.error(`Failed to track event: ${response.status}`);
    }
  }
}

type TrackPageviewOptions = {
  metadata?: AnalyticsMetadata;
  hostname?: string | undefined;
} & ServerContext;

export async function trackPageview(path: string, options: TrackPageviewOptions) {
  const headers = "request" in options ? options.request.headers : options.headers;

  const hostname = options.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

  if (!hostname) {
    console.error("No hostname provided for Simple Analytics");
    return;
  }

  const payload: AnalyticsPageview = {
    type: "pageview",
    hostname,
    event: "pageview",
    path,
    ua: headers.get("user-agent") ?? `ServerSide/1.0 (+${hostname})`,
  }

  const response = await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
      console.error(`Failed to track pageview: ${response.status}`, await response.json());
    }
    catch (error) {
      console.error(`Failed to track pageview: ${response.status}`);
    }
  }
}
