import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-[18px] px-3.5 py-2 text-lg font-bold text-heading shadow-[0_3px_8px_rgba(0,0,0,.12)]",
  {
    variants: {
      variant: {
        default: "bg-white/85",
        step: "bg-[#FFF1C9] text-[#9A6A00]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
