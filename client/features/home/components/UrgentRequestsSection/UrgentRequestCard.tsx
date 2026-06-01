"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UrgentHelpRequestPreview } from "../../types"

const CATEGORY_STYLES = {
  violet:
    "border-violet-500/25 bg-violet-500/10 text-violet-800 dark:text-violet-300",
  orange:
    "border-orange-500/25 bg-orange-500/10 text-orange-800 dark:text-orange-300",
  blue: "border-blue-500/25 bg-blue-500/10 text-blue-800 dark:text-blue-300",
  emerald:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  rose: "border-rose-500/25 bg-rose-500/10 text-rose-800 dark:text-rose-300",
} as const

const URGENCY_STYLES = {
  Critical: "text-destructive",
  High: "text-orange-600 dark:text-orange-400",
  Medium: "text-muted-foreground",
} as const

type UrgentRequestCardProps = {
  request: UrgentHelpRequestPreview
  index?: number
}

export function UrgentRequestCard({ request, index = 0 }: UrgentRequestCardProps) {
  const percent = Math.min(
    100,
    Math.round((request.raised / request.goal) * 100)
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="w-[min(100%,280px)] shrink-0 snap-start sm:w-[300px]"
      role="listitem"
    >
      <Link
        href="/help-requests"
        className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              CATEGORY_STYLES[request.categoryColor]
            )}
          >
            {request.category}
          </span>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
            aria-hidden
          >
            {request.authorInitials}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">
          {request.title}
        </h3>

        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {request.location}
        </p>

        <p
          className={cn(
            "mt-2 text-xs font-medium",
            URGENCY_STYLES[request.urgency]
          )}
        >
          {request.urgency} priority
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              ${request.raised} of ${request.goal}
            </span>
            <span className="text-muted-foreground">{percent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
