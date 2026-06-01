import { MapPin } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type DaleelLogoProps = {
  className?: string
  showTagline?: boolean
}

export function DaleelLogo({ className, showTagline = true }: DaleelLogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 outline-none", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <MapPin className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-semibold tracking-tight">Daleel</span>
        {showTagline ? (
          <span className="text-[11px] text-muted-foreground">
            Humanitarian Aid Platform
          </span>
        ) : null}
      </span>
    </Link>
  )
}
