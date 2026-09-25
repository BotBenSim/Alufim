import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Badge as KidsBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Game-sized header chip over the shared @kids badge. */
const badgeVariants = cva(
  "gap-2 border-0 px-3.5 py-2 text-lg font-semibold text-foreground shadow-soft",
  {
    variants: {
      variant: {
        default: "glass",
        step: "bg-linear-to-b from-[color-mix(in_oklab,var(--accent)_55%,white)] to-accent text-[color-mix(in_oklab,var(--accent)_35%,var(--foreground))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = Omit<ComponentProps<typeof KidsBadge>, "variant"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <KidsBadge variant="outline" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
