"use client"

import { useEffect, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { PropertyListingLocationFacets } from "../types"
import {
  countActivePropertyListingFilters,
  DEFAULT_PROPERTY_LISTING_UI_FILTERS,
  type PropertyListingUiFilters,
} from "../utils/property-listing-filters"
import { PropertyListingFiltersFields } from "./PropertyListingFiltersFields"

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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draft, setDraft] = useState<PropertyListingUiFilters>(filters)

  const activeCount = countActivePropertyListingFilters(filters)

  useEffect(() => {
    if (sheetOpen) {
      setDraft(filters)
    }
  }, [sheetOpen, filters])

  const openSheet = () => setSheetOpen(true)

  const applyDraft = () => {
    onChange(draft)
    setSheetOpen(false)
  }

  const clearAll = () => {
    onChange(DEFAULT_PROPERTY_LISTING_UI_FILTERS)
    setDraft(DEFAULT_PROPERTY_LISTING_UI_FILTERS)
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3",
          className
        )}
      >
        <PropertyListingFiltersFields
          variant="inline"
          filters={filters}
          facets={facets}
          onChange={onChange}
          className="hidden md:grid"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={openSheet}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            <span className="md:hidden">Filters</span>
            <span className="hidden md:inline">More filters</span>
            {activeCount > 0 ? (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
              >
                {activeCount}
              </Badge>
            ) : null}
          </Button>

          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={clearAll}
            >
              Clear all
            </Button>
          ) : null}
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine listings by location, type, price, and preferences.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <PropertyListingFiltersFields
              variant="full"
              filters={draft}
              facets={facets}
              onChange={setDraft}
            />
          </div>

          <div className="flex gap-2 border-t border-border bg-background p-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={clearAll}
            >
              Clear all
            </Button>
            <Button type="button" className="flex-1" onClick={applyDraft}>
              Show results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
