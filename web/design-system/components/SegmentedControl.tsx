import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const segmentVariants = cva(
  "rounded-xl px-3.5 py-2 text-[15px] font-bold transition-colors",
  {
    variants: {
      selected: {
        true: "bg-gradient-to-br from-[#4DA3FF] to-[#2F7BD0] text-white",
        false: "bg-[#E2ECF5] text-heading",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export type SegmentedOption<T extends string = string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  className,
  options,
  value,
  onChange,
  disabled,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn("seg flex flex-wrap gap-1.5", disabled && "pointer-events-none opacity-40", className)}
      role="group"
      {...props}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(segmentVariants({ selected: value === opt.value }))}
          aria-pressed={value === opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export { segmentVariants };
