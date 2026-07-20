"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MinigameShell } from "@/design-system";
import {
  pacedSpeed,
  resolveJumpConfig,
  spawnObstacleX,
  tryBeginJump,
} from "@/lib/minigames/jumpConfig";
import type { TimingBounceState } from "@/lib/minigames/timingBounce";
import type { MinigameViewProps } from "./types";

export function TimingBounceView({ session, formArt, onInput, playSfx }: MinigameViewProps) {
  const st = session.state as TimingBounceState;
  const cfg = st.jump ?? resolveJumpConfig("timingBounce");
  const [obsX, setObsX] = useState(1.35);
  const [y, setY] = useState(0);
  const [groundScroll, setGroundScroll] = useState(0);
  const [flash, setFlash] = useState<"good" | "miss" | null>(null);
  const [hit, setHit] = useState(false);
  const [runFrame, setRunFrame] = useState(0);
  const [tall, setTall] = useState(false);

  const obsXRef = useRef(1.35);
  const yRef = useRef(0);
  const vRef = useRef(0);
  const jumpingRef = useRef(false);
  const jumpsUsedRef = useRef(0);
  const holdUntilRef = useRef(0);
  const awaitingSpawnRef = useRef(false);
  const pendingSpawnXRef = useRef(1.35);
  const tallRef = useRef(false);
  const phaseRef = useRef<"open" | "cleared" | "hit">("open");
  const stunUntilRef = useRef(0);
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const completeRef = useRef(session.complete);
  completeRef.current = session.complete;
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;
  const playSfxRef = useRef(playSfx);
  playSfxRef.current = playSfx;

  const report = (quality: "good" | "miss") => {
    onInputRef.current(
      { type: "action", action: "hop", quality },
      { good: quality === "good" }
    );
  };

  const applySpawn = (x: number, tallNext: boolean) => {
    tallRef.current = tallNext;
    setTall(tallNext);
    awaitingSpawnRef.current = false;
    obsXRef.current = x;
    setObsX(x);
    phaseRef.current = "open";
  };

  const spawnNext = (now: number) => {
    const next = spawnObstacleX(cfgRef.current);
    if (next.holdMs > 0) {
      awaitingSpawnRef.current = true;
      holdUntilRef.current = now + next.holdMs;
      pendingSpawnXRef.current = next.x;
      tallRef.current = next.tall;
      setTall(next.tall);
      obsXRef.current = 2.8;
      setObsX(2.8);
      return;
    }
    applySpawn(next.x, next.tall);
  };

  const startJump = () => {
    if (completeRef.current) return;
    if (performance.now() < stunUntilRef.current) return;
    if (phaseRef.current === "hit") return;
    const grounded = yRef.current >= -2 && !jumpingRef.current;
    const next = tryBeginJump(cfgRef.current, {
      grounded,
      jumping: jumpingRef.current,
      jumpsUsed: jumpsUsedRef.current,
    });
    if (!next) return;
    jumpsUsedRef.current = next.jumpsUsed;
    jumpingRef.current = true;
    vRef.current = next.velocity;
    playSfxRef.current("jump");
  };

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
      const c = cfgRef.current;
      const stunned = now < stunUntilRef.current;

      if (jumpingRef.current) {
        vRef.current += c.gravity * dt;
        yRef.current += vRef.current * dt;
        if (yRef.current >= 0) {
          yRef.current = 0;
          vRef.current = 0;
          jumpingRef.current = false;
          jumpsUsedRef.current = 0;
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
        // Steady land pace — cactus distance / pack size carry the variety
        const speed = pacedSpeed(0, c);
        setGroundScroll((g) => (g + speed * 180 * dt) % 48);

        if (awaitingSpawnRef.current) {
          if (now >= holdUntilRef.current) {
            applySpawn(pendingSpawnXRef.current, tallRef.current);
          }
        } else {
          let x = obsXRef.current - speed * dt;
          const overlap =
            x > c.runnerX - c.hitHalf && x < c.runnerX + c.hitHalf;
          const clearY = tallRef.current ? c.clearYTall : c.clearYShort;

          if (overlap && phaseRef.current === "open") {
            const airborne = yRef.current < -clearY;
            if (airborne) {
              phaseRef.current = "cleared";
              setFlash("good");
              window.setTimeout(() => setFlash(null), 420);
              report("good");
            } else {
              phaseRef.current = "hit";
              jumpingRef.current = false;
              jumpsUsedRef.current = 0;
              vRef.current = 0;
              yRef.current = 0;
              setY(0);
              setHit(true);
              setFlash("miss");
              stunUntilRef.current = now + c.hitStunMs;
              report("miss");
              window.setTimeout(() => {
                setHit(false);
                setFlash(null);
                if (obsXRef.current > c.runnerX - c.hitHalf) {
                  obsXRef.current = c.runnerX - c.hitHalf - 0.02;
                  setObsX(obsXRef.current);
                }
              }, c.hitStunMs);
            }
          }

          if (x < -0.25) {
            spawnNext(now);
          } else {
            obsXRef.current = x;
            setObsX(x);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete]);

  const jumping = y < -1;

  return (
    <MinigameShell
      score={st.score}
      needed={st.needed}
      flash={flash}
      flashGoodLabel="יופי!"
      flashMissLabel="אוי!"
      stageClassName="cursor-pointer border-none bg-transparent"
      stageProps={{
        role: "button",
        tabIndex: 0,
        "aria-label": "קפיצה",
        onPointerDown: (e) => {
          e.preventDefault();
          startJump();
        },
      }}
    >
      <div
        className="absolute inset-x-0 bg-[#535353]/80"
        style={{ bottom: cfg.groundH, height: 2 }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 overflow-hidden"
        style={{
          bottom: 0,
          height: cfg.groundH,
          background: "rgba(255,255,255,.35)",
        }}
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
            opacity: 0.7,
          }}
        />
      </div>

      <div
        className={`pointer-events-none absolute leading-none ${
          hit ? "animate-[dinoBonk_0.7s_ease-out]" : ""
        }`}
        style={{
          left: `${obsX * 100}%`,
          bottom: cfg.groundH + 2,
          transform: "translateX(-50%)",
          fontSize: tall ? "clamp(48px, 13vw, 72px)" : "clamp(34px, 9vw, 52px)",
          filter: hit
            ? "grayscale(0.2) contrast(1.2)"
            : "grayscale(0.35) contrast(1.1)",
        }}
      >
        {st.obstacleEmoji}
      </div>

      {hit && (
        <div
          className="pointer-events-none absolute z-[2] animate-[dinoStars_0.7s_ease-out]"
          style={{
            left: `${cfg.runnerX * 100}%`,
            bottom: cfg.groundH + cfg.artSize * 0.55,
            transform: "translateX(-30%)",
            fontSize: 28,
          }}
        >
          💥
        </div>
      )}

      <div
        className={`pointer-events-none absolute origin-bottom ${
          hit ? "animate-[dinoCrash_0.7s_ease-out]" : ""
        }`}
        style={{
          left: `${cfg.runnerX * 100}%`,
          bottom: cfg.groundH + 2,
          width: cfg.artSize,
          height: cfg.artSize,
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
        <CharacterArt art={formArt} size={cfg.artSize} className="drop-shadow-sm" />
      </div>
    </MinigameShell>
  );
}
