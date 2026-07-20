"use client";

import type { MinigameSession } from "@/lib/minigames/types";

type Props = {
  session: MinigameSession;
  onTapTarget: (targetId: string) => void;
};

export function TapCollectView({ session, onTapTarget }: Props) {
  const st = session.state as {
    targets: { id: string; emoji: string; left: string; top: string; collected: boolean }[];
  };
  return (
    <div className="relative h-[55vh] w-full">
      {st.targets
        .filter((t) => !t.collected)
        .map((t) => (
          <button
            key={t.id}
            type="button"
            className="absolute border-none bg-transparent p-0 text-[clamp(48px,12vw,96px)] leading-none transition-transform active:scale-90"
            style={{ left: t.left, top: t.top }}
            onClick={() => onTapTarget(t.id)}
          >
            {t.emoji}
          </button>
        ))}
    </div>
  );
}
