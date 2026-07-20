import type { ComponentType } from "react";
import type { ArtDescriptor, CharacterDef } from "@/lib/types";
import type { MinigameInput, MinigameSession } from "@/lib/minigames/types";
import type { MinigameSfx } from "@/hooks/useAudio";

/** Shared props every minigame view strategy receives. */
export type MinigameViewProps = {
  session: MinigameSession;
  formArt: ArtDescriptor;
  character: CharacterDef;
  /** Forward engine input; Host applies store + default good/miss FX */
  onInput: (input: MinigameInput) => void;
  /** Play a mechanic-specific sound (jump, slice, bonk, …) */
  playSfx: (sfx: MinigameSfx) => void;
};

export type MinigameViewStrategy = ComponentType<MinigameViewProps>;
