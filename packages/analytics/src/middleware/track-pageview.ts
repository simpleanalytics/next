import { parseHeaders } from "../server/headers";
import type {
  AnalyticsPageview,
  ServerContext,
  TrackingOptions,
} from "../server/interfaces";
import { isBuildTime, isDoNotTrackEnabled, isProduction, parseRequest, isEnhancedBotDetectionEnabled } from "../server/utils";
import { parseUtmParameters } from "../server/utm";
import { isIndexedRoute } from "./routes";

type TrackPageviewOptions = TrackingOptions & ServerContext;

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

  const { path, searchParams } =
    "path" in options ? options : parseRequest(options.request);
  const headers =
    "headers" in options ? options.headers : options.request.headers;

  // We don't record non-navigation requests
  if (headers.get("Sec-Fetch-Mode") !== "navigate") {
    return;
  }

  if (isDoNotTrackEnabled(headers) && !options.collectDnt) {
    console.log("Do not track enabled, not tracking pageview");
    return;
  }

  if (isBuildTime()) {
    return;
  }

  if (!isProduction()) {
    console.log("Simple Analytics is disabled by default in development and preview environments, enable it by setting ENABLE_ANALYTICS_IN_DEV=1 in your environment");
    return;
  }

  if (!(await isIndexedRoute(path))) {
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

  const response = await fetch("https://queue.simpleanalyticscdn.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers.has("X-Forwarded-For") && isEnhancedBotDetectionEnabled(options) && { "X-Forwarded-For": headers.get("X-Forwarded-For")! }),
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
