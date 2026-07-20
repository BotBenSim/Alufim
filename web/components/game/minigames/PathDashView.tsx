"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MinigameShell } from "@/design-system";
import {
  pacedSpeed,
  pickGap,
  randRange,
  resolveJumpConfig,
  tryBeginJump,
  type JumpPlayConfig,
} from "@/lib/minigames/jumpConfig";
import type { PathDashState } from "@/lib/minigames/pathDash";
import type { MinigameViewProps } from "./types";

type Roof = { id: number; x: number; w: number };

function makeRoof(id: number, x: number, cfg: JumpPlayConfig): Roof {
  return { id, x, w: randRange(cfg.roofWidth) };
}

function seedRoofs(cfg: JumpPlayConfig): Roof[] {
  const roofs: Roof[] = [];
  let x = 0.05;
  for (let i = 0; i < 6; i++) {
    const r = makeRoof(i + 1, x, cfg);
    if (i === 0) r.w = Math.max(r.w, 0.45);
    roofs.push(r);
    x += r.w + pickGap(cfg, i >= 2);
  }
  return roofs;
}

function onRoof(roofs: Roof[], px: number): Roof | null {
  for (const r of roofs) {
    if (px >= r.x && px <= r.x + r.w) return r;
  }
  return null;
}

function rebuildFromSafe(nextId: { n: number }, cfg: JumpPlayConfig, runnerX: number): Roof[] {
  const safe = makeRoof(nextId.n++, runnerX - 0.12, cfg);
  safe.w = 0.45;
  const list = [safe];
  let x = safe.x + safe.w + pickGap(cfg, false);
  for (let i = 0; i < 5; i++) {
    const r = makeRoof(nextId.n++, x, cfg);
    list.push(r);
    x += r.w + pickGap(cfg, i >= 1);
  }
  return list;
}

