"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MinigameShell } from "@/design-system";
import { rnd } from "@/lib/random";
import {
  angleAboutPivot,
  candyFromAngle,
  hitsMouth,
  pickRopeLayout,
  releaseVelocity,
  stepPendulum,
  swipeCutsRope,
  swingPivot,
  type CutRopeState,
  type RopeLayout,
  type Vec,
} from "@/lib/minigames/cutRope";
import type { MinigameViewProps } from "./types";

type Rope = { id: string; peg: Vec; cut: boolean };
type Phase = "swing" | "fall" | "reset";

type Round = {
  layout: RopeLayout;
  ropes: Rope[];
  food: string;
  candy: Vec;
  vel: Vec;
  angle: number;
  omega: number;
  length: number;
  phase: Phase;
};

const FALL_G = 1.55;
const ART = 92;
const FOOD = 44;

function pickFood(pool: string[]): string {
  return pool[rnd(pool.length)] ?? "🍬";
}

function buildRound(pool: string[], wave: number): Round {
  const layout = pickRopeLayout(wave);
  const ropes: Rope[] = layout.pegs.map((peg, i) => ({
    id: `r${wave}-${i}`,
    peg,
    cut: false,
  }));
  const pivot = swingPivot(layout.pegs);
  // Two-peg layouts: slightly shorter so the snack sits in a readable V
  const length = layout.pegs.length > 1 ? layout.hang * 0.92 : layout.hang;
  const angle = layout.startAngle;
  const omega = layout.startOmega;
  return {
    layout,
    ropes,
    food: pickFood(pool),
    candy: candyFromAngle(pivot, length, angle),
    vel: { x: 0, y: 0 },
    angle,
    omega,
    length,
    phase: "swing",
  };
}

