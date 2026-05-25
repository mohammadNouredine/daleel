import {
  canManageHelpRequests,
  hasRequestPermission,
} from "@/lib/permissions"
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

export function canManageHelpRequest(
  request: HelpRequest,
  profile: DaleelProfile | undefined
): boolean {
  if (!profile || !canManageHelpRequests(profile.permissions)) {
    return false
  }
  if (!MANAGEABLE_STATUSES.includes(request.status)) {
    return false
  }
  const isOwner = request.createdBy === profile._id
  const isAdmin = profile.role === "ADMIN"
  return isOwner || isAdmin
}

export function canEditHelpRequest(
  profile: DaleelProfile | undefined
): boolean {
  return hasRequestPermission(profile?.permissions, "edit")
}

export function canDeleteHelpRequest(
  profile: DaleelProfile | undefined
): boolean {
  return hasRequestPermission(profile?.permissions, "delete")
}
