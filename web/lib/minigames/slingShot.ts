import type { MinigameEngine, MinigameSession } from "./types";

export type SlingShotState = {
  score: number;
  needed: number;
  pool: string[];
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
      } satisfies SlingShotState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    if (input.action !== "launch" || input.quality === "miss") return session;
    const st = asState(session);
    const score = st.score + 1;
    const complete = score >= st.needed;
    return {
      ...session,
      state: { ...st, score },
      progress: Math.min(1, score / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