export function PathDashView({ session, formArt, onInput, playSfx }: MinigameViewProps) {
  const st = session.state as PathDashState;
  const cfg = st.jump ?? resolveJumpConfig("pathDash");
  const [roofs, setRoofs] = useState(() => seedRoofs(cfg));
  const [y, setY] = useState(0);
  const [runFrame, setRunFrame] = useState(0);
  const [flash, setFlash] = useState<"good" | "miss" | null>(null);
  const [falling, setFalling] = useState(false);
  const [popCoin, setPopCoin] = useState(false);

  const roofsRef = useRef(roofs);
  const yRef = useRef(0);
  const vRef = useRef(0);
  const jumpingRef = useRef(false);
  const fallingRef = useRef(false);
  const jumpsUsedRef = useRef(0);
  const pacePhaseRef = useRef(Math.random() * Math.PI * 2);
  const crossedGapThisJumpRef = useRef(false);
  const scoredThisJumpRef = useRef(false);
  const stunUntilRef = useRef(0);
  const nextId = useRef({ n: 20 });
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
      { type: "action", action: "jump", quality },
      { good: quality === "good" }
    );
  };

  const awardLanding = () => {
    if (scoredThisJumpRef.current) return;
    if (!crossedGapThisJumpRef.current) return;
    scoredThisJumpRef.current = true;
    setFlash("good");
    setPopCoin(true);
    window.setTimeout(() => setFlash(null), 400);
    window.setTimeout(() => setPopCoin(false), 500);
    report("good");
  };

  const startJump = () => {
    if (completeRef.current || fallingRef.current) return;
    if (performance.now() < stunUntilRef.current) return;
    const c = cfgRef.current;
    const grounded =
      !!onRoof(roofsRef.current, c.runnerX) && yRef.current >= -2;
    const next = tryBeginJump(c, {
      grounded,
      jumping: jumpingRef.current,
      jumpsUsed: jumpsUsedRef.current,
    });
    if (!next) return;
    if (grounded) {
      crossedGapThisJumpRef.current = false;
      scoredThisJumpRef.current = false;
    }
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

      pacePhaseRef.current += dt * (0.7 + Math.random() * 0.5);
      const speed = pacedSpeed(pacePhaseRef.current, c);

      if (!stunned && !fallingRef.current) {
        let list = roofsRef.current.map((r) => ({ ...r, x: r.x - speed * dt }));
        while (list.length && list[0].x + list[0].w < -0.15) {
          list = list.slice(1);
        }
        while (list.length < 6) {
          const lastR = list[list.length - 1];
          const x = (lastR ? lastR.x + lastR.w : 0.2) + pickGap(c, true);
          list.push(makeRoof(nextId.current.n++, x, c));
        }
        roofsRef.current = list;
        setRoofs(list);
      }

      const under = onRoof(roofsRef.current, c.runnerX);
      const overGap = !under;

      if (jumpingRef.current && overGap) {
        crossedGapThisJumpRef.current = true;
      }

      if (jumpingRef.current || fallingRef.current) {
        vRef.current += c.gravity * dt;
        yRef.current += vRef.current * dt;
        if (jumpingRef.current && !fallingRef.current && yRef.current >= 0) {
          if (onRoof(roofsRef.current, c.runnerX)) {
            yRef.current = 0;
            vRef.current = 0;
            jumpingRef.current = false;
            jumpsUsedRef.current = 0;
            awardLanding();
          } else {
            fallingRef.current = true;
            setFalling(true);
            jumpingRef.current = false;
          }
        }
        setY(yRef.current);
      } else if (!stunned) {
        runAcc += dt;
        if (runAcc > 0.11) {
          runAcc = 0;
          setRunFrame((f) => (f + 1) % 2);
        }
        if (overGap) {
          fallingRef.current = true;
          setFalling(true);
          vRef.current = 120;
        }
      }

      if (fallingRef.current && yRef.current > 110) {
        fallingRef.current = false;
        setFalling(false);
        jumpingRef.current = false;
        jumpsUsedRef.current = 0;
        crossedGapThisJumpRef.current = false;
        scoredThisJumpRef.current = false;
        vRef.current = 0;
        yRef.current = 0;
        setY(0);
        setFlash("miss");
        stunUntilRef.current = now + c.hitStunMs;
        report("miss");
        const list = rebuildFromSafe(nextId.current, c, c.runnerX);
        roofsRef.current = list;
        setRoofs(list);
        window.setTimeout(() => setFlash(null), c.hitStunMs);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete]);

  const jumping = y < -1;
  const runnerX = cfg.runnerX;
  const roofTop = cfg.roofTop;
  const artSize = cfg.artSize;

  return (
    <MinigameShell
      score={st.score}
      needed={st.needed}
      flash={flash}
      flashGoodLabel="גג!"
      flashMissLabel="אופס…"
      stageClassName="cursor-pointer border-none bg-transparent"
      stageProps={{
        role: "button",
        tabIndex: 0,
        "aria-label": "קפיצה בין גגות",
        onPointerDown: (e) => {
          e.preventDefault();
          startJump();
        },
      }}
    >
      {roofs.map((r) => (
        <div
          key={r.id}
          className="pointer-events-none absolute bg-[#6B8FAD]"
          style={{
            left: `${r.x * 100}%`,
            width: `${r.w * 100}%`,
            bottom: 0,
            height: `${roofTop * 100}%`,
            boxShadow: "inset 0 4px 0 #4A6F8C",
          }}
        />
      ))}

      {popCoin && (
        <div
          className="pointer-events-none absolute animate-[slicePop_0.5s_ease-out] text-[28px]"
          style={{
            left: `${runnerX * 100}%`,
            bottom: `${roofTop * 100 + 18}%`,
            transform: "translateX(-50%)",
          }}
        >
          {st.treatEmoji}
        </div>
      )}

      <div
        className="pointer-events-none absolute origin-bottom"
        style={{
          left: `${runnerX * 100}%`,
          bottom: `${roofTop * 100}%`,
          width: artSize,
          height: artSize,
          transform: `translate(-40%, ${y}px) ${
            falling
              ? "rotate(55deg)"
              : jumping
                ? "rotate(-12deg)"
                : runFrame
                  ? "rotate(-3deg) translateY(-3px)"
                  : "rotate(3deg)"
          }`,
          transition: jumping || falling ? undefined : "transform 70ms linear",
        }}
      >
        <CharacterArt art={formArt} size={artSize} className="drop-shadow-lg" />
      </div>
    </MinigameShell>
  );
}
