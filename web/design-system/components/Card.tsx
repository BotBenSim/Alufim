import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "flex flex-col items-center justify-center gap-2 border-none font-bold text-white cursor-pointer transition-transform active:scale-[0.94] active:translate-y-1",
  {
    variants: {
      variant: {
        profile: "bg-white text-heading rounded-card shadow-card aspect-[1/1.12] w-full text-[clamp(15px,3vw,20px)]",
        game: "rounded-card aspect-[1/1.12] w-full text-[clamp(15px,3vw,20px)] shadow-card",
        add: "bg-gradient-to-br from-[#FFA94D] to-[#FF6B6B]",
        sub: "bg-gradient-to-br from-[#4DABF7] to-[#3B5BDB]",
        eng: "bg-gradient-to-br from-[#F783AC] to-[#D6336C]",
        find: "bg-gradient-to-br from-[#FFB454] to-[#F76707]",
        addProfile:
          "bg-white/60 text-[#2F6B9E] border-[3px] border-dashed border-[#9BB7D4] shadow-none font-extrabold",
        character:
          "bg-white text-heading rounded-card shadow-card aspect-[1/1.12] w-full p-3 gap-1",
      },
      selected: {
        true: "outline outline-4 outline-[#2E9E5B] outline-offset-2",
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
  }
);

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
