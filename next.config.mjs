/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify specific optimizations
  trailingSlash: false,
  
  // Image optimization for Netlify
  images: {
    domains: ['sutswaikdcssfgzsvczk.supabase.co'],
    unoptimized: false, // Netlify supports image optimization
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
