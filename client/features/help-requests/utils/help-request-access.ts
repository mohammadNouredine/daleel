import { hasRequestPermission } from "@/lib/permissions"
import type { DaleelProfile } from "@/features/users/types"
import {
  HelpRequestStatus,
  type HelpRequest,
  type HelpRequestStatusValue,
} from "../types"

const MANAGEABLE_STATUSES: HelpRequestStatusValue[] = [
  HelpRequestStatus.ACTIVE,
  HelpRequestStatus.PARTIALLY_FULFILLED,
]

const HIDEABLE_STATUSES: HelpRequestStatusValue[] = [
  HelpRequestStatus.ACTIVE,
  HelpRequestStatus.PARTIALLY_FULFILLED,
]

export function isHelpRequestOwner(
  request: HelpRequest,
  profile: DaleelProfile | undefined
): boolean {
  return Boolean(profile && request.createdBy === profile._id)
}

export function canEditHelpRequest(
  request: HelpRequest,
  profile: DaleelProfile | undefined
): boolean {
  if (!profile) return false
  if (isHelpRequestOwner(request, profile)) return true
  return hasRequestPermission(profile.permissions, "edit")
}

export function canDeleteHelpRequest(
  request: HelpRequest,
  profile: DaleelProfile | undefined
): boolean {
  if (!profile) return false
  if (isHelpRequestOwner(request, profile)) return true
  return hasRequestPermission(profile.permissions, "delete")
}

export function canManageHelpRequest(
  request: HelpRequest,
  profile: DaleelProfile | undefined
): boolean {
  if (!profile) return false
  if (!MANAGEABLE_STATUSES.includes(request.status)) return false
  if (isHelpRequestOwner(request, profile)) return true
  return hasRequestPermission(profile.permissions, "manage")
}

export function canHideHelpRequest(
  request: HelpRequest,
  profile: DaleelProfile | undefined
): boolean {
  if (!profile) return false
  if (!isHelpRequestOwner(request, profile)) return false
  return HIDEABLE_STATUSES.includes(request.status)
}

export function canRestoreHelpRequest(
  request: HelpRequest,
  profile: DaleelProfile | undefined
): boolean {
  if (!profile) return false
  if (!isHelpRequestOwner(request, profile)) return false
  return request.status === HelpRequestStatus.CANCELLED
}
