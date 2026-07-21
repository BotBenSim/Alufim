import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/Alufim";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alufim",
    short_name: "Alufim",
    description: "משחק חינוכי לילדים",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#6FC3F7",
    theme_color: "#FFD12E",
    lang: "he",
    dir: "rtl",
    icons: [
      {
        src: `${basePath}/assets/ui/home-bottom.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
