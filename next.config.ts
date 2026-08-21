import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  // Only use standalone output for Docker builds (avoids ENOENT manifest errors on Vercel)
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Google product images used throughout app (product cards, cart thumbnails)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
      {
        // Avatars from Google OAuth
        protocol: 'https',
        hostname: 'lh3.google.com',
      },
    ],
  },
};


export default nextConfig;

