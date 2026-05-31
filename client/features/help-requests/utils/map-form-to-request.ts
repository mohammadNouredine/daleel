import {
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
import { isFilledNeedLine } from "../schemas/need-line.schema"
import { buildLocationFromFormFields } from "./help-request-location"
import {
  splitContactPhone,
  formatContactPhone,
} from "@/components/forms/Phone/phone-utils"

function mapFormNeedLines(
  lines: NeedLineFormValue[]
): CreateHelpRequestNeedInput[] {
  return lines.filter(isFilledNeedLine).map((line) => ({
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
  const phone = splitContactPhone(request.contactPhone)

  return {
    title: request.title,
    description: request.description,
    helpType: request.helpType,
    subCategory: request.subCategory,
    priorityLevel: request.priorityLevel,
    needLines: mapRequestNeedsToFormLines(request.needs),
    governorate: request.location?.governorate ?? "",
    district: request.location?.district ?? "",
    city: request.location?.city ?? "",
    street: request.location?.street ?? "",
    latitude: request.location?.coordinates?.lat
      ? String(request.location.coordinates.lat)
      : "",
    longitude: request.location?.coordinates?.lng
      ? String(request.location.coordinates.lng)
      : "",
    beneficiariesCount: request.beneficiariesCount
      ? String(request.beneficiariesCount)
      : "",
    proofImageUrls: request.media ?? [],
    proofImageFiles: [],
    phoneCode: phone.phoneCode,
    phoneNumber: phone.phoneNumber,
  }
}

export function mapFormToCreateInput(
  values: CreateHelpRequestFormValues
): CreateHelpRequestInput {
  const beneficiaries = !values.beneficiariesCount?.trim()
    ? undefined
    : Number(values.beneficiariesCount)

  const location = buildLocationFromFormFields(values)

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    helpType: values.helpType as HelpTypeValue,
    subCategory: values.subCategory as SubCategoryValue,
    priorityLevel: values.priorityLevel as PriorityLevelValue,
    needs: mapFormNeedLines(values.needLines),
    beneficiariesCount: beneficiaries,
    location,
    visibility: Visibility.PUBLIC,
    contactPhone: formatContactPhone(values.phoneCode, values.phoneNumber),
  }
}