export function CutRopeView({ session, formArt, onInput, playSfx }: MinigameViewProps) {
  const st = session.state as CutRopeState;
  const stageRef = useRef<HTMLDivElement>(null);
  const [wave, setWave] = useState(0);
  const [round, setRound] = useState(() => buildRound(st.pool, 0));
  const [flash, setFlash] = useState<"good" | "miss" | null>(null);
  const [chomp, setChomp] = useState(false);
  const [slash, setSlash] = useState<{ a: Vec; b: Vec } | null>(null);

  const roundRef = useRef(round);
  roundRef.current = round;
  const pointerRef = useRef<Vec | null>(null);
  const settledRef = useRef(false);
  const completeRef = useRef(session.complete);
  completeRef.current = session.complete;
  const poolRef = useRef(st.pool);
  poolRef.current = st.pool;
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;
  const playSfxRef = useRef(playSfx);
  playSfxRef.current = playSfx;
  const waveRef = useRef(wave);
  waveRef.current = wave;

  const toNorm = (clientX: number, clientY: number): Vec | null => {
    const el = stageRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    return {
      x: (clientX - r.left) / r.width,
      y: (clientY - r.top) / r.height,
    };
  };

  const applyRound = (next: Round) => {
    roundRef.current = next;
    setRound(next);
  };

  const nextRound = () => {
    settledRef.current = false;
    const nextWave = waveRef.current + 1;
    waveRef.current = nextWave;
    setWave(nextWave);
    applyRound(buildRound(poolRef.current, nextWave));
  };

  useEffect(() => {
    if (session.complete) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const r = roundRef.current;

      if (r.phase === "swing" && !settledRef.current) {
        const alive = r.ropes.filter((rope) => !rope.cut).map((rope) => rope.peg);
        if (alive.length === 0) {
          raf = requestAnimationFrame(tick);
          return;
        }
        const pivot = swingPivot(alive);
        const next = stepPendulum(r.angle, r.omega, r.length, dt);
        const candy = candyFromAngle(pivot, r.length, next.angle);
        applyRound({
          ...r,
          angle: next.angle,
          omega: next.omega,
          candy,
        });
      } else if (r.phase === "fall" && !settledRef.current) {
        const v = { x: r.vel.x, y: r.vel.y + FALL_G * dt };
        const candy = {
          x: r.candy.x + v.x * dt,
          y: r.candy.y + v.y * dt,
        };

        if (hitsMouth(candy, r.layout.mouth, r.layout.mouthR)) {
          settledRef.current = true;
          applyRound({ ...r, candy, vel: v, phase: "reset" });
          setChomp(true);
          window.setTimeout(() => setChomp(false), 400);
          setFlash("good");
          window.setTimeout(() => setFlash(null), 420);
          onInputRef.current(
            { type: "action", action: "cut", quality: "good", targetId: r.food },
            { good: true }
          );
          window.setTimeout(() => {
            if (!completeRef.current) nextRound();
          }, 450);
        } else if (candy.y > 1.08 || candy.x < -0.18 || candy.x > 1.18) {
          settledRef.current = true;
          applyRound({ ...r, candy, vel: v, phase: "reset" });
          setFlash("miss");
          window.setTimeout(() => setFlash(null), 350);
          onInputRef.current(
            { type: "action", action: "cut", quality: "miss" },
            { good: false }
          );
          window.setTimeout(() => {
            if (!completeRef.current) {
              settledRef.current = false;
              applyRound(buildRound(poolRef.current, waveRef.current));
            }
          }, 400);
        } else {
          applyRound({ ...r, candy, vel: v });
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete]);

  const tryCut = (a: Vec, b: Vec) => {
    const r = roundRef.current;
    if (r.phase !== "swing" || completeRef.current) return;

    const candy = r.candy;
    let cutAny = false;
    const nextRopes = r.ropes.map((rope) => {
      if (rope.cut) return rope;
      if (swipeCutsRope(a, b, rope.peg, candy, 0.06)) {
        cutAny = true;
        return { ...rope, cut: true };
      }
      return rope;
    });
    if (!cutAny) return;

    playSfxRef.current("slice");
    setSlash({ a, b });
    window.setTimeout(() => setSlash(null), 180);

    const still = nextRopes.filter((rope) => !rope.cut).map((rope) => rope.peg);
    if (still.length === 0) {
      // Release with the swing’s tangential velocity
      const lastAlive = r.ropes.filter((rope) => !rope.cut).map((rope) => rope.peg);
      const releasePivot = swingPivot(lastAlive.length ? lastAlive : r.layout.pegs);
      const vel = releaseVelocity(releasePivot, r.length, r.angle, r.omega);
      applyRound({
        ...r,
        ropes: nextRopes,
        candy,
        vel: {
          x: vel.x + (r.layout.mouth.x - candy.x) * 0.12,
          y: vel.y + 0.06,
        },
        phase: "fall",
      });
      playSfxRef.current("jump");
      return;
    }

    // Still swinging on remaining rope(s) — re-pivot, keep motion
    const pivot = swingPivot(still);
    const angle = angleAboutPivot(pivot, candy);
    const length =
      still.length === 1
        ? Math.max(0.2, Math.hypot(candy.x - pivot.x, candy.y - pivot.y))
        : r.length;
    applyRound({
      ...r,
      ropes: nextRopes,
      candy: candyFromAngle(pivot, length, angle),
      angle,
      // Keep most of the swing energy
      omega: r.omega * 0.95,
      length,
      phase: "swing",
    });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const n = toNorm(e.clientX, e.clientY);
    if (!n) return;
    pointerRef.current = n;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const prev = pointerRef.current;
    if (!prev) return;
    const n = toNorm(e.clientX, e.clientY);
    if (!n) return;
    pointerRef.current = n;
    if (Math.hypot(n.x - prev.x, n.y - prev.y) > 0.02) {
      tryCut(prev, n);
    }
  };

  const onPointerUp = () => {
    pointerRef.current = null;
  };

  const { layout, ropes, food, candy, phase } = round;
  const alive = ropes.filter((r) => !r.cut);

  return (
    <MinigameShell
      score={st.score}
      needed={st.needed}
      flash={flash}
      flashGoodLabel="טעים!"
      flashMissLabel="עוד פעם!"
      stageClassName="border-none bg-transparent"
    >
      <div
        ref={stageRef}
        className="absolute inset-0 z-10 touch-none select-none"
        role="button"
        tabIndex={0}
        aria-label="חתכו את החבל"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="pointer-events-none absolute inset-x-0 bg-[#6B8F3C]/85"
          style={{ bottom: 0, height: "14%" }}
        />

        <div
          className="pointer-events-none absolute"
          style={{
            left: `${layout.mouth.x * 100}%`,
            top: `${layout.mouth.y * 100}%`,
            width: ART,
            height: ART,
            transform: `translate(-50%, -40%) scale(${chomp ? 1.12 : 1})`,
            transition: "transform 160ms ease-out",
          }}
        >
          <CharacterArt art={formArt} size={ART} className="drop-shadow-md" />
        </div>

        <div
          className="pointer-events-none absolute rounded-full border-2 border-dashed border-white/50"
          style={{
            left: `${layout.mouth.x * 100}%`,
            top: `${layout.mouth.y * 100}%`,
            width: `${layout.mouthR * 200}%`,
            height: `${layout.mouthR * 200}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {alive.map((rope) => (
            <line
              key={rope.id}
              x1={`${rope.peg.x * 100}%`}
              y1={`${rope.peg.y * 100}%`}
              x2={`${candy.x * 100}%`}
              y2={`${candy.y * 100}%`}
              stroke="#5C4033"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
          {slash && (
            <line
              x1={`${slash.a.x * 100}%`}
              y1={`${slash.a.y * 100}%`}
              x2={`${slash.b.x * 100}%`}
              y2={`${slash.b.y * 100}%`}
              stroke="#FF6B6B"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.85"
            />
          )}
        </svg>

        {ropes.map((rope) => (
          <div
            key={`peg-${rope.id}`}
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5A2B] ring-2 ring-[#5C4033]"
            style={{
              left: `${rope.peg.x * 100}%`,
              top: `${rope.peg.y * 100}%`,
              opacity: rope.cut ? 0.35 : 1,
            }}
          />
        ))}

        {(phase === "swing" || phase === "fall") && (
          <div
            className="pointer-events-none absolute flex items-center justify-center leading-none drop-shadow-md"
            style={{
              left: `${candy.x * 100}%`,
              top: `${candy.y * 100}%`,
              width: FOOD,
              height: FOOD,
              fontSize: FOOD,
              transform: `translate(-50%, -50%) rotate(${round.angle * 28}deg)`,
            }}
          >
            {food}
          </div>
        )}
      </div>
    </MinigameShell>
  );
}
