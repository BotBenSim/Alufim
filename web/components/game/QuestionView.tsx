"use client";

import { useMemo } from "react";
import { KidButton } from "@/design-system";
import { HEB_NUM } from "@/data/hebrew";
import { AnswerGlyphView } from "@/components/game/AnswerGlyphView";
import { addRenderMeta, type AddQuestion } from "@/lib/providers/add";
import { subRenderMeta, type SubQuestion } from "@/lib/providers/sub";
import { mulRenderMeta, type MulQuestion } from "@/lib/providers/mul";
import { divRenderMeta, type DivQuestion } from "@/lib/providers/div";
import { engRenderMeta, type EngQuestion } from "@/lib/providers/eng";
import { isStageGame, STAGE_PROVIDERS } from "@/lib/providers";
import type { AnswerChoice } from "@/lib/answerChoice";
import { PLAY_CARD_STAGE_CLASS } from "@/components/game/GamePlayPanel";
import type { PlayerGender, RunState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { numberOptions, repeatStr } from "@/lib/random";

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

/**
 * One equal group, boxed so the grouping itself is visible — that boundary is
 * what makes "4 groups of 3" readable rather than 12 loose emoji.
 */
function GroupBox({ emoji, count }: { emoji: string; count: number }) {
  return (
    <div className="rounded-2xl bg-white/55 px-1.5 py-1 shadow-[0_2px_0_rgba(0,0,0,.08)]">
      <EmojiGroup emoji={emoji} count={count} />
    </div>
  );
}

function GroupsRow({
  emoji,
  groups,
  per,
}: {
  emoji: string;
  groups: number;
  per: number;
}) {
  return (
    <div
      id="shapesRow"
      className="flex flex-wrap items-center justify-center gap-2 [direction:ltr]"
    >
      {Array.from({ length: groups }, (_, i) => (
        <GroupBox key={i} emoji={emoji} count={per} />
      ))}
    </div>
  );
}

type QuestionViewProps = {
  run: RunState;
  gender?: PlayerGender;
  disabledAnswers: string[];
  wobbleAnswer: string | null;
  onAnswer: (value: string) => void;
  onSpeak: () => void;
};

export function QuestionView({
  run,
  gender = "boy",
  disabledAnswers,
  wobbleAnswer,
  onAnswer,
  onSpeak,
}: QuestionViewProps) {
  const q = run.current;
  const em = run.character.counts;

  const choiceProps = useMemo(() => {
    if (!q) return null;

    if (q.op === "add") {
      const aq = q as unknown as AddQuestion;
      const meta = addRenderMeta(aq, run.step, em, run.curriculum, run.level);
      return {
        kind: "math" as const,
        visual: meta.visual,
        a: aq.a,
        b: aq.b,
        op: "+",
        digits: meta.digits,
        options: meta.options.map(String),
        variant: "answer" as const,
      };
    }

    if (q.op === "sub") {
      const sq = q as unknown as SubQuestion;
      const meta = subRenderMeta(sq, run.step, run.curriculum, run.level);
      return {
        kind: "sub" as const,
        visual: meta.visual,
        a: sq.a,
        b: sq.b,
        digits: meta.digits,
        options: meta.options.map(String),
        variant: "answer" as const,
      };
    }

    if (q.op === "mul") {
      const mq = q as unknown as MulQuestion;
      const meta = mulRenderMeta(mq, run.step, em, run.curriculum, run.level);
      return {
        kind: "mul" as const,
        a: mq.a,
        b: mq.b,
        visual: meta.visual,
        options: meta.options.map(String),
        variant: "answer" as const,
      };
    }

    if (q.op === "div") {
      const dq = q as unknown as DivQuestion;
      const meta = divRenderMeta(dq, run.step, em, run.curriculum, run.level);
      return {
        kind: "div" as const,
        a: dq.a,
        b: dq.b,
        // Only the scaffolded visuals may show the shared-out groups; at
        // "numbers" the child works it out from the digits alone.
        per: dq.answer,
        visual: meta.visual,
        options: meta.options.map(String),
        variant: "answer" as const,
      };
    }

    if (q.op === "eng") {
      const eq = q as unknown as EngQuestion;
      const meta = engRenderMeta(eq);
      return {
        kind: "wordPrompt" as const,
        word: meta.word,
        hint: meta.hint,
        options: meta.options,
        variant: "answerEng" as const,
      };
    }

    if (isStageGame(q.op)) {
      const meta = STAGE_PROVIDERS[q.op].render(q);
      if (meta.variant === "answerGroup") {
        // Sets of emoji need the wrapping button; the label is the answer.
        return {
          kind: "pickGroup" as const,
          prompt: meta.prompt,
          hint: meta.hint,
          options: meta.options.map((o) => ({ value: o, label: o })),
          variant: "answerGroup" as const,
        };
      }
      return {
        kind: "pick" as const,
        prompt: meta.prompt,
        hint: meta.hint,
        options: meta.options,
        variant: meta.variant,
      };
    }

    return null;
  }, [q, run.step, run.curriculum, run.level, em]);

  if (!q || !choiceProps) return null;

  return (
    <div
      id="questionCard"
      className={cn(
        PLAY_CARD_STAGE_CLASS,
        "relative flex flex-col border border-white bg-white/95 px-4 pb-5 pt-3 shadow-[0_24px_48px_-16px_rgba(35,53,84,.3),0_4px_12px_rgba(35,53,84,.06)]"
      )}
    >
      {/* Own row + opaque strip so emoji content can never paint over the speaker */}
      <div className="relative z-20 flex shrink-0 justify-end pb-1.5">
        <KidButton
          variant="speak"
          tone={gender}
          id="speakBtn"
          onClick={onSpeak}
          aria-label="השמע שוב"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden
          >
            <path d="M3 9v6h4l5 4V5L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.4-4v8a4.5 4.5 0 0 0 2.4-4Zm2.5 0c0 2.5-1.1 4.7-2.8 6.2l1.4 1.4A9.5 9.5 0 0 0 21 12a9.5 9.5 0 0 0-3.4-7.2l-1.4 1.4A7.5 7.5 0 0 1 19 12Z" />
          </svg>
        </KidButton>
      </div>

      {/* Scrollport below the speaker — tall prompts scroll instead of covering the button */}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gap-3 px-3 pb-5 pt-1">
        {choiceProps.kind === "math" && (
          <>
            {choiceProps.visual !== "numbers" && (
              <div
                id="shapesRow"
                className="flex flex-wrap items-center justify-center gap-2.5 [direction:ltr]"
              >
                {choiceProps.visual === "countOn" ? (
                  <>
                    <span className="bignum rounded-[18px] bg-[#FFE9A8] px-3 py-0.5 text-[clamp(54px,11vw,92px)] font-extrabold text-heading shadow-[0_4px_0_rgba(0,0,0,.12)]">
                      {choiceProps.a}
                    </span>
                    <span className="op text-[clamp(28px,5vw,44px)] font-extrabold text-heading">
                      +
                    </span>
                    <EmojiGroup emoji={em} count={choiceProps.b!} />
                  </>
                ) : (
                  <>
                    <EmojiGroup emoji={em} count={choiceProps.a!} />
                    <span className="op text-[clamp(28px,5vw,44px)] font-extrabold text-heading">
                      +
                    </span>
                    <EmojiGroup emoji={em} count={choiceProps.b!} />
                  </>
                )}
              </div>
            )}
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
            {choiceProps.visual !== "numbers" && (
              <div
                id="shapesRow"
                className="flex flex-wrap items-center justify-center gap-2.5 [direction:ltr]"
              >
                {choiceProps.visual === "countOn" ? (
                  <>
                    <span className="bignum rounded-[18px] bg-[#FFE9A8] px-3 py-0.5 text-[clamp(54px,11vw,92px)] font-extrabold text-heading shadow-[0_4px_0_rgba(0,0,0,.12)]">
                      {choiceProps.a}
                    </span>
                    <span className="op text-[clamp(28px,5vw,44px)] font-extrabold text-heading">
                      −
                    </span>
                    <EmojiGroup emoji={em} count={choiceProps.b!} />
                  </>
                ) : (
                  <EmojiGroup emoji={em} count={choiceProps.a!} crossed={choiceProps.b} />
                )}
              </div>
            )}
            <div
              id="digitsRow"
              className="text-[clamp(34px,7vw,56px)] font-extrabold tracking-wide text-[#E2574C] [direction:ltr]"
            >
              <b className="text-heading">{choiceProps.a}</b> −{" "}
              <b className="text-heading">{choiceProps.b}</b> = ?
            </div>
          </>
        )}

        {choiceProps.kind === "mul" && (
          <>
            {choiceProps.visual !== "numbers" &&
              (choiceProps.visual === "countOn" ? (
                <div
                  id="shapesRow"
                  className="flex flex-wrap items-center justify-center gap-2.5 [direction:ltr]"
                >
                  <span className="bignum rounded-[18px] bg-[#FFE9A8] px-3 py-0.5 text-[clamp(54px,11vw,92px)] font-extrabold text-heading shadow-[0_4px_0_rgba(0,0,0,.12)]">
                    {choiceProps.a}
                  </span>
                  <span className="op text-[clamp(28px,5vw,44px)] font-extrabold text-heading">
                    ×
                  </span>
                  <GroupBox emoji={em} count={choiceProps.b!} />
                </div>
              ) : (
                <GroupsRow emoji={em} groups={choiceProps.a!} per={choiceProps.b!} />
              ))}
            <div
              id="digitsRow"
              className="text-[clamp(34px,7vw,56px)] font-extrabold tracking-wide text-[#E2574C] [direction:ltr]"
            >
              <b className="text-heading">{choiceProps.a}</b> ×{" "}
              <b className="text-heading">{choiceProps.b}</b> = ?
            </div>
          </>
        )}

        {choiceProps.kind === "div" && (
          <>
            {choiceProps.visual !== "numbers" &&
              (choiceProps.visual === "countOn" ? (
                <div
                  id="shapesRow"
                  className="flex flex-wrap items-center justify-center gap-2.5 [direction:ltr]"
                >
                  <EmojiGroup emoji={em} count={choiceProps.a!} />
                  <span className="op text-[clamp(28px,5vw,44px)] font-extrabold text-heading">
                    ÷
                  </span>
                  <span className="bignum rounded-[18px] bg-[#FFE9A8] px-3 py-0.5 text-[clamp(54px,11vw,92px)] font-extrabold text-heading shadow-[0_4px_0_rgba(0,0,0,.12)]">
                    {choiceProps.b}
                  </span>
                </div>
              ) : (
                <GroupsRow emoji={em} groups={choiceProps.b!} per={choiceProps.per!} />
              ))}
            <div
              id="digitsRow"
              className="text-[clamp(34px,7vw,56px)] font-extrabold tracking-wide text-[#E2574C] [direction:ltr]"
            >
              <b className="text-heading">{choiceProps.a}</b> ÷{" "}
              <b className="text-heading">{choiceProps.b}</b> = ?
            </div>
          </>
        )}

        {choiceProps.kind === "wordPrompt" && (
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

        {(choiceProps.kind === "pick" || choiceProps.kind === "pickGroup") && (
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
            (choiceProps.kind === "pickGroup"
              ? (choiceProps.options as { value: string; label: string }[]).map((o) => (
                  <KidButton
                    key={o.value}
                    variant="answerGroup"
                    tone={gender}
                    off={disabledAnswers.includes(o.value)}
                    wobble={wobbleAnswer === o.value}
                    onClick={() => onAnswer(o.value)}
                  >
                    {o.label}
                  </KidButton>
                ))
              : choiceProps.kind === "wordPrompt"
                ? (choiceProps.options as AnswerChoice[]).map((o) => (
                    <KidButton
                      key={o.value}
                      variant={choiceProps.variant}
                      tone={gender}
                      off={disabledAnswers.includes(o.value)}
                      wobble={wobbleAnswer === o.value}
                      onClick={() => onAnswer(o.value)}
                    >
                      <AnswerGlyphView glyph={o.glyph} />
                    </KidButton>
                  ))
                : (choiceProps.options as string[]).map((o) => (
                    <KidButton
                      key={o}
                      variant={choiceProps.variant}
                      tone={gender}
                      off={disabledAnswers.includes(o)}
                      wobble={wobbleAnswer === o}
                      onClick={() => onAnswer(o)}
                    >
                      {o}
                    </KidButton>
                  )))}
        </div>
        </div>
      </div>
    </div>
  );
}
