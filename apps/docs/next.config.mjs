import { createMDX } from 'fumadocs-mdx/next';
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
};

export default withSimpleAnalytics(withMDX(config));
