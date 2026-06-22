import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const kidButtonVariants = cva(
  "border-none font-bold cursor-pointer transition-transform active:translate-y-0.5 disabled:opacity-45 disabled:grayscale disabled:cursor-default disabled:active:translate-y-0",
  {
    variants: {
      variant: {
        play: "rounded-[20px] text-[27px] px-11 py-4 text-white bg-gradient-to-br from-[#FFB23E] to-[#F77F1B] shadow-[0_6px_0_#C75E07,0_10px_22px_rgba(0,0,0,.22),0_0_0_5px_rgba(255,255,255,.75)] active:shadow-[0_3px_0_#C75E07,0_6px_14px_rgba(0,0,0,.22),0_0_0_5px_rgba(255,255,255,.75)]",
        text: "rounded-[18px] text-[clamp(15px,3vw,19px)] px-5 py-2.5 bg-white/90 text-heading shadow-[0_4px_10px_rgba(0,0,0,.14)]",
        continue:
          "rounded-[18px] text-[clamp(16px,3.2vw,20px)] px-5 py-2.5 text-white bg-gradient-to-br from-[#58C26E] to-[#2E9E5B] shadow-[0_5px_0_#1F7A42] active:shadow-[0_2px_0_#1F7A42] mt-3",
        panel:
          "rounded-[20px] text-[22px] px-6 py-3.5 text-white bg-gradient-to-br from-[#58C26E] to-[#2E9E5B] shadow-[0_5px_0_#1F7A42] active:shadow-[0_2px_0_#1F7A42]",
        panelRed:
          "rounded-[20px] text-[22px] px-6 py-3.5 text-white bg-gradient-to-br from-[#FF8A80] to-[#E2574C] shadow-[0_5px_0_#B03A31] active:shadow-[0_2px_0_#B03A31]",
        panelBlue:
          "rounded-[20px] text-[22px] px-6 py-3.5 text-white bg-gradient-to-br from-[#4DA3FF] to-[#2F7BD0] shadow-[0_5px_0_#1F5A9E] active:shadow-[0_2px_0_#1F5A9E]",
        top: "rounded-2xl text-[15px] px-3 py-2 bg-white/90 text-heading shadow-[0_3px_8px_rgba(0,0,0,.12)]",
        answer:
          "rounded-full w-[clamp(74px,16vw,120px)] h-[clamp(74px,16vw,120px)] text-[clamp(32px,7vw,52px)] text-white bg-gradient-to-br from-[#4DA3FF] to-[#2F7BD0] shadow-[0_7px_0_#1F5A9E,0_12px_20px_rgba(0,0,0,.18)] active:shadow-[0_2px_0_#1F5A9E]",
        answerEng:
          "rounded-full w-[clamp(86px,19vw,140px)] h-[clamp(86px,19vw,140px)] text-[clamp(46px,10vw,76px)] bg-gradient-to-br from-[#F783AC] to-[#D6336C] shadow-[0_7px_0_#A61E4D,0_12px_20px_rgba(0,0,0,.18)] active:shadow-[0_2px_0_#A61E4D]",
        answerFind:
          "rounded-full w-[clamp(74px,16vw,120px)] h-[clamp(74px,16vw,120px)] text-[clamp(40px,9vw,68px)] bg-gradient-to-br from-[#FFB454] to-[#F76707] shadow-[0_7px_0_#C2410C,0_12px_20px_rgba(0,0,0,.18)] active:shadow-[0_2px_0_#C2410C]",
        answerGroup:
          "rounded-3xl min-w-[clamp(78px,17vw,120px)] min-h-[clamp(74px,16vw,110px)] max-w-[clamp(120px,30vw,210px)] px-3.5 py-3 text-[clamp(20px,4.6vw,32px)] leading-tight flex flex-wrap items-center justify-center gap-0.5 bg-gradient-to-br from-[#63D2A6] to-[#22A06B] shadow-[0_7px_0_#157A4F,0_12px_20px_rgba(0,0,0,.18)] active:shadow-[0_2px_0_#157A4F] h-auto w-auto",
        speak:
          "rounded-full w-11 h-11 text-[22px] text-white bg-[#4DA3FF] shadow-[0_3px_0_#2F7BD0] active:shadow-[0_1px_0_#2F7BD0]",
      },
      off: {
        true: "bg-[#B8C4CE] shadow-[0_7px_0_#8E9BA6] pointer-events-none opacity-60 active:translate-y-0",
        false: "",
      },
      wobble: {
        true: "animate-[wob_0.45s]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "text",
      off: false,
      wobble: false,
    },
  }
);

export type KidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof kidButtonVariants>;

export function KidButton({
  className,
  variant,
  off,
  wobble,
  ...props
}: KidButtonProps) {
  return (
    <button
      type="button"
      className={cn(kidButtonVariants({ variant, off, wobble }), className)}
      {...props}
    />
  );
}
