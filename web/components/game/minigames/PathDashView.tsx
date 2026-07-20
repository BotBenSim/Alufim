"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import type { PathDashState } from "@/lib/minigames/pathDash";
import type { ArtDescriptor } from "@/lib/types";
import type { MinigameSession } from "@/lib/minigames/types";

type Props = {
  session: MinigameSession;
  formArt: ArtDescriptor;
  onJump: (quality: "good" | "miss") => void;
};

/** City-tower rooftop jumper — run across roofs, tap to leap the gaps. */
const RUNNER_X = 0.22;
const GRAVITY = 2200;
const JUMP_V = -820;
const SPEED = 0.42;
const ART_SIZE = 78;
const ROOF_TOP = 0.34;
const HIT_STUN_MS = 650;
const GAP_MIN = 0.14;
const GAP_MAX = 0.22;
const ROOF_MIN = 0.28;
const ROOF_MAX = 0.48;

type Roof = {
  id: number;
  x: number;
  w: number;
};

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeRoof(id: number, x: number): Roof {
  return {
    id,
    x,
    w: rand(ROOF_MIN, ROOF_MAX),
  };
}

function seedRoofs(): Roof[] {
  const roofs: Roof[] = [];
  let x = 0.05;
  for (let i = 0; i < 6; i++) {
    const r = makeRoof(i + 1, x);
    // First roof is wide so kids get a safe start
    if (i === 0) r.w = 0.45;
    roofs.push(r);
    x += r.w + rand(GAP_MIN, GAP_MAX);
  }
  return roofs;
}

function onRoof(roofs: Roof[], px: number): Roof | null {
  for (const r of roofs) {
    if (px >= r.x && px <= r.x + r.w) return r;
  }
  return null;
}

function rebuildFromSafe(nextId: { n: number }): Roof[] {
  const safe = makeRoof(nextId.n++, RUNNER_X - 0.12);
  safe.w = 0.42;
  const list = [safe];
  let x = safe.x + safe.w + rand(GAP_MIN, GAP_MAX);
  for (let i = 0; i < 5; i++) {
    const r = makeRoof(nextId.n++, x);
    list.push(r);
    x += r.w + rand(GAP_MIN, GAP_MAX);
  }
  return list;
}

export function PathDashView({ session, formArt, onJump }: Props) {
  const st = session.state as PathDashState;
  const [roofs, setRoofs] = useState<Roof[]>(seedRoofs);
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
  /** True once this jump has been over a gap — landing then scores a point */
  const crossedGapThisJumpRef = useRef(false);
  const scoredThisJumpRef = useRef(false);
  const stunUntilRef = useRef(0);
  const nextId = useRef({ n: 20 });
  const completeRef = useRef(session.complete);
  completeRef.current = session.complete;
  const onJumpRef = useRef(onJump);
  onJumpRef.current = onJump;

  const awardLanding = () => {
    if (scoredThisJumpRef.current) return;
    if (!crossedGapThisJumpRef.current) return;
    scoredThisJumpRef.current = true;
    setFlash("good");
    setPopCoin(true);
    window.setTimeout(() => setFlash(null), 400);
    window.setTimeout(() => setPopCoin(false), 500);
    onJumpRef.current("good");
  };

  const startJump = () => {
    if (completeRef.current || jumpingRef.current || fallingRef.current) return;
    if (performance.now() < stunUntilRef.current) return;
    if (!onRoof(roofsRef.current, RUNNER_X)) return;
    jumpingRef.current = true;
    crossedGapThisJumpRef.current = false;
    scoredThisJumpRef.current = false;
    vRef.current = JUMP_V;
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
      const stunned = now < stunUntilRef.current;

      // Scroll roofs first so landing tests use up-to-date positions
      if (!stunned && !fallingRef.current) {
        let list = roofsRef.current.map((r) => ({ ...r, x: r.x - SPEED * dt }));

        while (list.length && list[0].x + list[0].w < -0.15) {
          list = list.slice(1);
        }
        while (list.length < 6) {
          const lastR = list[list.length - 1];
          const x = (lastR ? lastR.x + lastR.w : 0.2) + rand(GAP_MIN, GAP_MAX);
          list.push(makeRoof(nextId.current.n++, x));
        }

        roofsRef.current = list;
        setRoofs(list);
      }

      const under = onRoof(roofsRef.current, RUNNER_X);
      const overGap = !under;

      // Mark gap crossed while airborne — landing after this = +1 point
      if (jumpingRef.current && overGap) {
        crossedGapThisJumpRef.current = true;
      }

      if (jumpingRef.current || fallingRef.current) {
        vRef.current += GRAVITY * dt;
        yRef.current += vRef.current * dt;
        if (jumpingRef.current && !fallingRef.current && yRef.current >= 0) {
          if (onRoof(roofsRef.current, RUNNER_X)) {
            yRef.current = 0;
            vRef.current = 0;
            jumpingRef.current = false;
            awardLanding(); // every successful gap jump scores here
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
        // Walked off a roof without jumping
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
        crossedGapThisJumpRef.current = false;
        scoredThisJumpRef.current = false;
        vRef.current = 0;
        yRef.current = 0;
        setY(0);
        setFlash("miss");
        stunUntilRef.current = now + HIT_STUN_MS;
        onJumpRef.current("miss");
        const list = rebuildFromSafe(nextId.current);
        roofsRef.current = list;
        setRoofs(list);
        window.setTimeout(() => setFlash(null), HIT_STUN_MS);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.complete]);

  const jumping = y < -1;

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-2 px-2">
      <div className="flex w-full max-w-[560px] items-baseline justify-between px-1 text-[clamp(18px,4vw,26px)] font-extrabold text-heading">
        <span>
          {flash === "good" && <span className="text-[#2F9E44]">גג! </span>}
          {flash === "miss" && <span className="text-[#E67700]">אופס… </span>}
        </span>
        <span>
          {st.score}
          <span className="mx-1 opacity-40">/</span>
          {st.needed}
        </span>
      </div>

      <button
        type="button"
        aria-label="קפיצה בין גגות"
        className="relative h-[42vh] w-full max-w-[560px] overflow-hidden rounded-[22px] border-none bg-[#E8F1FA] p-0 outline-none"
        onPointerDown={(e) => {
          e.preventDefault();
          startJump();
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
              height: `${ROOF_TOP * 100}%`,
              boxShadow: "inset 0 4px 0 #4A6F8C",
            }}
          />
        ))}

        {popCoin && (
          <div
            className="pointer-events-none absolute animate-[slicePop_0.5s_ease-out] text-[28px]"
            style={{
              left: `${RUNNER_X * 100}%`,
              bottom: `${ROOF_TOP * 100 + 18}%`,
              transform: "translateX(-50%)",
            }}
          >
            {st.treatEmoji}
          </div>
        )}

        <div
          className="pointer-events-none absolute origin-bottom"
          style={{
            left: `${RUNNER_X * 100}%`,
            bottom: `${ROOF_TOP * 100}%`,
            width: ART_SIZE,
            height: ART_SIZE,
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
          <CharacterArt art={formArt} size={ART_SIZE} className="drop-shadow-lg" />
        </div>

        <div className="pointer-events-none absolute bottom-1.5 w-full text-center text-[14px] font-extrabold text-heading/70">
          לחצו לקפיצה בין הגגות!
        </div>
      </button>
    </div>
  );
}
