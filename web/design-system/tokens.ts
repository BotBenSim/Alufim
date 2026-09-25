/*
  Colours for the UI live in the theme (app/globals.css: theme-alufim from the
  shared @kids registry, plus Alufim-only tokens). These are illustration
  colours for effects, not UI.
*/
export const tokens = {
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
