"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HELP_TYPE_OPTIONS, PRIORITY_OPTIONS } from "../constants"
import {
  DEFAULT_HELP_REQUEST_FILTERS,
  type HelpRequestFilters,
  hasActiveFilters,
} from "../utils/request-filters"

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm",
  "outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30"
)

type HelpRequestFiltersBarProps = {
  filters: HelpRequestFilters
  governorates: string[]
  onChange: (filters: HelpRequestFilters) => void
  className?: string
}

export function HelpRequestFiltersBar({
  filters,
  governorates,
  onChange,
  className,
}: HelpRequestFiltersBarProps) {
  const showClear = hasActiveFilters(filters)

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/60 p-3 sm:p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Filters</p>
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-muted-foreground"
            onClick={() => onChange(DEFAULT_HELP_REQUEST_FILTERS)}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Type
          <select
            className={selectClassName}
            value={filters.helpType}
            onChange={(e) =>
              onChange({
                ...filters,
                helpType: e.target.value as HelpRequestFilters["helpType"],
              })
            }
          >
            <option value="all">All types</option>
            {HELP_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Location
          <select
            className={selectClassName}
            value={filters.governorate}
            onChange={(e) =>
              onChange({ ...filters, governorate: e.target.value })
            }
          >
            <option value="all">All governorates</option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2 lg:col-span-1">
          Priority
          <select
            className={selectClassName}
            value={filters.priority}
            onChange={(e) =>
              onChange({
                ...filters,
                priority: e.target.value as HelpRequestFilters["priority"],
              })
            }
          >
            <option value="all">All priorities</option>
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
