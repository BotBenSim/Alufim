import { cn } from "@/lib/utils";

type Props = {
  /**
   * `fixed` — app-wide layer behind everything (default).
   * `fill` — absolute inset of a parent (e.g. settings minigame tryout).
   */
  mode?: "fixed" | "fill";
  className?: string;
};

export function BackgroundScene({ mode = "fixed", className }: Props) {
  const clouds = ["sc1", "sc2", "sc4", "sc6", "sc7"];

  return (
    <div
      id={mode === "fixed" ? "bgScene" : undefined}
      className={cn(
        "bgScene pointer-events-none overflow-hidden",
        mode === "fixed" ? "fixed inset-0 z-0" : "absolute inset-0",
        className
      )}
      aria-hidden
    >
      {/* Soft colour glows give the sky depth without a picture to read. */}
      <div className="absolute left-[-20%] top-[-18%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(255,214,120,.55),rgba(255,214,120,0)_62%)]" />
      <div className="absolute right-[-25%] top-[8%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(190,160,255,.35),rgba(190,160,255,0)_60%)]" />
      <div className="sun absolute left-[7%] top-[5%] h-[clamp(64px,14vw,110px)] w-[clamp(64px,14vw,110px)] animate-sunPulse rounded-full bg-[radial-gradient(circle_at_35%_35%,#FFF3B0,#FFD24A_60%,#FFB938)] shadow-[0_0_0_14px_rgba(255,220,110,.22),0_0_0_32px_rgba(255,220,110,.12)]" />
      {clouds.map((cls) => (
        <div key={cls} className={`skyCloud ${cls}`} />
      ))}
      <svg
        className="ground absolute bottom-0 left-0 h-[22vh] min-h-[130px] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#B5EBA0"
          d="M0 150C180 90 360 70 560 110s380 90 560 50 260-80 320-90V320H0Z"
        />
        <path
          fill="#86D873"
          d="M0 210c200-60 420-80 640-40s420 70 600 30c90-20 150-40 200-50V320H0Z"
        />
        <path
          fill="#5FC05A"
          d="M0 270c240-40 480-50 720-25s480 35 720 5V320H0Z"
        />
      </svg>
    </div>
  );
}
