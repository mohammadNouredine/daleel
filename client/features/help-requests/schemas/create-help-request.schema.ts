import { z } from "zod"
import { phoneFormFields } from "@/lib/validation/phone-fields"
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
  governorate: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  beneficiariesCount: z.string().optional(),
  proofImageUrls: z.array(z.string()).max(8).optional(),
  proofImageFiles: z.array(z.custom<File>((val) => val instanceof File)).max(8).optional(),
  ...phoneFormFields,
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
  proofImageFiles: [],
  phoneCode: "+961",
  phoneNumber: "",
}
