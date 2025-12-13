import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  // Ensure compatibility with Netlify
  output: "standalone",
};

export default nextConfig;
