"use client"

import { cn } from "@/lib/utils"

type HorizontalScrollRowProps = {
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}

export function HorizontalScrollRow({
  children,
  className,
  ariaLabel,
}: HorizontalScrollRowProps) {
  return (
    <div
      className={cn(
        "-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scroll-smooth snap-x snap-mandatory",
        "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5",
        className
      )}
      role="list"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}
