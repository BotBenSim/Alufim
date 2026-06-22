import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
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
