const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const publicStorageBase = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public` : null;

const publicRecipeMediaPrefixes = [
  "recipes/instagram-saved",
  "recipes/pasta",
  "recipes/personal-import",
  "recipes/sushi",
  "recipes/viennoiserie",
  "recipes/youtube-saved",
];

const publicSiteMediaPrefixes = [
  "documents",
  "logos",
  "mobile-page-backgrounds",
  "photos",
  "project-documents",
  "project-pages",
  "project-previews",
];

function storageFallbackRewrites(bucket, prefixes) {
  if (!publicStorageBase) return [];

  return prefixes.map((prefix) => ({
    source: `/${prefix}/:path+`,
    destination: `${publicStorageBase}/${bucket}/${prefix}/:path+`,
  }));
}

function rootMediaFallbackRewrite() {
  if (!publicStorageBase) return [];

  return [{
    source: "/:file([^/]+\\.(?:avif|gif|jpe?g|mp4|pdf|png|svg|webm|webp))",
    destination: `${publicStorageBase}/site-media/root/:file`,
  }];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Keep image delivery off Vercel's transformation pipeline. Supabase
    // Storage images use the custom loader's render endpoint; other images
    // are served directly from their source URL.
    loader: "custom",
    loaderFile: "./lib/supabase-image-loader.ts",
  },
  outputFileTracingIncludes: {
    "/api/towngas-report/private": ["./private/towngas/*.docx"],
  },
  experimental: {
    // Default is 1mb; the recipe admin form uploads several photos per submission.
    serverActions: { bodySizeLimit: "25mb" },
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        ...storageFallbackRewrites("recipe-media", publicRecipeMediaPrefixes),
        ...storageFallbackRewrites("site-media", publicSiteMediaPrefixes),
        ...rootMediaFallbackRewrite(),
      ],
    };
  },
};

export default nextConfig;
