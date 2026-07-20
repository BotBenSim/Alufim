"use client";

import { useEffect, useRef } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { AvatarFace } from "@/components/cards/ProfileCard";
import { EvolvePreview } from "@/components/game/EvolvePreview";
import { GamePlayPanel } from "@/components/game/GamePlayPanel";
import { Badge, KidButton } from "@/design-system";
import { characterById } from "@/data/characters";
import { currentFormArt } from "@/lib/missions";
import { speakQuestion } from "@/lib/speakPrompt";
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
  const playOverlay = useStore((s) => s.playOverlay);
  const collectionOverlay = useStore((s) => s.collectionOverlay);
  const evolveOverlay = useStore((s) => s.evolveOverlay);
  const goHome = useStore((s) => s.goHome);
  const submitAnswer = useStore((s) => s.submitAnswer);
  const playFoodTap = useStore((s) => s.playFoodTap);
  const restartGame = useStore((s) => s.restartGame);

  const { ensure, playCorrect, playWrong, playFanfare, playXpGain } = useAudio();
  const { speak, speakEn, cancel } = useSpeech();
  const { burst } = useConfetti();
  const lastSpokenKey = useRef<string | null>(null);
  const introPendingKey = useRef<string | null>(null);
  const prevStep = useRef<number | null>(null);

  const profile = app.profiles.find((p) => p.id === app.lastProfileId) ?? null;
  const prog = profile && run ? profile.characters[run.character.id] : null;
  const formArt = run && prog ? currentFormArt(run.character, prog.totalXp) : null;
  const xp = prog && run ? xpBarState(prog.totalXp, run.character.forms.length) : null;

  useEffect(() => {
    if (showMission && run?.mission) speak(run.mission.say);
  }, [showMission, run?.mission, speak]);

  useEffect(() => {
    if (playOverlay && run && !playOverlay.done) speak(`האכילו את ה${run.character.he}!`);
  }, [playOverlay, run, speak]);

  useEffect(() => {
    if (collectionOverlay) speak("נפתחה חיה חדשה!");
  }, [collectionOverlay, speak]);

  useEffect(() => {
    if (!run?.current || !run.currentKey) return;
    if (showMission || playOverlay || evolveOverlay) return;
    if (run.phase !== "learn") return;
    if (lastSpokenKey.current === run.currentKey) return;
    if (introPendingKey.current === run.currentKey) return;

    ensure();

    const isIntro = run.step === 1 && lastSpokenKey.current === null;
    if (isIntro) {
      introPendingKey.current = run.currentKey;
      speak("יוצאים לדרך!");
      const key = run.currentKey;
      const t = window.setTimeout(() => {
        const st = useStore.getState();
        const r = st.run;
        if (
          r?.currentKey === key &&
          r.current &&
          !r.locked &&
          !st.showMission &&
          !st.playOverlay &&
          !st.evolveOverlay
        ) {
          speakQuestion(r.current, speak, speakEn);
          lastSpokenKey.current = key;
        }
        introPendingKey.current = null;
      }, 1300);
      return () => window.clearTimeout(t);
    }

    speakQuestion(run.current, speak, speakEn);
    lastSpokenKey.current = run.currentKey;
  }, [
    run?.current,
    run?.currentKey,
    run?.step,
    run?.phase,
    run?.locked,
    showMission,
    playOverlay,
    evolveOverlay,
    ensure,
    speak,
    speakEn,
  ]);

  useEffect(() => {
    if (!run) {
      lastSpokenKey.current = null;
      introPendingKey.current = null;
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
    if (evolveOverlay?.phase === "filmstrip" && evolveOverlay.filmstripForm === 0) {
      burst(10);
      playFanfare();
    }
    if (evolveOverlay?.phase === "done") {
      burst(130);
      playFanfare();
      if (run) speak(run.character.cheer);
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
      if (run.gameId === "eng" && run.current && "word" in run.current) {
        const w = (run.current as unknown as { word: { en: string; he: string } }).word;
        speakEn(w.en);
        speak(`${w.he}! ${fb.replace("🎉 ", "")}`, true);
      } else {
        speak(fb.replace("🎉 ", ""));
      }
    } else if (!prevFlash) {
      playWrong();
      speak("כמעט! נסו שוב");
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
    introPendingKey.current = null;
    goHome();
  };

  const handlePlayTap = () => {
    ensure();
    playCorrect();
    burst(14);
    playFoodTap();
    if (playOverlay && playOverlay.tapsDone + 1 >= (run.preset.feedTaps || 3)) {
      playFanfare();
      burst(90);
      speak(`ה${run.character.he} אכל והתחזק!`);
    }
  };

  const playProgress = playOverlay
    ? Array.from({ length: run.preset.feedTaps || 3 }, (_, i) =>
        i < playOverlay.tapsDone ? "🟢" : "⚪"
      ).join("")
    : "";

  return (
    <>
      <div id="topbar" className="relative z-[3] flex items-center gap-2.5 px-3.5 py-2.5 [direction:rtl]">
        <KidButton variant="top" id="homeBtn" onClick={handleHome}>
          🏠
        </KidButton>
        <Badge className="badge">
          <AvatarFace avatar={profile.avatar} size={22} />
          {profile.name}
        </Badge>
        <Badge variant="step" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          שלב {run.step}
        </Badge>
        <button
          type="button"
          id="restartBtn"
          className="mr-auto rounded-[18px] border-none bg-[#FF6B6B] px-3.5 py-2 text-[17px] font-bold text-white shadow-[0_4px_0_#C94A4A] active:translate-y-0.5"
          onClick={restartGame}
        >
          🔄
        </button>
      </div>

      <div id="playWrap" className="relative z-[2] flex min-h-0 flex-1 flex-col">
        <div id="gameArea" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3.5 px-2.5 pb-3.5 pt-1.5">
          <GamePlayPanel
            run={run}
            formArt={formArt}
            xp={xp}
            xpGainFlash={xpGainFlash}
            disabledAnswers={disabledAnswers}
            wobbleAnswer={wobbleAnswer}
            onAnswer={handleAnswer}
            onSpeak={handleSpeak}
          />

          <div id="feedback" className="min-h-[34px] text-center text-[clamp(19px,3.6vw,28px)] font-bold text-heading">
            {feedback}
          </div>
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

      {playOverlay && (
        <div
          id="ovCatch"
          className="overlay show absolute inset-0 z-[9] flex items-center justify-center backdrop-blur-[3px]"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${run.character.sky}, ${run.character.accent})`,
          }}
        >
          <div id="catchScene" className="relative h-[80vh] w-[96vw]">
            {!playOverlay.done && (
              <>
                <div id="catchTitle" className="absolute top-[2%] w-full text-center text-[clamp(24px,6vw,44px)] font-extrabold text-heading">
                  האכילו את ה{run.character.he}! {run.character.food}
                </div>
                <div id="catchHint" className="absolute top-[11%] w-full text-center text-[clamp(18px,4vw,30px)] tracking-[3px] [direction:ltr]">
                  {playProgress}
                </div>
                <button
                  type="button"
                  id="catchCreature"
                  className="absolute border-none bg-transparent p-0 text-[clamp(64px,16vw,120px)] leading-none transition-transform active:scale-90"
                  style={{ left: playOverlay.foodLeft, top: playOverlay.foodTop }}
                  onClick={handlePlayTap}
                >
                  {run.character.food}
                </button>
              </>
            )}
            {playOverlay.done && (
              <div id="catchDone" className="catchDone show absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                <div className="caughtCreature animate-[caughtBounce_1.4s_ease-in-out_infinite] text-[clamp(90px,22vw,170px)] drop-shadow-lg">
                  <CharacterArt art={formArt} size={160} />
                </div>
                <div className="caughtCheck text-[clamp(40px,9vw,64px)]">✨</div>
                <div className="caughtText text-[clamp(24px,6vw,42px)] font-extrabold text-heading">
                  ה{run.character.he} אכל והתחזק!
                </div>
              </div>
            )}
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
