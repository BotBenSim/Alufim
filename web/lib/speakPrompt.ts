import { HEB_NUM } from "@/data/hebrew";
import { findCatLabel, LETTER_NAME } from "@/data/find";
import { addSpeakPrompt, type AddQuestion } from "@/lib/providers/add";
import { subSpeakPrompt, type SubQuestion } from "@/lib/providers/sub";
import type { EngQuestion, EngWord } from "@/lib/providers/eng";
import type { Question } from "@/lib/types";

type FindQ = Question & {
  kind?: string;
  item?: { name?: string; l?: string; he?: string; emoji?: string };
  prompt?: string;
  cat?: string;
  answer?: unknown;
};

type SpeakFn = (text: string, queue?: boolean) => void;

export function speakQuestion(q: Question, speak: SpeakFn, speakEn: SpeakFn) {
  switch (q.op) {
    case "add":
      speak(addSpeakPrompt(q as unknown as AddQuestion, HEB_NUM), true);
      break;
    case "sub":
      speak(subSpeakPrompt(q as unknown as SubQuestion, HEB_NUM), true);
      break;
    case "eng": {
      const w = (q as unknown as EngQuestion).word;
      speakEn(w.en, true);
      break;
    }
    case "find": {
      const fq = q as FindQ;
      if (fq.kind === "num")
        speak(`לחצו על המספר ${HEB_NUM[fq.answer as number] || fq.answer}!`, true);
      else if (fq.kind === "letter")
        speak(`מצאו את האות ${fq.item?.name}!`, true);
      else if (fq.kind === "phon")
        speak(`מה מתחיל באות ${LETTER_NAME[fq.item?.l as string] || fq.item?.l}?`, true);
      else if (fq.kind === "more") speak("מצאו את הקבוצה עם הכי הרבה!", true);
      else if (fq.kind === "bignum") speak("איזה מספר גדול יותר?", true);
      else if (fq.kind === "reason") speak(fq.prompt || "", true);
      else if (fq.kind === "cat" && fq.cat && fq.item?.he)
        speak(findCatLabel(fq.cat, fq.item.he), true);
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
