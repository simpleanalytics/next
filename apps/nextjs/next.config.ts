import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = withSimpleAnalytics({
  hostname: process.env.VERCEL_PROJECT_PRODUCTION_URL!,
});

export default nextConfig;
