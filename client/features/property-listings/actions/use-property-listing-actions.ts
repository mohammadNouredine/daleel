"use client"

import { useCallback, useState } from "react"
import { useConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import type { DaleelProfile } from "@/features/users/types"
import { useApprovePropertyListing, useRejectPropertyListing } from "../hooks/use-moderate-property-listing"
import { useDeletePropertyListing } from "../hooks/use-delete-property-listing"
import { usePermanentDeletePropertyListing } from "../hooks/use-permanent-delete-property-listing"
import { useHidePropertyListing } from "../hooks/use-hide-property-listing"
import { useUnhidePropertyListing } from "../hooks/use-unhide-property-listing"
import type { PropertyListing } from "../types"
import {
  getAvailablePropertyListingActions,
  PROPERTY_LISTING_ACTIONS,
} from "./property-listing-actions"
import type { PropertyListingActionId } from "./property-listing-action-ids"

type UsePropertyListingActionsOptions = {
  profile: DaleelProfile | null | undefined
  onEdit?: (listing: PropertyListing) => void
}

export function usePropertyListingActions({
  profile,
  onEdit,
}: UsePropertyListingActionsOptions) {
  const { confirmAsync } = useConfirmDialog()
  const approveMutation = useApprovePropertyListing()
  const rejectMutation = useRejectPropertyListing()
  const hideMutation = useHidePropertyListing()
  const unhideMutation = useUnhidePropertyListing()
  const deleteMutation = useDeletePropertyListing()
  const permanentDeleteMutation = usePermanentDeletePropertyListing()

  const [rejectingListing, setRejectingListing] = useState<PropertyListing | null>(
    null
  )
  const [rejectReason, setRejectReason] = useState("")

  const getAvailableActions = useCallback(
    (listing: PropertyListing) =>
      getAvailablePropertyListingActions(
        listing,
        profile?.permissions,
        profile?._id
      ),
    [profile?._id, profile?.permissions]
  )

  const runAction = useCallback(
    async (actionId: PropertyListingActionId, listing: PropertyListing) => {
      if (actionId === "edit") {
        onEdit?.(listing)
        return
      }

      if (actionId === "reject") {
        setRejectingListing(listing)
        setRejectReason("")
        return
      }

      const definition = PROPERTY_LISTING_ACTIONS.find(
        (action) => action.id === actionId
      )
      if (!definition) return

      if (definition.confirm) {
        const confirmed = await confirmAsync(definition.confirm)
        if (!confirmed) return
      }

      switch (actionId) {
        case "approve":
          approveMutation.mutate(listing._id)
          break
        case "hide":
          hideMutation.mutate(listing._id)
          break
        case "unhide":
          unhideMutation.mutate(listing._id)
          break
        case "delete":
          deleteMutation.mutate(listing._id)
          break
        case "permanentDelete":
          permanentDeleteMutation.mutate(listing._id)
          break
        default:
          break
      }
    },
    [
      approveMutation,
      confirmAsync,
      deleteMutation,
      permanentDeleteMutation,
      hideMutation,
      onEdit,
      unhideMutation,
    ]
  )

  const submitReject = useCallback(() => {
    if (!rejectingListing) return
    const reason = rejectReason.trim()
    if (!reason) return
    rejectMutation.mutate(
      { id: rejectingListing._id, rejectionReason: reason },
      {
        onSuccess: () => {
          setRejectingListing(null)
          setRejectReason("")
        },
      }
    )
  }, [rejectMutation, rejectReason, rejectingListing])

  const isPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    hideMutation.isPending ||
    unhideMutation.isPending ||
    deleteMutation.isPending ||
    permanentDeleteMutation.isPending

  return {
    getAvailableActions,
    runAction,
    isPending,
    rejectingListing,
    rejectReason,
    setRejectReason,
    setRejectingListing,
    submitReject,
    rejectDialogOpen: Boolean(rejectingListing),
    closeRejectDialog: () => {
      setRejectingListing(null)
      setRejectReason("")
    },
  }
}
