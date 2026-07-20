import type { Config } from "tailwindcss";
import { tokens } from "./design-system/tokens";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./design-system/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: tokens.colors.brand,
        sky: tokens.colors.sky,
        "sky-mid": tokens.colors.skyMid,
        "sky-light": tokens.colors.skyLight,
        ground: tokens.colors.ground,
        "ground-dark": tokens.colors.groundDark,
        heading: tokens.colors.heading,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: tokens.radii.card,
        panel: tokens.radii.panel,
      },
      fontSize: {
        brand: tokens.font.brand,
        card: tokens.font.card,
      },
      boxShadow: {
        card: tokens.shadows.card,
        panel: tokens.shadows.panel,
      },
      keyframes: {
        skyDrift: {
          from: { transform: "translateX(-34vw)" },
          to: { transform: "translateX(120vw)" },
        },
        sunPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
        },
        evoPop: {
          "0%": { transform: "scale(.42)", opacity: "0" },
          "55%": { transform: "scale(1.14)", opacity: "1" },
          "78%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)" },
        },
        xpFloatUp: {
          "0%": { transform: "translateY(0) scale(.85)", opacity: "0" },
          "12%": { opacity: "1" },
          "100%": { transform: "translateY(-72px) scale(1.08)", opacity: "0" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        skyDrift: "skyDrift 46s linear infinite",
        sunPulse: "sunPulse 5s ease-in-out infinite",
        evoPop: "evoPop .85s cubic-bezier(.34,1.45,.64,1)",
        xpFloatUp: "xpFloatUp 1.4s ease-out forwards",
        confettiFall: "confettiFall 2.8s linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
