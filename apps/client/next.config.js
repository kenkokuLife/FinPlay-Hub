/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingRoot: process.cwd()
  },
  trailingSlash: true
};

export default nextConfig;
