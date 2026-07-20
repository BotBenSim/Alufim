"use client";

import type { MinigameSession } from "@/lib/minigames/types";

type Props = {
  session: MinigameSession;
  onTapTarget: (targetId: string) => void;
  onMiss: () => void;
};

export function CatchView({ session, onTapTarget, onMiss }: Props) {
  const st = session.state as {
    current: { id: string; emoji: string; left: string; top: string };
    caught: number;
    needed: number;
  };
  return (
    <div className="relative h-[55vh] w-full" onClick={onMiss}>
      <button
        type="button"
        className="absolute animate-bounce border-none bg-transparent p-0 text-[clamp(48px,12vw,96px)] leading-none"
        style={{ left: st.current.left, top: st.current.top }}
        onClick={(e) => {
          e.stopPropagation();
          onTapTarget(st.current.id);
        }}
      >
        {st.current.emoji}
      </button>
      <div className="absolute bottom-2 w-full text-center text-[18px] font-bold text-heading">
        {st.caught} / {st.needed}
      </div>
    </div>
  );
}
