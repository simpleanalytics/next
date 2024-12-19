import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next";

const nextConfig: NextConfig = withSimpleAnalytics({
  domain: process.env.VERCEL_PROJECT_PRODUCTION_URL!,
});

export default nextConfig;
