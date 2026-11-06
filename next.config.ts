import type { NextConfig } from "next";

const LIVE_SITE = "https://happy-1st-anniversary-mylove.pages.dev";
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = isDev
  ? {
      // `npm run dev`: the polaroid photo API only runs on Cloudflare,
      // so forward /api calls to the live site while testing locally.
      async rewrites() {
        return [{ source: "/api/:path*", destination: `${LIVE_SITE}/api/:path*` }];
      },
    }
  : {
      // `npm run build` / deploy: plain static files for Cloudflare Pages
      output: "export",
      images: { unoptimized: true },
    };

export default nextConfig;
