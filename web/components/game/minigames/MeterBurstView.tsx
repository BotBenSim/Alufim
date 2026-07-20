"use client";

import type { MinigameSession } from "@/lib/minigames/types";

type Props = {
  session: MinigameSession;
  onTap: () => void;
};

export function MeterBurstView({ session, onTap }: Props) {
  const st = session.state as { taps: number; needed: number; emoji: string };
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-[30px] w-[min(74vw,420px)] overflow-hidden rounded-[18px] bg-white/35 shadow-[inset_0_2px_6px_rgba(0,0,0,.25)]">
        <div
          className="h-full rounded-[18px] bg-gradient-to-r from-[#FFD93D] to-[#FF8A3D] transition-[width] duration-200"
          style={{ width: `${Math.round(session.progress * 100)}%` }}
        />
      </div>
      <button
        type="button"
        className="border-none bg-transparent p-0 text-[clamp(72px,18vw,140px)] leading-none transition-transform active:scale-90"
        onClick={onTap}
      >
        {st.emoji}
      </button>
      <div className="text-[clamp(18px,4vw,28px)] font-extrabold text-heading tracking-[3px] [direction:ltr]">
        {Array.from({ length: st.needed }, (_, i) => (i < st.taps ? "🟢" : "⚪")).join("")}
      </div>
    </div>
  );
}
