import {
  HelpRequestStatus,
  HelpType,
  PriorityLevel,
  SubCategory,
  Visibility,
  HelpRequestNeedKind,
  type HelpRequest,
  type HelpRequestNeedLine,
} from "./types"
import { createNeedLineId } from "./utils/request-needs"

function need(
  partial: Omit<HelpRequestNeedLine, "id" | "fulfilled"> & {
    fulfilled?: number
  }
): HelpRequestNeedLine {
  const required = partial.required
  const fulfilled = partial.fulfilled ?? 0
  return {
    id: createNeedLineId(),
    label: partial.label,
    required,
    fulfilled: Math.min(fulfilled, required),
    unit: partial.unit,
    kind: partial.kind,
    notes: partial.notes,
  }
}

export const MOCK_HELP_REQUESTS: HelpRequest[] = [
  {
    _id: "hr_001",
    createdBy: "mock_user_1",
    title: "Medical medication request",
    description:
      "Family needs ongoing medication after displacement. Sizes and brands noted per line.",
    helpType: HelpType.MEDICAL,
    subCategory: SubCategory.MEDICINE,
    priorityLevel: PriorityLevel.HIGH,
    needs: [
      need({
        label: "insulin boxes",
        required: 3,
        fulfilled: 1,
        unit: "boxes",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({
        label: "asthma inhalers",
        required: 2,
        fulfilled: 0,
        unit: "inhalers",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({
        label: "blood pressure monitor",
        required: 1,
        fulfilled: 0,
        unit: "device",
        kind: HelpRequestNeedKind.ITEM,
      }),
    ],
    beneficiariesCount: 4,
    location: {
      governorate: "Mount Lebanon",
      district: "Baabda",
      city: "Hazmieh",
    },
    status: HelpRequestStatus.PARTIALLY_FULFILLED,
    visibility: Visibility.PUBLIC,
    isVerified: true,
    contactPhone: "+96170123456",
    createdAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-05-22T14:30:00.000Z",
  },
  {
    _id: "hr_002",
    createdBy: "user_2",
    title: "Medical surgery fund",
    description:
      "Independent financial goals for surgery and post-op medication.",
    helpType: HelpType.FINANCIAL,
    subCategory: SubCategory.SURGERY,
    priorityLevel: PriorityLevel.CRITICAL,
    needs: [
      need({
        label: "surgery cost",
        required: 4500,
        fulfilled: 2000,
        unit: "USD",
        kind: HelpRequestNeedKind.FINANCIAL,
      }),
      need({
        label: "medication afterward",
        required: 700,
        fulfilled: 0,
        unit: "USD",
        kind: HelpRequestNeedKind.FINANCIAL,
      }),
    ],
    beneficiariesCount: 1,
    location: {
      governorate: "Beirut",
      district: "Beirut",
      city: "Achrafieh",
    },
    status: HelpRequestStatus.PARTIALLY_FULFILLED,
    visibility: Visibility.PUBLIC,
    isVerified: false,
    createdAt: "2026-05-21T08:15:00.000Z",
    updatedAt: "2026-05-21T08:15:00.000Z",
  },
  {
    _id: "hr_003",
    createdBy: "user_3",
    title: "Hospital transportation",
    description:
      "Service-based need: rides to Beirut hospital and return this month.",
    helpType: HelpType.TRANSPORT,
    subCategory: SubCategory.HOSPITAL,
    priorityLevel: PriorityLevel.HIGH,
    needs: [
      need({
        label: "rides to hospital",
        required: 12,
        fulfilled: 5,
        unit: "rides",
        kind: HelpRequestNeedKind.SERVICE,
        notes: "Tripoli ↔ Beirut",
      }),
    ],
    beneficiariesCount: 1,
    location: {
      governorate: "North",
      district: "Tripoli",
      city: "Tripoli",
    },
    status: HelpRequestStatus.PARTIALLY_FULFILLED,
    visibility: Visibility.PUBLIC,
    isVerified: true,
    createdAt: "2026-05-18T16:45:00.000Z",
    updatedAt: "2026-05-19T11:00:00.000Z",
  },
  {
    _id: "hr_004",
    createdBy: "user_4",
    title: "Food assistance for one month",
    description:
      "Mixed weight and count units for one-month household support.",
    helpType: HelpType.MATERIAL,
    subCategory: SubCategory.FOOD,
    priorityLevel: PriorityLevel.MEDIUM,
    needs: [
      need({ label: "rice", required: 25, fulfilled: 10, unit: "kg", kind: HelpRequestNeedKind.ITEM }),
      need({
        label: "cooking oil",
        required: 10,
        fulfilled: 4,
        unit: "bottles",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({
        label: "canned food packs",
        required: 15,
        fulfilled: 0,
        unit: "packs",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({
        label: "milk powder",
        required: 8,
        fulfilled: 0,
        unit: "boxes",
        kind: HelpRequestNeedKind.ITEM,
      }),
    ],
    beneficiariesCount: 6,
    location: {
      governorate: "Bekaa",
      district: "Zahle",
      city: "Chtaura",
    },
    status: HelpRequestStatus.PARTIALLY_FULFILLED,
    visibility: Visibility.PUBLIC,
    isVerified: true,
    createdAt: "2026-05-19T09:00:00.000Z",
    updatedAt: "2026-05-23T07:20:00.000Z",
  },
  {
    _id: "hr_005",
    createdBy: "user_5",
    title: "School supplies for children",
    description:
      "Notebooks partially donated; uploader can adjust remaining lines manually.",
    helpType: HelpType.MATERIAL,
    subCategory: SubCategory.FOOD,
    priorityLevel: PriorityLevel.MEDIUM,
    needs: [
      need({ label: "school bags", required: 4, fulfilled: 4, unit: "bags", kind: HelpRequestNeedKind.ITEM }),
      need({
        label: "notebooks",
        required: 20,
        fulfilled: 20,
        unit: "notebooks",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({
        label: "calculator sets",
        required: 4,
        fulfilled: 4,
        unit: "sets",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({
        label: "uniforms",
        required: 4,
        fulfilled: 4,
        unit: "sets",
        kind: HelpRequestNeedKind.ITEM,
        notes: "Sizes 8–12",
      }),
    ],
    beneficiariesCount: 4,
    location: {
      governorate: "South",
      district: "Saida",
      city: "Saida",
    },
    status: HelpRequestStatus.FULFILLED,
    visibility: Visibility.PUBLIC,
    isVerified: true,
    createdAt: "2026-04-10T12:00:00.000Z",
    updatedAt: "2026-05-01T18:00:00.000Z",
  },
  {
    _id: "hr_006",
    createdBy: "user_6",
    title: "Emergency home repair",
    description:
      "Materials plus one electrician visit — mixed item and service lines.",
    helpType: HelpType.SHELTER,
    subCategory: SubCategory.RENT,
    priorityLevel: PriorityLevel.HIGH,
    needs: [
      need({
        label: "cement bags",
        required: 15,
        fulfilled: 0,
        unit: "bags",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({ label: "doors", required: 2, fulfilled: 0, unit: "doors", kind: HelpRequestNeedKind.ITEM }),
      need({
        label: "windows",
        required: 4,
        fulfilled: 0,
        unit: "windows",
        kind: HelpRequestNeedKind.ITEM,
      }),
      need({
        label: "electrician visit",
        required: 1,
        fulfilled: 0,
        unit: "visit",
        kind: HelpRequestNeedKind.SERVICE,
      }),
    ],
    location: {
      governorate: "Beirut",
      district: "Beirut",
      city: "Hamra",
    },
    status: HelpRequestStatus.EXPIRED,
    visibility: Visibility.PUBLIC,
    isVerified: false,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
]
