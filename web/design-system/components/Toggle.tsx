import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "rounded-lg px-3.5 py-2 text-[15px] font-bold transition-colors",
  {
    variants: {
      on: {
        true: "bg-secondary text-secondary-foreground",
        false: "bg-muted text-foreground",
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
