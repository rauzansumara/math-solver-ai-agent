import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse"], // Ensure pdf-parse is handled correctly
};

export default nextConfig;
