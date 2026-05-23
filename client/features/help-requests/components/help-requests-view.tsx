"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { canWriteHelpRequests } from "@/lib/permissions"
import { useCurrentProfile } from "@/features/users/hooks/use-current-profile"
import { MOCK_HELP_REQUESTS } from "../mock-data"
import type { CreateHelpRequestInput, HelpRequest } from "../types"
import {
  mapCreateInputToHelpRequest,
} from "../utils/map-form-to-request"
import { CreateHelpRequestDialog } from "./create-help-request-dialog"
import { HelpRequestCard } from "./help-request-card"

export function HelpRequestsView() {
  const [requests, setRequests] = useState<HelpRequest[]>(MOCK_HELP_REQUESTS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: profile, isLoading: isProfileLoading } = useCurrentProfile()

  const canWrite = canWriteHelpRequests(profile?.permissions)

  const handleCreate = (input: CreateHelpRequestInput) => {
    const createdBy = profile?._id ?? "anonymous"
    const newRequest = mapCreateInputToHelpRequest(input, createdBy)
    setRequests((prev) => [newRequest, ...prev])
    setDialogOpen(false)
  }

  return (
    <PageShell
      size="wide"
      title="Help Requests"
      description="Browse and manage humanitarian help requests across Lebanon."
      headerAction={
        !isProfileLoading && canWrite ? (
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-full shadow-sm"
            onClick={() => setDialogOpen(true)}
            aria-label="Add help request"
          >
            <Plus className="size-5" />
          </Button>
        ) : undefined
      }
    >
      {requests.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-16 text-center">
          <p className="text-muted-foreground">No help requests yet.</p>
          {canWrite ? (
            <Button
              type="button"
              className="mt-4"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4" />
              Add first request
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-4">
          {requests.map((request) => (
            <li key={request._id}>
              <HelpRequestCard request={request} />
            </li>
          ))}
        </ul>
      )}

      {canWrite ? (
        <CreateHelpRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleCreate}
        />
      ) : null}
    </PageShell>
  )
}
