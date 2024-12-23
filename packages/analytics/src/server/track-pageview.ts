import "server-only";
import type { AnalyticsPageview } from "../interfaces";

export async function trackPageview(event: AnalyticsPageview) {
  await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
}
