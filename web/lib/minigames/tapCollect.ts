import { rnd } from "@/lib/random";
import type { MinigameEngine, MinigameSession } from "./types";

type Target = { id: string; emoji: string; left: string; top: string; collected: boolean };
type TapState = { targets: Target[]; needed: number; collected: number };

function asState(session: MinigameSession): TapState {
  return session.state as TapState;
}

export const tapCollectEngine: MinigameEngine = {
  id: "tapCollect",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 4;
    const items = ctx.skin.items.length ? ctx.skin.items : ["⭐"];
    const targets: Target[] = Array.from({ length: needed }, (_, i) => ({
      id: `t${i}`,
      emoji: items[i % items.length],
      left: `${10 + rnd(70)}%`,
      top: `${18 + rnd(55)}%`,
      collected: false,
    }));
    return {
      engineId: "tapCollect",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: { targets, needed, collected: 0 } satisfies TapState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete || input.type !== "tap" || !input.targetId) return session;
    const st = asState(session);
    const targets = st.targets.map((t) =>
      t.id === input.targetId && !t.collected ? { ...t, collected: true } : t
    );
    const collected = targets.filter((t) => t.collected).length;
    const complete = collected >= st.needed;
    return {
      ...session,
      state: { ...st, targets, collected },
      progress: Math.min(1, collected / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
