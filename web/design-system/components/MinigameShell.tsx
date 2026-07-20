"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MinigameFlash = "good" | "miss" | null;

export type MinigameShellProps = {
  score: number;
  needed: number;
  flash?: MinigameFlash;
  /** Default: יופי! */
  flashGoodLabel?: string;
  /** Default: עוד פעם */
  flashMissLabel?: string;
  children: ReactNode;
  /** Extra classes on the play stage */
  stageClassName?: string;
  /** Make the stage a single tappable surface */
  stageProps?: HTMLAttributes<HTMLDivElement>;
  className?: string;
};

/**
 * Shared chrome for every play-beat minigame:
 * score row → play stage.
 * No instruction text — preschoolers get cues from speech + play, not reading.
 */
export function MinigameShell({
  score,
  needed,
  flash = null,
  flashGoodLabel = "יופי!",
  flashMissLabel = "עוד פעם",
  children,
  stageClassName,
  stageProps,
  className,
}: MinigameShellProps) {
  const { className: stageExtra, ...restStage } = stageProps ?? {};

  return (
    <div
      className={cn(
        "flex w-full max-w-[560px] shrink-0 flex-col items-center gap-2 px-2",
        className
      )}
    >
      {/* Fixed-height score row — flash is overlaid so it never changes size */}
      <div className="relative flex h-9 w-full shrink-0 items-center justify-between px-1 text-[clamp(18px,4vw,26px)] font-extrabold leading-none text-heading [text-shadow:0_1px_0_#fff]">
        <span className="relative inline-block min-w-[5.5em]">
          <span
            className={cn(
              "text-[#2F9E44]",
              flash === "good" ? "visible" : "invisible"
            )}
            aria-hidden={flash !== "good"}
          >
            {flashGoodLabel}
          </span>
          <span
            className={cn(
              "absolute inset-0 text-[#E67700]",
              flash === "miss" ? "visible" : "invisible"
            )}
            aria-hidden={flash !== "miss"}
          >
            {flashMissLabel}
          </span>
        </span>
        <span className="tabular-nums tracking-wide">
          {score}
          <span className="mx-1 opacity-40">/</span>
          {needed}
        </span>
      </div>

      <div
        className={cn(
          "relative h-[min(42vh,360px)] w-full shrink-0 overflow-hidden rounded-[22px] bg-white/30 shadow-inner ring-1 ring-white/50 backdrop-blur-[1px]",
          stageClassName,
          stageExtra
        )}
        {...restStage}
      >
        {children}
      </div>
    </div>
  );
}
