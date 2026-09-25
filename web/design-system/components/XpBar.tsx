import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { xpGainColor } from "@/lib/xp";

export type XpBarProps = HTMLAttributes<HTMLDivElement> & {
  pct: number;
  label: string;
  gainFlash?: number | null;
};

export function XpBar({ className, pct, label, gainFlash, ...props }: XpBarProps) {
  return (
    <div className={cn("relative w-full", className)} {...props}>
      <div
        className={cn(
          "xpBar relative h-6 overflow-hidden rounded-full bg-[#E6EEF7] shadow-[inset_0_2px_4px_rgba(35,53,84,.12)]",
          gainFlash && "gain"
        )}
        style={gainFlash ? { ["--xp-gain" as string]: xpGainColor(gainFlash) } : undefined}
      >
        <div
          className={cn(
            "xpFill absolute inset-y-0 left-0 rounded-full bg-linear-to-b from-[#6EE08A] to-[#2FB45A] shadow-[inset_0_3px_0_rgba(255,255,255,.4)] transition-[width] duration-500",
            gainFlash && "gain"
          )}
          style={{ width: `${pct}%` }}
        />
        <div
          className={cn(
            "xpText absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-heading [direction:ltr]",
            gainFlash && "tick"
          )}
        >
          {label}
        </div>
      </div>
      {gainFlash != null && (
        <span
          className={cn(
            "xpFloat absolute bottom-0.5 left-1/2 z-6 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border-[3px] px-3.5 py-1.5 text-[clamp(26px,6.5vw,38px)] font-black leading-none shadow-lg animate-xpFloatUp",
            gainFlash >= 6 && "big text-[clamp(34px,8vw,50px)]",
            gainFlash >= 4 && gainFlash < 6 && "med text-[clamp(30px,7vw,44px)]"
          )}
          style={{
            color: xpGainColor(gainFlash),
            borderColor: xpGainColor(gainFlash),
          }}
        >
          <span className="xpStar text-[0.85em]">⭐</span>+{gainFlash}
        </span>
      )}
    </div>
  );
}
