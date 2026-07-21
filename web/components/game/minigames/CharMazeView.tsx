"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MinigameShell } from "@/design-system";
import {
  canStep,
  dirToAdjacent,
  neighbor,
  pickLayout,
  swipeToDir,
  type MazeDir,
  type CharMazeState,
} from "@/lib/minigames/charMaze";
import type { MinigameViewProps } from "./types";

const ART = 40;

type Board = {
  grid: ReturnType<typeof pickLayout>["grid"];
  rows: number;
  cols: number;
  playerR: number;
  playerC: number;
  exitR: number;
  exitC: number;
};

function loadWave(wave: number): Board {
  const layout = pickLayout(wave);
  return {
    grid: layout.grid,
    rows: layout.grid.length,
    cols: layout.grid[0]!.length,
    playerR: layout.start[0],
    playerC: layout.start[1],
    exitR: layout.exit[0],
    exitC: layout.exit[1],
  };
}

export function CharMazeView({ session, formArt, onInput, playSfx }: MinigameViewProps) {
  const st = session.state as CharMazeState;
  const [wave, setWave] = useState(0);
  const [board, setBoard] = useState(() => loadWave(0));
  const [flash, setFlash] = useState<"good" | "miss" | null>(null);
  const [bump, setBump] = useState(false);

  const boardRef = useRef(board);
  boardRef.current = board;
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const cellTapRef = useRef(false);
  const movingRef = useRef(false);
  const completeRef = useRef(session.complete);
  completeRef.current = session.complete;
  const scoreRef = useRef(st.score);
  scoreRef.current = st.score;
  const neededRef = useRef(st.needed);
  neededRef.current = st.needed;
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;
  const playSfxRef = useRef(playSfx);
  playSfxRef.current = playSfx;
  const waveRef = useRef(wave);
  waveRef.current = wave;

  const step = (dir: MazeDir) => {
    if (completeRef.current || movingRef.current) return;
    const b = boardRef.current;
    const [nr, nc] = neighbor(b.playerR, b.playerC, dir);
    if (!canStep(b.grid, nr, nc)) {
      setBump(true);
      window.setTimeout(() => setBump(false), 160);
      setFlash("miss");
      window.setTimeout(() => setFlash(null), 280);
      // Host plays missSfx — don't double-fire here
      onInputRef.current({ type: "action", action: "step", quality: "miss" });
      return;
    }

    movingRef.current = true;
    const atExit = nr === b.exitR && nc === b.exitC;
    const next: Board = { ...b, playerR: nr, playerC: nc };
    boardRef.current = next;
    setBoard(next);

    if (atExit) {
      // Host plays goodSfx ("pop") via onInput — don't double-fire here
      setFlash("good");
      window.setTimeout(() => setFlash(null), 420);
      onInputRef.current({ type: "action", action: "step", quality: "good" });
      const nextScore = scoreRef.current + 1;
      window.setTimeout(() => {
        movingRef.current = false;
        if (completeRef.current || nextScore >= neededRef.current) return;
        const nextWave = waveRef.current + 1;
        waveRef.current = nextWave;
        setWave(nextWave);
        const fresh = loadWave(nextWave);
        boardRef.current = fresh;
        setBoard(fresh);
      }, 380);
      return;
    }

    playSfxRef.current("pop");
    window.setTimeout(() => {
      movingRef.current = false;
    }, 90);
  };

  const stepRef = useRef(step);
  stepRef.current = step;

  const tapCell = (r: number, c: number) => {
    const b = boardRef.current;
    const dir = dirToAdjacent(b.playerR, b.playerC, r, c);
    if (!dir) {
      // Tapped a non-neighbor path — soft ignore
      return;
    }
    stepRef.current(dir);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, MazeDir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        KeyW: "up",
        KeyS: "down",
        KeyA: "left",
        KeyD: "right",
      };
      const dir = map[e.code];
      if (!dir) return;
      e.preventDefault();
      stepRef.current(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    cellTapRef.current = false;
    pointerRef.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const finishPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerRef.current;
    pointerRef.current = null;
    if (!start || cellTapRef.current) return;
    const dir = swipeToDir(e.clientX - start.x, e.clientY - start.y, 14);
    if (dir) stepRef.current(dir);
  };

  const { grid, rows, cols, playerR, playerC, exitR, exitC } = board;

  return (
    <MinigameShell
      score={st.score}
      needed={st.needed}
      flash={flash}
      flashGoodLabel="יצאת!"
      flashMissLabel="קיר!"
      stageClassName="border-none"
    >
      <div
        className="absolute inset-0 z-10 touch-none select-none"
        role="application"
        aria-label="מבוך — לחצו על משבצת ליד החבר"
        onPointerDown={onPointerDown}
        onPointerUp={finishPointer}
        onPointerCancel={() => {
          pointerRef.current = null;
        }}
      >
        <div
          className="absolute inset-[5%] bottom-14 grid gap-1 rounded-2xl bg-[#5C7C3A]/40 p-1.5 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {grid.flatMap((row, r) =>
            row.map((cell, c) => {
              const wall = cell === 1;
              const isPlayer = r === playerR && c === playerC;
              const isExit = r === exitR && c === exitC;
              const adjacent =
                !wall &&
                !isPlayer &&
                dirToAdjacent(playerR, playerC, r, c) !== null;

              if (wall) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="rounded-md bg-[#6B4F2A] shadow-[inset_0_-2px_0_#4A3418]"
                  />
                );
              }

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={isExit ? "יציאה" : adjacent ? "ללכת לכאן" : "משבצת"}
                  className={
                    isExit
                      ? "relative flex items-center justify-center rounded-md bg-[#FFE066]/95 ring-2 ring-[#FAB005]"
                      : adjacent
                        ? "relative flex items-center justify-center rounded-md bg-[#A9E34B]/95 ring-2 ring-white/70"
                        : "relative flex items-center justify-center rounded-md bg-[#C8E6A0]/90"
                  }
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    cellTapRef.current = true;
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    cellTapRef.current = true;
                    if (!isPlayer) tapCell(r, c);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPlayer) tapCell(r, c);
                  }}
                >
                  {isExit && !isPlayer && (
                    <span className="pointer-events-none text-[clamp(18px,4.5vw,28px)] leading-none">
                      {st.exitEmoji}
                    </span>
                  )}
                  {isPlayer && (
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: bump ? "translateX(3px)" : undefined,
                        transition: "transform 70ms",
                      }}
                    >
                      <CharacterArt art={formArt} size={ART} className="drop-shadow-sm" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-0.5">
          <PadBtn label="▲" onPress={() => stepRef.current("up")} />
          <div className="flex gap-0.5">
            <PadBtn label="◀" onPress={() => stepRef.current("left")} />
            <PadBtn label="▼" onPress={() => stepRef.current("down")} />
            <PadBtn label="▶" onPress={() => stepRef.current("right")} />
          </div>
        </div>
      </div>
    </MinigameShell>
  );
}

function PadBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 text-lg font-black text-heading shadow-sm active:scale-95"
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onPress();
      }}
    >
      {label}
    </button>
  );
}
