import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type PillOption<T extends string = string> = {
  value: T;
  label: string;
};

type PillControlProps<T extends string> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  /** Equal-width segments (default true). */
  equal?: boolean;
  "aria-label"?: string;
};

/** Shared equal-width pill segmented control (settings / forms). */
export function PillControl<T extends string>({
  className,
  options,
  value,
  onChange,
  disabled,
  size = "sm",
  equal = true,
  "aria-label": ariaLabel,
  ...props
}: PillControlProps<T>) {
  return (
    <div
      className={cn(
        "pillControl",
        size === "md" && "pillControl--md",
        equal && "pillControl--equal",
        disabled && "is-disabled",
        className
      )}
      role="radiogroup"
      aria-label={ariaLabel}
      {...props}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={cn("pillControlSeg", selected && "is-selected")}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
