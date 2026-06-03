"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { PropertyListingCard } from "@/features/property-listings/components/PropertyListingCard"
import { RejectPropertyListingDialog } from "@/features/property-listings/components/RejectPropertyListingDialog"
import {
  useApprovePropertyListing,
  useRejectPropertyListing,
} from "@/features/property-listings/hooks/use-moderate-property-listing"
import { usePendingPropertyListings } from "@/features/property-listings/hooks/use-pending-property-listings"
import type { PropertyListing } from "@/features/property-listings/types"
import { useDashboardAuth } from "../../providers/DashboardAuthProvider"
import { DashboardPageHeader } from "../../components/DashboardPageHeader"

export function PropertyApprovalsPage() {
  const { isAdmin } = useDashboardAuth()
  const { data: pending = [], isLoading } = usePendingPropertyListings(isAdmin)
  const approveMutation = useApprovePropertyListing()
  const rejectMutation = useRejectPropertyListing()
  const [rejectingListing, setRejectingListing] =
    useState<PropertyListing | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const handleReject = () => {
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
  }

  if (!isAdmin) {
    return (
      <>
        <DashboardPageHeader
          title="Approvals"
          description="Property moderation is limited to administrators."
        />
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
          You do not have access to this queue.
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardPageHeader
        title="Approvals"
        description="Review property listings submitted for publication."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading pending listings…</p>
      ) : pending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-muted-foreground">
          No listings waiting for approval.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pending.map((listing, index) => (
            <li key={listing._id} className="space-y-3">
              <PropertyListingCard listing={listing} index={index} />
              <div className="flex flex-wrap gap-2 px-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => approveMutation.mutate(listing._id)}
                  disabled={approveMutation.isPending}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectingListing(listing)}
                  disabled={rejectMutation.isPending}
                >
                  Reject
                </Button>
                <Link
                  href={`/properties/${listing._id}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RejectPropertyListingDialog
        listing={rejectingListing}
        open={Boolean(rejectingListing)}
        reason={rejectReason}
        isPending={rejectMutation.isPending}
        onReasonChange={setRejectReason}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingListing(null)
            setRejectReason("")
          }
        }}
        onSubmit={handleReject}
      />
    </>
  )
}
