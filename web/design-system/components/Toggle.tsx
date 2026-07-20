import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "rounded-xl px-3.5 py-2 text-[15px] font-bold transition-colors",
  {
    variants: {
      on: {
        true: "bg-gradient-to-br from-[#4DA3FF] to-[#2F7BD0] text-white",
        false: "bg-[#E2ECF5] text-heading",
      },
    },
    defaultVariants: {
      on: false,
    },
  }
);

export type ToggleProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof toggleVariants> & {
    onLabel?: string;
    offLabel?: string;
  };

export function Toggle({
  className,
  on,
  onLabel = "פעיל",
  offLabel = "כבוי",
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      className={cn(toggleVariants({ on }), className)}
      aria-pressed={!!on}
      {...props}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}
