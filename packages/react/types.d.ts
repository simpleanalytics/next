export {};

declare global {
  interface Window {
    sa_event?(
      s: string,
      params?: Record<string, string | boolean | number | Date>,
    ): void;
    sa_pageview?(
      s: string,
      params?: Record<string, string | boolean | number | Date>,
    ): void;
  }
}
