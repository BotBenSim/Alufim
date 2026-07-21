"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { MinigameShell } from "@/design-system";
import { rnd } from "@/lib/random";
import type { SliceSwipeState } from "@/lib/minigames/sliceSwipe";
import type { MinigameViewProps } from "./types";

type Flyer = {
  id: string;
  emoji: string;
  x: number; // 0..1
  y: number;
  vx: number;
  vy: number;
  born: number;
};

type Burst = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  drops: { id: string; dx: string; dy: string; color: string }[];
};

/** Near-miss padding around each snack — enough for little fingers, not the whole stage. */
const PAD = 44;
const SLICE_SAMPLES = 12;
/** Minimum pointer travel before a drag counts as a slice (px). */
const SLICE_MOVE = 4;

const JUICE: Record<string, string[]> = {
  "🍎": ["#FF6B6B", "#FF922B", "#FFD43B"],
  "🍉": ["#FF6B6B", "#69DB7C", "#FF8787"],
  "🥕": ["#FF922B", "#FFD43B", "#69DB7C"],
  "🥬": ["#69DB7C", "#51CF66", "#FFD43B"],
  "🍖": ["#E03131", "#FF8787", "#FFD43B"],
  "🥩": ["#C92A2A", "#FF6B6B", "#FFA8A8"],
  "🦐": ["#FF922B", "#FFC078", "#FFD43B"],
  "🐠": ["#4DABF7", "#FFD43B", "#74C0FC"],
  "🔥": ["#FF922B", "#FF6B6B", "#FFD43B"],
  "🍃": ["#69DB7C", "#51CF66", "#FFD43B"],
};

function juiceColors(emoji: string): string[] {
  return JUICE[emoji] ?? ["#FFD43B", "#FF922B", "#FF6B6B"];
}

function spawn(pool: string[], now: number): Flyer {
  const fromLeft = rnd(2) === 0;
  return {
    id: `f${now}-${rnd(9999)}`,
    emoji: pool[rnd(pool.length)] ?? "🍎",
    x: fromLeft ? -0.05 : 1.05,
    y: 0.55 + rnd(30) / 100,
    vx: (fromLeft ? 1 : -1) * (0.35 + rnd(20) / 100),
    vy: -0.55 - rnd(25) / 100,
    born: now,
  };
}

function segmentHitsRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: DOMRect
): boolean {
  const expanded = {
    left: r.left - PAD,
    right: r.right + PAD,
    top: r.top - PAD,
    bottom: r.bottom + PAD,
  };
  for (let i = 0; i <= SLICE_SAMPLES; i++) {
    const t = i / SLICE_SAMPLES;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    if (
      x >= expanded.left &&
      x <= expanded.right &&
      y >= expanded.top &&
      y <= expanded.bottom
    ) {
      return true;
    }
  }
  return false;
}

function makeBurst(f: Flyer): Burst {
  const colors = juiceColors(f.emoji);
  const drops = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 8 + (rnd(20) - 10) / 40;
    const dist = 40 + rnd(50);
    return {
      id: `${f.id}-d${i}`,
      dx: `${Math.cos(angle) * dist}px`,
      dy: `${Math.sin(angle) * dist + 20}px`,
      color: colors[i % colors.length],
    };
  });
  return { id: f.id, emoji: f.emoji, x: f.x, y: f.y, drops };
}

