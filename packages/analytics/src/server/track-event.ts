import "server-only";
import type { AnalyticsEvent } from "../interfaces";

export async function trackEvent(event: AnalyticsEvent) {
  await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
}
