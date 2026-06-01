"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHelpRequestReference } from "@/features/reference/hooks/use-help-request-reference";
import { toSelectOptions } from "@/features/reference/utils/reference-labels";
import { PRIORITY_OPTIONS, SORT_OPTIONS } from "../constants";
import {
  DEFAULT_HELP_REQUEST_FILTERS,
  type HelpRequestFilters,
  hasActiveFilters,
} from "../utils/request-filters";
import type { HelpRequestSortValue } from "../types";

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm",
  "outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30",
);

type HelpRequestFiltersBarProps = {
  filters: HelpRequestFilters;
  sort: HelpRequestSortValue;
  governorates: string[];
  onChange: (filters: HelpRequestFilters) => void;
  onSortChange: (sort: HelpRequestSortValue) => void;
  sortHint?: string;
  className?: string;
};

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
    useHelpRequestReference();
  const helpTypeOptions = toSelectOptions(helpTypes);
  const showClear = hasActiveFilters(filters);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/60 p-3 sm:p-4",
        className,
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Type
          <select
            className={selectClassName}
            value={filters.helpType}
            disabled={isReferenceLoading}
            onChange={(e) =>
              onChange({
                ...filters,
                helpType: e.target.value as HelpRequestFilters["helpType"],
              })
            }
          >
            <option value="all">All types</option>
            {helpTypeOptions.map((opt) => (
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

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2 lg:col-span-1">
          Sort by
          <select
            className={selectClassName}
            value={sort}
            onChange={(e) =>
              onSortChange(e.target.value as HelpRequestSortValue)
            }
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {sortHint ? (
            <span className="text-[11px] font-normal leading-snug text-muted-foreground">
              {sortHint}
            </span>
          ) : null}
        </label>
      </div>
    </div>
  );
}
