"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { HelpRequestCard } from "@/features/help-requests/components/HelpRequestCard"
import {
  useApproveHelpRequest,
  usePendingHelpRequests,
  useRejectHelpRequest,
} from "@/features/help-requests/hooks/use-moderate-help-request"
import type { HelpRequest } from "@/features/help-requests/types"
import { canModerateHelpRequests } from "@/lib/access-control"
import { useDashboardAuth } from "../../providers/DashboardAuthProvider"
import { DashboardPageHeader } from "../../components/DashboardPageHeader"

export function HelpRequestsPendingPage() {
  const { profile } = useDashboardAuth()
  const canModerate = canModerateHelpRequests(profile)
  const { data: pending = [], isLoading } = usePendingHelpRequests(canModerate)
  const approveMutation = useApproveHelpRequest()
  const rejectMutation = useRejectHelpRequest()
  const [rejectingRequest, setRejectingRequest] = useState<HelpRequest | null>(
    null
  )
  const [rejectReason, setRejectReason] = useState("")

  const handleReject = () => {
    if (!rejectingRequest) return
    rejectMutation.mutate(
      { id: rejectingRequest._id, reason: rejectReason.trim() || undefined },
      {
        onSuccess: () => {
          setRejectingRequest(null)
          setRejectReason("")
        },
      }
    )
  }

  if (!canModerate) {
    return (
      <>
        <DashboardPageHeader
          title="Pending approval"
          description="You need verify permission to access this queue."
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
        title="Pending approval"
        description="Review submissions from users without direct publishing permission."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading pending requests…</p>
      ) : pending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-muted-foreground">
          No requests waiting for approval.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pending.map((request) => (
            <li key={request._id} className="space-y-3">
              <HelpRequestCard
                request={request}
                showApprovalStatus
                variant="active"
              />
              <div className="flex flex-wrap gap-2 px-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => approveMutation.mutate(request._id)}
                  disabled={approveMutation.isPending}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectingRequest(request)}
                  disabled={rejectMutation.isPending}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(rejectingRequest)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingRequest(null)
            setRejectReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
          </DialogHeader>
          {rejectingRequest ? (
            <p className="text-sm text-muted-foreground">
              {rejectingRequest.title}
            </p>
          ) : null}
          <Textarea
            className="min-h-24"
            placeholder="Optional reason for the submitter"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectingRequest(null)
                setRejectReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
