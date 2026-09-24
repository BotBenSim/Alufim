import type { HTMLAttributes } from "react";
import type { DifficultyLevel } from "@/lib/types";
import { PillControl } from "./PillControl";
import { t } from "@/lib/i18n";

const LEVELS: { value: DifficultyLevel; readonly label: string }[] = (
  ["easy", "medium", "hard"] as const
).map((value) => ({
  value,
  get label() {
    return t(`levels.${value}`);
  },
}));

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
      aria-label={t("levels.label")}
      {...props}
    />
  );
}
