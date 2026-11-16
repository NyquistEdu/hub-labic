import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/simulador-p3dx", destination: "/simulador-p3dx/index.html" },
      { source: "/simulador-p3dx/guia", destination: "/simulador-p3dx/guia.html" },
    ];
  },
};

export default nextConfig;
