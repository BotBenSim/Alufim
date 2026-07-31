"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SettingsNumberFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value"
> & {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** `inline` puts the label beside the input (e.g. XP rows). */
  layout?: "stack" | "inline";
};

/**
 * Compact labeled number input for settings forms.
 * Commits on blur/Enter only so partial typing (e.g. "2" on the way to "20")
 * cannot thrash paired min/max fields.
 */
export function SettingsNumberField({
  label,
  value,
  onChange,
  className,
  id,
  min,
  max,
  layout = "stack",
  ...props
}: SettingsNumberFieldProps) {
  const inputId = id ?? `num-${label}`;
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setText(String(value));
      return;
    }
    const minN = typeof min === "number" ? Number(min) : undefined;
    const maxN = typeof max === "number" ? Number(max) : undefined;
    if (minN != null && parsed < minN) {
      setText(String(value));
      return;
    }
    if (maxN != null && parsed > maxN) {
      setText(String(value));
      return;
    }
    onChange(parsed);
    setText(String(parsed));
  };

  return (
    <label
      className={cn(
        "settingsNumField",
        layout === "inline" && "settingsNumField--inline",
        className
      )}
      htmlFor={inputId}
    >
      <span className="settingsNumLabel">{label}</span>
      <input
        {...props}
        id={inputId}
        className="settingsNumInput"
        type="number"
        min={min}
        max={max}
        value={text}
        onFocus={(e) => {
          setFocused(true);
          // Clear a lone zero so typing 50 doesn’t become 050
          if (value === 0) {
            setText("");
            e.target.select();
          } else {
            e.target.select();
          }
        }}
        onBlur={() => {
          setFocused(false);
          commit(text);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        onChange={(e) => setText(e.target.value)}
      />
    </label>
  );
}
