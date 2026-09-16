import type { NextConfig } from "next";

const { API_BASE_URL } = require("./config.js");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.170.251.47"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
