import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * `surface` — padded content panel (About, forms).
   * `shell` — flush outer frame for multi-pane layouts (settings).
   */
  variant?: "surface" | "shell";
};

/**
 * Shared elevated white surface for settings / about / form chrome.
 * Always `width: 100%` of the Screen column — never `vw` (avoids uneven side padding).
 */
export function Panel({
  className,
  variant = "surface",
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "panel",
        variant === "shell" && "panel--shell",
        variant === "surface" && "panel--surface",
        className
      )}
      {...props}
    />
  );
}
