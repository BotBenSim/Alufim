"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import type { TimingBounceState } from "@/lib/minigames/timingBounce";
import type { ArtDescriptor } from "@/lib/types";
import type { MinigameSession } from "@/lib/minigames/types";

type Props = {
  session: MinigameSession;
  formArt: ArtDescriptor;
  onHop: (quality: "good" | "miss") => void;
};

/** Layout in “track units” (0 = left, 1 = right of playfield). */
const RUNNER_X = 0.14;
const HIT_HALF = 0.07;
/** How high (px up) counts as clearing an obstacle — generous for kids. */
const CLEAR_Y = 28;
const GRAVITY = 2100; // px/s²
const JUMP_V = -780; // px/s upward
const SPEED = 0.55; // track units / s
const ART_SIZE = 88;
const GROUND_H = 22;
const HIT_STUN_MS = 700;

type Cloud = { id: number; x: number; y: number; scale: number };

export function TimingBounceView({ session, formArt, onHop }: Props) {
  const st = session.state as TimingBounceState;
  const [obsX, setObsX] = useState(1.35);
  const [y, setY] = useState(0);
  const [groundScroll, setGroundScroll] = useState(0);
  const [clouds, setClouds] = useState<Cloud[]>(() => [
    { id: 1, x: 0.7, y: 18, scale: 1 },
    { id: 2, x: 1.2, y: 36, scale: 0.7 },
  ]);
  const [flash, setFlash] = useState<"good" | "miss" | null>(null);
  const [hit, setHit] = useState(false);
  const [runFrame, setRunFrame] = useState(0);

  const obsXRef = useRef(1.35);
  const yRef = useRef(0);
  const vRef = useRef(0);
  const jumpingRef = useRef(false);
  /** "open" | "cleared" | "hit" — cactus stays until it scrolls off */
  const phaseRef = useRef<"open" | "cleared" | "hit">("open");
  const stunUntilRef = useRef(0);
  const completeRef = useRef(session.complete);
  completeRef.current = session.complete;
  const onHopRef = useRef(onHop);
  onHopRef.current = onHop;

  const startJump = () => {
    if (completeRef.current || jumpingRef.current) return;
    if (performance.now() < stunUntilRef.current) return;
    if (phaseRef.current === "hit") return;
    jumpingRef.current = true;
    vRef.current = JUMP_V;
  };

  // Space / ↑ like Chrome dino
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        startJump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (session.complete) return;
    let raf = 0;
    let last = performance.now();
    let runAcc = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const stunned = now < stunUntilRef.current;

      // Jump physics (keep running mid-air even during brief hit flash after land)
      if (jumpingRef.current) {
        vRef.current += GRAVITY * dt;
        yRef.current += vRef.current * dt;
        if (yRef.current >= 0) {
          yRef.current = 0;
          vRef.current = 0;
          jumpingRef.current = false;
        }
        setY(yRef.current);
      } else if (!stunned) {
        runAcc += dt;
        if (runAcc > 0.12) {
          runAcc = 0;
          setRunFrame((f) => (f + 1) % 2);
        }
      }

      if (!stunned) {
        // World scroll
        setGroundScroll((g) => (g + SPEED * 180 * dt) % 48);
        setClouds((prev) =>
          prev.map((c) => {
            let cx = c.x - SPEED * 0.12 * dt;
            if (cx < -0.25) cx = 1.25 + Math.random() * 0.3;
            return { ...c, x: cx };
          })
        );

        let x = obsXRef.current - SPEED * dt;

        const overlap =
          x > RUNNER_X - HIT_HALF && x < RUNNER_X + HIT_HALF;

        if (overlap && phaseRef.current === "open") {
          const airborne = yRef.current < -CLEAR_Y;
          if (airborne) {
            // Cleared — cactus keeps sliding under / past; land on the other side
            phaseRef.current = "cleared";
            setFlash("good");
            window.setTimeout(() => setFlash(null), 420);
            onHopRef.current("good");
          } else {
            // Bonk — freeze briefly with crash animation, then continue
            phaseRef.current = "hit";
            jumpingRef.current = false;
            vRef.current = 0;
            yRef.current = 0;
            setY(0);
            setHit(true);
            setFlash("miss");
            stunUntilRef.current = now + HIT_STUN_MS;
            onHopRef.current("miss");
            window.setTimeout(() => {
              setHit(false);
              setFlash(null);
              // Kick cactus past the runner so we don't re-trigger immediately
              if (obsXRef.current > RUNNER_X - HIT_HALF) {
                obsXRef.current = RUNNER_X - HIT_HALF - 0.02;
                setObsX(obsXRef.current);
              }
            }, HIT_STUN_MS);
          }
        }

        // Only spawn the next cactus after this one fully left the screen
        if (x < -0.25) {
          x = 1.35 + Math.random() * 0.25;
          phaseRef.current = "open";
        }

        obsXRef.current = x;
        setObsX(x);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete]);

  const jumping = y < -1;

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-2 px-2">
      <div className="flex w-full max-w-[560px] items-baseline justify-between px-1 font-mono text-[clamp(18px,4vw,26px)] font-bold tracking-wide text-[#535353]">
        <span>
          {flash === "good" && <span className="text-[#2F9E44]">HI! </span>}
          {flash === "miss" && <span className="text-[#E67700]">אוי! </span>}
        </span>
        <span>
          {String(st.score).padStart(3, "0")}
          <span className="mx-1 opacity-40">/</span>
          {String(st.needed).padStart(3, "0")}
        </span>
      </div>

      <button
        type="button"
        aria-label="קפיצה"
        className="relative h-[38vh] w-full max-w-[560px] overflow-hidden rounded-none border-none bg-[#F7F7F7] p-0 outline-none ring-1 ring-[#E0E0E0]"
        onPointerDown={(e) => {
          e.preventDefault();
          startJump();
        }}
      >
        {clouds.map((c) => (
          <div
            key={c.id}
            className="pointer-events-none absolute text-[#D2D2D2]"
            style={{
              left: `${c.x * 100}%`,
              top: c.y,
              fontSize: 28 * c.scale,
              transform: "translateX(-50%)",
              lineHeight: 1,
            }}
          >
            ☁
          </div>
        ))}

        <div
          className="absolute inset-x-0 bg-[#535353]"
          style={{ bottom: GROUND_H, height: 2 }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 overflow-hidden"
          style={{ bottom: 0, height: GROUND_H, background: "#F7F7F7" }}
        >
          <div
            className="absolute inset-y-0 flex"
            style={{
              width: "200%",
              transform: `translateX(-${groundScroll}px)`,
              backgroundImage:
                "repeating-linear-gradient(90deg, #535353 0 10px, transparent 10px 28px), repeating-linear-gradient(90deg, transparent 0 40px, #9e9e9e 40px 44px, transparent 44px 70px)",
              backgroundPosition: "0 4px, 0 12px",
              backgroundSize: "auto 3px, auto 2px",
              backgroundRepeat: "repeat-x",
              opacity: 0.85,
            }}
          />
        </div>

        {/* Obstacle stays on screen and scrolls past under a successful jump */}
        <div
          className={`pointer-events-none absolute leading-none ${
            hit ? "animate-[dinoBonk_0.7s_ease-out]" : ""
          }`}
          style={{
            left: `${obsX * 100}%`,
            bottom: GROUND_H + 2,
            transform: "translateX(-50%)",
            fontSize: "clamp(34px, 9vw, 52px)",
            filter: hit
              ? "grayscale(0.2) contrast(1.2)"
              : "grayscale(0.35) contrast(1.1)",
          }}
        >
          {st.obstacleEmoji}
        </div>

        {/* Crash stars */}
        {hit && (
          <div
            className="pointer-events-none absolute z-[2] animate-[dinoStars_0.7s_ease-out]"
            style={{
              left: `${RUNNER_X * 100}%`,
              bottom: GROUND_H + ART_SIZE * 0.55,
              transform: "translateX(-30%)",
              fontSize: 28,
            }}
          >
            💥
          </div>
        )}

        {/* Runner — tips over on hit, lands past cactus on clear */}
        <div
          className={`pointer-events-none absolute origin-bottom ${
            hit ? "animate-[dinoCrash_0.7s_ease-out]" : ""
          }`}
          style={{
            left: `${RUNNER_X * 100}%`,
            bottom: GROUND_H + 2,
            width: ART_SIZE,
            height: ART_SIZE,
            transform: hit
              ? undefined
              : `translate(-40%, ${y}px) ${
                  jumping
                    ? "rotate(-8deg)"
                    : runFrame
                      ? "rotate(-2deg) translateY(-2px)"
                      : "rotate(2deg) translateY(0)"
                }`,
            transition: jumping || hit ? undefined : "transform 80ms linear",
          }}
        >
          <CharacterArt art={formArt} size={ART_SIZE} className="drop-shadow-sm" />
        </div>

        <div className="pointer-events-none absolute bottom-1 w-full text-center font-mono text-[12px] font-bold tracking-wide text-[#757575]">
          לחצו / הקלידו — קִפְצו מעל המכשול
        </div>
      </button>
    </div>
  );
}
