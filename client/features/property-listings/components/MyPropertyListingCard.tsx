"use client"

import Link from "next/link"
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { useDeletePropertyListing } from "../hooks/use-delete-property-listing"
import { usePermanentDeletePropertyListing } from "../hooks/use-permanent-delete-property-listing"
import { useHidePropertyListing } from "../hooks/use-hide-property-listing"
import { useUnhidePropertyListing } from "../hooks/use-unhide-property-listing"
import { PropertyListingStatus, type PropertyListing } from "../types"
import {
  formatListingLocation,
  formatListingPriceLabel,
} from "../utils/property-listing-display"
import {
  formatPropertyListingStatus,
  propertyListingStatusBadgeClass,
} from "../utils/property-listing-status"
import { PropertyListingCover } from "./PropertyListingCover"

type MyPropertyListingCardProps = {
  listing: PropertyListing
  onEdit: (listing: PropertyListing) => void
}

export function MyPropertyListingCard({
  listing,
  onEdit,
}: MyPropertyListingCardProps) {
  const { confirmAsync } = useConfirmDialog()
  const hideMutation = useHidePropertyListing()
  const unhideMutation = useUnhidePropertyListing()
  const deleteMutation = useDeletePropertyListing()
  const permanentDeleteMutation = usePermanentDeletePropertyListing()

  const isHidden = listing.status === PropertyListingStatus.ARCHIVED
  const isDeleted = listing.status === PropertyListingStatus.DELETED
  const isPending = hideMutation.isPending || unhideMutation.isPending
  const isDeleting =
    deleteMutation.isPending || permanentDeleteMutation.isPending
  const isBusy = isPending || isDeleting

  const handleSoftDelete = async () => {
    const confirmed = await confirmAsync({
      title: "Delete this listing?",
      description:
        "The listing is soft-deleted. You can permanently remove it later from your deleted listings.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    })
    if (!confirmed) return
    deleteMutation.mutate(listing._id)
  }

  const handlePermanentDelete = async () => {
    const confirmed = await confirmAsync({
      title: "Permanently delete this listing?",
      description:
        "This cannot be undone. All images and data will be removed from the platform.",
      confirmText: "Delete permanently",
      cancelText: "Cancel",
      variant: "danger",
    })
    if (!confirmed) return
    permanentDeleteMutation.mutate(listing._id)
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Link
        href={`/properties/${listing._id}`}
        className="group relative block"
      >
        <PropertyListingCover
          listing={listing}
          className="aspect-[4/3] w-full"
        />
        <Badge
          className={cn(
            "absolute left-3 top-3 border-0 shadow-sm",
            propertyListingStatusBadgeClass(listing.status)
          )}
        >
          {formatPropertyListingStatus(listing.status)}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/properties/${listing._id}`} className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-semibold leading-snug hover:underline">
              {listing.title}
            </h3>
          </Link>
          {!isHidden && !isDeleted ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1 px-2"
              disabled={isBusy}
              onClick={() => onEdit(listing)}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          ) : null}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatListingLocation(listing)}
        </p>
        <p className="mt-2 text-sm font-medium text-primary">
          {formatListingPriceLabel(listing)}
        </p>

        {isHidden ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Hidden from public browse. Restore visibility when you are ready.
          </p>
        ) : null}

        {isDeleted ? (
          <p className="mt-2 text-xs text-muted-foreground">
            This listing is deleted. Permanently remove it to clear it from your
            account.
          </p>
        ) : null}

        {listing.rejectionReason ? (
          <p className="mt-2 text-xs text-destructive">
            {listing.rejectionReason}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {!isDeleted ? (
            <>
              {isHidden ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1"
                  disabled={isBusy}
                  onClick={() => unhideMutation.mutate(listing._id)}
                >
                  <Eye className="size-3.5" />
                  Show listing
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1"
                  disabled={isBusy}
                  onClick={() => hideMutation.mutate(listing._id)}
                >
                  <EyeOff className="size-3.5" />
                  Hide
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-destructive hover:text-destructive"
                disabled={isBusy}
                onClick={() => void handleSoftDelete()}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-destructive hover:text-destructive"
                disabled={isBusy}
                onClick={() => void handlePermanentDelete()}
              >
                <Trash2 className="size-3.5" />
                Delete permanently
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 gap-1"
              disabled={isBusy}
              onClick={() => void handlePermanentDelete()}
            >
              <Trash2 className="size-3.5" />
              Delete permanently
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
