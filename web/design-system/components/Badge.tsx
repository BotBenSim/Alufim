import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-lg font-semibold text-heading shadow-soft",
  {
    variants: {
      variant: {
        default: "glass",
        step: "bg-gradient-to-b from-[#FFE08A] to-[#FFC53D] text-[#7A4B00]",
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
