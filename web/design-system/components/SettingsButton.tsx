import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SettingsButtonVariant = "primary" | "ghost" | "danger";

type SettingsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: SettingsButtonVariant;
};

/** Fixed-height settings action button — equal width when placed in a `.btnRow`. */
export function SettingsButton({
  className,
  variant = "ghost",
  type = "button",
  ...props
}: SettingsButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "settingsBtn",
        variant === "primary" && "settingsBtnPrimary",
        variant === "ghost" && "settingsBtnGhost",
        variant === "danger" && "settingsBtnDanger",
        className
      )}
      {...props}
    />
  );
}
