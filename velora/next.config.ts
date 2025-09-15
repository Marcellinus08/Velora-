import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
    // Opsional (boleh dihapus kalau pakai remotePatterns saja)
    // domains: ["lh3.googleusercontent.com", "images.unsplash.com"],
  },
};

export default nextConfig;
