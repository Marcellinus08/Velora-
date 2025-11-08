// next.config.ts
import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).host : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "api.dicebear.com" },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      ...(SUPABASE_HOST
        ? [
            {
              protocol: "https",
              hostname: SUPABASE_HOST, // contoh: kpdfvndcsstsoxmondwqv.supabase.co
              pathname: "/storage/**", // /storage/v1/object/public/<bucket>/...
            } as const,
          ]
        : []),
    ],
  },
};

export default nextConfig;
