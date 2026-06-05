"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { HelpRequest } from "../types"

type HideHelpRequestDialogProps = {
  request: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (requestId: string) => void
}

export function HideHelpRequestDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
}: HideHelpRequestDialogProps) {
  if (!request) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hide request?</DialogTitle>
          <DialogDescription>
            &ldquo;{request.title}&rdquo; will be removed from the active list
            and moved to your archive. You can restore it later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm(request._id)
              onOpenChange(false)
            }}
          >
            Hide request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
