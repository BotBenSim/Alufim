"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { characterById } from "@/data/characters";
import { useAudio } from "@/hooks/useAudio";
import { useConfetti } from "@/hooks/useConfetti";

type CharacterPreviewOverlayProps = {
  characterId: string | null;
  onClose: () => void;
};

/** Home-screen lifecycle preview — sweeps through every form with a pop (vanilla previewLifecycle) */
export function CharacterPreviewOverlay({ characterId, onClose }: CharacterPreviewOverlayProps) {
  const [formIdx, setFormIdx] = useState(0);
  const [swept, setSwept] = useState(false);
  const tokenRef = useRef(0);
  const { playFanfare, playXpGain } = useAudio();
  const { burst } = useConfetti();

  const character = characterId ? characterById(characterId) : null;

  useEffect(() => {
    if (!character) return;

    const token = ++tokenRef.current;
    setFormIdx(0);
    setSwept(false);
    burst(60);

    const maxIdx = character.forms.length - 1;
    let i = 0;
    let stepT: number | undefined;
    let closeT: number | undefined;

    const showNext = () => {
      if (token !== tokenRef.current) return;
      if (i > maxIdx) {
        setSwept(true);
        closeT = window.setTimeout(() => {
          if (token === tokenRef.current) onClose();
        }, 800);
        return;
      }
      setFormIdx(i);
      playXpGain(Math.min(7, 3 + i));
      burst(10);
      i += 1;
      stepT = window.setTimeout(showNext, 340);
    };

    // Let animal-name TTS finish before preview beeps/fanfare
    const startT = window.setTimeout(() => {
      if (token !== tokenRef.current) return;
      playFanfare();
      showNext();
    }, 550);

    return () => {
      window.clearTimeout(startT);
      if (stepT !== undefined) window.clearTimeout(stepT);
      if (closeT !== undefined) window.clearTimeout(closeT);
      tokenRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose identity is stable enough; characterId drives replay
  }, [character, characterId, burst, playFanfare, playXpGain]);

  if (!character) return null;

  return (
    <div
      className="fixed inset-0 z-[12] flex items-center justify-center bg-[rgba(20,40,70,.45)] backdrop-blur-[3px]"
      onClick={() => swept && onClose()}
      role="presentation"
    >
      <div
        key={formIdx}
        className="evoCell solo h-[min(80vw,62vh,440px)] w-[min(80vw,62vh,440px)] animate-evoPop"
      >
        <CharacterArt art={character.forms[formIdx]} size={420} className="h-full w-full" />
      </div>
    </div>
  );
}
