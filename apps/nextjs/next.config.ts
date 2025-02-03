import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = {};

export default withSimpleAnalytics(nextConfig);
