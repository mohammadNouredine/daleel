"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  fetchAddressPlaceSuggestions,
  type PlaceSuggestion,
} from "@/lib/google-places-autocomplete"
import { resolveFromPlaceId, type ResolvedLocation } from "@/lib/location-resolve"

type AddressAutocompleteProps = {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onResolved: (location: ResolvedLocation) => void
  disabled?: boolean
}

export function AddressAutocomplete({
  label,
  placeholder = "Search for an address in Lebanon",
  value,
  onChange,
  onResolved,
  disabled = false,
}: AddressAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<PlaceSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const skipNextFetchRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const shouldFetch = useMemo(
    () => isOpen && value.trim().length >= 2 && !disabled,
    [disabled, isOpen, value]
  )

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
      setItems([])
      return
    }

    if (!shouldFetch) {
      setItems([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    const timeout = window.setTimeout(async () => {
      try {
        const suggestions = await fetchAddressPlaceSuggestions(value)
        if (!cancelled) {
          setItems(suggestions)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [value, shouldFetch])

  const handleSelect = async (item: PlaceSuggestion) => {
    skipNextFetchRef.current = true
    setIsOpen(false)
    setItems([])

    const resolved = await resolveFromPlaceId(item.placeId)
    if (!resolved) {
      onChange(item.description)
      return
    }

    onChange(resolved.formattedAddress)
    onResolved(resolved)
    inputRef.current?.blur()
  }

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            skipNextFetchRef.current = false
            onChange(e.target.value)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150)
          }}
          className="pr-9"
        />
        <span className="pointer-events-none absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </span>
        {isOpen && items.length > 0 ? (
          <ul
            className={cn(
              "absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md"
            )}
          >
            {items.map((item) => (
              <li key={item.placeId}>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void handleSelect(item)}
                >
                  {item.description}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
