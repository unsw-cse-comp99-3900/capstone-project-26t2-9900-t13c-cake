import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Smaller production image for Docker (CAKE-13 / client handover).
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