/** Hits only — empty air is silent (no miss SFX / flash). */
export function SliceSwipeView({ session, onInput }: MinigameViewProps) {
  const st = session.state as SliceSwipeState;
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [flash, setFlash] = useState<"good" | null>(null);
  const flyersRef = useRef<Flyer[]>([]);
  const elRefs = useRef<Record<string, HTMLElement | null>>({});
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const coolRef = useRef(false);
  const tappedRef = useRef(false);
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;
  const pool = st.pool;

  const sync = useCallback((next: Flyer[]) => {
    flyersRef.current = next;
    setFlyers(next);
  }, []);

  useEffect(() => {
    if (session.complete) return;
    const now = performance.now();
    if (flyersRef.current.length === 0) {
      sync([spawn(pool, now), spawn(pool, now + 1)]);
    }
  }, [session.complete, st.score, pool, sync]);

  useEffect(() => {
    if (session.complete) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = flyersRef.current.map((f) => ({
        ...f,
        x: f.x + f.vx * dt,
        y: f.y + f.vy * dt,
        vy: f.vy + 0.9 * dt,
      }));
      const kept: Flyer[] = [];
      for (const f of next) {
        if (f.x < -0.2 || f.x > 1.2 || f.y > 1.25) {
          kept.push(spawn(pool, now + rnd(100)));
        } else {
          kept.push(f);
        }
      }
      while (kept.length < 2) kept.push(spawn(pool, now + rnd(200)));
      sync(kept.slice(0, 2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete, pool, sync]);

  const trySlice = (x0: number, y0: number, x1: number, y1: number) => {
    if (session.complete || coolRef.current) return;
    for (const f of flyersRef.current) {
      const el = elRefs.current[f.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (segmentHitsRect(x0, y0, x1, y1, rect)) {
        coolRef.current = true;
        const burst = makeBurst(f);
        setBursts((prev) => [...prev.slice(-2), burst]);
        setFlash("good");
        sync(flyersRef.current.filter((x) => x.id !== f.id).concat(spawn(pool, performance.now())));
        onInputRef.current({
          type: "action",
          action: "slice",
          quality: "good",
          targetId: f.emoji,
        });
        window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== burst.id));
        }, 600);
        window.setTimeout(() => {
          coolRef.current = false;
          setFlash(null);
        }, 280);
        return;
      }
    }
  };

  return (
    <MinigameShell
      score={st.score}
      needed={st.needed}
      flash={flash}
      flashGoodLabel="חתכת!"
      stageClassName="touch-none"
      stageProps={{
        onPointerDown: (e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          pointer.current = { x: e.clientX, y: e.clientY };
          tappedRef.current = true;
        },
        onPointerMove: (e) => {
          if (!pointer.current) return;
          const prev = pointer.current;
          pointer.current = { x: e.clientX, y: e.clientY };
          if (Math.hypot(e.clientX - prev.x, e.clientY - prev.y) > SLICE_MOVE) {
            tappedRef.current = false;
            trySlice(prev.x, prev.y, e.clientX, e.clientY);
          }
        },
        onPointerUp: (e) => {
          if (pointer.current && tappedRef.current) {
            const { x, y } = pointer.current;
            trySlice(x, y, x, y);
          }
          pointer.current = null;
          tappedRef.current = false;
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
          } catch {
            /* ignore */
          }
        },
        onPointerCancel: () => {
          pointer.current = null;
          tappedRef.current = false;
        },
      }}
    >
      {flyers.map((f) => (
        <div
          key={f.id}
          ref={(el) => {
            elRefs.current[f.id] = el;
          }}
          className="pointer-events-none absolute z-[1] px-2 py-2 text-[clamp(48px,12vw,88px)] leading-none drop-shadow-md"
          style={{
            left: `${f.x * 100}%`,
            top: `${f.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden
        >
          {f.emoji}
        </div>
      ))}

      {bursts.map((b) => (
        <div
          key={b.id}
          className="pointer-events-none absolute z-[3]"
          style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%` }}
        >
          <div
            className="slice-pop absolute text-[clamp(48px,12vw,88px)] leading-none"
            style={{ left: 0, top: 0 }}
          >
            {b.emoji}
          </div>
          <div
            className="slice-half-l absolute text-[clamp(40px,10vw,72px)] leading-none"
            style={{ left: 0, top: 0, clipPath: "inset(0 50% 0 0)" }}
          >
            {b.emoji}
          </div>
          <div
            className="slice-half-r absolute text-[clamp(40px,10vw,72px)] leading-none"
            style={{ left: 0, top: 0, clipPath: "inset(0 0 0 50%)" }}
          >
            {b.emoji}
          </div>
          <div
            className="slice-slash absolute h-[6px] w-[120px] rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,.85)]"
            style={{ left: 0, top: 0 }}
          />
          {b.drops.map((d) => (
            <div
              key={d.id}
              className="slice-drop absolute h-3 w-3 rounded-full"
              style={
                {
                  left: 0,
                  top: 0,
                  background: d.color,
                  boxShadow: `0 0 8px ${d.color}`,
                  "--dx": d.dx,
                  "--dy": d.dy,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </MinigameShell>
  );
}
