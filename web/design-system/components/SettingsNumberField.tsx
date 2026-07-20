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

/** Compact labeled number input for settings forms. */
export function SettingsNumberField({
  label,
  value,
  onChange,
  className,
  id,
  min,
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
      const fallback = typeof min === "number" ? min : 0;
      onChange(fallback);
      setText(String(fallback));
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
        id={inputId}
        className="settingsNumInput"
        type="number"
        min={min}
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
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          if (raw === "" || raw === "-") return;
          const parsed = parseInt(raw, 10);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        {...props}
      />
    </label>
  );
}
