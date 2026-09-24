import { describe, expect, it } from "vitest";
import he from "@/locales/he.json";
import { interpolate, t, tGroup } from "./i18n";

describe("t", () => {
  it("reads a nested key", () => {
    expect(t("game.tryAgain")).toBe("נסו שוב!");
  });

  it("fills {{placeholders}}", () => {
    expect(t("math.addAsk", { a: "שבע", b: "חמש" })).toBe("כמה זה שבע ועוד חמש?");
  });

  it("leaves an unknown placeholder visible rather than blank", () => {
    expect(interpolate("{{a}} ו{{b}}", { a: 1 })).toBe("1 ו{{b}}");
  });

  it("reads a group in file order", () => {
    expect(tGroup("praise")).toEqual(Object.values(he.praise));
  });
});

describe("he.json", () => {
  it("uses only {{name}} placeholders (i18next syntax)", () => {
    const strings: string[] = [];
    const walk = (n: unknown) =>
      typeof n === "string" ? strings.push(n) : Object.values(n as object).forEach(walk);
    walk(he);
    for (const s of strings) {
      expect(s, s).not.toMatch(/(^|[^{])\{[^{}]*\}(?!\})/);
      expect(s, s).not.toMatch(/\$\{/);
    }
  });
});
