import { z } from "zod"
import { HelpType, PriorityLevel, SubCategory } from "../types"
import { needLineFormSchema, type NeedLineFormValue } from "./need-line.schema"
import {
  createNeedLineId,
  defaultNeedKindForHelpType,
  defaultUnitForKind,
} from "../utils/request-needs"

const helpTypeValues = Object.values(HelpType) as [string, ...string[]]
const subCategoryValues = Object.values(SubCategory) as [string, ...string[]]
const priorityValues = Object.values(PriorityLevel) as [string, ...string[]]

export const createHelpRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  helpType: z.enum(helpTypeValues, "Select a help type"),
  subCategory: z.enum(subCategoryValues, "Select a sub-category"),
  priorityLevel: z.enum(priorityValues),
  needLines: z.array(needLineFormSchema),
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

export type CreateHelpRequestFormValues = z.infer<typeof createHelpRequestSchema>

export function createEmptyNeedLine(
  helpType: (typeof HelpType)[keyof typeof HelpType] = HelpType.MATERIAL
): NeedLineFormValue {
  const kind = defaultNeedKindForHelpType(helpType)
  return {
    id: createNeedLineId(),
    label: "",
    required: "1",
    unit: defaultUnitForKind(kind),
    notes: "",
    kind,
  }
}

export const createHelpRequestDefaultValues: CreateHelpRequestFormValues = {
  title: "",
  description: "",
  helpType: HelpType.MATERIAL,
  subCategory: SubCategory.FOOD,
  priorityLevel: PriorityLevel.HIGH,
  needLines: [],
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
