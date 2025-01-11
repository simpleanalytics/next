export type AnalyticsMetadata =
  | Record<string, string | boolean | number | Date>
  | undefined;

export interface AnalyticsSettings {
  collectDnt?: boolean | undefined;
  hostname?: string | undefined;
  mode?: "dash" | undefined;
  ignoreMetrics?:
    | {
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
      }
    | undefined;
  ignorePages?: string[] | undefined;
  allowParams?: string[] | undefined;
  nonUniqueParams?: string[] | undefined;
  strictUtm?: boolean | undefined;
}
