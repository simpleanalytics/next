import "server-only";

import { headers } from "next/headers";
import { AnalyticsEventMetadata } from "../interfaces";
import { trackEvent } from "./track-event";
import { trackPageview } from "./track-pageview";

interface SimpleAnalyticsClientOptions {
  hostname: string;
}

const SIMPLE_ANALYTICS_EVENTS_URL =
  "https://queue.simpleanalyticscdn.com/events";

class SimpleAnalyticsClient {
  constructor(private readonly options: SimpleAnalyticsClientOptions) {}

  async trackEvent(eventName: string, params?: AnalyticsEventMetadata) {
    const ua = (await headers()).get("user-agent") || "";

    return trackEvent({
      type: "event",
      hostname: this.options.hostname,
      event: eventName,
      metadata: params,
      ua,
    });
  }

  async trackPageview(path: string) {
    const headerList = await headers();
    const ua = headerList.get("user-agent") || "";
    const referrer = headerList.get("referrer") || "";

    return trackPageview({
      type: "pageview",
      hostname: this.options.hostname,
      path,
      ref: referrer,
      ua,
    });
  }
}

export function simpleAnalytics(options: SimpleAnalyticsClientOptions) {
  return new SimpleAnalyticsClient(options);
}
