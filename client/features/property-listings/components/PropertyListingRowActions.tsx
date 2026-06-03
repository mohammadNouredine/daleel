"use client"

import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DaleelProfile } from "@/features/users/types"
import { usePropertyListingActions } from "../actions/use-property-listing-actions"
import type { PropertyListing } from "../types"
import { RejectPropertyListingDialog } from "./RejectPropertyListingDialog"

type PropertyListingRowActionsProps = {
  listing: PropertyListing
  profile: DaleelProfile | null | undefined
  onEdit?: (listing: PropertyListing) => void
}

export function PropertyListingRowActions({
  listing,
  profile,
  onEdit,
}: PropertyListingRowActionsProps) {
  const {
    getAvailableActions,
    runAction,
    isPending,
    rejectingListing,
    rejectReason,
    setRejectReason,
    submitReject,
    rejectDialogOpen,
    closeRejectDialog,
  } = usePropertyListingActions({ profile, onEdit })

  const actions = getAvailableActions(listing)

  if (actions.length === 0) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Row actions"
              disabled={isPending}
              onClick={(event) => event.stopPropagation()}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => void runAction(action.id, listing)}
            >
              <action.icon className="size-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <RejectPropertyListingDialog
        listing={rejectingListing}
        open={rejectDialogOpen}
        reason={rejectReason}
        isPending={isPending}
        onReasonChange={setRejectReason}
        onOpenChange={(open) => {
          if (!open) closeRejectDialog()
        }}
        onSubmit={submitReject}
      />
    </>
  )
}
