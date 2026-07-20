import { describe, expect, it } from "vitest";
import {
  pacedSpeed,
  pickGap,
  resolveJumpConfig,
  tryBeginJump,
} from "./jumpConfig";

describe("resolveJumpConfig", () => {
  it("returns engine defaults", () => {
    const cfg = resolveJumpConfig("pathDash");
    expect(cfg.maxJumps).toBe(2);
    expect(cfg.speedMax).toBeGreaterThan(cfg.speedMin);
  });

  it("merges per-skin jump overrides", () => {
    const cfg = resolveJumpConfig("timingBounce", {
      jump: { maxJumps: 1, hardChance: 0.1 },
    });
    expect(cfg.maxJumps).toBe(1);
    expect(cfg.hardChance).toBe(0.1);
    expect(cfg.gravity).toBe(resolveJumpConfig("timingBounce").gravity);
  });
});

describe("tryBeginJump", () => {
  const cfg = resolveJumpConfig("pathDash");

  it("allows grounded jump", () => {
    const next = tryBeginJump(cfg, { grounded: true, jumping: false, jumpsUsed: 0 });
    expect(next?.jumpsUsed).toBe(1);
    expect(next?.velocity).toBe(cfg.jumpVelocity);
  });

  it("allows double jump when maxJumps is 2", () => {
    const next = tryBeginJump(cfg, { grounded: false, jumping: true, jumpsUsed: 1 });
    expect(next?.jumpsUsed).toBe(2);
    expect(next?.velocity).toBe(cfg.doubleJumpVelocity);
  });

  it("blocks third jump", () => {
    expect(
      tryBeginJump(cfg, { grounded: false, jumping: true, jumpsUsed: 2 })
    ).toBeNull();
  });

  it("respects maxJumps: 1", () => {
    const single = resolveJumpConfig("pathDash", { jump: { maxJumps: 1 } });
    expect(
      tryBeginJump(single, { grounded: false, jumping: true, jumpsUsed: 1 })
    ).toBeNull();
  });
});

describe("pickGap / pacedSpeed", () => {
  it("returns a value inside easy range when hard disallowed", () => {
    const cfg = resolveJumpConfig("pathDash", { jump: { hardChance: 1 } });
    for (let i = 0; i < 20; i++) {
      const g = pickGap(cfg, false);
      expect(g).toBeGreaterThanOrEqual(cfg.gapEasy[0]);
      expect(g).toBeLessThanOrEqual(cfg.gapEasy[1]);
    }
  });

  it("dino race uses a steady scroll pace", () => {
    const cfg = resolveJumpConfig("timingBounce");
    expect(cfg.paceDriftRate).toBe(0);
    expect(pacedSpeed(0, cfg)).toBeCloseTo(pacedSpeed(Math.PI, cfg), 5);
    expect(pacedSpeed(0, cfg)).toBeCloseTo((cfg.speedMin + cfg.speedMax) / 2, 5);
  });

  it("path dash still drifts between min and max", () => {
    const cfg = resolveJumpConfig("pathDash");
    const a = pacedSpeed(0, cfg);
    const b = pacedSpeed(Math.PI, cfg);
    expect(a).toBeGreaterThanOrEqual(cfg.speedMin * 0.85);
    expect(b).toBeLessThanOrEqual(cfg.speedMax * 1.15);
  });
});
