import { z } from "zod"
import { LocationVisibility } from "../types"

const locationVisibilityValues = Object.values(LocationVisibility) as [
  string,
  ...string[],
]

export const listingLocationFormSchema = z.object({
  country: z.string().min(1, "Country is required"),
  governorate: z.string().min(1, "Governorate is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  street: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  locationVisibility: z.enum(locationVisibilityValues),
})

export type ListingLocationFormValues = z.infer<typeof listingLocationFormSchema>
