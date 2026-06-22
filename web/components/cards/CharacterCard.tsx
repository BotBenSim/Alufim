"use client";

import { CharacterArt } from "@/components/art/CharacterArt";
import { Card } from "@/design-system";
import { formForXp } from "@/lib/xp";
import type { CharacterDef } from "@/lib/types";
import { cn } from "@/lib/utils";

type CharacterCardProps = {
  character: CharacterDef;
  owned: boolean;
  totalXp?: number;
  picked?: boolean;
  onClick?: () => void;
};

export function CharacterCard({
  character,
  owned,
  totalXp = 0,
  picked,
  onClick,
}: CharacterCardProps) {
  const fi = owned
    ? formForXp(totalXp, character.forms.length)
    : 0;
  const art = owned
    ? character.forms[Math.min(fi, character.forms.length - 1)]
    : "🔒";

  return (
    <button
      type="button"
      disabled={!owned}
      onClick={onClick}
      className={cn(
        "charCard relative flex aspect-[1/1.12] w-full flex-col items-center justify-center gap-1 rounded-[20px] bg-white p-3 shadow-[0_5px_0_rgba(0,0,0,.10),0_9px_18px_rgba(0,0,0,.10)] transition-transform active:scale-95 active:translate-y-0.5",
        picked && "outline outline-[3px] outline-[#2E9E5B] outline-offset-2",
        picked &&
          "after:absolute after:left-1 after:top-1 after:flex after:h-[22px] after:w-[22px] after:items-center after:justify-center after:rounded-full after:bg-[#2E9E5B] after:text-sm after:font-black after:text-white after:content-['✓'] after:shadow-md",
        !owned && "cursor-default grayscale opacity-55 active:scale-100 active:translate-y-0"
      )}
    >
      <CharacterArt
        art={art}
        size={88}
        className={cn("cArt", !owned && "blur-[1px]")}
      />
      <span className="cName text-[clamp(15px,3vw,19px)] font-extrabold text-heading">
        {character.he}
      </span>
    </button>
  );
}
