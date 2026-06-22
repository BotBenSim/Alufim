export const FIND_PACKS = {
  colors: [
    { he: "אדום", emoji: "🔴" },
    { he: "כחול", emoji: "🔵" },
    { he: "ירוק", emoji: "🟢" },
    { he: "צהוב", emoji: "🟡" },
    { he: "כתום", emoji: "🟠" },
    { he: "סגול", emoji: "🟣" },
  ],
  shapes: [
    { he: "עיגול", emoji: "⭕" },
    { he: "משולש", emoji: "🔺" },
    { he: "ריבוע", emoji: "🟦" },
    { he: "לב", emoji: "❤️" },
    { he: "כוכב", emoji: "⭐" },
  ],
  animals: [
    { he: "כלב", emoji: "🐶" },
    { he: "חתול", emoji: "🐱" },
    { he: "דג", emoji: "🐟" },
    { he: "ציפור", emoji: "🐦" },
    { he: "פרה", emoji: "🐮" },
    { he: "קוף", emoji: "🐵" },
  ],
} as const;

export const FIND_CATS = ["colors", "shapes", "animals"] as const;

export type FindCat = (typeof FIND_CATS)[number];

export function findCatLabel(cat: string, he: string): string {
  if (cat === "colors") return `מצא את הצבע ה${he}!`;
  return `מצא את ה${he}!`;
}

export const FIND_LETTERS = [
  { l: "א", name: "אָלֶף" },
  { l: "ב", name: "בֵּית" },
  { l: "ג", name: "גִימֶל" },
  { l: "ד", name: "דָלֶת" },
  { l: "ה", name: "הֵא" },
  { l: "ו", name: "וָו" },
  { l: "ז", name: "זַיִן" },
  { l: "ח", name: "חֵית" },
  { l: "ט", name: "טֵית" },
  { l: "י", name: "יוֹד" },
  { l: "כ", name: "כַּף" },
  { l: "ל", name: "לָמֶד" },
  { l: "מ", name: "מֵם" },
  { l: "נ", name: "נוּן" },
  { l: "ס", name: "סָמֶך" },
  { l: "ע", name: "עַיִן" },
  { l: "פ", name: "פֵּא" },
  { l: "צ", name: "צָדִי" },
  { l: "ק", name: "קוֹף" },
  { l: "ר", name: "רֵיש" },
  { l: "ש", name: "שִין" },
  { l: "ת", name: "תָו" },
] as const;

export const LETTER_CONFUSE = [
  ["ב", "כ", "נ", "מ"],
  ["ג", "נ"],
  ["ד", "ר"],
  ["ה", "ח", "ת"],
  ["ו", "ז", "ר", "ן"],
  ["ע", "צ"],
  ["ט", "מ"],
  ["ס", "ם"],
  ["פ", "ף"],
] as const;

export const FIND_PHON = [
  { he: "אריה", emoji: "🦁", l: "א" },
  { he: "בית", emoji: "🏠", l: "ב" },
  { he: "גלידה", emoji: "🍦", l: "ג" },
  { he: "דג", emoji: "🐟", l: "ד" },
  { he: "הר", emoji: "⛰️", l: "ה" },
  { he: "ורד", emoji: "🌹", l: "ו" },
  { he: "זברה", emoji: "🦓", l: "ז" },
  { he: "חתול", emoji: "🐱", l: "ח" },
  { he: "טרקטור", emoji: "🚜", l: "ט" },
  { he: "יד", emoji: "✋", l: "י" },
  { he: "כלב", emoji: "🐶", l: "כ" },
  { he: "לב", emoji: "❤️", l: "ל" },
  { he: "מכונית", emoji: "🚗", l: "מ" },
  { he: "נחש", emoji: "🐍", l: "נ" },
  { he: "סוס", emoji: "🐴", l: "ס" },
  { he: "עץ", emoji: "🌳", l: "ע" },
  { he: "פיל", emoji: "🐘", l: "פ" },
  { he: "צב", emoji: "🐢", l: "צ" },
  { he: "קוף", emoji: "🐵", l: "ק" },
  { he: "רכבת", emoji: "🚂", l: "ר" },
  { he: "שמש", emoji: "☀️", l: "ש" },
  { he: "תפוח", emoji: "🍎", l: "ת" },
] as const;

export const FIND_REASON = [
  { q: "מי יכול לעוף?", yes: ["🐦", "🦋", "🐝", "🦅", "🦜", "🦉"], no: ["🐟", "🐶", "🐢", "🐌", "🐱", "🦁", "🐮", "🐠"] },
  { q: "מי חי בים?", yes: ["🐟", "🐠", "🐙", "🦀", "🐬", "🐋", "🦈", "🐳"], no: ["🐶", "🐦", "🦁", "🐘", "🐱", "🐴", "🐝", "🦒"] },
  { q: "מצאו את הפרי", yes: ["🍎", "🍌", "🍓", "🍇", "🍊", "🍉", "🍐", "🍑"], no: ["🥕", "🚗", "🐶", "⚽", "🪑", "🌳", "🥦", "✏️"] },
  { q: "מצאו את הירק", yes: ["🥕", "🥦", "🌽", "🍅", "🥒", "🧅", "🥔"], no: ["🍎", "🍌", "🚗", "🐶", "⚽", "🍩", "🐱", "🌸"] },
  { q: "מה נוסע בכביש?", yes: ["🚗", "🚌", "🚚", "🏍️", "🚕", "🚜"], no: ["✈️", "🚢", "🚁", "🐶", "🍎", "🌳", "🐦", "⛵"] },
  { q: "מצאו את החיה", yes: ["🐶", "🐱", "🦁", "🐘", "🐵", "🐴", "🐰", "🐻"], no: ["🍎", "🚗", "⚽", "🪑", "👟", "🌳", "✏️", "🎈"] },
  { q: "מה אפשר לאכול?", yes: ["🍎", "🍌", "🍕", "🍞", "🧀", "🍪", "🥕", "🍓"], no: ["🚗", "🪑", "👟", "⚽", "✏️", "📱", "🧸", "🔑"] },
  { q: "מה צומח בגינה?", yes: ["🌳", "🌷", "🌻", "🌵", "🍄", "🌹", "🌼"], no: ["🚗", "🐶", "📱", "⚽", "🪑", "✈️", "👟", "🍕"] },
] as const;

export const LETTER_NAME: Record<string, string> = Object.fromEntries(
  FIND_LETTERS.map((x) => [x.l, x.name])
);

export function letterByGlyph(g: string) {
  return FIND_LETTERS.find((x) => x.l === g) ?? null;
}
