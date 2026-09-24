"use client";

import { KidButton, Panel, Screen } from "@/design-system";
import { t } from "@/lib/i18n";
import { useStore } from "@/state/store";

const WHY = ["progress", "noClock", "level", "concrete", "listen", "breaks", "variety"] as const;

export function AboutScreen() {
  const setScreen = useStore((s) => s.setScreen);

  return (
    <Screen id="scrAbout" scroll className="z-[11]" contentClassName="gap-6 max-w-[640px]">
      <Panel id="aboutContent" variant="surface" className="leading-[1.65]">
        <h2 className="mb-1 text-[clamp(26px,5.5vw,36px)] font-black text-heading">
          {t("about.title")}
        </h2>
        <p className="text-[clamp(16px,3.4vw,19px)] font-bold text-[#2F6B9E]">
          {t("about.tagline")}
        </p>

        <p className="mt-4">{t("about.intro")}</p>

        <h3 className="mt-6 text-[clamp(19px,4vw,24px)] font-extrabold text-[#2F6B9E]">
          {t("about.ideaTitle")}
        </h3>
        <p>{t("about.idea")}</p>

        <h3 className="mt-6 text-[clamp(19px,4vw,24px)] font-extrabold text-[#2F6B9E]">
          {t("about.whyTitle")}
        </h3>
        <ul className="mt-2 flex list-none flex-col gap-3 p-0">
          {WHY.map((id) => (
            <li key={id}>
              <b className="text-heading">{t(`about.why.${id}.title`)}</b>{" "}
              {t(`about.why.${id}.body`)}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-[clamp(19px,4vw,24px)] font-extrabold text-[#2F6B9E]">
          {t("about.parentsTitle")}
        </h3>
        <p>{t("about.parents")}</p>

        <p className="mt-5 text-[15px] font-bold text-[#5a7a94]">{t("about.closing")}</p>
      </Panel>

      <KidButton variant="continue" onClick={() => setScreen("profiles")}>
        {t("about.back")}
      </KidButton>
    </Screen>
  );
}
