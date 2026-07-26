import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Prisma non va bundlato: gira solo lato server.
  serverExternalPackages: ['@prisma/client', 'nodemailer'],
  images: {
    // Le foto reali non ci sono ancora: quando arriveranno basta puntare qui il
    // dominio dello storage (S3/CDN) senza toccare i componenti.
    remotePatterns: [],
  },
};

export default nextConfig;
