import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefix asset paths for GitHub Pages basePath */
export function assetPath(p: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Alufim";
  return `${base}/${p.replace(/^\//, "")}`;
}
