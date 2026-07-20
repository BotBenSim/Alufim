import type { MinigameEngine, MinigameSession } from "./types";

export type SlingShotState = {
  score: number;
  needed: number;
  pool: string[];
  lastQuality: "good" | "miss" | null;
  lastHitEmoji: string | null;
};

function asState(session: MinigameSession): SlingShotState {
  return session.state as SlingShotState;
}

export const slingShotEngine: MinigameEngine = {
  id: "slingShot",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 4;
    const pool = ctx.skin.items.length ? ctx.skin.items : ["🍎"];
    return {
      engineId: "slingShot",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        score: 0,
        needed,
        pool,
        lastQuality: null,
        lastHitEmoji: null,
      } satisfies SlingShotState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    if (input.type !== "action" || input.action !== "launch") return session;
    const st = asState(session);
    if (input.quality === "miss") {
      return {
        ...session,
        state: { ...st, lastQuality: "miss", lastHitEmoji: null },
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
        lastHitEmoji: input.targetId ?? st.pool[0] ?? "🍎",
      },
      progress: Math.min(1, score / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
