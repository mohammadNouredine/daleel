"use client"

import { SelectField } from "@/components/select/SelectField"
import { cn } from "@/lib/utils"
import { useHelpRequestReference } from "@/features/reference/hooks/use-help-request-reference"
import { toSelectOptions } from "@/features/reference/utils/reference-labels"
import { PRIORITY_OPTIONS, SORT_OPTIONS } from "../constants"
import type { HelpRequestSortValue } from "../types"
import type { HelpRequestFilters } from "../utils/request-filters"

type HelpRequestFiltersBarProps = {
  filters: HelpRequestFilters
  sort: HelpRequestSortValue
  governorates: string[]
  onChange: (filters: HelpRequestFilters) => void
  onSortChange: (sort: HelpRequestSortValue) => void
  sortHint?: string
  className?: string
}

export function HelpRequestFiltersBar({
  filters,
  sort,
  governorates,
  onChange,
  onSortChange,
  sortHint,
  className,
}: HelpRequestFiltersBarProps) {
  const { helpTypes, isLoading: isReferenceLoading } =
    useHelpRequestReference()
  const helpTypeOptions = [
    { value: "all", label: "All types" },
    ...toSelectOptions(helpTypes),
  ]
  const governorateOptions = [
    { value: "all", label: "All governorates" },
    ...governorates.map((gov) => ({ value: gov, label: gov })),
  ]
  const priorityOptions = [
    { value: "all", label: "All priorities" },
    ...PRIORITY_OPTIONS,
  ]

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/60 p-3 sm:p-4",
        className
      )}
    >
      <p className="mb-3 text-sm font-medium">Filters</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Type"
          options={helpTypeOptions}
          value={filters.helpType}
          clearValue="all"
          disabled={isReferenceLoading}
          onValueChange={(value) =>
            onChange({
              ...filters,
              helpType: value as HelpRequestFilters["helpType"],
            })
          }
        />

        <SelectField
          label="Location"
          options={governorateOptions}
          value={filters.governorate}
          clearValue="all"
          onValueChange={(value) =>
            onChange({ ...filters, governorate: value })
          }
        />

        <SelectField
          label="Priority"
          options={priorityOptions}
          value={filters.priority}
          clearValue="all"
          className="sm:col-span-2 lg:col-span-1"
          onValueChange={(value) =>
            onChange({
              ...filters,
              priority: value as HelpRequestFilters["priority"],
            })
          }
        />

        <SelectField
          label="Sort by"
          options={SORT_OPTIONS}
          value={sort}
          className="sm:col-span-2 lg:col-span-1"
          hint={sortHint}
          onValueChange={(value) => onSortChange(value as HelpRequestSortValue)}
        />
      </div>
    </div>
  )
}
