/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "76.13.69.213",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.areis.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
