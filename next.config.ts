import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Recommended by pdf-parse for Next.js/Vercel and other serverless hosts,
  // so its (and pdf.js's) worker/native files are bundled correctly for
  // server-side use instead of being processed as client-bundle code.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

export default nextConfig;
