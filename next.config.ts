import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  trailingSlash: true,
  // Keep nodejs-dna and its SOAP dependencies out of the webpack bundle
  serverExternalPackages: ['nodejs-dna', 'strong-soap', 'strong-globalize', 'globalize'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  // Skip TS check during cloud builds (verified locally, cloud OOMs on 94 strong-soap deps)
  typescript: { ignoreBuildErrors: true },
  // SEO & Performance
  compress: true,
  poweredByHeader: false,
  
  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/order-now',
        destination: '/menu',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
