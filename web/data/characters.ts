import { assetPath } from "@/lib/utils";
import type { ArtDescriptor, CharacterDef } from "@/lib/types";

export function charArt(id: string, stage: number, fallback: string): ArtDescriptor {
  return {
    type: "image",
    src: assetPath(`assets/characters/${id}/${id}-${stage}.png`),
    fallback,
  };
}

/** Transitions between living forms (stages 2→3 and 3→4). Egg stage removed. */
export function transitionArtFor(charId: string, fromFormIdx: number): ArtDescriptor | null {
  const keys = ["t23", "t34"];
  if (fromFormIdx < 0 || fromFormIdx >= keys.length) return null;
  return {
    type: "image",
    src: assetPath(`assets/characters/${charId}/${charId}-${keys[fromFormIdx]}.png`),
    fallback: "✨",
  };
}

/** Forms start at living baby (asset stage 2) — no egg. */
export const CHARACTERS = [
  {
    id: "lion",
    he: "אריה",
    en: "Lion",
    forms: [charArt("lion", 2, "🦁"), charArt("lion", 3, "🦁"), charArt("lion", 4, "🦁")],
    sky: "#F6D58A",
    ground: "#C8923B",
    accent: "#E0892E",
    // Single clear mark — 🐾 reads as two prints and confuses counting
    counts: "🦁",
    food: "🍖",
    reward: { title: "תפסו פקעת חוט", emoji: "🧶" },
    cheer: "שאגה ענקית!",
    starter: true,
  },
  {
    id: "dragon",
    he: "דרקון",
    en: "Dragon",
    forms: [charArt("dragon", 2, "🦎"), charArt("dragon", 3, "🐊"), charArt("dragon", 4, "🐉")],
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
    forms: [charArt("rabbit", 2, "🐰"), charArt("rabbit", 3, "🐰"), charArt("rabbit", 4, "🐰")],
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
    forms: [charArt("shark", 2, "🦈"), charArt("shark", 3, "🦈"), charArt("shark", 4, "🦈")],
    sky: "#2E86C1",
    ground: "#1B4F72",
    accent: "#5DADE2",
    counts: "🐠",
    food: "🦐",
    reward: { title: "תפסו דגים", emoji: "🐠" },
    cheer: "גל ענק!",
    starter: true,
  },
  {
    id: "turtle",
    he: "צב",
    en: "Turtle",
    forms: [charArt("turtle", 2, "🐢"), charArt("turtle", 3, "🐢"), charArt("turtle", 4, "🐢")],
    sky: "#BFE9FF",
    ground: "#8FBF6A",
    accent: "#4CAF50",
    // 🍃 often draws as several leaves — bad for one-to-one counting
    counts: "🐢",
    food: "🌿",
    reward: { title: "תפסו טיפות", emoji: "💧" },
    cheer: "שריון חזק!",
    starter: true,
  },
] as const;

/** Spoken + on-screen line when a form unlocks — e.g. "שאגה ענקית, עכשיו יש לך אריה גיבור!" */
export function evolveCelebrateLine(
  character: Pick<CharacterDef, "he" | "cheer" | "forms">,
  formIdx: number
): string {
  const opener = character.cheer.replace(/[!]+$/u, "").trim();
  // Mid form = בוגר, final form = גיבור (starter baby has no evolve line).
  const stage = formIdx >= character.forms.length - 1 ? "גיבור" : "בוגר";
  return `${opener}, עכשיו יש לך ${character.he} ${stage}!`;
}

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
