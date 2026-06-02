import type { CreatePropertyListingFormValues } from "../schemas/create-property-listing.schema"

export const PROPERTY_LISTING_FORM_STEPS = [
  "basics",
  "location",
  "details",
  "access",
  "media",
] as const

export type PropertyListingFormStep =
  (typeof PROPERTY_LISTING_FORM_STEPS)[number]

export const PROPERTY_LISTING_STEP_FIELDS: Record<
  PropertyListingFormStep,
  (keyof CreatePropertyListingFormValues)[]
> = {
  basics: ["listingType", "propertyType", "title", "description"],
  location: ["formattedAddress", "latitude", "longitude", "locationVisibility"],
  details: [],
  access: [],
  media: ["phoneCode", "phoneNumber"],
}

export function getNextStep(
  step: PropertyListingFormStep
): PropertyListingFormStep | null {
  const index = PROPERTY_LISTING_FORM_STEPS.indexOf(step)
  if (index < 0 || index >= PROPERTY_LISTING_FORM_STEPS.length - 1) {
    return null
  }
  return PROPERTY_LISTING_FORM_STEPS[index + 1]
}

export function getPreviousStep(
  step: PropertyListingFormStep
): PropertyListingFormStep | null {
  const index = PROPERTY_LISTING_FORM_STEPS.indexOf(step)
  if (index <= 0) {
    return null
  }
  return PROPERTY_LISTING_FORM_STEPS[index - 1]
}

export function isLastStep(step: PropertyListingFormStep): boolean {
  return step === PROPERTY_LISTING_FORM_STEPS[PROPERTY_LISTING_FORM_STEPS.length - 1]
}

export function hasVisitedAllSteps(visited: Set<PropertyListingFormStep>): boolean {
  return PROPERTY_LISTING_FORM_STEPS.every((step) => visited.has(step))
}
