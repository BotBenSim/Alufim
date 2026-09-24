import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const boyAnswerFill =
  "text-white bg-gradient-to-b from-[#5DB2FF] to-[#3A86F0] shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_6px_0_#2462C4,0_14px_22px_-6px_rgba(36,98,196,.55)] active:shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_2px_0_#2462C4]";
const girlAnswerFill =
  "text-white bg-gradient-to-b from-[#FF8DBA] to-[#F0508F] shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_6px_0_#C72E6C,0_14px_22px_-6px_rgba(199,46,108,.5)] active:shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_2px_0_#C72E6C]";
const boySpeakFill =
  "text-white bg-[#4DA3FF] shadow-[0_3px_0_#2F7BD0,0_4px_10px_rgba(47,123,208,.25)] hover:bg-[#3b93ef] active:translate-y-0.5 active:shadow-[0_1px_0_#2F7BD0]";
const girlSpeakFill =
  "text-white bg-[#F783AC] shadow-[0_3px_0_#D6336C,0_4px_10px_rgba(214,51,108,.25)] hover:bg-[#e66f9a] active:translate-y-0.5 active:shadow-[0_1px_0_#D6336C]";

const kidButtonVariants = cva(
  "border-none font-bold cursor-pointer transition-[transform,box-shadow] duration-150 active:translate-y-1 disabled:opacity-45 disabled:grayscale disabled:cursor-default disabled:active:translate-y-0",
  {
    variants: {
      variant: {
        play: "inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full text-[22px] font-bold px-10 py-4 text-white bg-gradient-to-b from-[#FFA24C] to-[#FF6A3D] shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_6px_0_#D9481F,0_18px_30px_-8px_rgba(255,106,61,.6)] hover:brightness-105 active:shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_2px_0_#D9481F] disabled:shadow-none",
        text: "glass rounded-full text-[clamp(15px,3vw,19px)] px-5 py-2.5 text-heading shadow-soft",
        continue:
          "rounded-[18px] text-[clamp(16px,3.2vw,20px)] px-5 py-2.5 text-white bg-gradient-to-br from-[#58C26E] to-[#2E9E5B] shadow-[0_5px_0_#1F7A42] active:shadow-[0_2px_0_#1F7A42] mt-3",
        panel:
          "rounded-[20px] text-[22px] px-6 py-3.5 text-white bg-gradient-to-br from-[#58C26E] to-[#2E9E5B] shadow-[0_5px_0_#1F7A42] active:shadow-[0_2px_0_#1F7A42]",
        panelRed:
          "rounded-[20px] text-[22px] px-6 py-3.5 text-white bg-gradient-to-br from-[#FF8A80] to-[#E2574C] shadow-[0_5px_0_#B03A31] active:shadow-[0_2px_0_#B03A31]",
        panelBlue:
          "rounded-[20px] text-[22px] px-6 py-3.5 text-white bg-gradient-to-br from-[#4DA3FF] to-[#2F7BD0] shadow-[0_5px_0_#1F5A9E] active:shadow-[0_2px_0_#1F5A9E]",
        top: "glass inline-flex h-11 w-11 items-center justify-center rounded-full text-[18px] text-heading shadow-soft",
        answer:
          "inline-flex items-center justify-center whitespace-nowrap rounded-[clamp(24px,5vw,36px)] min-w-[clamp(78px,17vw,120px)] h-[clamp(78px,17vw,120px)] px-[0.3em] text-[clamp(34px,7.5vw,54px)]",
        answerEng:
          "inline-flex items-center justify-center whitespace-nowrap rounded-[clamp(26px,5.5vw,40px)] min-w-[clamp(86px,19vw,140px)] h-[clamp(86px,19vw,140px)] px-[0.3em] text-[clamp(46px,10vw,76px)]",
        answerFind:
          "inline-flex items-center justify-center whitespace-nowrap rounded-[clamp(24px,5vw,36px)] min-w-[clamp(78px,17vw,120px)] h-[clamp(78px,17vw,120px)] px-[0.3em] text-[clamp(40px,9vw,68px)]",
        answerGroup:
          "rounded-3xl min-w-[clamp(78px,17vw,120px)] min-h-[clamp(74px,16vw,110px)] max-w-[clamp(120px,30vw,210px)] px-3.5 py-3 text-[clamp(20px,4.6vw,32px)] leading-tight flex flex-wrap items-center justify-center gap-0.5 h-auto w-auto",
        speak:
          "inline-flex items-center justify-center rounded-full h-10 w-10",
      },
      tone: {
        boy: "",
        girl: "",
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
    compoundVariants: [
      {
        variant: ["answer", "answerEng", "answerFind", "answerGroup"],
        tone: "boy",
        off: false,
        class: boyAnswerFill,
      },
      {
        variant: ["answer", "answerEng", "answerFind", "answerGroup"],
        tone: "girl",
        off: false,
        class: girlAnswerFill,
      },
      { variant: "speak", tone: "boy", off: false, class: boySpeakFill },
      { variant: "speak", tone: "girl", off: false, class: girlSpeakFill },
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
