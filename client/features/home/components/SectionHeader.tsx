import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  title: string
  subtitle?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "outline" | "destructive"
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  badgeVariant = "secondary",
  viewAllHref,
  viewAllLabel = "View all",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h2>
          {badge ? (
            <Badge variant={badgeVariant} className="text-[10px] uppercase">
              {badge}
            </Badge>
          ) : null}
        </div>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {viewAllLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  )
}
