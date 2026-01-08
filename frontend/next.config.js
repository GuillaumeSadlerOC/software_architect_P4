const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();
const isDev = process.env.NODE_ENV === 'development';

// Extraction logic (CommonJS)
function getRemotePatterns() {
  const envDomains = process.env.ALLOWED_IMAGE_DOMAINS;
  if (!envDomains) return [];

  return envDomains.split(',')
    .map(d => d.trim())
    .filter(Boolean)
    .flatMap(domain => {
      // Aggressive cleaning
      const hostname = domain.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
      if (!hostname) return [];
      return [
        { protocol: 'https', hostname },
        { protocol: 'http', hostname }
      ];
    });
}

// Calculation of patterns
const remotePatterns = getRemotePatterns();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  images: {
    unoptimized: isDev,
    remotePatterns: remotePatterns,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    serverActions: {
      allowedOrigins: remotePatterns.map(p => p.hostname),
    },
  },
  
  logging: { fetches: { fullUrl: true } },
};

module.exports = withNextIntl(nextConfig);