import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { haptic } from "@/shared/lib/haptics"
import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:bg-ink/[0.07] disabled:bg-none disabled:text-muted-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // One green does the work, as on the landing: a solid fill that
        // darkens on hover. The gradient-and-glow pair this replaces was built
        // to glow against a dark page and only smudges on paper.
        default: "text-white bg-brand-green hover:bg-brand-greenDeep shadow-glow",
        action: "text-white bg-brand-green hover:bg-brand-greenDeep shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
        outline:
          "bg-transparent shadow-[inset_0_0_0_1px_rgba(29,27,24,0.14)] hover:bg-ink/[0.04]",
        secondary:
          "bg-ink/[0.05] text-secondary-foreground hover:bg-ink/[0.08]",
        ghost: "hover:bg-ink/[0.035] text-foreground",
        link: "text-brand-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Variants that count as "important" actions get a subtle haptic tap.
const HAPTIC_VARIANTS = new Set([undefined, "default", "action", "destructive"])

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (HAPTIC_VARIANTS.has(variant ?? undefined)) haptic()
      onClick?.(e)
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
