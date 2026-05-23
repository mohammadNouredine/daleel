import { z } from "zod"
import {
  HelpType,
  PriorityLevel,
  SubCategory,
  Visibility,
} from "../types"

const helpTypeValues = Object.values(HelpType) as [string, ...string[]]
const subCategoryValues = Object.values(SubCategory) as [string, ...string[]]
const priorityValues = Object.values(PriorityLevel) as [string, ...string[]]
const visibilityValues = Object.values(Visibility) as [string, ...string[]]

export const createHelpRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  helpType: z.enum(helpTypeValues, "Select a help type"),
  subCategory: z.enum(subCategoryValues, "Select a sub-category"),
  priorityLevel: z.enum(priorityValues),
  quantityRequired: z
    .string()
    .min(1, "Quantity is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 1, {
      message: "Quantity must be at least 1",
    }),
  quantityUnit: z.string().optional(),
  governorate: z.string().min(1, "Governorate is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  beneficiariesCount: z.string().optional(),
  visibility: z.enum(visibilityValues),
})

export type CreateHelpRequestFormValues = z.infer<typeof createHelpRequestSchema>

export const createHelpRequestDefaultValues: CreateHelpRequestFormValues = {
  title: "",
  description: "",
  helpType: HelpType.MATERIAL,
  subCategory: SubCategory.FOOD,
  priorityLevel: PriorityLevel.MEDIUM,
  quantityRequired: "1",
  quantityUnit: "",
  governorate: "",
  district: "",
  city: "",
  beneficiariesCount: "",
  visibility: Visibility.PUBLIC,
}
