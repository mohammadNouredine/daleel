"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { PropertyListing } from "../types"

type RejectPropertyListingDialogProps = {
  listing: PropertyListing | null
  open: boolean
  reason: string
  isPending?: boolean
  onReasonChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function RejectPropertyListingDialog({
  listing,
  open,
  reason,
  isPending = false,
  onReasonChange,
  onOpenChange,
  onSubmit,
}: RejectPropertyListingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject listing</DialogTitle>
        </DialogHeader>
        {listing ? (
          <p className="text-sm text-muted-foreground">{listing.title}</p>
        ) : null}
        <Textarea
          className="min-h-24"
          placeholder="Reason shown to the owner (required)"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onSubmit}
            disabled={isPending || !reason.trim()}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
