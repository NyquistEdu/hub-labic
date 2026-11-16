import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/simulador-p3dx", destination: "/simulador-p3dx/index.html" },
    ];
  },
};

export default nextConfig;
