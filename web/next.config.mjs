import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Voice clips are cached as they are played (app/sw.ts), not all at install.
  globPublicPatterns: ["*", "!(audio)/**/*"],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Alufim",
  assetPrefix: "/Alufim",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default withSerwist(nextConfig);
