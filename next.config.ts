import type { NextConfig } from "next";

// Static export so the site can be hosted on GitHub Pages.
// The deploy workflow sets PAGES_BASE_PATH to "/Aniv-invitation".
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath }, // so photo URLs work on GitHub Pages too
  images: { unoptimized: true },
};

export default nextConfig;
