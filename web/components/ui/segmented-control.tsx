"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type SegmentedOption<T extends string = string> = {
  value: T
  label: React.ReactNode
}

/**
 * A row of mutually exclusive pills (ported from Alufim's SegmentedControl).
 * Colours come from the theme: the selected pill is `primary`, the rest `muted`.
 */
function SegmentedControl<T extends string>({
  className,
  options,
  value,
  onValueChange,
  disabled,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  options: SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  disabled?: boolean
  size?: "sm" | "default"
}) {
  return (
    <div
      data-slot="segmented-control"
      role="group"
      className={cn(
        "flex flex-wrap gap-1.5",
        disabled && "pointer-events-none opacity-40",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          disabled={disabled}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "rounded-lg font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-3.5 py-2 text-sm",
            "bg-muted text-muted-foreground hover:text-foreground",
            "aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export { SegmentedControl }
