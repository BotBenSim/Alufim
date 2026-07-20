"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ArtDescriptor } from "@/lib/types";

type CharacterArtProps = {
  art: ArtDescriptor | string;
  className?: string;
  size?: number;
  /**
   * Fill the parent box (parent must be `position: relative` with a size).
   * Use this instead of a fixed `size` larger than the box — overflow skews
   * off-center under `dir=rtl`.
   */
  fill?: boolean;
  evolving?: boolean;
  onClick?: () => void;
};

export function CharacterArt({
  art,
  className,
  size = 96,
  fill = false,
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
          fill && "h-full w-full",
          evolving && "evolving",
          className
        )}
        style={fill ? { fontSize: "70%" } : { fontSize: size, width: size, height: size }}
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
        fill && "h-full w-full",
        evolving && "evolving",
        className
      )}
      style={fill ? undefined : { width: size, height: size }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <Image
        src={normalized.src}
        alt=""
        fill
        unoptimized
        className="object-contain object-center"
        onError={(e) => {
          const t = e.currentTarget;
          t.style.display = "none";
          if (t.parentElement) {
            t.parentElement.textContent = normalized.fallback || "⭐";
            t.parentElement.style.fontSize = fill
              ? "70%"
              : `${size * 0.7}px`;
          }
        }}
      />
    </span>
  );
}
