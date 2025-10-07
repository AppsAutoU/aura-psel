'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border border-neutral-300",
        success: "bg-green-100 text-green-800 border border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        error: "bg-red-100 text-red-800 border border-red-200",
        info: "bg-blue-100 text-blue-800 border border-blue-200",
        cosmic: "bg-gradient-cosmic text-white",

        // Reprovações (tons de vermelho crescente)
        'red-light': "bg-red-50 text-red-700 border border-red-200",
        'red-medium': "bg-red-100 text-red-800 border border-red-300",
        'red-dark': "bg-red-200 text-red-900 border border-red-400",
        'red-intense': "bg-red-300 text-red-950 border border-red-500",

        // Aprovações (tons de verde crescente)
        'green-light': "bg-green-50 text-green-700 border border-green-200",
        'green-medium': "bg-green-100 text-green-800 border border-green-300",
        'green-intense': "bg-green-200 text-green-900 border border-green-400",

        // Processos em andamento (azul)
        'blue-light': "bg-blue-50 text-blue-700 border border-blue-200",
        'blue-medium': "bg-blue-100 text-blue-800 border border-blue-300",

        // Processos em andamento (amarelo)
        'yellow-light': "bg-yellow-50 text-yellow-700 border border-yellow-200",
        'yellow-medium': "bg-yellow-100 text-yellow-800 border border-yellow-300",

        // Etapas de entrevista
        'violet': "bg-violet-100 text-violet-800 border border-violet-300",
        'pink': "bg-pink-100 text-pink-800 border border-pink-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }