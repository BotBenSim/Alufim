/**
 * All app copy lives in `locales/<lang>.json`, in i18next's JSON format: nested
 * keys and `{{name}}` placeholders. Adding a language is adding a file here;
 * moving to i18next itself later needs no change to the files.
 *
 * Content — word lists, letters, character names, minigame skins — stays with
 * its data in `data/`; this is the copy around it.
 */
import he from "@/locales/he.json";

type Messages = typeof he;

/** Every dotted path to a string in the locale file, e.g. "game.tryAgain". */
type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MsgKey = Leaves<Messages>;
/** Paths to a group of strings, e.g. "praise" — read with `tGroup`. */
type Groups<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? never : `${P}${K}` | Groups<T[K], `${P}${K}.`>;
}[keyof T & string];
export type MsgGroup = Groups<Messages>;

export type Params = Record<string, unknown>;

const LOCALES = { he } as const;
export type Locale = keyof typeof LOCALES;
export const LOCALE_META: Record<Locale, { lang: string; dir: "rtl" | "ltr" }> = {
  he: { lang: "he", dir: "rtl" },
};

let locale: Locale = "he";
export const getLocale = () => locale;
export const setLocale = (next: Locale) => {
  locale = next;
};

function lookup(tree: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    tree
  );
}

export function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m
  );
}

/** The raw template for a key, placeholders intact. */
export function template(key: MsgKey): string {
  const s = lookup(LOCALES[locale], key) ?? lookup(he, key);
  return typeof s === "string" ? s : key;
}

type RenderHook = (key: string, text: string) => void;
let renderHook: RenderHook | null = null;
/** Lets the voice inventory see which key produced each line. */
export function onRender(hook: RenderHook | null) {
  renderHook = hook;
}

export function t(key: MsgKey, params?: Params): string {
  const text = interpolate(template(key), params);
  renderHook?.(key, text);
  return text;
}

/** The keys directly under a group, in file order. */
export function groupKeys(group: MsgGroup): MsgKey[] {
  const node = lookup(LOCALES[locale], group) ?? lookup(he, group);
  if (!node || typeof node !== "object") return [];
  return Object.keys(node).map((k) => `${group}.${k}` as MsgKey);
}

/** Every string under a group, in file order — e.g. the praise lines. */
export function tGroup(group: MsgGroup): string[] {
  return groupKeys(group).map((key) => t(key));
}
