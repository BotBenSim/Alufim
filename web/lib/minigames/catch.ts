import { rnd } from "@/lib/random";
import type { MinigameEngine, MinigameSession } from "./types";

type Falling = { id: string; emoji: string; left: string; top: string };
type CatchState = { current: Falling; needed: number; caught: number; spawn: number; pool: string[] };

function asState(session: MinigameSession): CatchState {
  return session.state as CatchState;
}

function spawnItem(pool: string[], spawn: number): Falling {
  return {
    id: `c${spawn}`,
    emoji: pool[rnd(pool.length)] ?? "⭐",
    left: `${8 + rnd(74)}%`,
    top: `${15 + rnd(50)}%`,
  };
}

export const catchEngine: MinigameEngine = {
  id: "catch",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 4;
    const pool = ctx.skin.items.length ? ctx.skin.items : ["🍎"];
    return {
      engineId: "catch",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        current: spawnItem(pool, 0),
        needed,
        caught: 0,
        spawn: 1,
        pool,
      } satisfies CatchState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete || input.type !== "tap") return session;
    const st = asState(session);

    // Only an explicit tap on the current item counts; empty/background taps miss (respawn)
    const hit = input.targetId === st.current.id;

    if (!hit) {
      // Miss: respawn elsewhere, never fail
      return {
        ...session,
        state: {
          ...st,
          current: spawnItem(st.pool, st.spawn),
          spawn: st.spawn + 1,
        },
      };
    }

    const caught = st.caught + 1;
    const complete = caught >= st.needed;
    return {
      ...session,
      state: {
        ...st,
        caught,
        current: complete ? st.current : spawnItem(st.pool, st.spawn),
        spawn: st.spawn + 1,
      },
      progress: Math.min(1, caught / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
