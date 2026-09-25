import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
  Every colour is a theme token. A raised "toy" fill takes its role colour from
  --fill; the highlight and pressed edge are derived from it with color-mix,
  the same way the shared @kids button does.
*/
const toyFill =
  "text-white bg-linear-to-b from-[color-mix(in_oklab,var(--fill)_72%,white)] to-(--fill) [--edge:color-mix(in_oklab,var(--fill)_68%,black)]";
const answerFill = `${toyFill} shadow-[inset_0_3px_0_color-mix(in_oklab,white_35%,transparent),0_6px_0_var(--edge),0_14px_22px_-6px_color-mix(in_oklab,var(--edge)_55%,transparent)] active:shadow-[inset_0_3px_0_color-mix(in_oklab,white_35%,transparent),0_2px_0_var(--edge)]`;
const speakFill =
  "text-white bg-(--fill) [--edge:color-mix(in_oklab,var(--fill)_68%,black)] shadow-[0_3px_0_var(--edge),0_4px_10px_color-mix(in_oklab,var(--edge)_25%,transparent)] hover:brightness-95 active:translate-y-0.5 active:shadow-[0_1px_0_var(--edge)]";
const panelFill = `${toyFill} shadow-[0_5px_0_var(--edge)] active:shadow-[0_2px_0_var(--edge)]`;

const kidButtonVariants = cva(
  "border-none font-bold cursor-pointer transition-[transform,box-shadow] duration-150 active:translate-y-1 disabled:opacity-45 disabled:grayscale disabled:cursor-default disabled:active:translate-y-0",
  {
    variants: {
      variant: {
        // The main call to action is the shared @kids `play` button.
        play: cn(buttonVariants({ variant: "play", size: "kid" }), "min-w-[200px] px-10 text-[22px]"),
        text: "glass rounded-full text-[clamp(15px,3vw,19px)] px-5 py-2.5 text-foreground shadow-soft",
        continue: `${panelFill} [--fill:var(--success)] rounded-[18px] text-[clamp(16px,3.2vw,20px)] px-5 py-2.5 mt-3`,
        panel: `${panelFill} [--fill:var(--success)] rounded-[20px] text-[22px] px-6 py-3.5`,
        panelRed: `${panelFill} [--fill:var(--destructive)] rounded-[20px] text-[22px] px-6 py-3.5`,
        panelBlue: `${panelFill} [--fill:var(--secondary)] rounded-[20px] text-[22px] px-6 py-3.5`,
        top: "glass inline-flex h-11 w-11 items-center justify-center rounded-full text-[18px] text-foreground shadow-soft",
        answer:
          "rounded-[30%] w-[clamp(78px,17vw,120px)] h-[clamp(78px,17vw,120px)] text-[clamp(34px,7.5vw,54px)]",
        answerEng:
          "rounded-[30%] w-[clamp(86px,19vw,140px)] h-[clamp(86px,19vw,140px)] text-[clamp(46px,10vw,76px)]",
        answerFind:
          "rounded-[30%] w-[clamp(78px,17vw,120px)] h-[clamp(78px,17vw,120px)] text-[clamp(40px,9vw,68px)]",
        answerGroup:
          "rounded-[24px] min-w-[clamp(78px,17vw,120px)] min-h-[clamp(74px,16vw,110px)] max-w-[clamp(120px,30vw,210px)] px-3.5 py-3 text-[clamp(20px,4.6vw,32px)] leading-tight flex flex-wrap items-center justify-center gap-0.5 h-auto w-auto",
        speak:
          "inline-flex items-center justify-center rounded-full h-10 w-10",
      },
      tone: {
        boy: "[--fill:var(--boy)]",
        girl: "[--fill:var(--girl)]",
      },
      off: {
        true: "bg-muted text-muted-foreground shadow-[0_7px_0_color-mix(in_oklab,var(--muted)_70%,black)] pointer-events-none opacity-60 active:translate-y-0",
        false: "",
      },
      wobble: {
        true: "animate-[wob_0.45s]",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: ["answer", "answerEng", "answerFind", "answerGroup"],
        off: false,
        class: answerFill,
      },
      { variant: "speak", off: false, class: speakFill },
    ],
    defaultVariants: {
      variant: "text",
      tone: "boy",
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
  tone,
  off,
  wobble,
  ...props
}: KidButtonProps) {
  return (
    <button
      type="button"
      className={cn(kidButtonVariants({ variant, tone, off, wobble }), className)}
      {...props}
    />
  );
}
