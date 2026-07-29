import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  // Vercel (and most static/edge hosts) don't add security response
  // headers by default - the equivalent hardening already exists for the
  // API in train-db's SecurityHeadersFilter, but that only covers JSON
  // responses from the backend, not the actual HTML/JS this app serves.
  // Applied to every route (matcher: '/(.*)') since there's no reason any
  // page here should ever be framed or leak a full referrer.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
