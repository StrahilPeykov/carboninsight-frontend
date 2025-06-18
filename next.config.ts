import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: "export" for Vercel deployment
  // output: "export", // Only use this for static hosting

  images: {
    unoptimized: true,
  },

  // Environment variables - will be set in Vercel dashboard
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Optional: Add rewrites for API proxy (if needed)
  async rewrites() {
    // Only add rewrites if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },

  // Optimizations for production
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Production headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;