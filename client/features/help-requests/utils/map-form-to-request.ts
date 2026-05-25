import {
  HelpRequestStatus,
  Visibility,
  type CreateHelpRequestInput,
  type CreateHelpRequestNeedInput,
  type HelpRequest,
  type HelpRequestNeedLine,
  type HelpRequestNeedKindValue,
  type PriorityLevelValue,
  type SubCategoryValue,
  type HelpTypeValue,
} from "../types"
import type { CreateHelpRequestFormValues } from "../schemas/create-help-request.schema"
import type { NeedLineFormValue } from "../schemas/need-line.schema"
import {
  splitContactPhone,
  formatContactPhone,
} from "@/components/forms/Phone/phone-utils"
import {
  buildNeedsFromCreateInput,
  createNeedLineId,
  deriveStatusFromNeeds,
  normalizeNeedLine,
  normalizeNeedLines,
} from "./request-needs"

function mapFormNeedLines(
  lines: NeedLineFormValue[]
): CreateHelpRequestNeedInput[] {
  return lines.map((line) => ({
    id: line.id,
    label: line.label.trim(),
    required: Number(line.required),
    unit: line.unit?.trim() || undefined,
    kind: line.kind as HelpRequestNeedKindValue,
    notes: line.notes?.trim() || undefined,
  }))
}

function mapRequestNeedsToFormLines(
  needs: HelpRequestNeedLine[]
): NeedLineFormValue[] {
  return needs.map((line) => ({
    id: line.id,
    label: line.label,
    required: String(line.required),
    unit: line.unit ?? "",
    notes: line.notes ?? "",
    kind: line.kind,
  }))
}

export function mapHelpRequestToFormValues(
  request: HelpRequest
): CreateHelpRequestFormValues {
  return {
    title: request.title,
    description: request.description,
    helpType: request.helpType,
    subCategory: request.subCategory,
    priorityLevel: request.priorityLevel,
    needLines: mapRequestNeedsToFormLines(request.needs),
    governorate: request.location.governorate,
    district: request.location.district,
    city: request.location.city,
    street: request.location.street ?? "",
    latitude: request.location.coordinates?.lat
      ? String(request.location.coordinates.lat)
      : "",
    longitude: request.location.coordinates?.lng
      ? String(request.location.coordinates.lng)
      : "",
    beneficiariesCount: request.beneficiariesCount
      ? String(request.beneficiariesCount)
      : "",
    proofImageUrls: request.media ?? [],
    ...splitContactPhone(request.contactPhone),
  }
}

export function applyEditInputToHelpRequest(
  existing: HelpRequest,
  input: CreateHelpRequestInput
): HelpRequest {
  const now = new Date().toISOString()

  const needs = normalizeNeedLines(
    input.needs.map((needInput) => {
      const previous = existing.needs.find((line) => line.id === needInput.id)
      const fulfilled = previous
        ? Math.min(previous.fulfilled, needInput.required)
        : 0

      return normalizeNeedLine({
        id: needInput.id ?? createNeedLineId(),
        label: needInput.label,
        required: needInput.required,
        fulfilled,
        unit: needInput.unit,
        kind: needInput.kind,
        notes: needInput.notes,
      })
    })
  )

  return {
    ...existing,
    title: input.title,
    description: input.description,
    helpType: input.helpType,
    subCategory: input.subCategory,
    priorityLevel: input.priorityLevel,
    needs,
    beneficiariesCount: input.beneficiariesCount,
    location: input.location,
    visibility: input.visibility,
    media: input.media,
    contactPhone: input.contactPhone,
    updatedAt: now,
    status: deriveStatusFromNeeds(needs, existing.status),
  }
}

export { applyNeedLineFulfillment as applyFulfillmentAdjustment } from "./request-needs"

export function mapFormToCreateInput(
  values: CreateHelpRequestFormValues
): CreateHelpRequestInput {
  const beneficiaries = !values.beneficiariesCount?.trim()
    ? undefined
    : Number(values.beneficiariesCount)

  const lat = values.latitude?.trim() ? Number(values.latitude) : undefined
  const lng = values.longitude?.trim() ? Number(values.longitude) : undefined

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    helpType: values.helpType as HelpTypeValue,
    subCategory: values.subCategory as SubCategoryValue,
    priorityLevel: values.priorityLevel as PriorityLevelValue,
    needs: mapFormNeedLines(values.needLines),
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
    contactPhone: formatContactPhone(values.phoneCode, values.phoneNumber),
  }
}

export function mapCreateInputToHelpRequest(
  input: CreateHelpRequestInput,
  createdBy: string
): HelpRequest {
  const now = new Date().toISOString()
  const needs = buildNeedsFromCreateInput(input.needs)

  return {
    _id: `hr_${crypto.randomUUID().slice(0, 8)}`,
    createdBy,
    title: input.title,
    description: input.description,
    helpType: input.helpType,
    subCategory: input.subCategory,
    priorityLevel: input.priorityLevel,
    needs,
    beneficiariesCount: input.beneficiariesCount,
    location: input.location,
    status: HelpRequestStatus.ACTIVE,
    visibility: input.visibility,
    media: input.media,
    contactPhone: input.contactPhone,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  }
}
