"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MinigameShell } from "@/design-system";
import { rnd } from "@/lib/random";
import type { SlingShotState } from "@/lib/minigames/slingShot";
import type { MinigameViewProps } from "./types";

type Vec = { x: number; y: number };

type Burst = {
  id: string;
  emoji: string;
  x: number;
  y: number;
};

/** Fork crotch — inset so pull-back stays inside the stage. */
const ANCHOR: Vec = { x: 0.26, y: 0.7 };
/**
 * Rest pouch — snack sits a bit behind the bow so the ready state is obvious
 * (Angry Birds–style: bird loaded left of the Y-fork).
 */
const REST: Vec = { x: 0.18, y: 0.76 };
const CATCH_R = 0.22;
const MAX_PULL = 0.24;
const POWER = 6.1;
const GRAVITY = 0.75;
const ART = 100;
const FOOD = 52;
const GROUND_Y = 0.9;

/**
 * Distinct seats across the stage (top, corners, mid-right) — never a tiny
 * nudge of the same spot. Kept clear of the sling on the left.
 */
const CATCH_SEATS: Vec[] = [
  { x: 0.88, y: 0.16 }, // top-right
  { x: 0.58, y: 0.14 }, // top-center
  { x: 0.74, y: 0.18 }, // top
  { x: 0.50, y: 0.28 }, // upper mid (left of right half)
  { x: 0.92, y: 0.40 }, // right mid / corner
  { x: 0.82, y: 0.55 }, // classic mid-right
  { x: 0.66, y: 0.36 }, // center-right high
];

function pickCatch(prev: Vec | null = null): Vec {
  const far = prev
    ? CATCH_SEATS.filter((s) => Math.hypot(s.x - prev.x, s.y - prev.y) > 0.28)
    : CATCH_SEATS;
  const pool = far.length > 0 ? far : CATCH_SEATS;
  const base = pool[rnd(pool.length)]!;
  return {
    x: Math.min(0.94, Math.max(0.46, base.x + (rnd(5) - 2) / 100)),
    y: Math.min(0.58, Math.max(0.12, base.y + (rnd(5) - 2) / 100)),
  };
}

function clampPull(from: Vec, to: Vec, max: number): Vec {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  if (len <= max) return to;
  return { x: from.x + (dx / len) * max, y: from.y + (dy / len) * max };
}

function pickFood(pool: string[]): string {
  return pool[rnd(pool.length)] ?? "🍎";
}

function hitsCatch(p: Vec, catchAt: Vec): boolean {
  return Math.hypot(p.x - catchAt.x, p.y - catchAt.y) <= CATCH_R;
}

/** Segment vs circle so fast frames can’t tunnel past the animal. */
function segmentHitsCatch(a: Vec, b: Vec, catchAt: Vec): boolean {
  if (hitsCatch(a, catchAt) || hitsCatch(b, catchAt)) return true;
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const acx = catchAt.x - a.x;
  const acy = catchAt.y - a.y;
  const ab2 = abx * abx + aby * aby || 1;
  const t = Math.max(0, Math.min(1, (acx * abx + acy * aby) / ab2));
  const px = a.x + abx * t;
  const py = a.y + aby * t;
  return Math.hypot(px - catchAt.x, py - catchAt.y) <= CATCH_R;
}

function predictPath(pull: Vec, steps = 18): Vec[] {
  const dx = ANCHOR.x - pull.x;
  const dy = ANCHOR.y - pull.y;
  let x = ANCHOR.x;
  let y = ANCHOR.y;
  let vx = dx * POWER;
  let vy = dy * POWER;
  const pts: Vec[] = [];
  const dt = 0.04;
  for (let i = 0; i < steps; i++) {
    vy += GRAVITY * dt;
    x += vx * dt;
    y += vy * dt;
    if (y > GROUND_Y || x > 1.2 || x < -0.15) break;
    pts.push({ x, y });
  }
  return pts;
}

