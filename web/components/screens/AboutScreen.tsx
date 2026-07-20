"use client";

import { KidButton, Panel, Screen } from "@/design-system";
import { useStore } from "@/state/store";

export function AboutScreen() {
  const setScreen = useStore((s) => s.setScreen);

  return (
    <Screen id="scrAbout" scroll className="z-[11]" contentClassName="gap-6 max-w-[640px]">
      <Panel id="aboutContent" variant="surface" className="leading-[1.65]">
        <h2 className="mb-1 text-[clamp(26px,5.5vw,36px)] font-black text-heading">
          אלופים
        </h2>
        <p className="text-[clamp(16px,3.4vw,19px)] font-bold text-[#2F6B9E]">
          ללמוד דרך טיפוח — בלי לחץ, בלי עונש, עם חיה שאוהבים
        </p>

        <p className="mt-4">
          אלופים הוא משחק לימודי לילדים: בוחרים חיה, מגדלים אותה, ומתקדמים יחד דרך
          תרגילים קצרים בחיבור, חיסור, אנגלית ו&quot;מצא את…&quot;. כל תשובה מזינה את
          החיה — והיא מתפתחת וגדלה ככל שמשחקים.
        </p>

        <h3 className="mt-6 text-[clamp(19px,4vw,24px)] font-extrabold text-[#2F6B9E]">
          הרעיון
        </h3>
        <p>
          הילד לא &quot;עושה שיעורים&quot; מול מסך יבש. הוא מטפח חבר: בוחר מי לגדל,
          שומע את השאלות בקול, עונה בקצב שלו, ורואה את החיה מתחזקת. ההתקדמות שייכת
          לחיה — אפשר להחליף משחק והקשר נשאר.
        </p>

        <h3 className="mt-6 text-[clamp(19px,4vw,24px)] font-extrabold text-[#2F6B9E]">
          למה זה עוזר ללמוד
        </h3>
        <ul className="mt-2 flex list-none flex-col gap-3 p-0">
          <li>
            <b className="text-heading">תמיד מתקדמים.</b> כל תשובה נותנת התקדמות.
            טעות לא מוחקת — רק מזמינה לנסות שוב. כך נבנה ביטחון במקום חרדה ממתמטיקה.
          </li>
          <li>
            <b className="text-heading">בלי שעון ובלי &quot;חיים&quot;.</b> אין טיימר,
            אין רצף שנשבר, ואין עונש על הפסקה. הילד יכול לעצור ולחזור מתי שנוח.
          </li>
          <li>
            <b className="text-heading">רמה שמתאימה לילד.</b> אפשר לבחור קל / בינוני /
            קשה, ולהתאים את טווחי השאלות — כדי להישאר באזור שבו יש אתגר אבל גם הצלחה.
          </li>
          <li>
            <b className="text-heading">מהמוחשי אל המספר.</b> בחשבון מתחילים לפעמים
            עם אימוג׳ים שאפשר לספור, ואט־אט עוברים למספרים — כמו למידה מהקונקרטי
            למופשט.
          </li>
          <li>
            <b className="text-heading">שומעים לפני שקוראים.</b> השאלות נאמרות בקול,
            ואפשר לשמוע שוב — חשוב לילדים שעדיין לומדים לקרוא.
          </li>
          <li>
            <b className="text-heading">הפסקות משחק קצרות.</b> כל כמה שלבים יש משחקון
            קטן עם החיה — בלי להפסיד — כדי לרענן קשב ולחזור ללמידה בכיף.
          </li>
          <li>
            <b className="text-heading">מגוון משחקים.</b> חיבור, חיסור, אנגלית
            ו&quot;מצא את…&quot; — תרגול מגוון במקום תרגיל אחד חוזר על עצמו.
          </li>
        </ul>

        <h3 className="mt-6 text-[clamp(19px,4vw,24px)] font-extrabold text-[#2F6B9E]">
          להורים
        </h3>
        <p>
          אפשר לכוון אילו משחקים פעילים, את רמת הקושי, ואת קצב ההתקדמות — בלי לאפס
          את מה שהילד כבר בנה. הכל נשמר על המכשיר; אין חשבון בענן ואין מעקב.
        </p>

        <p className="mt-5 text-[15px] font-bold text-[#5a7a94]">
          אלופים — לגדל חיה, ולגדול איתה.
        </p>
      </Panel>

      <KidButton variant="continue" onClick={() => setScreen("profiles")}>
        ← חזרה
      </KidButton>
    </Screen>
  );
}
