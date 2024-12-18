export interface AnalyticsEvent {
  type: "event";
  hostname: string;
  event: string;
  metadata: Record<string, string | boolean | number | Date>;
  ua: string;

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

export type AnalyticsEventMetadata = AnalyticsEvent["metadata"];

export interface AnalyticsPageview {
  type: "pageview";
  hostname: string;
  path: string;
  ref: string;
  ua: string;
}

export interface AnalyticsSettings {
  collectDnt?: boolean | undefined;
  hostname?: string | undefined;
  mode?: "dash" | undefined;
  ignoreMetrics?: {
    referrer?: boolean | undefined;
    utm?: boolean | undefined;
    country?: boolean | undefined;
    session?: boolean | undefined;
    timeonpage?: boolean | undefined;
    scrolled?: boolean | undefined;
    useragent?: boolean | undefined;
    screensize?: boolean | undefined;
    viewportsize?: boolean | undefined;
    language?: boolean | undefined;
  } | undefined;
  ignorePages?: string[] | undefined;
  allowParams?: string[] | undefined;
  nonUniqueParams?: string[] | undefined;
  strictUtm?: boolean | undefined;
};