export function SlingShotView({ session, formArt, onInput, playSfx }: MinigameViewProps) {
  const st = session.state as SlingShotState;
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"ready" | "aim" | "fly" | "reset">("ready");
  const [pos, setPos] = useState<Vec>(REST);
  const [catchAt, setCatchAt] = useState<Vec>(pickCatch);
  const [pathDots, setPathDots] = useState<Vec[]>([]);
  const [food, setFood] = useState(() => pickFood(st.pool));
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [flash, setFlash] = useState<"good" | "miss" | null>(null);
  const [tilt, setTilt] = useState(0);
  const [chomp, setChomp] = useState(false);

  const phaseRef = useRef(phase);
  const posRef = useRef(pos);
  posRef.current = pos;
  const pullRef = useRef<Vec>(REST);
  const catchRef = useRef(catchAt);
  catchRef.current = catchAt;
  const foodRef = useRef(food);
  foodRef.current = food;
  const velRef = useRef<Vec>({ x: 0, y: 0 });
  const hitThisFlightRef = useRef(false);
  const completeRef = useRef(session.complete);
  completeRef.current = session.complete;
  const poolRef = useRef(st.pool);
  poolRef.current = st.pool;
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;
  const playSfxRef = useRef(playSfx);
  playSfxRef.current = playSfx;

  const setPhaseSync = (p: typeof phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

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

  const loadNextFood = () => {
    const next = pickFood(poolRef.current);
    foodRef.current = next;
    setFood(next);
  };

  const resetToSling = (reseatCatch = false) => {
    velRef.current = { x: 0, y: 0 };
    hitThisFlightRef.current = false;
    posRef.current = REST;
    pullRef.current = REST;
    if (reseatCatch) {
      const nextCatch = pickCatch(catchRef.current);
      catchRef.current = nextCatch;
      setCatchAt(nextCatch);
    }
    setPos(REST);
    setPathDots([]);
    setTilt(0);
    setPhaseSync("ready");
  };

  useEffect(() => {
    if (session.complete) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      if (phaseRef.current === "fly") {
        const v = velRef.current;
        const prev = posRef.current;
        // Sub-steps so we don’t skip over the catch circle
        const steps = Math.max(1, Math.ceil(dt / 0.008));
        const h = dt / steps;
        let p = prev;
        let caught = false;
        for (let i = 0; i < steps; i++) {
          v.y += GRAVITY * h;
          const next = { x: p.x + v.x * h, y: p.y + v.y * h };
          if (!hitThisFlightRef.current && segmentHitsCatch(p, next, catchRef.current)) {
            p = next;
            caught = true;
            break;
          }
          p = next;
        }
        posRef.current = p;
        setPos(p);
        setTilt((Math.atan2(v.y, v.x) * 180) / Math.PI);

        if (caught) {
          hitThisFlightRef.current = true;
          setPhaseSync("reset");
          const emoji = foodRef.current;
          const burstId = `b${now}`;
          const c = catchRef.current;
          setBursts((b) => [...b, { id: burstId, emoji, x: c.x, y: c.y }]);
          window.setTimeout(() => {
            setBursts((b) => b.filter((x) => x.id !== burstId));
          }, 500);
          setChomp(true);
          window.setTimeout(() => setChomp(false), 420);
          setFlash("good");
          window.setTimeout(() => setFlash(null), 400);
          onInputRef.current({
            type: "action",
            action: "launch",
            quality: "good",
            targetId: emoji,
          });
          window.setTimeout(() => {
            if (!completeRef.current) {
              loadNextFood();
              resetToSling(true);
            }
          }, 320);
        } else if (
          !hitThisFlightRef.current &&
          (p.x > 1.15 || p.x < -0.15 || p.y > GROUND_Y)
        ) {
          setPhaseSync("reset");
          setFlash("miss");
          window.setTimeout(() => setFlash(null), 350);
          onInputRef.current({ type: "action", action: "launch", quality: "miss" });
          window.setTimeout(() => {
            if (!completeRef.current) {
              loadNextFood();
              resetToSling(true);
            }
          }, 280);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (completeRef.current || phaseRef.current !== "ready") return;
    const n = toNorm(e.clientX, e.clientY);
    if (!n) return;
    // Grab near the resting snack / pouch (behind the bow)
    if (Math.hypot(n.x - REST.x, n.y - REST.y) > 0.22) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setPhaseSync("aim");
    const pulled = clampPull(ANCHOR, n, MAX_PULL);
    pullRef.current = pulled;
    posRef.current = pulled;
    setPos(pulled);
    setPathDots(predictPath(pulled));
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "aim") return;
    const n = toNorm(e.clientX, e.clientY);
    if (!n) return;
    const pulled = clampPull(ANCHOR, n, MAX_PULL);
    pullRef.current = pulled;
    posRef.current = pulled;
    setPos(pulled);
    setPathDots(predictPath(pulled));
  };

  const onPointerUp = () => {
    if (phaseRef.current !== "aim") return;
    const p = pullRef.current;
    const dx = ANCHOR.x - p.x;
    const dy = ANCHOR.y - p.y;
    const strength = Math.hypot(dx, dy);
    if (strength < 0.04) {
      resetToSling();
      return;
    }
    // Boost weak pulls so preschool aims still reach across the wider gap
    const boost = strength < 0.12 ? 1.45 : 1;
    velRef.current = { x: dx * POWER * boost, y: dy * POWER * boost };
    hitThisFlightRef.current = false;
    posRef.current = ANCHOR;
    setPos(ANCHOR);
    setPathDots([]);
    setPhaseSync("fly");
    playSfxRef.current("jump");
  };

  const bandLeft = { x: ANCHOR.x - 0.035, y: ANCHOR.y - 0.08 };
  const bandRight = { x: ANCHOR.x + 0.035, y: ANCHOR.y - 0.08 };
  const showFoodOnSling = phase === "ready" || phase === "aim";
  const showFoodFlying = phase === "fly";

  return (
    <MinigameShell
      score={st.score}
      needed={st.needed}
      flash={flash}
      flashGoodLabel="טעים!"
      flashMissLabel="עוד פעם!"
      stageClassName="border-none"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bg-[#E8D5A8]"
        style={{
          bottom: 0,
          height: "16%",
          boxShadow: "inset 0 3px 0 #C4A96A",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bg-[#8B5A2B]/85"
        style={{ bottom: "14%", height: 6 }}
      />

      {/* Hungry character */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${catchAt.x * 100}%`,
          top: `${catchAt.y * 100}%`,
          width: ART,
          height: ART,
          transform: `translate(-50%, -50%) scale(${chomp ? 1.12 : 1})`,
          transition: "left 280ms ease-out, top 280ms ease-out, transform 180ms ease-out",
        }}
      >
        <CharacterArt art={formArt} size={ART} className="drop-shadow-md" />
      </div>

      {phase === "aim" && (
        <div
          className="pointer-events-none absolute rounded-full border-[3px] border-dashed border-[#E8590C]"
          style={{
            left: `${catchAt.x * 100}%`,
            top: `${catchAt.y * 100}%`,
            width: `${CATCH_R * 200}%`,
            height: `${CATCH_R * 200}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Rubber bands — pouch behind the fork at rest */}
      {showFoodOnSling && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <line
            x1={`${bandLeft.x * 100}%`}
            y1={`${bandLeft.y * 100}%`}
            x2={`${pos.x * 100}%`}
            y2={`${pos.y * 100}%`}
            stroke="#3d2a1a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={`${bandRight.x * 100}%`}
            y1={`${bandRight.y * 100}%`}
            x2={`${pos.x * 100}%`}
            y2={`${pos.y * 100}%`}
            stroke="#3d2a1a"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}

      {phase === "aim" &&
        pathDots.map((d, i) => (
          <div
            key={`d${i}`}
            className="pointer-events-none absolute rounded-full bg-[#E8590C] ring-2 ring-[#FFE8CC]"
            style={{
              left: `${d.x * 100}%`,
              top: `${d.y * 100}%`,
              width: 7 + (i % 3),
              height: 7 + (i % 3),
              transform: "translate(-50%, -50%)",
              opacity: 0.95 - i * 0.04,
            }}
          />
        ))}

      {/* Snack first (behind), then the bow on top so rest pose reads as “loaded” */}
      {(showFoodOnSling || showFoodFlying) && (
        <div
          className="pointer-events-none absolute flex items-center justify-center leading-none"
          style={{
            left: `${pos.x * 100}%`,
            top: `${pos.y * 100}%`,
            width: FOOD,
            height: FOOD,
            fontSize: FOOD,
            zIndex: showFoodFlying ? 2 : 1,
            transform: `translate(-50%, -50%) rotate(${showFoodFlying ? tilt : 0}deg)`,
          }}
        >
          {food}
        </div>
      )}

      <div
        className="pointer-events-none absolute z-[2]"
        style={{
          left: `${ANCHOR.x * 100}%`,
          top: `${(ANCHOR.y - 0.12) * 100}%`,
          width: 28,
          height: 70,
          transform: "translate(-50%, 0)",
        }}
      >
        <div className="absolute bottom-0 left-1/2 h-[42px] w-[10px] -translate-x-1/2 rounded-sm bg-[#6B3F1A]" />
        <div className="absolute left-0 top-0 h-[38px] w-[10px] -rotate-[18deg] rounded-sm bg-[#8B5A2B]" />
        <div className="absolute right-0 top-0 h-[38px] w-[10px] rotate-[18deg] rounded-sm bg-[#8B5A2B]" />
      </div>

      {bursts.map((b) => (
        <div
          key={b.id}
          className="pointer-events-none absolute animate-ping text-[clamp(28px,6vw,44px)]"
          style={{
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {b.emoji}
        </div>
      ))}

      <div
        ref={stageRef}
        className="absolute inset-0 z-10 touch-none cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label="שליחת חטיף לחבר"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </MinigameShell>
  );
}
