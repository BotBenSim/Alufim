import { resolveJumpConfig, type JumpPlayConfig } from "./jumpConfig";
import type { MinigameEngine, MinigameSession } from "./types";

export type PathDashState = {
  score: number;
  needed: number;
  /** Coin / star collected vibe on successful roof landings */
  treatEmoji: string;
  lastQuality: "good" | "miss" | null;
  /** Resolved jump feel (engine defaults + skin overrides) */
  jump: JumpPlayConfig;
};

function asState(session: MinigameSession): PathDashState {
  return session.state as PathDashState;
}

export const pathDashEngine: MinigameEngine = {
  id: "pathDash",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 5;
    const treatEmoji = ctx.skin.items[1] ?? ctx.skin.items[0] ?? "⭐";
    return {
      engineId: "pathDash",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        score: 0,
        needed,
        treatEmoji,
        lastQuality: null,
        jump: resolveJumpConfig("pathDash", ctx.skin),
      } satisfies PathDashState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    if (input.type !== "action" || input.action !== "jump") return session;
    const st = asState(session);
    if (input.quality === "miss") {
      return {
        ...session,
        state: { ...st, lastQuality: "miss" },
      };
    }
    const score = st.score + 1;
    const complete = score >= st.needed;
    return {
      ...session,
      state: { ...st, score, lastQuality: "good" },
      progress: Math.min(1, score / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
