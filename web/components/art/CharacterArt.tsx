"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ArtDescriptor } from "@/lib/types";

type CharacterArtProps = {
  art: ArtDescriptor | string;
  className?: string;
  size?: number;
  evolving?: boolean;
  onClick?: () => void;
};

export function CharacterArt({
  art,
  className,
  size = 96,
  evolving,
  onClick,
}: CharacterArtProps) {
  const normalized =
    typeof art === "string" ? ({ type: "emoji", value: art } as ArtDescriptor) : art;

  if (normalized.type === "emoji") {
    return (
      <span
        className={cn(
          "charArt inline-flex items-center justify-center leading-none",
          evolving && "evolving",
          className
        )}
        style={{ fontSize: size, width: size, height: size }}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        {normalized.value}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "charArt relative inline-flex items-center justify-center",
        evolving && "evolving",
        className
      )}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <Image
        src={normalized.src}
        alt=""
        fill
        unoptimized
        className="object-contain"
        onError={(e) => {
          const t = e.currentTarget;
          t.style.display = "none";
          if (t.parentElement) {
            t.parentElement.textContent = normalized.fallback || "⭐";
            t.parentElement.style.fontSize = `${size * 0.7}px`;
          }
        }}
      />
    </span>
  );
}
