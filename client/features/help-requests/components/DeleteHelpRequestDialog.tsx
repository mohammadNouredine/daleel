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

type DeleteHelpRequestDialogProps = {
  request: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (requestId: string) => void
}

export function DeleteHelpRequestDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
}: DeleteHelpRequestDialogProps) {
  if (!request) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete request?</DialogTitle>
          <DialogDescription>
            This will permanently remove &ldquo;{request.title}&rdquo;. This
            action cannot be undone.
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
            variant="destructive"
            onClick={() => {
              onConfirm(request._id)
              onOpenChange(false)
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
