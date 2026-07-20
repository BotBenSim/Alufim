"use client";

import { useCallback } from "react";
import { tokens } from "@/design-system/tokens";
import { rnd } from "@/lib/random";

export function useConfetti() {
  const burst = useCallback((n = 45) => {
    if (typeof document === "undefined") return;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.className = "cf";
      d.style.left = `${rnd(100)}vw`;
      d.style.background = tokens.confettiColors[rnd(tokens.confettiColors.length)];
      d.style.animationDuration = `${1.4 + Math.random() * 1.4}s`;
      d.style.animationDelay = `${Math.random() * 0.3}s`;
      if (rnd(2)) d.style.borderRadius = "50%";
      document.body.appendChild(d);
      window.setTimeout(() => d.remove(), 3200);
    }
  }, []);

  return { burst };
}
