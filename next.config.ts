import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "optcgapi.com",
      },
      {
        protocol: "https",
        hostname: "www.optcgapi.com",
      },
    ],
  },
};

export default nextConfig;
