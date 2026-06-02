"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DEFAULT_PROPERTY_LISTING_UI_FILTERS,
  hasActivePropertyListingFilters,
  type PropertyListingUiFilters,
} from "../utils/property-listing-filters"
import type { PropertyListingLocationFacets } from "../types"
import {
  BEDROOM_FILTER_OPTIONS,
  CURRENCY_FILTER_OPTIONS,
  FURNISHING_FILTER_OPTIONS,
  LISTING_TYPE_FILTER_OPTIONS,
  PROPERTY_TYPE_FILTER_OPTIONS,
} from "../utils/filter-options"
import {
  type CurrencyValue,
  type FurnishingStatusValue,
  type ListingTypeValue,
  type PropertyTypeValue,
} from "../types"

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm",
  "outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30"
)

type PropertyListingFiltersBarProps = {
  filters: PropertyListingUiFilters
  facets?: PropertyListingLocationFacets
  onChange: (filters: PropertyListingUiFilters) => void
  className?: string
}

export function PropertyListingFiltersBar({
  filters,
  facets,
  onChange,
  className,
}: PropertyListingFiltersBarProps) {
  const governorateOptions = [
    { value: "all", label: "All governorates" },
    ...(facets?.governorates ?? []).map((g) => ({
      value: g.value,
      label: g.value,
    })),
  ]

  const cityOptions = [
    { value: "all", label: "All cities" },
    ...(facets?.cities ?? [])
      .filter(
        (c) =>
          filters.governorate === "all" ||
          !filters.governorate ||
          c.governorate === filters.governorate
      )
      .map((c) => ({ value: c.value, label: c.value })),
  ]

  const showClear = hasActivePropertyListingFilters(filters)

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
            onClick={() => onChange(DEFAULT_PROPERTY_LISTING_UI_FILTERS)}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Listing type
          <select
            className={selectClassName}
            value={filters.listingType ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                listingType:
                  e.target.value === "all"
                    ? undefined
                    : (e.target.value as ListingTypeValue),
              })
            }
          >
            {LISTING_TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Property type
          <select
            className={selectClassName}
            value={filters.propertyType ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                propertyType:
                  e.target.value === "all"
                    ? undefined
                    : (e.target.value as PropertyTypeValue),
              })
            }
          >
            {PROPERTY_TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Governorate
          <select
            className={selectClassName}
            value={filters.governorate ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                governorate: e.target.value,
                city: "all",
              })
            }
          >
            {governorateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          City
          <select
            className={selectClassName}
            value={filters.city ?? "all"}
            disabled={
              governorateOptions.length <= 1 ||
              (filters.governorate !== "all" &&
                filters.governorate !== undefined &&
                cityOptions.length <= 1)
            }
            onChange={(e) =>
              onChange({ ...filters, city: e.target.value })
            }
          >
            {cityOptions.map((opt) => (
              <option key={`${opt.value}-${opt.label}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Bedrooms
          <select
            className={selectClassName}
            value={
              filters.bedrooms != null ? String(filters.bedrooms) : "all"
            }
            onChange={(e) =>
              onChange({
                ...filters,
                bedrooms:
                  e.target.value === "all"
                    ? undefined
                    : Number(e.target.value),
              })
            }
          >
            {BEDROOM_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Furnishing
          <select
            className={selectClassName}
            value={filters.furnishingStatus ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                furnishingStatus:
                  e.target.value === "all"
                    ? undefined
                    : (e.target.value as FurnishingStatusValue),
              })
            }
          >
            {FURNISHING_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Currency
          <select
            className={selectClassName}
            value={filters.currency ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                currency:
                  e.target.value === "all"
                    ? undefined
                    : (e.target.value as CurrencyValue),
              })
            }
          >
            {CURRENCY_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Min price
          <input
            type="number"
            min={0}
            className={selectClassName}
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMin: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Min"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Max price
          <input
            type="number"
            min={0}
            className={selectClassName}
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMax: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Max"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["isEmergencyShelter", "Emergency shelter"],
            ["acceptPets", "Pets allowed"],
            ["isVerified", "Verified only"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 px-2.5 py-1.5 text-xs"
          >
            <input
              type="checkbox"
              className="size-3.5 rounded border-input"
              checked={filters[key] === true}
              onChange={(e) =>
                onChange({
                  ...filters,
                  [key]: e.target.checked ? true : undefined,
                })
              }
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
