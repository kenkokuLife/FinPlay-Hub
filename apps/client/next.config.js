/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingRoot: process.cwd()
  },
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/games/:slug/",
        destination: "/games/:slug/index.html"
      }
    ];
  }
};

export default nextConfig;
