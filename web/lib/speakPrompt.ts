import { HEB_NUM } from "@/data/hebrew";
import { addSpeakPrompt, type AddQuestion } from "@/lib/providers/add";
import { subSpeakPrompt, type SubQuestion } from "@/lib/providers/sub";
import { mulSpeakPrompt, type MulQuestion } from "@/lib/providers/mul";
import { divSpeakPrompt, type DivQuestion } from "@/lib/providers/div";
import type { EngQuestion, EngWord } from "@/lib/providers/eng";
import { isStageGame, STAGE_PROVIDERS } from "@/lib/providers";
import type { Question } from "@/lib/types";

type SpeakFn = (text: string, queue?: boolean) => void;

export function speakQuestion(q: Question, speak: SpeakFn, speakEn: SpeakFn) {
  switch (q.op) {
    case "add":
      speak(addSpeakPrompt(q as unknown as AddQuestion, HEB_NUM), true);
      break;
    case "sub":
      speak(subSpeakPrompt(q as unknown as SubQuestion, HEB_NUM), true);
      break;
    case "mul":
      speak(mulSpeakPrompt(q as unknown as MulQuestion, HEB_NUM), true);
      break;
    case "div":
      speak(divSpeakPrompt(q as unknown as DivQuestion, HEB_NUM), true);
      break;
    case "eng": {
      const w = (q as unknown as EngQuestion).word;
      speakEn(w.en, true);
      break;
    }
    default: {
      if (!isStageGame(q.op)) break;
      const { he, en } = STAGE_PROVIDERS[q.op].speak(q);
      if (he) speak(he, true);
      if (en) speakEn(en, true);
      break;
    }
  }
}

/** Correct pick: pair Hebrew ↔ English, confirm right, then caller advances. */
export function speakEngCorrect(word: EngWord, speak: SpeakFn, speakEn: SpeakFn) {
  speak(`${word.he}!`);
  speakEn(word.en, true);
  speak(`זה ${word.he}! יופי!`, true);
}

/**
 * Wrong pick: name what they tapped (he + en), try again, then re-prompt the
 * target English word.
 */
export function speakEngWrong(
  target: EngWord,
  picked: EngWord,
  speak: SpeakFn,
  speakEn: SpeakFn
) {
  speak(`${picked.he} אומרים`);
  speakEn(picked.en, true);
  speak("נסו שוב!", true);
  speakEn(target.en, true);
}

/** Rough ms to wait before advancing after eng correct feedback. */
export const ENG_CORRECT_ADVANCE_MS = 3400;
