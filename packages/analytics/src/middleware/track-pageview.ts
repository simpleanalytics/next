import { parseHeaders } from "../server/headers";
import type {
  AnalyticsPageview,
  ServerContext,
  TrackingOptions,
} from "../server/interfaces";
import { isDoNotTrackEnabled, parseRequest } from "../server/utils";
import { parseUtmParameters } from "../server/utm";
import { isExistingRoute } from "./routes";

const PROXY_PATHS = /^\/(proxy\.js|auto-events\.js|simple\/.*)$/;

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

  if (isDoNotTrackEnabled(headers) && !options.collectDnt) {
    console.log("Do not track enabled, not tracking pageview");
    return;
  }

  if (
    PROXY_PATHS.test(path) ||
    (process.env.EXPERIMENTAL_ANALYTICS_MIDDLEWARE === "1" &&
      (await isExistingRoute(path)))
  ) {
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
