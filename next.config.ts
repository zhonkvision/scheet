import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Allow MAL images to be loaded via next/image if ever needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
    ],
  },
};

export default nextConfig;
