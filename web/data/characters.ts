import { assetPath } from "@/lib/utils";
import type { ArtDescriptor } from "@/lib/types";

export function charArt(id: string, stage: number, fallback: string): ArtDescriptor {
  return {
    type: "image",
    src: assetPath(`assets/characters/${id}/${id}-${stage}.png`),
    fallback,
  };
}

export function transitionArtFor(charId: string, fromFormIdx: number): ArtDescriptor | null {
  const keys = ["t12", "t23", "t34"];
  if (fromFormIdx < 0 || fromFormIdx > 2) return null;
  return {
    type: "image",
    src: assetPath(`assets/characters/${charId}/${charId}-${keys[fromFormIdx]}.png`),
    fallback: "✨",
  };
}

export const CHARACTERS = [
  {
    id: "lion",
    he: "אריה",
    en: "Lion",
    forms: [charArt("lion", 1, "🥚"), charArt("lion", 2, "🦁"), charArt("lion", 3, "🦁"), charArt("lion", 4, "🦁")],
    sky: "#F6D58A",
    ground: "#C8923B",
    accent: "#E0892E",
    counts: "🐾",
    food: "🍖",
    reward: { title: "תפסו פקעת חוט", emoji: "🧶" },
    cheer: "שאגה ענקית!",
    starter: true,
  },
  {
    id: "dragon",
    he: "דרקון",
    en: "Dragon",
    forms: [charArt("dragon", 1, "🥚"), charArt("dragon", 2, "🦎"), charArt("dragon", 3, "🐊"), charArt("dragon", 4, "🐉")],
    sky: "#3B1A1A",
    ground: "#5A2A1A",
    accent: "#FF6B3D",
    counts: "🔥",
    food: "🔥",
    reward: { title: "תפסו להבות", emoji: "🔥" },
    cheer: "הדרקון נושף אש!",
    starter: true,
  },
  {
    id: "rabbit",
    he: "ארנב",
    en: "Rabbit",
    forms: [charArt("rabbit", 1, "🥚"), charArt("rabbit", 2, "🐰"), charArt("rabbit", 3, "🐰"), charArt("rabbit", 4, "🐰")],
    sky: "#F9C8E8",
    ground: "#FFC8E6",
    accent: "#F783AC",
    counts: "💖",
    food: "🥕",
    reward: { title: "תפסו כוכבים", emoji: "⭐" },
    cheer: "קפיצה מגניבה!",
    starter: true,
  },
  {
    id: "shark",
    he: "כריש",
    en: "Shark",
    forms: [charArt("shark", 1, "🥚"), charArt("shark", 2, "🦈"), charArt("shark", 3, "🦈"), charArt("shark", 4, "🦈")],
    sky: "#2E86C1",
    ground: "#1B4F72",
    accent: "#5DADE2",
    counts: "🐠",
    food: "🦐",
    reward: { title: "תפסו דגים", emoji: "🐠" },
    cheer: "שְפְּלַאש! התחזקת!",
    starter: true,
  },
  {
    id: "turtle",
    he: "צב",
    en: "Turtle",
    forms: [charArt("turtle", 1, "🥚"), charArt("turtle", 2, "🐢"), charArt("turtle", 3, "🐢"), charArt("turtle", 4, "🐢")],
    sky: "#BFE9FF",
    ground: "#8FBF6A",
    accent: "#4CAF50",
    counts: "🍃",
    food: "🌿",
    reward: { title: "תפסו טיפות", emoji: "💧" },
    cheer: "צמחת חזק!",
    starter: true,
  },
] as const;

export type CharacterId = (typeof CHARACTERS)[number]["id"];

export function characterById(id: string) {
  return CHARACTERS.find((c) => c.id === id) ?? null;
}

export function characterIndex(id: string) {
  return CHARACTERS.findIndex((c) => c.id === id);
}

export function normArt(a: ArtDescriptor | string): ArtDescriptor {
  return typeof a === "string" ? { type: "emoji", value: a } : a;
}

export function artText(art: ArtDescriptor | string): string {
  const a = normArt(art);
  return a.type === "emoji" ? a.value : a.fallback || "⭐";
}
