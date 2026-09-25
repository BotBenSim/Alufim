"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MinigameShell } from "@/design-system";
import {
  CATCH_BAND_TOP,
  FALL_SECONDS,
  LANE_COUNT,
  TELEGRAPH_SECONDS,
  WALK_SPEED,
  isCaught,
  laneCenter,
  laneFromX,
  moveToward,
  pickSpawn,
  stepLane,
  type LaneCatchKind,
  type LaneCatchState,
} from "@/lib/minigames/laneCatch";
import type { MinigameViewProps } from "./types";

type Drop = {
  id: number;
  emoji: string;
  kind: LaneCatchKind;
  lane: number;
  /** Normalized y; only meaningful once falling. */
  y: number;
  phase: "telegraph" | "falling";
  /** Seconds spent in the current phase. */
  t: number;
};

const ART = 74;
/** Normalized centre of the animal — it stands on the ground strip. */
const ANIMAL_Y = 0.84;
const SPAWN_Y = -0.08;
const FLOOR_Y = 1.08;
/** Breath between one item resolving and the next lane lighting up. */
const GAP_SECONDS = 0.3;

const MISS_LABEL_GONE = "אופס…";
const MISS_LABEL_INEDIBLE = "לא אוכל…";

export function LaneCatchView({ session, formArt, onInput }: MinigameViewProps) {
  const st = session.state as LaneCatchState;
  const lanes = st.lanes || LANE_COUNT;

  const [animalX, setAnimalX] = useState(() => laneCenter(1, lanes));
  const [drop, setDrop] = useState<Drop | null>(null);
  const [flash, setFlash] = useState<"good" | "miss" | null>(null);
  const [missLabel, setMissLabel] = useState(MISS_LABEL_GONE);
  const [wobble, setWobble] = useState(false);

  const animalXRef = useRef(animalX);
  const targetLaneRef = useRef(1);
  const dropRef = useRef<Drop | null>(null);
  const gapRef = useRef(GAP_SECONDS);
  const dropIndexRef = useRef(0);
  const prevKindRef = useRef<LaneCatchKind | null>(null);
  const prevLaneRef = useRef<number | null>(null);
  const nextIdRef = useRef(1);

  const completeRef = useRef(session.complete);
  completeRef.current = session.complete;
  const poolRef = useRef(st.pool);
  poolRef.current = st.pool;
  const avoidRef = useRef(st.avoid);
  avoidRef.current = st.avoid;
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;

  const syncDrop = useCallback((next: Drop | null) => {
    dropRef.current = next;
    setDrop(next);
  }, []);

  const setTargetLane = useCallback(
    (lane: number) => {
      if (completeRef.current || lane === targetLaneRef.current) return;
      targetLaneRef.current = lane;
    },
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir =
        e.code === "ArrowLeft" || e.code === "KeyA"
          ? -1
          : e.code === "ArrowRight" || e.code === "KeyD"
            ? 1
            : null;
      if (dir === null) return;
      e.preventDefault();
      setTargetLane(stepLane(targetLaneRef.current, dir, lanes));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lanes, setTargetLane]);

  useEffect(() => {
    if (session.complete) return;
    let raf = 0;
    let last = performance.now();

    const showMiss = (label: string) => {
      setMissLabel(label);
      setFlash("miss");
      window.setTimeout(() => setFlash(null), 420);
    };

    const resolve = (d: Drop, caught: boolean) => {
      syncDrop(null);
      gapRef.current = GAP_SECONDS;

      if (d.kind === "good") {
        if (caught) {
          setFlash("good");
          window.setTimeout(() => setFlash(null), 420);
        } else {
          showMiss(MISS_LABEL_GONE);
        }
        onInputRef.current({
          type: "action",
          action: "catch",
          quality: caught ? "good" : "miss",
          targetId: d.emoji,
        });
        return;
      }

      // Inedible: a yuck wobble and the soft miss chime. The score does not move.
      if (caught) {
        setWobble(true);
        window.setTimeout(() => setWobble(false), 480);
        showMiss(MISS_LABEL_INEDIBLE);
        onInputRef.current({
          type: "action",
          action: "catch",
          quality: "miss",
          targetId: d.emoji,
        });
      }
      // Letting an inedible object fall past is the right move — stay quiet.
    };

    const spawn = () => {
      const next = pickSpawn({
        dropIndex: dropIndexRef.current,
        prevKind: prevKindRef.current,
        prevLane: prevLaneRef.current,
        pool: poolRef.current,
        avoid: avoidRef.current,
        laneCount: lanes,
      });
      dropIndexRef.current += 1;
      prevKindRef.current = next.kind;
      prevLaneRef.current = next.lane;
      syncDrop({
        id: nextIdRef.current++,
        emoji: next.emoji,
        kind: next.kind,
        lane: next.lane,
        y: SPAWN_Y,
        phase: "telegraph",
        t: 0,
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = laneCenter(targetLaneRef.current, lanes);
      if (animalXRef.current !== target) {
        const nx = moveToward(animalXRef.current, target, WALK_SPEED * dt);
        animalXRef.current = nx;
        setAnimalX(nx);
      }

      const d = dropRef.current;
      if (!d) {
        gapRef.current -= dt;
        if (gapRef.current <= 0) spawn();
      } else if (d.phase === "telegraph") {
        const t = d.t + dt;
        if (t >= TELEGRAPH_SECONDS) {
          syncDrop({ ...d, phase: "falling", t: 0, y: SPAWN_Y });
        } else {
          syncDrop({ ...d, t });
        }
      } else {
        const y = d.y + dt / FALL_SECONDS;
        const x = laneCenter(d.lane, lanes);
        if (y >= CATCH_BAND_TOP && isCaught(x, y, animalXRef.current)) {
          resolve(d, true);
        } else if (y > FLOOR_Y) {
          resolve(d, false);
        } else {
          syncDrop({ ...d, y });
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete, lanes, syncDrop]);

  const pointerLane = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    setTargetLane(laneFromX((e.clientX - rect.left) / rect.width, lanes));
  };

  const laneWidth = 100 / lanes;
  const telegraphing = drop?.phase === "telegraph" ? drop : null;
  const falling = drop?.phase === "falling" ? drop : null;

  return (
    <MinigameShell
      score={st.score}
      needed={st.needed}
      flash={flash}
      flashGoodLabel="טעים!"
      flashMissLabel={missLabel}
      stageClassName="touch-none cursor-pointer border-none"
      stageProps={{
        role: "button",
        tabIndex: 0,
        "aria-label": "תפסו את האוכל — הזיזו את החבר בין המסלולים",
        onPointerDown: (e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          pointerLane(e);
        },
        onPointerMove: (e) => {
          // Only while a finger / button is down — hovering must not steer.
          if (e.buttons === 0) return;
          pointerLane(e);
        },
        onPointerUp: (e) => {
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
          } catch {
            /* ignore */
          }
        },
      }}
    >
      {Array.from({ length: lanes }, (_, i) => (
        <div
          key={`lane-${i}`}
          className="pointer-events-none absolute top-0 bottom-0 border-x border-dashed border-white/60"
          style={{ left: `${i * laneWidth}%`, width: `${laneWidth}%` }}
        />
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-[#8CC63F]/70 shadow-[inset_0_3px_0_rgba(255,255,255,.5)]" />

      {telegraphing && (
        <div
          className="pointer-events-none absolute top-[6%] z-2 animate-jumpCuePulse text-[clamp(26px,7vw,40px)] leading-none"
          style={{ left: `${laneCenter(telegraphing.lane, lanes) * 100}%` }}
          aria-hidden
        >
          ✨
        </div>
      )}

      {falling && (
        <div
          className="pointer-events-none absolute z-3 text-[clamp(38px,10vw,64px)] leading-none drop-shadow-md"
          style={{
            left: `${laneCenter(falling.lane, lanes) * 100}%`,
            top: `${falling.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden
        >
          {falling.emoji}
        </div>
      )}

      <div
        className={`pointer-events-none absolute z-4 ${
          wobble ? "animate-[laneCatchYuck_0.48s_ease-out]" : ""
        }`}
        style={{
          left: `${animalX * 100}%`,
          top: `${ANIMAL_Y * 100}%`,
          width: ART,
          height: ART,
          transform: "translate(-50%, -50%)",
        }}
      >
        <CharacterArt art={formArt} size={ART} className="drop-shadow-lg" />
      </div>
    </MinigameShell>
  );
}
