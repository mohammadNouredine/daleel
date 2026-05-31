"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { useCurrentProfile } from "@/features/users/hooks/use-current-profile"
import {
  useApproveHelpRequest,
  usePendingHelpRequests,
  useRejectHelpRequest,
} from "@/features/help-requests/hooks/use-moderate-help-request"
import { HelpRequestCard } from "@/features/help-requests/components/help-request-card"
import type { HelpRequest } from "@/features/help-requests/types"

export function AdminHelpRequestsView() {
  const router = useRouter()
  const { data: profile, isLoading: isProfileLoading } = useCurrentProfile()
  const { data: pending = [], isLoading } = usePendingHelpRequests(
    profile?.role === "ADMIN"
  )
  const approveMutation = useApproveHelpRequest()
  const rejectMutation = useRejectHelpRequest()
  const [rejectingRequest, setRejectingRequest] = useState<HelpRequest | null>(
    null
  )
  const [rejectReason, setRejectReason] = useState("")

  if (!isProfileLoading && profile?.role !== "ADMIN") {
    router.replace("/help-requests")
    return null
  }

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

  return (
    <PageShell
      size="wide"
      title="Moderate help requests"
      description="Review submissions from users without direct publishing permission."
    >
      {isLoading || isProfileLoading ? (
        <p className="text-sm text-muted-foreground">Loading pending requests…</p>
      ) : pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-muted-foreground">
          No requests waiting for approval.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      {rejectingRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-popover p-5 shadow-lg ring-1 ring-foreground/10">
            <h2 className="text-base font-medium">Reject request</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {rejectingRequest.title}
            </p>
            <textarea
              className="mt-4 min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Optional reason for the submitter"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
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
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
