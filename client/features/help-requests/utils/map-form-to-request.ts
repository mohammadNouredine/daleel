import {
  HelpRequestStatus,
  HelpType,
  Visibility,
  type CreateHelpRequestInput,
  type HelpRequest,
  type HelpTypeValue,
  type PriorityLevelValue,
  type SubCategoryValue,
} from "../types"
import type { CreateHelpRequestFormValues } from "../schemas/create-help-request.schema"

export function mapFormToCreateInput(
  values: CreateHelpRequestFormValues
): CreateHelpRequestInput {
  const beneficiaries = !values.beneficiariesCount?.trim()
    ? undefined
    : Number(values.beneficiariesCount)

  const isFinancial = values.helpType === HelpType.FINANCIAL
  const amount = Number(values.quantityRequired)
  const currency = values.quantityUnit?.trim()

  const lat = values.latitude?.trim()
    ? Number(values.latitude)
    : undefined
  const lng = values.longitude?.trim()
    ? Number(values.longitude)
    : undefined

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    helpType: values.helpType as HelpTypeValue,
    subCategory: values.subCategory as SubCategoryValue,
    priorityLevel: values.priorityLevel as PriorityLevelValue,
    quantity: {
      required: amount,
      unit: isFinancial ? currency : values.quantityUnit?.trim() || undefined,
    },
    financialDetails: isFinancial
      ? {
          requiredAmount: amount,
          collectedAmount: 0,
          currency: currency ?? "USD",
        }
      : undefined,
    beneficiariesCount: beneficiaries,
    location: {
      governorate: values.governorate.trim(),
      district: values.district.trim(),
      city: values.city.trim(),
      street: values.street?.trim() || undefined,
      coordinates:
        lat !== undefined &&
        lng !== undefined &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng)
          ? { lat, lng }
          : undefined,
    },
    visibility: Visibility.PUBLIC,
    media: values.proofImageUrls?.length ? values.proofImageUrls : undefined,
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
    financialDetails: input.financialDetails,
    beneficiariesCount: input.beneficiariesCount,
    location: input.location,
    status: HelpRequestStatus.ACTIVE,
    visibility: input.visibility,
    media: input.media,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  }
}
