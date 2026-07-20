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
  const fi = owned ? formForXp(totalXp, character.forms.length) : 0;
  const art = owned
    ? character.forms[Math.min(fi, character.forms.length - 1)]
    : "🔒";

  return (
    <Card variant="character" selected={picked} locked={!owned} onClick={onClick}>
      <CharacterArt
        art={art}
        size={88}
        className={cn("cArt", !owned && "blur-[1px]")}
      />
      <span className="cName text-[clamp(15px,3vw,19px)] font-extrabold text-heading">
        {character.he}
      </span>
    </Card>
  );
}
