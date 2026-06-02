import { z } from "zod"
import { LocationVisibility } from "../types"

const locationVisibilityValues = Object.values(LocationVisibility) as [
  string,
  ...string[],
]

export const listingLocationFormSchema = z.object({
  country: z.string().min(1, "Country is required"),
  formattedAddress: z.string().optional(),
  governorate: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  locationVisibility: z.enum(locationVisibilityValues),
})

export type ListingLocationFormValues = z.infer<typeof listingLocationFormSchema>
