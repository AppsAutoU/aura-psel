'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-neutral-200 bg-neutral-50 hover:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
        clean: "border border-neutral-200 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
        minimal: "border-0 border-b-2 border-neutral-200 bg-transparent focus:border-violet-500 rounded-none",
      },
      size: {
        default: "h-12 px-4 py-3 text-sm rounded-lg",
        sm: "h-9 px-3 py-2 text-xs rounded-md",
        lg: "h-14 px-5 py-4 text-base rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }