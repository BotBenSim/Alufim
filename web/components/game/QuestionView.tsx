"use client";

import { useMemo } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { KidButton } from "@/design-system";
import { HEB_NUM } from "@/data/hebrew";
import { findCatLabel } from "@/data/find";
import { addRenderMeta } from "@/lib/providers/add";
import { subRenderMeta } from "@/lib/providers/sub";
import type { EngQuestion } from "@/lib/providers/eng";
import type { RunState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { repeatStr } from "@/lib/random";

function emojiSize(n: number) {
  if (n <= 3) return 44;
  if (n <= 6) return 36;
  if (n <= 10) return 28;
  return 22;
}

function EmojiGroup({
  emoji,
  count,
  crossed,
}: {
  emoji: string;
  count: number;
  crossed?: number;
}) {
  const es = emojiSize(count);
  return (
    <div
      className="group flex max-w-[calc(5*(var(--es)+4px))] flex-wrap justify-center gap-0.5"
      style={{ ["--es" as string]: `${es}px` }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn("leading-tight", i < (crossed || 0) && "x relative opacity-55")}
          style={{ fontSize: es }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

type QuestionViewProps = {
  run: RunState;
  disabledAnswers: string[];
  wobbleAnswer: string | null;
  onAnswer: (value: string) => void;
};

export function QuestionView({
  run,
  disabledAnswers,
  wobbleAnswer,
  onAnswer,
}: QuestionViewProps) {
  const q = run.current;
  const em = run.character.counts;

  const choiceProps = useMemo(() => {
    if (!q) return null;

    if (q.op === "add") {
      const aq = q as { a: number; b: number; answer: number };
      const meta = addRenderMeta(aq, run.step, em);
      return {
        kind: "math" as const,
        countOn: meta.countOn,
        a: aq.a,
        b: aq.b,
        op: "+",
        digits: meta.digits,
        options: meta.options.map(String),
        variant: "answer" as const,
      };
    }

    if (q.op === "sub") {
      const sq = q as { a: number; b: number; answer: number };
      const meta = subRenderMeta(sq);
      return {
        kind: "sub" as const,
        a: sq.a,
        b: sq.b,
        digits: meta.digits,
        options: meta.options.map(String),
        variant: "answer" as const,
      };
    }

    if (q.op === "eng") {
      const eq = q as EngQuestion;
      return {
        kind: "eng" as const,
        word: eq.word.en,
        hint: "איזה אחד זה?",
        options: eq.options.map((o) => o.emoji),
        variant: "answerEng" as const,
      };
    }

    if (q.op === "find") {
      const fq = q as Record<string, unknown> & { kind: string; answer: unknown };
      const pointer = "👆";

      if (fq.kind === "num") {
        return {
          kind: "find" as const,
          prompt: `מצאו את המספר ${HEB_NUM[fq.answer as number] || fq.answer}`,
          hint: pointer,
          options: (fq as { options?: number[] }).options?.map(String) ?? [],
          variant: "answerFind" as const,
        };
      }
      if (fq.kind === "letter") {
        const item = fq.item as { name: string; l: string };
        return {
          kind: "find" as const,
          prompt: `מצאו את האות ${item.name}`,
          hint: pointer,
          options: (fq.options as { l: string }[]).map((o) => o.l),
          variant: "answerFind" as const,
        };
      }
      if (fq.kind === "phon") {
        const item = fq.item as { l: string; emoji: string };
        return {
          kind: "find" as const,
          prompt: `מה מתחיל ב־ ${item.l}`,
          hint: "איזה מתחיל בּצליל הזה?",
          options: (fq.options as { emoji: string }[]).map((o) => o.emoji),
          variant: "answerEng" as const,
        };
      }
      if (fq.kind === "more") {
        const opts = fq.options as { count: number; em: string }[];
        return {
          kind: "findGroup" as const,
          prompt: "מצאו את הקבוצה עם הכי הרבה",
          hint: pointer,
          options: opts.map((o) => ({
            value: String(o.count),
            label: repeatStr(o.em, o.count),
          })),
          variant: "answerGroup" as const,
        };
      }
      if (fq.kind === "bignum") {
        return {
          kind: "find" as const,
          prompt: "איזה מספר גדול יותר?",
          hint: pointer,
          options: (fq.options as number[]).map(String),
          variant: "answerFind" as const,
        };
      }
      if (fq.kind === "reason") {
        return {
          kind: "find" as const,
          prompt: fq.prompt as string,
          hint: pointer,
          options: fq.options as string[],
          variant: "answerEng" as const,
        };
      }
      const cat = fq.cat as string;
      const item = fq.item as { he: string; emoji: string };
      return {
        kind: "find" as const,
        prompt: findCatLabel(cat, item.he),
        hint: pointer,
        options: (fq.options as { emoji: string }[]).map((o) => o.emoji),
        variant: "answerEng" as const,
      };
    }

    return null;
  }, [q, run.step, em]);

  if (!q || !choiceProps) return null;

  return (
    <div id="questionCard" className="flex max-w-[96%] flex-col items-center gap-2 rounded-[26px] bg-white/90 px-4 py-3.5 shadow-[0_8px_22px_rgba(29,78,122,.18)]">
      {choiceProps.kind === "math" && (
        <>
          <div id="shapesRow" className="flex flex-wrap items-center justify-center gap-2.5 [direction:ltr]">
            {choiceProps.countOn ? (
              <>
                <span className="bignum rounded-[18px] bg-[#FFE9A8] px-3 py-0.5 text-[clamp(54px,11vw,92px)] font-extrabold text-heading shadow-[0_4px_0_rgba(0,0,0,.12)]">
                  {choiceProps.a}
                </span>
                <span className="op text-[clamp(28px,5vw,44px)] font-extrabold text-heading">+</span>
                <EmojiGroup emoji={em} count={choiceProps.b!} />
              </>
            ) : (
              <>
                <EmojiGroup emoji={em} count={choiceProps.a!} />
                <span className="op text-[clamp(28px,5vw,44px)] font-extrabold text-heading">+</span>
                <EmojiGroup emoji={em} count={choiceProps.b!} />
              </>
            )}
          </div>
          <div
            id="digitsRow"
            className="text-[clamp(34px,7vw,56px)] font-extrabold tracking-wide text-[#E2574C] [direction:ltr]"
          >
            <b className="text-heading">{choiceProps.a}</b> +{" "}
            <b className="text-heading">{choiceProps.b}</b> = ?
          </div>
        </>
      )}

      {choiceProps.kind === "sub" && (
        <>
          <div id="shapesRow" className="flex flex-wrap items-center justify-center gap-2.5 [direction:ltr]">
            <EmojiGroup emoji={em} count={choiceProps.a!} crossed={choiceProps.b} />
          </div>
          <div
            id="digitsRow"
            className="text-[clamp(34px,7vw,56px)] font-extrabold tracking-wide text-[#E2574C] [direction:ltr]"
          >
            <b className="text-heading">{choiceProps.a}</b> −{" "}
            <b className="text-heading">{choiceProps.b}</b> = ?
          </div>
        </>
      )}

      {choiceProps.kind === "eng" && (
        <>
          <div id="shapesRow" className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="engword text-[clamp(48px,12vw,100px)] font-extrabold tracking-wide text-heading [direction:ltr]">
              {choiceProps.word}
            </div>
          </div>
          <div id="digitsRow" className="enghint text-[clamp(18px,3.4vw,26px)] font-bold text-heading">
            {choiceProps.hint}
          </div>
        </>
      )}

      {(choiceProps.kind === "find" || choiceProps.kind === "findGroup") && (
        <>
          <div className="findprompt text-center text-[clamp(30px,7vw,56px)] font-extrabold text-heading">
            {"prompt" in choiceProps ? choiceProps.prompt : ""}
          </div>
          {"hint" in choiceProps && choiceProps.hint && (
            <div className="enghint text-[clamp(18px,3.4vw,26px)] font-bold text-heading">
              {choiceProps.hint}
            </div>
          )}
        </>
      )}

      <div id="answers" className="flex flex-wrap justify-center gap-[clamp(12px,3vw,26px)]">
        {"options" in choiceProps &&
          (choiceProps.kind === "findGroup"
            ? (choiceProps.options as { value: string; label: string }[]).map((o) => (
                <KidButton
                  key={o.value}
                  variant="answerGroup"
                  off={disabledAnswers.includes(o.value)}
                  wobble={wobbleAnswer === o.value}
                  onClick={() => onAnswer(o.value)}
                >
                  {o.label}
                </KidButton>
              ))
            : (choiceProps.options as string[]).map((o) => (
                <KidButton
                  key={o}
                  variant={choiceProps.variant}
                  off={disabledAnswers.includes(o)}
                  wobble={wobbleAnswer === o}
                  onClick={() => onAnswer(o)}
                >
                  {o}
                </KidButton>
              )))}
      </div>
    </div>
  );
}
