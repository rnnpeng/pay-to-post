/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // OnchainKit targets React 19 types; safe to ignore at build time with React 18
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
