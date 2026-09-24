/**
 * The lookup key for a spoken line: the same text always maps to the same clip.
 * Emoji are dropped (they are never spoken) and whitespace is collapsed; niqqud
 * is kept, because it changes the pronunciation.
 */
export function normalizeSpoken(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}|‍|️/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
