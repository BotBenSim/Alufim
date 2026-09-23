import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Shared shell for home-screen picker cards (profile / character / game) */
const pickerShell =
  "box-border flex flex-col items-center justify-end gap-1.5 bg-white text-heading rounded-[26px] aspect-square w-full border-[3px] border-white px-1.5 pb-2.5 pt-2 font-semibold cursor-pointer shadow-soft text-[clamp(13px,2.6vw,16px)] leading-tight transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.95] active:translate-y-0.5";

const cardVariants = cva("", {
  variants: {
    variant: {
      profile: pickerShell,
      game: pickerShell,
      character: `${pickerShell} relative`,
      add: "flex flex-col items-center justify-end gap-1 rounded-[20px] aspect-square w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#FFA94D] to-[#FF6B6B] shadow-card px-1.5 pb-2 pt-1.5 active:scale-[0.94] active:translate-y-1",
      sub: "flex flex-col items-center justify-end gap-1 rounded-[20px] aspect-square w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#4DABF7] to-[#3B5BDB] shadow-card px-1.5 pb-2 pt-1.5 active:scale-[0.94] active:translate-y-1",
      eng: "flex flex-col items-center justify-end gap-1 rounded-[20px] aspect-square w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#F783AC] to-[#D6336C] shadow-card px-1.5 pb-2 pt-1.5 active:scale-[0.94] active:translate-y-1",
      find: "flex flex-col items-center justify-end gap-1 rounded-[20px] aspect-square w-full border-none font-bold text-white cursor-pointer bg-gradient-to-br from-[#FFB454] to-[#F76707] shadow-card px-1.5 pb-2 pt-1.5 active:scale-[0.94] active:translate-y-1",
      addProfile:
        "box-border flex flex-col items-center justify-end gap-1.5 bg-white/40 text-heading/80 border-[3px] border-dashed border-white shadow-none font-semibold rounded-[26px] aspect-square w-full px-1.5 pb-2.5 pt-2 cursor-pointer backdrop-blur-md transition-colors hover:bg-white/60 active:scale-[0.95]",
    },
    selected: {
      true: "border-[#FF7A45] ring-4 ring-[#FF7A45]/25 -translate-y-1",
      false: "",
    },
    locked: {
      true: "grayscale opacity-55 cursor-default active:scale-100 active:translate-y-0",
      false: "",
    },
  },
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
      className={cn(
        "flex min-h-0 flex-1 items-center justify-center text-[clamp(44px,12vw,65px)] leading-none",
        className
      )}
      {...props}
    />
  );
}

export function CardSub({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-[clamp(13px,2.4vw,17px)] font-normal opacity-90", className)}
      {...props}
    />
  );
}
