"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ModalProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
};

/** Game-styled modal wrapper over shadcn Dialog */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  overlayClassName,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[86%] rounded-panel border-none bg-white p-7 text-center shadow-panel animate-[pop_0.35s]",
          className
        )}
        overlayClassName={cn("bg-[rgba(20,40,70,.45)] backdrop-blur-[3px]", overlayClassName)}
      >
        {(title || description) && (
          <DialogHeader className="space-y-2 text-center">
            {title && (
              <DialogTitle className="text-[clamp(24px,5.5vw,40px)] font-extrabold text-heading">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-[19px] text-[#456]">{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
