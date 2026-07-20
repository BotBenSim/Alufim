import type { MinigameSkin } from "@/lib/minigames/types";

/** Data-driven skins — add rows without touching engine code. */
export const MINIGAME_SKINS: MinigameSkin[] = [
  // meterBurst
  {
    id: "lion-roar",
    engineId: "meterBurst",
    characterTags: ["lion"],
    promptHe: "שאגו עם האריה!",
    items: ["🦁"],
    targetCount: 3,
  },
  {
    id: "shark-splash",
    engineId: "meterBurst",
    characterTags: ["shark"],
    promptHe: "שִפְלוּש עם הכריש!",
    items: ["🌊"],
    targetCount: 3,
  },
  {
    id: "dragon-cheer",
    engineId: "meterBurst",
    characterTags: ["dragon"],
    promptHe: "עודדו את הדרקון!",
    items: ["🔥"],
    targetCount: 3,
  },
  {
    id: "rabbit-cheer",
    engineId: "meterBurst",
    characterTags: ["rabbit"],
    promptHe: "קִפְצו עם הארנב!",
    items: ["💖"],
    targetCount: 3,
  },
  {
    id: "turtle-cheer",
    engineId: "meterBurst",
    characterTags: ["turtle"],
    promptHe: "עודדו את הצב!",
    items: ["🍃"],
    targetCount: 3,
  },
  // tapCollect
  {
    id: "lion-sparkles",
    engineId: "tapCollect",
    characterTags: ["lion"],
    promptHe: "אספו ניצוצות בסביבה!",
    items: ["✨", "⭐", "🟡"],
    targetCount: 4,
  },
  {
    id: "shark-gems",
    engineId: "tapCollect",
    characterTags: ["shark"],
    promptHe: "אספו אבני חן בים!",
    items: ["💎", "🔵", "🫧"],
    targetCount: 4,
  },
  {
    id: "rabbit-stars",
    engineId: "tapCollect",
    characterTags: ["rabbit"],
    promptHe: "אספו כוכבים!",
    items: ["⭐", "💖", "🌸"],
    targetCount: 4,
  },
  // catch
  {
    id: "lion-treats",
    engineId: "catch",
    characterTags: ["lion"],
    promptHe: "תפסו את הממתקים!",
    items: ["🍖", "🍗"],
    targetCount: 4,
  },
  {
    id: "shark-shrimp",
    engineId: "catch",
    characterTags: ["shark"],
    promptHe: "תפסו שרימפס!",
    items: ["🦐", "🐠"],
    targetCount: 4,
  },
  {
    id: "rabbit-carrots",
    engineId: "catch",
    characterTags: ["rabbit"],
    promptHe: "תפסו גזרים!",
    items: ["🥕", "🥬"],
    targetCount: 4,
  },
  // pathDash — city rooftop jumper; items[1]=coin pop on landing
  {
    id: "lion-savanna-dash",
    engineId: "pathDash",
    characterTags: ["lion"],
    promptHe: "קִפְצו בין גגות העיר!",
    items: ["🦁", "⭐"],
    targetCount: 5,
  },
  {
    id: "shark-reef-swim",
    engineId: "pathDash",
    characterTags: ["shark"],
    promptHe: "קִפְצו בין גגות העיר!",
    items: ["🦈", "💎"],
    targetCount: 5,
  },
  {
    id: "turtle-leaf-trail",
    engineId: "pathDash",
    characterTags: ["turtle"],
    promptHe: "קִפְצו בין גגות העיר!",
    items: ["🐢", "🪙"],
    targetCount: 5,
  },
  // timingBounce — Chrome-dino style jump over obstacles
  {
    id: "lion-pounce",
    engineId: "timingBounce",
    characterTags: ["lion"],
    promptHe: "קִפְצו מעל הקקטוסים!",
    items: ["🦁", "🌵"],
    targetCount: 5,
  },
  {
    id: "rabbit-hops",
    engineId: "timingBounce",
    characterTags: ["rabbit"],
    promptHe: "קִפְצו מעל הקקטוסים!",
    items: ["🐰", "🌵"],
    targetCount: 5,
  },
  {
    id: "dragon-ember-hops",
    engineId: "timingBounce",
    characterTags: ["dragon"],
    promptHe: "קִפְצו מעל הקקטוסים!",
    items: ["🐉", "🌵"],
    targetCount: 5,
  },
  // sliceSwipe
  {
    id: "lion-snack-slash",
    engineId: "sliceSwipe",
    characterTags: ["lion"],
    promptHe: "החליקו וחתכו חטיפים!",
    items: ["🍖", "🍎", "🥩"],
    targetCount: 5,
  },
  {
    id: "rabbit-carrot-toss",
    engineId: "sliceSwipe",
    characterTags: ["rabbit"],
    promptHe: "החליקו וחתכו גזרים!",
    items: ["🥕", "🍎", "🥬"],
    targetCount: 5,
  },
  {
    id: "shark-kelp-toss",
    engineId: "sliceSwipe",
    characterTags: ["shark"],
    promptHe: "החליקו וחתכו חטיפי ים!",
    items: ["🦐", "🐠", "🍉"],
    targetCount: 5,
  },
];

export function skinsForEngine(engineId: MinigameSkin["engineId"]): MinigameSkin[] {
  return MINIGAME_SKINS.filter((s) => s.engineId === engineId);
}
