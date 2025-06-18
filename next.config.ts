import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: "export" for Vercel deployment
  // output: "export", // Only use this for static hosting

  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Optional: Add rewrites for API proxy (if needed)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },

  /* config options here */
};

export default nextConfig;