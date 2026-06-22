import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Shared shell for home-screen picker cards (profile / character / game) */
const pickerShell =
  "box-border flex flex-col items-center justify-center gap-2 bg-white text-heading rounded-[24px] aspect-[1/1.12] w-full border-4 border-transparent p-3 font-bold cursor-pointer shadow-[0_6px_0_rgba(60,90,120,.10),0_12px_22px_rgba(60,90,120,.14)] text-[clamp(15px,3vw,20px)] transition-[transform,box-shadow,border-color] active:scale-[0.94] active:translate-y-1";

const cardVariants = cva("", {
  variants: {
    variant: {
      profile: pickerShell,
      game: pickerShell,
      character: `${pickerShell} relative`,
      add: "flex flex-col items-center justify-center gap-2 rounded-card aspect-[1/1.12] w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#FFA94D] to-[#FF6B6B] shadow-card active:scale-[0.94] active:translate-y-1",
      sub: "flex flex-col items-center justify-center gap-2 rounded-card aspect-[1/1.12] w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#4DABF7] to-[#3B5BDB] shadow-card active:scale-[0.94] active:translate-y-1",
      eng: "flex flex-col items-center justify-center gap-2 rounded-card aspect-[1/1.12] w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#F783AC] to-[#D6336C] shadow-card active:scale-[0.94] active:translate-y-1",
      find: "flex flex-col items-center justify-center gap-2 rounded-card aspect-[1/1.12] w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#FFB454] to-[#F76707] shadow-card active:scale-[0.94] active:translate-y-1",
      addProfile:
        "box-border flex flex-col items-center justify-center gap-2 bg-white/60 text-[#2F6B9E] border-[3px] border-dashed border-[#9BB7D4] shadow-none font-extrabold rounded-[24px] aspect-[1/1.12] w-full p-3 cursor-pointer active:scale-[0.94] active:translate-y-1",
    },
    selected: {
      true: "border-[#2E9E5B]",
      false: "",
    },
    locked: {
      true: "grayscale opacity-55 cursor-default active:scale-100 active:translate-y-0",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "character",
      selected: true,
      class:
        "after:absolute after:left-1 after:top-1 after:flex after:h-[22px] after:w-[22px] after:items-center after:justify-center after:rounded-full after:bg-[#2E9E5B] after:text-sm after:font-black after:text-white after:content-['✓'] after:shadow-md",
    },
  ],
  defaultVariants: {
    variant: "profile",
    selected: false,
    locked: false,
  },
});

export type CardProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof cardVariants>;

export function Card({ className, variant, selected, locked, ...props }: CardProps) {
  return (
    <button
      type="button"
      className={cn(cardVariants({ variant, selected, locked }), className)}
      disabled={locked ?? undefined}
      {...props}
    />
  );
}

export function CardBig({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-[clamp(46px,12vw,72px)] leading-none", className)}
      {...props}
    />
  );
}

export function CardSub({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-[clamp(15px,2.6vw,20px)] font-normal opacity-90", className)}
      {...props}
    />
  );
}
