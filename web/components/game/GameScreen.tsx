"use client";

import { useEffect, useRef } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { AvatarFace } from "@/components/cards/ProfileCard";
import { EvolvePreview } from "@/components/game/EvolvePreview";
import { evolveCelebrateLine } from "@/data/characters";
import { GamePlayPanel } from "@/components/game/GamePlayPanel";
import { MinigameHost } from "@/components/game/MinigameHost";
import { Badge, KidButton } from "@/design-system";
import { characterById } from "@/data/characters";
import { currentFormArt } from "@/lib/missions";
import {
  speakEngCorrect,
  speakEngWrong,
  speakQuestion,
} from "@/lib/speakPrompt";
import { engAnswerKey, type EngQuestion } from "@/lib/providers/eng";
import { xpBarState } from "@/lib/xp";
import { useStore } from "@/state/store";
import { useAudio } from "@/hooks/useAudio";
import { useConfetti } from "@/hooks/useConfetti";
import { useSpeech } from "@/hooks/useSpeech";

export function GameScreen() {
  const app = useStore((s) => s.app);
  const run = useStore((s) => s.run);
  const feedback = useStore((s) => s.feedback);
  const disabledAnswers = useStore((s) => s.disabledAnswers);
  const wobbleAnswer = useStore((s) => s.wobbleAnswer);
  const xpGainFlash = useStore((s) => s.xpGainFlash);
  const showMission = useStore((s) => s.showMission);
  const minigameOverlay = useStore((s) => s.minigameOverlay);
  const collectionOverlay = useStore((s) => s.collectionOverlay);
  const evolveOverlay = useStore((s) => s.evolveOverlay);
  const goHome = useStore((s) => s.goHome);
  const submitAnswer = useStore((s) => s.submitAnswer);
  const restartGame = useStore((s) => s.restartGame);

  const { ensure, playCorrect, playWrong, playFanfare, playXpGain } = useAudio();
  const { speak, speakEn, cancel } = useSpeech();
  const { burst } = useConfetti();
  const lastSpokenKey = useRef<string | null>(null);
  const prevStep = useRef<number | null>(null);

  const profile = app.profiles.find((p) => p.id === app.lastProfileId) ?? null;
  const gender = profile?.gender ?? "boy";
  const prog = profile && run ? profile.characters[run.character.id] : null;
  const formArt = run && prog ? currentFormArt(run.character, prog.totalXp) : null;
  const xp = prog && run ? xpBarState(prog.totalXp, run.character.forms.length) : null;

  useEffect(() => {
    if (showMission && run?.mission) speak(run.mission.say);
  }, [showMission, run?.mission, speak]);

  useEffect(() => {
    if (collectionOverlay) speak("נפתחה חיה חדשה!");
  }, [collectionOverlay, speak]);

  useEffect(() => {
    if (!run?.current || !run.currentKey) return;
    if (showMission || minigameOverlay || evolveOverlay) return;
    if (run.phase !== "learn") return;
    if (lastSpokenKey.current === run.currentKey) return;

    ensure();
    speakQuestion(run.current, speak, speakEn);
    lastSpokenKey.current = run.currentKey;
  }, [
    run?.current,
    run?.currentKey,
    run?.phase,
    showMission,
    minigameOverlay,
    evolveOverlay,
    ensure,
    speak,
    speakEn,
  ]);

  useEffect(() => {
    if (!run) {
      lastSpokenKey.current = null;
    }
  }, [run]);

  useEffect(() => {
    if (xpGainFlash) playXpGain(xpGainFlash);
  }, [xpGainFlash, playXpGain]);

  useEffect(() => {
    if (!run) {
      prevStep.current = null;
      return;
    }
    if (prevStep.current != null && run.step > prevStep.current) {
      const roundEdge = run.preset.round && (run.step - 1) % run.preset.round === 0;
      if (roundEdge) burst(40);
    }
    prevStep.current = run.step;
  }, [run, burst]);

  useEffect(() => {
    if (!evolveOverlay) return;
    // Reveal of the new form — the big payoff after tapping.
    if (
      evolveOverlay.phase === "filmstrip" &&
      evolveOverlay.filmstripForm === evolveOverlay.formIdx
    ) {
      burst(90);
      playFanfare();
    }
    if (evolveOverlay.phase === "done") {
      burst(160);
      playFanfare();
      if (run) speak(evolveCelebrateLine(run.character, evolveOverlay.formIdx));
      const wave = window.setTimeout(() => burst(100), 900);
      return () => window.clearTimeout(wave);
    }
  }, [evolveOverlay?.phase, evolveOverlay?.filmstripForm, burst, playFanfare, run, speak]);

  if (!run || !profile || !prog || !formArt || !xp) return null;

  const handleAnswer = (value: string) => {
    ensure();
    const prevFlash = useStore.getState().xpGainFlash;
    submitAnswer(value);
    const st = useStore.getState();
    if (st.showMission && st.run?.mission) {
      if (value === st.run.mission.target) {
        playCorrect();
        burst(20);
        speak(st.run.mission.success);
      } else {
        playWrong();
        speak("כמעט! נסו שוב");
      }
      return;
    }
    const ans = run.current?.answer;
    const correct =
      ans != null &&
      (value === String(ans) || (typeof ans === "number" && Number(value) === ans));
    if (correct) {
      playCorrect();
      burst(8);
      const fb = useStore.getState().feedback;
      if (run.gameId === "eng" && run.current?.op === "eng") {
        speakEngCorrect((run.current as EngQuestion).word, speak, speakEn);
      } else {
        speak(fb.replace("🎉 ", ""));
      }
    } else if (!prevFlash) {
      playWrong();
      if (run.gameId === "eng" && run.current?.op === "eng") {
        const eq = run.current as EngQuestion;
        const picked = eq.options.find((o) => engAnswerKey(o) === value);
        if (picked && engAnswerKey(picked) !== engAnswerKey(eq.word)) {
          speakEngWrong(eq.word, picked, speak, speakEn);
        } else {
          speak("נסו שוב!");
          speakEn(eq.word.en, true);
        }
      } else {
        speak("כמעט! נסו שוב");
      }
    }
  };

  const handleSpeak = () => {
    if (showMission && run.mission) {
      speak(run.mission.say);
      return;
    }
    if (run.current) speakQuestion(run.current, speak, speakEn);
  };

  const handleHome = () => {
    cancel();
    lastSpokenKey.current = null;
    goHome();
  };

  return (
    <>
      <div
        id="topbar"
        className="relative z-[3] flex items-center gap-3 px-3 py-2.5 [direction:rtl]"
      >
        <Badge className="badge min-w-0 flex-1 overflow-hidden px-2.5 text-[clamp(14px,3.6vw,18px)]">
          <AvatarFace avatar={profile.avatar} size={22} className="shrink-0" />
          <span className="truncate">{profile.name}</span>
        </Badge>
        <Badge variant="step" className="shrink-0 px-2.5 text-[clamp(14px,3.6vw,18px)]">
          שלב {run.step}
        </Badge>
        <div className="flex shrink-0 items-center gap-2">
          <KidButton variant="top" id="homeBtn" className="shrink-0" onClick={handleHome}>
            🏠
          </KidButton>
          <button
            type="button"
            id="restartBtn"
            aria-label="התחילו מחדש"
            className="inline-flex items-center justify-center rounded-[18px] border-none bg-[#FF6B6B] px-3 py-2 text-white shadow-[0_4px_0_#C94A4A] active:translate-y-0.5"
            onClick={restartGame}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="block"
            >
              <path
                d="M21 12a9 9 0 1 1-2.6-6.3"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M21 3v6h-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div id="playWrap" className="relative z-[2] flex min-h-0 flex-1 flex-col">
        <div id="gameArea" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3.5 px-2.5 pb-3.5 pt-1.5">
          {/* XP bar always stays; only the question card swaps for the minigame */}
          <GamePlayPanel
            run={run}
            gender={gender}
            formArt={formArt}
            xp={xp}
            xpGainFlash={xpGainFlash}
            disabledAnswers={disabledAnswers}
            wobbleAnswer={wobbleAnswer}
            onAnswer={handleAnswer}
            onSpeak={handleSpeak}
            body={
              minigameOverlay ? (
                <MinigameHost
                  overlay={minigameOverlay}
                  character={run.character}
                  formArt={formArt}
                />
              ) : undefined
            }
          />

          {!minigameOverlay && (
            <div
              id="feedback"
              className="min-h-[34px] text-center text-[clamp(19px,3.6vw,28px)] font-bold text-heading"
            >
              {feedback}
            </div>
          )}
        </div>
      </div>

      {showMission && run.mission && (
        <div id="ovMission" className="overlay show absolute inset-0 z-10 flex items-center justify-center bg-[rgba(20,40,70,.45)] backdrop-blur-[3px]">
          <div className="panel flex max-w-[86%] flex-col items-center gap-4 rounded-panel bg-white p-7 text-center shadow-panel animate-[pop_0.35s]">
            <div id="missionPrompt" className="text-[clamp(24px,5.5vw,40px)] text-heading">
              {run.mission.prompt}
            </div>
            <div id="missionOptions" className="flex flex-wrap justify-center gap-[clamp(14px,4vw,28px)]">
              {run.mission.options.map((em) => (
                <KidButton
                  key={em}
                  variant="answerEng"
                  tone={gender}
                  wobble={wobbleAnswer === em}
                  onClick={() => handleAnswer(em)}
                >
                  {em}
                </KidButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {evolveOverlay && <EvolvePreview />}

      {collectionOverlay && (() => {
        const unlocked = characterById(collectionOverlay.characterId);
        return (
          <div id="ovCollection" className="overlay show absolute inset-0 z-10 flex items-center justify-center bg-[rgba(20,40,70,.45)] backdrop-blur-[3px]">
            <div className="panel flex max-w-[86%] flex-col items-center gap-4 rounded-panel bg-white p-7 text-center shadow-panel">
              <h2 className="text-[clamp(24px,5vw,38px)] text-heading">🎉 נפתחה חיה חדשה!</h2>
              {unlocked && <CharacterArt art={unlocked.forms[0]} size={120} />}
              <p className="text-[19px] text-[#456]">{collectionOverlay.message}</p>
            </div>
          </div>
        );
      })()}
    </>
  );
}
