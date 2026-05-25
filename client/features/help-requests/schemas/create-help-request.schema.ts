import { z } from "zod"
import { HelpType, PriorityLevel, SubCategory } from "../types"
import { FINANCIAL_CURRENCY_OPTIONS } from "../constants"

const helpTypeValues = Object.values(HelpType) as [string, ...string[]]
const subCategoryValues = Object.values(SubCategory) as [string, ...string[]]
const priorityValues = Object.values(PriorityLevel) as [string, ...string[]]
const currencyValues = FINANCIAL_CURRENCY_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
]

export const createHelpRequestSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    helpType: z.enum(helpTypeValues, "Select a help type"),
    subCategory: z.enum(subCategoryValues, "Select a sub-category"),
    priorityLevel: z.enum(priorityValues),
    quantityRequired: z
      .string()
      .min(1, "This field is required")
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 1, {
        message: "Must be at least 1",
      }),
    quantityUnit: z.string().optional(),
    governorate: z.string().min(1, "Governorate is required"),
    district: z.string().min(1, "District is required"),
    city: z.string().min(1, "City is required"),
    street: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    beneficiariesCount: z.string().optional(),
    proofImageUrls: z.array(z.string()).max(8).optional(),
    phoneCode: z.string().min(1, "Select a country code"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .refine((v) => {
        const digits = v.replace(/\D/g, "")
        return digits.length >= 6 && digits.length <= 15
      }, "Enter a valid phone number (6–15 digits)"),
  })
  .superRefine((data, ctx) => {
    if (data.helpType === HelpType.FINANCIAL) {
      if (
        !data.quantityUnit ||
        !currencyValues.includes(data.quantityUnit as (typeof currencyValues)[number])
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["quantityUnit"],
          message: "Select a currency",
        })
      }
    }
  })

export type CreateHelpRequestFormValues = z.infer<typeof createHelpRequestSchema>

export const createHelpRequestDefaultValues: CreateHelpRequestFormValues = {
  title: "",
  description: "",
  helpType: HelpType.MATERIAL,
  subCategory: SubCategory.FOOD,
  priorityLevel: PriorityLevel.HIGH,
  quantityRequired: "1",
  quantityUnit: "",
  governorate: "",
  district: "",
  city: "",
  street: "",
  latitude: "",
  longitude: "",
  beneficiariesCount: "",
  proofImageUrls: [],
  phoneCode: "+961",
  phoneNumber: "",
}
