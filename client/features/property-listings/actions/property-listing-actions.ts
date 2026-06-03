import type { LucideIcon } from "lucide-react"
import {
  Check,
  EyeOff,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import type { PropertyPermissionKey } from "@/features/users/types"
import type { UserPermissions } from "@/features/users/types"
import { hasPropertyPermission } from "@/lib/permissions"
import {
  PropertyListingStatus,
  type PropertyListing,
} from "../types"
import type { PropertyListingActionId } from "./property-listing-action-ids"
import type { ConfirmDialogVariant } from "@/components/dialogs/ConfirmDialog"

export type PropertyListingActionDefinition = {
  id: PropertyListingActionId
  label: string
  icon: LucideIcon
  permission: PropertyPermissionKey
  confirm?: {
    title: string
    description: string
    confirmText?: string
    variant?: ConfirmDialogVariant
  }
}

export const PROPERTY_LISTING_ACTIONS: PropertyListingActionDefinition[] = [
  {
    id: "edit",
    label: "Edit",
    icon: Pencil,
    permission: "canEditProperty",
  },
  {
    id: "approve",
    label: "Approve",
    icon: Check,
    permission: "canApproveProperty",
    confirm: {
      title: "Approve this listing?",
      description: "It will be published on the public property feed.",
      confirmText: "Approve",
      variant: "info",
    },
  },
  {
    id: "reject",
    label: "Reject",
    icon: X,
    permission: "canRejectProperty",
  },
  {
    id: "hide",
    label: "Hide",
    icon: EyeOff,
    permission: "canHideProperty",
    confirm: {
      title: "Hide this listing?",
      description: "It will be removed from the public browse feed.",
      confirmText: "Hide",
      variant: "warning",
    },
  },
  {
    id: "unhide",
    label: "Show listing",
    icon: Eye,
    permission: "canHideProperty",
    confirm: {
      title: "Restore this listing?",
      description: "It will become visible again according to its status.",
      confirmText: "Show",
      variant: "info",
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    permission: "canDeleteProperty",
    confirm: {
      title: "Delete this listing?",
      description:
        "This soft-deletes the listing. Owners lose access; admins can still review it.",
      confirmText: "Delete",
      variant: "danger",
    },
  },
]

function isActionVisibleForListing(
  actionId: PropertyListingActionId,
  listing: PropertyListing
): boolean {
  switch (actionId) {
    case "approve":
    case "reject":
      return listing.status === PropertyListingStatus.PENDING_APPROVAL
    case "hide":
      return (
        listing.status !== PropertyListingStatus.ARCHIVED &&
        listing.status !== PropertyListingStatus.DELETED
      )
    case "unhide":
      return listing.status === PropertyListingStatus.ARCHIVED
    case "delete":
      return listing.status !== PropertyListingStatus.DELETED
    case "edit":
      return listing.status !== PropertyListingStatus.DELETED
    default:
      return true
  }
}

export function getAvailablePropertyListingActions(
  listing: PropertyListing,
  permissions: UserPermissions | undefined,
  viewerId?: string
): PropertyListingActionDefinition[] {
  const isOwner = viewerId ? listing.ownerId === viewerId : false

  return PROPERTY_LISTING_ACTIONS.filter((action) => {
    if (!isActionVisibleForListing(action.id, listing)) {
      return false
    }

    if (
      isOwner &&
      (action.id === "hide" ||
        action.id === "unhide" ||
        action.id === "delete" ||
        action.id === "edit")
    ) {
      return true
    }

    return hasPropertyPermission(permissions, action.permission)
  })
}
