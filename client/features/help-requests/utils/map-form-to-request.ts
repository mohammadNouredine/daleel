import {
  HelpRequestStatus,
  type CreateHelpRequestInput,
  type HelpRequest,
  type HelpTypeValue,
  type PriorityLevelValue,
  type SubCategoryValue,
  type VisibilityValue,
} from "../types"
import type { CreateHelpRequestFormValues } from "../schemas/create-help-request.schema"

export function mapFormToCreateInput(
  values: CreateHelpRequestFormValues
): CreateHelpRequestInput {
  const beneficiaries =
    !values.beneficiariesCount?.trim()
      ? undefined
      : Number(values.beneficiariesCount)

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    helpType: values.helpType as HelpTypeValue,
    subCategory: values.subCategory as SubCategoryValue,
    priorityLevel: values.priorityLevel as PriorityLevelValue,
    quantity: {
      required: Number(values.quantityRequired),
      unit: values.quantityUnit?.trim() || undefined,
    },
    beneficiariesCount: beneficiaries,
    location: {
      governorate: values.governorate.trim(),
      district: values.district.trim(),
      city: values.city.trim(),
    },
    visibility: values.visibility as VisibilityValue,
  }
}

export function mapCreateInputToHelpRequest(
  input: CreateHelpRequestInput,
  createdBy: string
): HelpRequest {
  const now = new Date().toISOString()
  const required = input.quantity.required

  return {
    _id: `hr_${crypto.randomUUID().slice(0, 8)}`,
    createdBy,
    title: input.title,
    description: input.description,
    helpType: input.helpType,
    subCategory: input.subCategory,
    priorityLevel: input.priorityLevel,
    quantity: {
      required,
      fulfilled: 0,
      remaining: required,
      unit: input.quantity.unit,
    },
    beneficiariesCount: input.beneficiariesCount,
    location: input.location,
    status: HelpRequestStatus.ACTIVE,
    visibility: input.visibility,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  }
}
