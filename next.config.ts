import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/painel-cepedi/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/painel-cepedi", destination: "/painel-cepedi/index.html" },
      { source: "/simulador-p3dx", destination: "/simulador-p3dx/index.html" },
      { source: "/simulador-p3dx/guia", destination: "/simulador-p3dx/guia.html" },
      { source: "/simulador-manipuladores", destination: "/simulador-manipuladores/index.html" },
    ];
  },
};

export default nextConfig;
