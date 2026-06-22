import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const screenVariants = cva(
  "absolute inset-0 z-[2] flex flex-col items-center gap-6 p-5",
  {
    variants: {
      scroll: {
        true: "justify-start overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] pt-6 pb-10 gap-4",
        false: "justify-center",
      },
      hidden: {
        true: "hidden",
        false: "flex",
      },
    },
    defaultVariants: {
      scroll: false,
      hidden: false,
    },
  }
);

export type ScreenProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof screenVariants>;

export function Screen({ className, scroll, hidden, ...props }: ScreenProps) {
  return (
    <div className={cn(screenVariants({ scroll, hidden }), className)} {...props} />
  );
}

export function BrandTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col items-center gap-0.5 mt-1.5", className)} {...props} />
  );
}

export function Brand({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-brand font-black tracking-wide leading-none text-brand",
        "text-shadow-brand",
        className
      )}
      {...props}
    />
  );
}
