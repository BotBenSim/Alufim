"use client";

import { CharacterArt } from "@/components/art/CharacterArt";
import { QuestionView } from "@/components/game/QuestionView";
import { XpBar } from "@/design-system";
import type { ArtDescriptor, RunState } from "@/lib/types";

type GamePlayPanelProps = {
  run: RunState;
  formArt: ArtDescriptor;
  xp: { pct: number; label: string };
  xpGainFlash: number | null;
  disabledAnswers: string[];
  wobbleAnswer: string | null;
  onAnswer: (value: string) => void;
  onSpeak: () => void;
};

/** Character + XP bar, question, and replay-audio — one aligned column (vanilla #gameArea layout). */
export function GamePlayPanel({
  run,
  formArt,
  xp,
  xpGainFlash,
  disabledAnswers,
  wobbleAnswer,
  onAnswer,
  onSpeak,
}: GamePlayPanelProps) {
  return (
    <div
      id="gamePanel"
      className="flex w-[min(94vw,520px)] flex-col items-stretch gap-3.5"
    >
      <div
        id="runHeader"
        className="flex w-full items-center gap-3 rounded-[22px] bg-white/90 px-3.5 py-2 shadow-[0_6px_16px_rgba(29,78,122,.16)]"
      >
        <CharacterArt art={formArt} size={56} className="shrink-0" />
        <div className="runInfo relative min-w-0 flex flex-1 flex-col gap-1">
          <div className="runName truncate text-[clamp(15px,3vw,20px)] font-extrabold text-heading [direction:rtl]">
            {run.character.he}
          </div>
          <XpBar pct={xp.pct} label={xp.label} gainFlash={xpGainFlash} />
        </div>
      </div>

      <QuestionView
        run={run}
        disabledAnswers={disabledAnswers}
        wobbleAnswer={wobbleAnswer}
        onAnswer={onAnswer}
        onSpeak={onSpeak}
      />
    </div>
  );
}
