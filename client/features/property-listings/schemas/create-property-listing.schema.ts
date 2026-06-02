import { z } from "zod"
import { phoneFormFields } from "@/lib/validation/phone-fields"
import {
  DEFAULT_LISTING_COUNTRY,
  LEBANON_GOVERNORATES,
} from "../constants"
import {
  Currency,
  FurnishingStatus,
  ListingContactMethod,
  ListingType,
  LocationVisibility,
  PricePeriod,
  PropertyType,
} from "../types"
import { listingLocationFormSchema } from "./listing-location.schema"

const listingTypeValues = Object.values(ListingType) as [string, ...string[]]
const propertyTypeValues = Object.values(PropertyType) as [string, ...string[]]
const furnishingValues = Object.values(FurnishingStatus) as [string, ...string[]]
const currencyValues = Object.values(Currency) as [string, ...string[]]
const pricePeriodValues = Object.values(PricePeriod) as [string, ...string[]]
const contactMethodValues = Object.values(ListingContactMethod) as [
  string,
  ...string[],
]
const governorateValues = [...LEBANON_GOVERNORATES] as [string, ...string[]]
const locationVisibilityValues = Object.values(LocationVisibility) as [
  string,
  ...string[],
]

const optionalPositiveInt = z
  .string()
  .optional()
  .refine((v) => !v || /^\d+$/.test(v), "Must be a whole number")

const optionalNumber = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), "Must be a number")

export const createPropertyListingSchema = z.object({
  listingType: z.enum(listingTypeValues, "Select a listing type"),
  propertyType: z.enum(propertyTypeValues, "Select a property type"),
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  country: listingLocationFormSchema.shape.country,
  governorate: z.enum(governorateValues, "Choose a Lebanese governorate"),
  district: z.string().min(1, "District is required"),
  city: listingLocationFormSchema.shape.city,
  street: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  locationVisibility: z.enum(locationVisibilityValues),
  maxOccupancy: optionalPositiveInt,
  bedrooms: optionalPositiveInt,
  bathrooms: optionalPositiveInt,
  livingRooms: optionalPositiveInt,
  parkingSpaces: optionalPositiveInt,
  floorNumber: optionalNumber,
  buildingFloors: optionalPositiveInt,
  area: optionalNumber,
  areaUnit: z.enum(["SQM", "SQFT"]).optional(),
  furnishingStatus: z.enum(furnishingValues).optional(),
  price: optionalNumber,
  currency: z.enum(currencyValues).optional(),
  pricePeriod: z.enum(pricePeriodValues).optional(),
  requiredAdvanceMonths: optionalPositiveInt,
  securityDeposit: optionalNumber,
  officeDeposit: optionalNumber,
  commissionAmount: optionalNumber,
  isPriceNegotiable: z.boolean().optional(),
  isEmergencyShelter: z.boolean().optional(),
  acceptFamilies: z.boolean().optional(),
  acceptChildren: z.boolean().optional(),
  acceptPets: z.boolean().optional(),
  womenOnly: z.boolean().optional(),
  menOnly: z.boolean().optional(),
  availableBeds: optionalPositiveInt,
  totalBeds: optionalPositiveInt,
  amenityIds: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  contactMethod: z
    .enum(contactMethodValues)
    .refine((v) => v !== ListingContactMethod.PLATFORM_ONLY, {
      message: "Choose a contact method",
    }),
  ...phoneFormFields,
  contactWhatsapp: z.string().optional(),
  imageUrls: z.array(z.string()).max(20).optional(),
  imageFiles: z
    .array(z.custom<File>((val) => val instanceof File))
    .max(20)
    .optional(),
  saveAsDraft: z.boolean().optional(),
}).superRefine((values, ctx) => {
  const timeBasedListing =
    values.listingType === ListingType.RENT ||
    values.listingType === ListingType.TEMPORARY_HOUSING ||
    values.listingType === ListingType.ROOMMATE

  if (timeBasedListing && !values.pricePeriod) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Price period is required for time-based listings",
      path: ["pricePeriod"],
    })
  }
})

export type CreatePropertyListingFormValues = z.infer<
  typeof createPropertyListingSchema
>

export const createPropertyListingDefaultValues: CreatePropertyListingFormValues =
  {
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    title: "",
    description: "",
    country: DEFAULT_LISTING_COUNTRY,
    governorate: LEBANON_GOVERNORATES[4],
    district: "",
    city: "",
    street: "",
    latitude: "",
    longitude: "",
    locationVisibility: LocationVisibility.APPROXIMATE,
    maxOccupancy: "",
    bedrooms: "",
    bathrooms: "",
    livingRooms: "",
    parkingSpaces: "",
    floorNumber: "",
    buildingFloors: "",
    area: "",
    areaUnit: "SQM",
    furnishingStatus: undefined,
    price: "",
    currency: Currency.USD,
    pricePeriod: PricePeriod.MONTHLY,
    requiredAdvanceMonths: "",
    securityDeposit: "",
    officeDeposit: "",
    commissionAmount: "",
    isPriceNegotiable: false,
    isEmergencyShelter: false,
    acceptFamilies: false,
    acceptChildren: false,
    acceptPets: false,
    womenOnly: false,
    menOnly: false,
    availableBeds: "",
    totalBeds: "",
    amenityIds: [],
    isAvailable: true,
    availableFrom: "",
    availableUntil: "",
    contactMethod: ListingContactMethod.PHONE,
    phoneCode: "+961",
    phoneNumber: "",
    contactWhatsapp: "",
    imageUrls: [],
    imageFiles: [],
    saveAsDraft: false,
  }
