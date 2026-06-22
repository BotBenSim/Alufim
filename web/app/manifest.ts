import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alufim",
    short_name: "Alufim",
    description: "משחק חינוכי לילדים",
    start_url: "/Alufim/",
    display: "standalone",
    background_color: "#6FC3F7",
    theme_color: "#FFD12E",
    lang: "he",
    dir: "rtl",
    icons: [
      {
        src: "/Alufim/assets/ui/home-bottom.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
