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

function storageRedirects(bucket, prefixes) {
  if (!publicStorageBase || process.env.NODE_ENV !== "production") return [];

  return prefixes.map((prefix) => ({
    source: `/${prefix}/:path+`,
    destination: `${publicStorageBase}/${bucket}/${prefix}/:path+`,
    permanent: false,
  }));
}

function rootMediaRedirect() {
  if (!publicStorageBase || process.env.NODE_ENV !== "production") return [];

  return [{
    source: "/:file([^/]+\\.(?:avif|gif|jpe?g|mp4|pdf|png|svg|webm|webp))",
    destination: `${publicStorageBase}/site-media/root/:file`,
    permanent: false,
  }];
}

function storageFallbackRewrites(bucket, prefixes) {
  if (!publicStorageBase || process.env.NODE_ENV === "production") return [];

  return prefixes.map((prefix) => ({
    source: `/${prefix}/:path+`,
    destination: `${publicStorageBase}/${bucket}/${prefix}/:path+`,
  }));
}

function rootMediaFallbackRewrite() {
  if (!publicStorageBase || process.env.NODE_ENV === "production") return [];

  return [{
    source: "/:file([^/]+\\.(?:avif|gif|jpe?g|mp4|pdf|png|svg|webm|webp))",
    destination: `${publicStorageBase}/site-media/root/:file`,
  }];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/towngas-report/private": ["./private/towngas/*.docx"],
  },
  experimental: {
    // Default is 1mb; the recipe admin form uploads several photos per submission.
    serverActions: { bodySizeLimit: "25mb" },
  },
  async redirects() {
    return [
      ...storageRedirects("recipe-media", publicRecipeMediaPrefixes),
      ...storageRedirects("site-media", publicSiteMediaPrefixes),
      ...rootMediaRedirect(),
    ];
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
