import {
  HelpRequestStatus,
  HelpType,
  Visibility,
  type CreateHelpRequestInput,
  type HelpRequest,
  type HelpTypeValue,
  type PriorityLevelValue,
  type SubCategoryValue,
} from "../types";
import type { CreateHelpRequestFormValues } from "../schemas/create-help-request.schema";
import {
  splitContactPhone,
  formatContactPhone,
} from "@/components/forms/Phone/phone-utils";

export function mapHelpRequestToFormValues(
  request: HelpRequest,
): CreateHelpRequestFormValues {
  const isFinancial = request.helpType === HelpType.FINANCIAL;
  const amount = isFinancial
    ? (request.financialDetails?.requiredAmount ?? request.quantity.required)
    : request.quantity.required;

  return {
    title: request.title,
    description: request.description,
    helpType: request.helpType,
    subCategory: request.subCategory,
    priorityLevel: request.priorityLevel,
    quantityRequired: String(amount),
    quantityUnit: isFinancial
      ? (request.financialDetails?.currency ?? request.quantity.unit ?? "USD")
      : (request.quantity.unit ?? ""),
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
  };
}

export function applyEditInputToHelpRequest(
  existing: HelpRequest,
  input: CreateHelpRequestInput,
): HelpRequest {
  const now = new Date().toISOString();
  const required = input.quantity.required;
  const fulfilled = Math.min(existing.quantity.fulfilled, required);
  const remaining = Math.max(0, required - fulfilled);

  let status = existing.status;
  if (
    existing.status === HelpRequestStatus.ACTIVE ||
    existing.status === HelpRequestStatus.PARTIALLY_FULFILLED ||
    existing.status === HelpRequestStatus.FULFILLED
  ) {
    if (fulfilled >= required) {
      status = HelpRequestStatus.FULFILLED;
    } else if (fulfilled > 0) {
      status = HelpRequestStatus.PARTIALLY_FULFILLED;
    } else {
      status = HelpRequestStatus.ACTIVE;
    }
  }

  return {
    ...existing,
    title: input.title,
    description: input.description,
    helpType: input.helpType,
    subCategory: input.subCategory,
    priorityLevel: input.priorityLevel,
    quantity: {
      required,
      fulfilled,
      remaining,
      unit: input.quantity.unit,
    },
    financialDetails: input.financialDetails
      ? {
          ...input.financialDetails,
          collectedAmount: input.financialDetails.collectedAmount ?? fulfilled,
        }
      : undefined,
    beneficiariesCount: input.beneficiariesCount,
    location: input.location,
    visibility: input.visibility,
    media: input.media,
    contactPhone: input.contactPhone,
    updatedAt: now,
    status,
  };
}

export function applyFulfillmentAdjustment(
  request: HelpRequest,
  delta: number,
): HelpRequest {
  const required = request.quantity.required;
  const fulfilled = Math.max(
    0,
    Math.min(required, request.quantity.fulfilled + delta),
  );
  const remaining = Math.max(0, required - fulfilled);
  const now = new Date().toISOString();

  let status = request.status;
  if (fulfilled >= required) {
    status = HelpRequestStatus.FULFILLED;
  } else if (fulfilled > 0) {
    status = HelpRequestStatus.PARTIALLY_FULFILLED;
  } else {
    status = HelpRequestStatus.ACTIVE;
  }

  return {
    ...request,
    quantity: {
      ...request.quantity,
      required,
      fulfilled,
      remaining,
    },
    financialDetails: request.financialDetails
      ? {
          ...request.financialDetails,
          collectedAmount: fulfilled,
        }
      : undefined,
    status,
    updatedAt: now,
  };
}

export function mapFormToCreateInput(
  values: CreateHelpRequestFormValues,
): CreateHelpRequestInput {
  const beneficiaries = !values.beneficiariesCount?.trim()
    ? undefined
    : Number(values.beneficiariesCount);

  const isFinancial = values.helpType === HelpType.FINANCIAL;
  const amount = Number(values.quantityRequired);
  const currency = values.quantityUnit?.trim();

  const lat = values.latitude?.trim() ? Number(values.latitude) : undefined;
  const lng = values.longitude?.trim() ? Number(values.longitude) : undefined;

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
    contactPhone: formatContactPhone(values.phoneCode, values.phoneNumber),
  };
}

export function mapCreateInputToHelpRequest(
  input: CreateHelpRequestInput,
  createdBy: string,
): HelpRequest {
  const now = new Date().toISOString();
  const required = input.quantity.required;

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
    contactPhone: input.contactPhone,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  };
}
