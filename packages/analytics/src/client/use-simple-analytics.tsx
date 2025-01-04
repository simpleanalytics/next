import { useCallback } from "react";
import type { AnalyticsMetadata } from "../interfaces";

interface UseSimpleAnalyticsResult {
  trackEvent: (eventName: string, params?: AnalyticsEventMetadata) => void;
  trackPageview: (path: string) => void;
}

export const useSimpleAnalytics = (): UseSimpleAnalyticsResult => {
  const trackEvent = useCallback(
    (eventName: string, params?: AnalyticsMetadata) => {
      // Disable tracking on during SSR
      if (typeof window === "undefined" || !window.sa_event) {
        return;
      }

      return window.sa_event(eventName, params);
    },
    [],
  );

  const trackPageview = useCallback((path: string, params?: AnalyticsMetadata) => {
    // Disable tracking on during SSR
    if (typeof window === "undefined" || !window.sa_pageview) {
      return;
    }

    return window.sa_pageview(path, params);
  }, []);

  return { trackEvent, trackPageview };
};
