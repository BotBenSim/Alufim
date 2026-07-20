export const tokens = {
  colors: {
    brand: "#FFD12E",
    brandDark: "#E69A00",
    sky: "#6FC3F7",
    skyMid: "#A8DCFB",
    skyLight: "#D9F1FF",
    ground: "#8FD957",
    groundMid: "#6FC23E",
    groundDark: "#57AC2C",
    heading: "#1D4E7A",
    panelText: "#1D4E7A",
  },
  radii: {
    card: "28px",
    panel: "30px",
  },
  shadows: {
    card: "0 8px 24px rgba(0,0,0,.12)",
    panel: "0 18px 50px rgba(0,0,0,.3)",
  },
  font: {
    brand: "clamp(48px,12vw,86px)",
    card: "clamp(22px,4vw,34px)",
  },
  motion: {
    evoStep: 340,
    cardPop: 350,
  },
  xpGainColors: [
    "#4DABF7",
    "#38D9A9",
    "#94D82D",
    "#FFD43B",
    "#FF922B",
    "#FF6B6B",
    "#E03131",
  ] as const,
  confettiColors: [
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#B388EB",
    "#FF8AD8",
    "#FFA94D",
  ] as const,
} as const;

import type { CSSProperties } from "react";

export type CharacterTheme = {
  sky: string;
  ground: string;
  accent: string;
};

export function characterThemeVars(theme: CharacterTheme): CSSProperties {
  return {
    ["--char-sky" as string]: theme.sky,
    ["--char-ground" as string]: theme.ground,
    ["--char-accent" as string]: theme.accent,
  };
}
