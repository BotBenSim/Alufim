import { describe, expect, it } from "vitest";
import { characterMinigameNotes, type MinigameSfx } from "./characterMinigameSfx";

const SFX: MinigameSfx[] = ["jump", "land", "slice", "bonk", "pop", "good", "miss", "fanfare"];
const ANIMALS = ["lion", "rabbit", "dragon", "shark", "turtle"];

describe("characterMinigameNotes", () => {
  it("returns notes for every animal × sfx", () => {
    for (const id of ANIMALS) {
      for (const sfx of SFX) {
        const notes = characterMinigameNotes(id, sfx);
        expect(notes.length).toBeGreaterThan(0);
        expect(notes[0].freq).toBeGreaterThan(0);
      }
    }
  });

  it("gives animals different jump pitches", () => {
    const lion = characterMinigameNotes("lion", "jump")[0].freq;
    const rabbit = characterMinigameNotes("rabbit", "jump")[0].freq;
    expect(rabbit).toBeGreaterThan(lion);
  });

  it("falls back for unknown characters", () => {
    expect(characterMinigameNotes("unknown", "slice").length).toBeGreaterThan(0);
  });
});
