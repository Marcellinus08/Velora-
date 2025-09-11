import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'googleusercontent.com',
        port: '',
        pathname: '/profile/picture/**',
      },
    ],
    domains: ["lh3.googleusercontent.com"],
  },
};


export default nextConfig;
