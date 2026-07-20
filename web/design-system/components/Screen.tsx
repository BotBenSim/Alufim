import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const screenVariants = cva("absolute inset-0 z-[2]", {
  variants: {
    scroll: {
      // Scroll on the outer shell; horizontal padding lives on the inner column
      // so the scrollbar never steals space from one side.
      true: "overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
      false: "flex flex-col items-center justify-center gap-6 px-5 py-5",
    },
    hidden: {
      true: "hidden",
      false: "",
    },
  },
  defaultVariants: {
    scroll: false,
    hidden: false,
  },
});

export type ScreenProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof screenVariants> & {
    /** Layout classes for the padded inner column (scroll screens only). */
    contentClassName?: string;
  };

export function Screen({
  className,
  contentClassName,
  scroll,
  hidden,
  children,
  ...props
}: ScreenProps) {
  if (scroll) {
    return (
      <div
        className={cn(screenVariants({ scroll, hidden }), !hidden && "block", className)}
        {...props}
      >
        <div
          className={cn(
            "mx-auto box-border flex w-full max-w-[720px] flex-col items-center px-5 pt-6 pb-10",
            contentClassName ?? "gap-6"
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        screenVariants({ scroll, hidden }),
        !hidden && "flex",
        className
      )}
      {...props}
    >
      {children}
    </div>
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
