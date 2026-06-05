"use client"

import { SelectField } from "@/components/select/SelectField"
import { cn } from "@/lib/utils"
import type { PropertyListingLocationFacets } from "../types"
import {
  type CurrencyValue,
  type FurnishingStatusValue,
  type ListingTypeValue,
  type PropertyTypeValue,
} from "../types"
import {
  BEDROOM_FILTER_OPTIONS,
  CURRENCY_FILTER_OPTIONS,
  FURNISHING_FILTER_OPTIONS,
  LISTING_TYPE_FILTER_OPTIONS,
  PROPERTY_TYPE_FILTER_OPTIONS,
} from "../utils/filter-options"
import type { PropertyListingUiFilters } from "../utils/property-listing-filters"

const inputClassName = cn(
  "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm",
  "outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30"
)

type PropertyListingFiltersFieldsProps = {
  filters: PropertyListingUiFilters
  facets?: PropertyListingLocationFacets
  onChange: (filters: PropertyListingUiFilters) => void
  /** Desktop quick filters only (listing type, governorate, bedrooms). */
  variant?: "inline" | "full"
  className?: string
}

function FilterSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function PropertyListingFiltersFields({
  filters,
  facets,
  onChange,
  variant = "full",
  className,
}: PropertyListingFiltersFieldsProps) {
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

  const cityDisabled =
    governorateOptions.length <= 1 ||
    (filters.governorate !== "all" &&
      filters.governorate !== undefined &&
      cityOptions.length <= 1)

  const listingTypeField = (
    <SelectField
      label="Listing type"
      options={LISTING_TYPE_FILTER_OPTIONS}
      value={filters.listingType ?? "all"}
      clearValue="all"
      onValueChange={(value) =>
        onChange({
          ...filters,
          listingType:
            value === "all" ? undefined : (value as ListingTypeValue),
        })
      }
    />
  )

  const propertyTypeField = (
    <SelectField
      label="Property type"
      options={PROPERTY_TYPE_FILTER_OPTIONS}
      value={filters.propertyType ?? "all"}
      clearValue="all"
      onValueChange={(value) =>
        onChange({
          ...filters,
          propertyType:
            value === "all" ? undefined : (value as PropertyTypeValue),
        })
      }
    />
  )

  const governorateField = (
    <SelectField
      label="Governorate"
      options={governorateOptions}
      value={filters.governorate ?? "all"}
      clearValue="all"
      onValueChange={(value) =>
        onChange({
          ...filters,
          governorate: value,
          city: "all",
        })
      }
    />
  )

  const cityField = (
    <SelectField
      label="City"
      options={cityOptions}
      value={filters.city ?? "all"}
      clearValue="all"
      disabled={cityDisabled}
      onValueChange={(value) => onChange({ ...filters, city: value })}
    />
  )

  const bedroomsField = (
    <SelectField
      label="Bedrooms"
      options={BEDROOM_FILTER_OPTIONS}
      value={filters.bedrooms != null ? String(filters.bedrooms) : "all"}
      clearValue="all"
      onValueChange={(value) =>
        onChange({
          ...filters,
          bedrooms: value === "all" ? undefined : Number(value),
        })
      }
    />
  )

  const furnishingField = (
    <SelectField
      label="Furnishing"
      options={FURNISHING_FILTER_OPTIONS}
      value={filters.furnishingStatus ?? "all"}
      clearValue="all"
      onValueChange={(value) =>
        onChange({
          ...filters,
          furnishingStatus:
            value === "all" ? undefined : (value as FurnishingStatusValue),
        })
      }
    />
  )

  const currencyField = (
    <SelectField
      label="Currency"
      options={CURRENCY_FILTER_OPTIONS}
      value={filters.currency ?? "all"}
      clearValue="all"
      onValueChange={(value) =>
        onChange({
          ...filters,
          currency: value === "all" ? undefined : (value as CurrencyValue),
        })
      }
    />
  )

  const priceFields = (
    <>
      <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Min price
        <input
          type="number"
          min={0}
          className={inputClassName}
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
          className={inputClassName}
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
    </>
  )

  const preferenceCheckboxes = (
    <div className="flex flex-wrap gap-2 sm:col-span-2">
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
  )

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3",
          className
        )}
      >
        {listingTypeField}
        {governorateField}
        {bedroomsField}
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <FilterSection title="Location">
        {governorateField}
        {cityField}
      </FilterSection>

      <FilterSection title="Listing">
        {listingTypeField}
        {propertyTypeField}
      </FilterSection>

      <FilterSection title="Space">
        {bedroomsField}
        {furnishingField}
      </FilterSection>

      <FilterSection title="Price">
        {currencyField}
        {priceFields}
      </FilterSection>

      <FilterSection title="Preferences">{preferenceCheckboxes}</FilterSection>
    </div>
  )
}
