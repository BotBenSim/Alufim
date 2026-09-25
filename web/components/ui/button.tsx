import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Kid games: raised buttons that sink when pressed, like a toy. The
        // edge, highlight and text shadow are derived from the role colour,
        // so every theme gets them for free. `play` is the main action,
        // `play-secondary` and `play-accent` sit beside it, `chip` is a white
        // button for everything else a child may press (new picture, stop).
        play: "bg-primary text-primary-foreground font-bold [--edge:color-mix(in_oklab,var(--primary)_68%,black)] [text-shadow:0_2px_0_var(--edge)] shadow-[inset_0_3px_0_color-mix(in_oklab,white_30%,transparent),0_6px_0_var(--edge)] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_var(--edge)] disabled:translate-y-0 disabled:shadow-none",
        "play-secondary": "bg-secondary text-secondary-foreground font-bold [--edge:color-mix(in_oklab,var(--secondary)_68%,black)] shadow-[inset_0_3px_0_color-mix(in_oklab,white_35%,transparent),0_6px_0_var(--edge)] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_var(--edge)] disabled:translate-y-0 disabled:shadow-none",
        "play-accent": "bg-accent text-accent-foreground font-bold [--edge:color-mix(in_oklab,var(--accent)_60%,var(--primary))] shadow-[inset_0_3px_0_color-mix(in_oklab,white_40%,transparent),0_6px_0_var(--edge)] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_var(--edge)] disabled:translate-y-0 disabled:shadow-none",
        chip: "border-2 border-border bg-card text-card-foreground font-bold [--edge:color-mix(in_oklab,var(--border)_75%,black)] shadow-[0_5px_0_var(--edge)] hover:bg-muted active:translate-y-1 active:shadow-[0_1px_0_var(--edge)] disabled:translate-y-0 disabled:shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        // Kid games: tap targets a small hand can hit. `kid` is a pill,
        // `icon-kid` a big circle for a single glyph (mic, play, send).
        kid: "h-18 min-w-18 rounded-full px-8 text-2xl [&_svg:not([class*='size-'])]:size-7",
        "icon-kid": "size-18 rounded-full text-3xl [&_svg:not([class*='size-'])]:size-8",
        // An app-icon tile: a glyph with a one- or two-word caption under it
        // (`<Button size="tile">🏠<small>בית</small></Button>`), for a row of
        // actions that must stay kid-sized on a phone.
        tile: "size-18 flex-col gap-1 rounded-xl text-3xl leading-none [&_svg:not([class*='size-'])]:size-7 [&>small]:text-xs [&>small]:font-bold [&>small]:[text-shadow:none]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
