import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** GitHub Pages project URL path; PR staging uses /Alufim/pr/<n>. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/Alufim";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default withSerwist(nextConfig);
