import type { MinigameEngine, MinigameSession } from "./types";

type MeterState = { taps: number; needed: number; emoji: string };

function asMeter(session: MinigameSession): MeterState {
  return session.state as MeterState;
}

export const meterBurstEngine: MinigameEngine = {
  id: "meterBurst",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 3;
    const emoji = ctx.skin.items[0] ?? "✨";
    return {
      engineId: "meterBurst",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: { taps: 0, needed, emoji } satisfies MeterState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete || input.type !== "tap") return session;
    const st = asMeter(session);
    const taps = st.taps + 1;
    const complete = taps >= st.needed;
    return {
      ...session,
      state: { ...st, taps },
      progress: Math.min(1, taps / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
