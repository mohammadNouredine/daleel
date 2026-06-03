import type { DaleelProfile } from "@/features/users/types"
import {
  canApproveProperty,
  canDeleteProperty,
  canEditProperty,
  canHideProperty,
  canRejectProperty,
  canViewProperties,
} from "@/lib/permissions"

export function canViewPropertiesFromProfile(
  profile: DaleelProfile | null | undefined
): boolean {
  return canViewProperties(profile?.permissions)
}

export function canEditPropertyFromProfile(
  profile: DaleelProfile | null | undefined
): boolean {
  return canEditProperty(profile?.permissions)
}

export function canDeletePropertyFromProfile(
  profile: DaleelProfile | null | undefined
): boolean {
  return canDeleteProperty(profile?.permissions)
}

export function canHidePropertyFromProfile(
  profile: DaleelProfile | null | undefined
): boolean {
  return canHideProperty(profile?.permissions)
}

export function canApprovePropertyFromProfile(
  profile: DaleelProfile | null | undefined
): boolean {
  return canApproveProperty(profile?.permissions)
}

export function canRejectPropertyFromProfile(
  profile: DaleelProfile | null | undefined
): boolean {
  return canRejectProperty(profile?.permissions)
}
