import "server-only";

import { buildRequestReport } from "./request-payload";
import { isBuildTime, isProduction } from "./utils";

const QUEUE_URL = "https://queue.simpleanalyticscdn.com/requests";
const TIMEOUT_MS = 2000;

export interface TrackRequestOptions {
  /** The incoming request in `proxy.ts` or `middleware.ts`. */
  request: Request;
  /** Defaults to the `SIMPLE_ANALYTICS_HOSTNAME` environment variable. */
  hostname?: string | undefined;
  /**
   * Turns server-side collection on or off. Defaults to the
   * `SIMPLE_ANALYTICS_SERVER_SIDE_COLLECTION` environment variable, which is
   * on when set to `1` or `true`. Off by default.
   */
  serverSideCollection?: boolean | undefined;
  /** Query parameters to report besides the UTM parameters and `ref`. */
  allowParams?: string[] | undefined;
  /**
   * Asks the queue to store nothing and prints its reply on the server
   * console. Defaults to the `SIMPLE_ANALYTICS_TEST_MODE` environment
   * variable, which is on when set to `1` or `true`.
   */
  testMode?: boolean | undefined;
}

function isOn(value: string | undefined) {
  return value === "1" || value === "true";
}

function logTestMode(message: string) {
  console.log(`Simple Analytics test mode: ${message}`);
}

/**
 * Reports a page request for server-side collection, so AI agents and robots
 * that do not run the script are counted. Call it from `proxy.ts` (or
 * `middleware.ts` before Next.js 16) with `event.waitUntil` so the page does
 * not wait for it. It never throws.
 */
export async function trackRequest(options: TrackRequestOptions) {
  const testMode =
    options.testMode ?? isOn(process.env.SIMPLE_ANALYTICS_TEST_MODE);

  try {
    const enabled =
      options.serverSideCollection ??
      isOn(process.env.SIMPLE_ANALYTICS_SERVER_SIDE_COLLECTION);

    if (!enabled) {
      if (testMode) {
        logTestMode(
          "server-side collection is off. Set SIMPLE_ANALYTICS_SERVER_SIDE_COLLECTION=1 to turn it on.",
        );
      }
      return;
    }

    const hostname = options.hostname ?? process.env.SIMPLE_ANALYTICS_HOSTNAME;

    if (!hostname) {
      if (testMode) {
        logTestMode(
          "no hostname. Set SIMPLE_ANALYTICS_HOSTNAME to the hostname of your website in Simple Analytics.",
        );
      }
      return;
    }

    // Outside test mode, only production deployments report requests.
    if (isBuildTime() || (!testMode && !isProduction())) {
      return;
    }

    const report = buildRequestReport(options.request, {
      hostname,
      allowParams: options.allowParams,
      test: testMode,
    });

    if (!report) {
      return;
    }

    // One attempt, abandoned after 2 seconds, including reading the reply.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(QUEUE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...report.headers },
        body: JSON.stringify(report.body),
        signal: controller.signal,
      });

      if (testMode) {
        logTestMode(
          [
            `sent ${JSON.stringify(report.body)}`,
            `with address headers ${JSON.stringify(report.headers)}`,
            `queue replied ${response.status}: ${await response.text()}`,
          ].join("\n"),
        );
      } else {
        await response.body?.cancel();
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    // A failed report never affects the page. Only test mode mentions it.
    if (testMode) {
      logTestMode(`the request was not reported: ${error}`);
    }
  }
}
