import { Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/shared/lib/utils"

const inputClass =
  "flex h-10 w-full rounded-xl bg-white/5 px-3.5 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { t } = useTranslation()
    const [revealed, setRevealed] = React.useState(false)
    const isPassword = type === "password"

    const input = (
      <input
        type={isPassword && revealed ? "text" : type}
        className={cn(inputClass, isPassword && "pr-10", className)}
        ref={ref}
        {...props}
      />
    )

    if (!isPassword) return input

    return (
      <div className="relative w-full">
        {input}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setRevealed((v) => !v)}
          aria-label={t(revealed ? "auth.hidePassword" : "auth.showPassword")}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          disabled={props.disabled}
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
