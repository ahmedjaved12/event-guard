import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["freeimage.host", "localhost"], // 👈 add all external image hosts here
  },
};

export default nextConfig;
