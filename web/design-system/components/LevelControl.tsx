import type { HTMLAttributes } from "react";
import type { DifficultyLevel } from "@/lib/types";
import { PillControl } from "./PillControl";

const LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: "easy", label: "קל" },
  { value: "medium", label: "בינוני" },
  { value: "hard", label: "קשה" },
];

type LevelControlProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value: DifficultyLevel;
  onChange: (value: DifficultyLevel) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

/** Compact 3-level pill for easy / medium / hard. */
export function LevelControl({
  value,
  onChange,
  disabled,
  size = "sm",
  className,
  ...props
}: LevelControlProps) {
  return (
    <PillControl
      className={className}
      options={LEVELS}
      value={value}
      onChange={onChange}
      disabled={disabled}
      size={size}
      aria-label="רמת קושי"
      {...props}
    />
  );
}
