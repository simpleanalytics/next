import type { AnalyticsMetadata } from "../interfaces";

export interface AnalyticsEvent {
  type: "event";
  hostname: string;
  event: string;
  ua: string;
  path?: string | undefined;

  metadata?: AnalyticsMetadata;

  unique?: string | undefined;
  https?: boolean | undefined;

  viewport_width?: number | undefined;
  viewport_height?: number | undefined;
  screen_width?: number | undefined;
  screen_height?: number | undefined;

  language?: string | undefined;
  timezone?: string | undefined;

  source?: string | undefined;
  campaign?: string | undefined;
  medium?: string | undefined;
  content?: string | undefined;
}

export type AnalyticsPageview = Omit<AnalyticsEvent, "type" | "event"> &
  Required<Pick<AnalyticsEvent, "path">> & {
    type: "pageview";
    event: "pageview";
  };

export interface IgnoredMetrics {
  utm?: boolean | undefined;
  timezone?: boolean | undefined;
  userAgent?: boolean | undefined;
  viewportSize?: boolean | undefined;
  language?: boolean | undefined;
}

export type ServerContext = ServerContextWithRequest | ServerContextWithPath;

export type ServerContextWithRequest = { request: Request };

export type HeaderOnlyContext = { headers: Headers };

export type ServerContextWithPath = {
  path: string;
  headers: Headers;
  searchParams?: Record<string, string | string[] | undefined>;
};

export interface TrackingOptions {
  hostname?: string | undefined;
  strictUtm?: boolean | undefined;
  ignoreMetrics?: IgnoredMetrics | undefined;
  collectDnt?: boolean | undefined;
  metadata?: AnalyticsMetadata;
}
