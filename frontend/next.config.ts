import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5005",
      },
      {
        protocol: "https",
        hostname: "hnntugzgntibfwebuydd.supabase.co",
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
