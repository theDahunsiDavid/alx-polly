import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Disable the Next.js development overlay and indicators
  experimental: {
    // This helps reduce development UI elements
  },
  // Additional configuration to minimize development UI
  typescript: {
    // Keep TypeScript checking but reduce UI noise
  },
};

export default nextConfig;
