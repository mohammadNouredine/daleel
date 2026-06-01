"use client"

import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useFormContext } from "react-hook-form"
import { useAmenities } from "../../hooks/use-amenities"
import type { CreatePropertyListingFormValues } from "../../schemas/create-property-listing.schema"

export function PropertyListingAmenitiesField() {
  const form = useFormContext<CreatePropertyListingFormValues>()
  const { data: amenities = [], isLoading } = useAmenities()

  return (
    <FormField
      control={form.control}
      name="amenityIds"
      render={({ field }) => {
        const selected = field.value ?? []

        const toggle = (id: string) => {
          const next = selected.includes(id)
            ? selected.filter((x) => x !== id)
            : [...selected, id]
          field.onChange(next)
        }

        return (
          <FormItem>
            <FormLabel>Amenities</FormLabel>
            <FormDescription>
              Select amenities that apply to this listing.
            </FormDescription>
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading amenities…</p>
            ) : amenities.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No amenities configured yet. You can still publish without them.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {amenities
                  .filter((a) => a.isActive)
                  .map((amenity) => (
                    <label
                      key={amenity._id}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs"
                    >
                      <input
                        type="checkbox"
                        className="size-3.5 rounded border-input"
                        checked={selected.includes(amenity._id)}
                        onChange={() => toggle(amenity._id)}
                      />
                      {amenity.code.replace(/_/g, " ")}
                    </label>
                  ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
