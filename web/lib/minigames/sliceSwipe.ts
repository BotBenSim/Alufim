import type { MinigameEngine, MinigameSession } from "./types";

export type SliceSwipeState = {
  score: number;
  needed: number;
  pool: string[];
  lastQuality: "good" | "miss" | null;
  lastSlicedEmoji: string | null;
};

function asState(session: MinigameSession): SliceSwipeState {
  return session.state as SliceSwipeState;
}

export const sliceSwipeEngine: MinigameEngine = {
  id: "sliceSwipe",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 5;
    const pool = ctx.skin.items.length ? ctx.skin.items : ["🍎"];
    return {
      engineId: "sliceSwipe",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        score: 0,
        needed,
        pool,
        lastQuality: null,
        lastSlicedEmoji: null,
      } satisfies SliceSwipeState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    if (input.type !== "action" || input.action !== "slice") return session;
    const st = asState(session);
    if (input.quality === "miss") {
      return {
        ...session,
        state: { ...st, lastQuality: "miss", lastSlicedEmoji: null },
      };
    }
    const score = st.score + 1;
    const complete = score >= st.needed;
    return {
      ...session,
      state: {
        ...st,
        score,
        lastQuality: "good",
        lastSlicedEmoji: input.targetId ?? st.pool[0] ?? "🍎",
      },
      progress: Math.min(1, score / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
