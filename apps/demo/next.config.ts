import type { NextConfig } from "next";

import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = withSimpleAnalytics({
  domain: process.env.VERCEL_URL!,
});

export default nextConfig;
