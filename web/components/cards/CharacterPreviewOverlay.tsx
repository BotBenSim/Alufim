"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CharacterArt } from "@/components/art/CharacterArt";
import { characterById } from "@/data/characters";
import { useAudio } from "@/hooks/useAudio";
import { useConfetti } from "@/hooks/useConfetti";

type CharacterPreviewOverlayProps = {
  characterId: string | null;
  onClose: () => void;
};

/** Side inset so the preview never clips against the viewport edge. */
const PREVIEW_INSET = 20;

/** Home-screen lifecycle preview — sweeps through every form with a pop. */
export function CharacterPreviewOverlay({ characterId, onClose }: CharacterPreviewOverlayProps) {
  const [formIdx, setFormIdx] = useState(0);
  const [swept, setSwept] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [box, setBox] = useState(280);
  const tokenRef = useRef(0);
  const { playFanfare, playXpGain } = useAudio();
  const { burst } = useConfetti();

  const character = characterId ? characterById(characterId) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const measure = () => {
      const side = Math.min(
        window.innerWidth - PREVIEW_INSET * 2,
        window.innerHeight * 0.62,
        440
      );
      setBox(Math.max(160, Math.floor(side)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!character) return;

    const token = ++tokenRef.current;
    setFormIdx(0);
    setSwept(false);
    playFanfare();
    burst(60);

    const maxIdx = character.forms.length - 1;
    let i = 0;

    const showNext = () => {
      if (token !== tokenRef.current) return;
      if (i > maxIdx) {
        setSwept(true);
        window.setTimeout(() => {
          if (token === tokenRef.current) onClose();
        }, 800);
        return;
      }
      setFormIdx(i);
      playXpGain(Math.min(7, 3 + i));
      burst(10);
      i += 1;
      window.setTimeout(showNext, 340);
    };

    showNext();

    return () => {
      tokenRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose identity is stable enough; characterId drives replay
  }, [character, characterId, burst, playFanfare, playXpGain]);

  if (!character || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[12] flex items-center justify-center bg-[rgba(20,40,70,.45)] backdrop-blur-[3px]"
      style={{ padding: PREVIEW_INSET }}
      onClick={() => swept && onClose()}
      role="presentation"
    >
      <div
        key={formIdx}
        className="evoCell solo flex shrink-0 items-center justify-center animate-evoPop"
        style={{ width: box, height: box }}
      >
        <CharacterArt art={character.forms[formIdx]} size={box} />
      </div>
    </div>,
    document.body
  );
}
