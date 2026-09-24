import { afterEach, describe, expect, it, vi } from "vitest";
import { playBreaksDisabled } from "./devFlags";

function atUrl(search: string) {
  vi.stubGlobal("window", { location: { search } });
}

describe("playBreaksDisabled", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is off without a window (static export prerender)", () => {
    expect(playBreaksDisabled()).toBe(false);
  });

  it("is off when the flag is absent", () => {
    atUrl("?foo=1");
    expect(playBreaksDisabled()).toBe(false);
  });

  it.each(["?noplay", "?noplay=1", "?x=2&noplay=true"])("is on for %s", (q) => {
    atUrl(q);
    expect(playBreaksDisabled()).toBe(true);
  });

  it.each(["?noplay=0", "?noplay=false"])("is off for %s", (q) => {
    atUrl(q);
    expect(playBreaksDisabled()).toBe(false);
  });
});
