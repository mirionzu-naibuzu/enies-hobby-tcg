import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "optcgapi.com",
      },
      {
        protocol: "https",
        hostname: "www.optcgapi.com",  // ← add this one
      },
    ],
  },
};

export default nextConfig;
