import { resolveJumpConfig, type JumpPlayConfig } from "./jumpConfig";
import type { MinigameEngine, MinigameSession } from "./types";

export type TimingBounceState = {
  score: number;
  needed: number;
  /** Obstacle emoji kids jump over */
  obstacleEmoji: string;
  /** Resolved jump feel (engine defaults + skin overrides) */
  jump: JumpPlayConfig;
};

function asState(session: MinigameSession): TimingBounceState {
  return session.state as TimingBounceState;
}

export const timingBounceEngine: MinigameEngine = {
  id: "timingBounce",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 4;
    const obstacleEmoji = ctx.skin.items[1] ?? ctx.skin.items[0] ?? "🪨";
    return {
      engineId: "timingBounce",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        score: 0,
        needed,
        obstacleEmoji,
        jump: resolveJumpConfig("timingBounce", ctx.skin),
      } satisfies TimingBounceState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    if (input.action !== "hop" || input.quality === "miss") return session;
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
