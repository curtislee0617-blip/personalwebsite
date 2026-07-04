/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Default is 1mb; the recipe admin form uploads several photos per submission.
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
