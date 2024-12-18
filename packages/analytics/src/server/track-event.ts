import "server-only";
import type { AnalyticsEvent } from "../interfaces";

const SIMPLE_ANALYTICS_EVENTS_URL =
  "https://queue.simpleanalyticscdn.com/events";

export async function trackEvent(event: AnalyticsEvent) {
  await fetch(SIMPLE_ANALYTICS_EVENTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
}
