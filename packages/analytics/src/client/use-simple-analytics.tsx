import { useCallback } from "react";
import type { AnalyticsEventMetadata } from "../interfaces";

interface UseSimpleAnalyticsProps {}

interface UseSimpleAnalyticsResult {
  trackEvent: (eventName: string, params?: AnalyticsEventMetadata) => void;
  trackPageview: (path: string) => void;
}

export const useSimpleAnalytics = (
  props: UseSimpleAnalyticsProps,
): UseSimpleAnalyticsResult => {
  const trackEvent = useCallback(
    (eventName: string, params?: AnalyticsEventMetadata) => {
      // Disable tracking on during SSR
      if (typeof window === "undefined" || !window.sa_event) {
        return;
      }

      return window.sa_event(eventName, params);
    },
    [],
  );

  const trackPageview = useCallback((path: string) => {
    // Disable tracking on during SSR
    if (typeof window === "undefined" || !window.sa_pageview) {
      return;
    }

    return window.sa_pageview(path);
  }, []);

  return { trackEvent, trackPageview };
};
