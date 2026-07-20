"use client";

import type { ReactNode } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { QuestionView } from "@/components/game/QuestionView";
import { XpBar } from "@/design-system";
import type { ArtDescriptor, RunState } from "@/lib/types";

/** Shared column width — XP header, question card, and minigame all align here. */
export const PLAY_COLUMN_CLASS = "flex w-[min(94vw,520px)] flex-col items-stretch gap-3.5";

/** Shared play-card footprint (question + minigame stage). */
export const PLAY_CARD_STAGE_CLASS =
  "relative min-h-[min(42vh,360px)] w-full overflow-hidden rounded-[26px]";

type GamePlayPanelProps = {
  run: RunState;
  formArt: ArtDescriptor;
  xp: { pct: number; label: string };
  xpGainFlash: number | null;
  disabledAnswers: string[];
  wobbleAnswer: string | null;
  onAnswer: (value: string) => void;
  onSpeak: () => void;
  /** Replaces the question card (e.g. play-beat minigame) while keeping the XP bar. */
  body?: ReactNode;
};

/** Character + XP bar, then question — or a swapped body of the same width. */
export function GamePlayPanel({
  run,
  formArt,
  xp,
  xpGainFlash,
  disabledAnswers,
  wobbleAnswer,
  onAnswer,
  onSpeak,
  body,
}: GamePlayPanelProps) {
  return (
    <div id="gamePanel" className={PLAY_COLUMN_CLASS}>
      <div
        id="runHeader"
        className="flex w-full items-center gap-3 rounded-[22px] bg-white/90 px-3.5 py-2 shadow-[0_6px_16px_rgba(29,78,122,.16)]"
      >
        <CharacterArt art={formArt} size={56} className="shrink-0" />
        <div className="runInfo relative flex min-w-0 flex-1 flex-col gap-1">
          <div className="runName truncate text-[clamp(15px,3vw,20px)] font-extrabold text-heading [direction:rtl]">
            {run.character.he}
          </div>
          <XpBar pct={xp.pct} label={xp.label} gainFlash={xpGainFlash} />
        </div>
      </div>

      {body ?? (
        <QuestionView
          run={run}
          disabledAnswers={disabledAnswers}
          wobbleAnswer={wobbleAnswer}
          onAnswer={onAnswer}
          onSpeak={onSpeak}
        />
      )}
    </div>
  );
}
