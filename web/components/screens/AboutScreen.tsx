"use client";

import { KidButton, Screen } from "@/design-system";
import { CHARACTERS, artText } from "@/data/characters";
import {
  FORM_XP_STEP,
  XP_BATCH_SIZE,
  XP_BEAT,
  formThresholds,
  xpForCorrect,
} from "@/lib/xp";
import { useStore } from "@/state/store";

export function AboutScreen() {
  const setScreen = useStore((s) => s.setScreen);
  const th = formThresholds(4);

  return (
    <Screen id="scrAbout" scroll className="z-[11]">
      <div
        id="aboutContent"
        className="mx-auto w-full max-w-[680px] rounded-[22px] bg-white/90 p-5 text-[#1D3550] shadow-[0_10px_30px_rgba(0,0,0,.18)] [direction:rtl] leading-relaxed"
      >
        <h2 className="text-[clamp(24px,5vw,34px)] text-heading">🐣 אלופים — מאחורי הקלעים</h2>
        <p>
          משחק חינוכי לילדים: מגדלים חיות, מרוויחים XP, ומתפתחים דרך חיבור, חיסור, אנגלית
          ו&quot;מצא את...&quot;. הכל נשמר מקומית במכשיר.
        </p>

        <h3 className="mt-4 text-[clamp(19px,4vw,24px)] text-[#2F6B9E]">המודל המנטלי</h3>
        <p>
          מגדלים <b>חיות</b>. XP, הפס וצורות ההתפתחות נשמרים לכל חיה. משחק הוא מקור XP —
          אפשר להחליף משחק באמצע וה-XP נשאר.
        </p>

        <h3 className="mt-4 text-[clamp(19px,4vw,24px)] text-[#2F6B9E]">איך מרוויחים XP</h3>
        <ul className="list-disc pr-5">
          <li>רמה: קל / בינוני / קשה</li>
          <li>שלב: 3 מקטעים של {XP_BATCH_SIZE} שלבים — כל מקטע שווה יותר</li>
          <li>דיוק: בלי טעות = מלא, אחרי טעות = פחות, אף פעם לא פחות מ-1</li>
        </ul>
        <table className="my-2 w-full border-collapse text-[clamp(14px,2.8vw,17px)]">
          <thead>
            <tr className="bg-[#D6E8FB]">
              <th className="border border-[#C5D8EC] p-2">דוגמה</th>
              <th className="border border-[#C5D8EC] p-2">XP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#C5D8EC] p-2">קל, שלב 1, מושלם</td>
              <td className="border border-[#C5D8EC] p-2 text-center">{xpForCorrect("easy", 1, 0)}</td>
            </tr>
            <tr>
              <td className="border border-[#C5D8EC] p-2">קשה, שלב 20, מושלם</td>
              <td className="border border-[#C5D8EC] p-2 text-center">{xpForCorrect("hard", 20, 0)}</td>
            </tr>
          </tbody>
        </table>
        <p>
          משימות קצב: משימת ביטחון +{XP_BEAT.mission}, משחקון עם החיה +{XP_BEAT.play}.
        </p>

        <h3 className="mt-4 text-[clamp(19px,4vw,24px)] text-[#2F6B9E]">צורות ו-XP</h3>
        <p>
          4 צורות לכל חיה. ספים מצטברים (FORM_XP_STEP={FORM_XP_STEP}):{" "}
          <b>{th.join(", ")}</b>. הפס מציג XP מצטבר / הסף הבא.
        </p>

        <h3 className="mt-4 text-[clamp(19px,4vw,24px)] text-[#2F6B9E]">החיות</h3>
        <table className="my-2 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#D6E8FB]">
              <th className="border border-[#C5D8EC] p-2">#</th>
              <th className="border border-[#C5D8EC] p-2">חיה</th>
              <th className="border border-[#C5D8EC] p-2">צורות</th>
            </tr>
          </thead>
          <tbody>
            {CHARACTERS.map((c, i) => (
              <tr key={c.id}>
                <td className="border border-[#C5D8EC] p-2 text-center">{i + 1}</td>
                <td className="border border-[#C5D8EC] p-2 text-center">{c.he}</td>
                <td className="border border-[#C5D8EC] p-2 text-center">
                  {c.forms.map(artText).join(" → ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-4 text-[clamp(19px,4vw,24px)] text-[#2F6B9E]">עקרונות</h3>
        <ul className="list-disc pr-5">
          <li>ניצחונות תכופים — חגיגה בהתפתחות</li>
          <li>טיפוח ואוטונומיה — החיה שבחרתם</li>
          <li>בלי עונש, טיימר או חיים</li>
          <li>שינוי הגדרות לא מאפס התקדמות</li>
        </ul>
      </div>

      <KidButton variant="continue" onClick={() => setScreen("profiles")}>
        ← חזרה
      </KidButton>
    </Screen>
  );
}
