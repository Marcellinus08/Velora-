// next.config.ts
import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).host : undefined;

const nextConfig: NextConfig = {
  // Allow production builds to succeed even if there are ESLint issues.
  // This does NOT affect local development; errors will still show in the editor and during `next lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      { 
        protocol: "https", 
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "abstract-assets.abs.xyz",
        pathname: "/**",
      },
      // Supabase storage - explicit hostname
      {
        protocol: "https" as const,
        hostname: "kpdfvndcstsoxmondwqv.supabase.co",
        pathname: "/**",
      },
      // Fallback pattern for Supabase storage (if hostname is different)
      ...(SUPABASE_HOST && SUPABASE_HOST !== "kpdfvndcstsoxmondwqv.supabase.co"
        ? [
            {
              protocol: "https" as const,
              hostname: SUPABASE_HOST,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
