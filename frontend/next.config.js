/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "76.13.69.213",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.areis.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.areis.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
