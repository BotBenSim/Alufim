/**
 * Lines that are too many to record whole are split at a natural pause into
 * pieces that are each recorded once. `כמה זה שבע ועוד חמש?` becomes
 * `כמה זה שבע ועוד` + `חמש?` — ~120 openings and ~120 endings instead of every
 * pair of numbers.
 *
 * The split point is the placeholder named here, found in the locale template,
 * so rewording the copy moves the split with it.
 */
import { template, type MsgKey } from "@/lib/i18n";

const SPLIT_BEFORE: [MsgKey, string][] = [
  ["math.addAsk", "b"],
  ["math.subAsk", "b"],
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `כמה זה {{a}} ועוד {{b}}?` split before `{{b}}` → /^(כמה זה .+ ועוד) (.+\?)$/ */
function ruleFor(key: MsgKey, at: string): RegExp {
  const tpl = template(key);
  const cut = tpl.indexOf(`{{${at}}}`);
  const toPattern = (part: string) =>
    part
      .split(/\{\{\s*\w+\s*\}\}/)
      .map(escape)
      .join(".+");
  const head = tpl.slice(0, cut).trimEnd();
  const tail = tpl.slice(cut);
  return new RegExp(`^(${toPattern(head)})\\s+(${toPattern(tail)})$`, "u");
}

let rules: RegExp[] | null = null;

/** The pieces to play for `text`, or null when the line is recorded whole. */
export function splitSpoken(text: string): string[] | null {
  rules ??= SPLIT_BEFORE.map(([key, at]) => ruleFor(key, at));
  for (const re of rules) {
    const m = re.exec(text);
    if (m) return m.slice(1);
  }
  return null;
}
