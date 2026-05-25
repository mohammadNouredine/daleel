"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { canWriteHelpRequests } from "@/lib/permissions"
import { useCurrentProfile } from "@/features/users/hooks/use-current-profile"
import { MOCK_HELP_REQUESTS } from "../mock-data"
import type { CreateHelpRequestInput, HelpRequest } from "../types"
import {
  applyEditInputToHelpRequest,
  applyFulfillmentAdjustment,
  mapCreateInputToHelpRequest,
} from "../utils/map-form-to-request"
import {
  canDeleteHelpRequest,
  canEditHelpRequest,
  canManageHelpRequest,
} from "../utils/help-request-access"
import {
  DEFAULT_HELP_REQUEST_FILTERS,
  extractGovernorates,
  filterHelpRequests,
  hasActiveFilters,
  partitionRequests,
  type HelpRequestFilters,
} from "../utils/request-filters"
import { CreateHelpRequestDialog } from "./create-help-request-dialog"
import { CreateHelpRequestDialogProvider } from "./create-help-request-dialog-context"
import { DeleteHelpRequestDialog } from "./delete-help-request-dialog"
import { HelpRequestCard } from "./help-request-card"
import { HelpRequestFiltersBar } from "./help-request-filters"
import {
  HelpRequestsToolbar,
  type HelpRequestsViewMode,
} from "./help-requests-toolbar"
import { ManageHelpRequestDialog } from "./manage-help-request-dialog"
import {
  ManageHelpRequestDialogProvider,
  type ManageHelpRequestPayload,
} from "./manage-help-request-dialog-context"

export function HelpRequestsView() {
  const [requests, setRequests] = useState<HelpRequest[]>(MOCK_HELP_REQUESTS)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<HelpRequest | null>(null)
  const [managingRequest, setManagingRequest] = useState<HelpRequest | null>(
    null
  )
  const [deletingRequest, setDeletingRequest] = useState<HelpRequest | null>(
    null
  )
  const [viewMode, setViewMode] = useState<HelpRequestsViewMode>("active")
  const [filters, setFilters] = useState<HelpRequestFilters>(
    DEFAULT_HELP_REQUEST_FILTERS
  )
  const { data: profile, isLoading: isProfileLoading } = useCurrentProfile()

  const canWrite = canWriteHelpRequests(profile?.permissions)
  const canEdit = canEditHelpRequest(profile)
  const canDelete = canDeleteHelpRequest(profile)

  const { active, archive } = useMemo(
    () => partitionRequests(requests),
    [requests]
  )

  const governorates = useMemo(() => extractGovernorates(requests), [requests])

  const sourceList = viewMode === "active" ? active : archive

  const displayedRequests = useMemo(
    () => filterHelpRequests(sourceList, filters),
    [sourceList, filters]
  )

  const openCreateDialog = () => {
    setEditingRequest(null)
    setFormDialogOpen(true)
  }

  const openEditDialog = (request: HelpRequest) => {
    setEditingRequest(request)
    setFormDialogOpen(true)
  }

  const handleFormDialogOpenChange = (open: boolean) => {
    setFormDialogOpen(open)
    if (!open) {
      setEditingRequest(null)
    }
  }

  const handleCreate = (input: CreateHelpRequestInput) => {
    const createdBy = profile?._id ?? "anonymous"
    const newRequest = mapCreateInputToHelpRequest(input, createdBy)
    setRequests((prev) => [newRequest, ...prev])
    setFormDialogOpen(false)
  }

  const handleEdit = (input: CreateHelpRequestInput) => {
    if (!editingRequest) {
      return
    }
    setRequests((prev) =>
      prev.map((item) =>
        item._id === editingRequest._id
          ? applyEditInputToHelpRequest(item, input)
          : item
      )
    )
    setFormDialogOpen(false)
    setEditingRequest(null)
  }

  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setManagingRequest(null)
    }
  }

  const handleManage = (payload: ManageHelpRequestPayload) => {
    const delta =
      payload.adjustmentType === "add" ? payload.amount : -payload.amount

    setRequests((prev) =>
      prev.map((item) =>
        item._id === payload.requestId
          ? applyFulfillmentAdjustment(item, delta)
          : item
      )
    )
    setManagingRequest(null)
  }

  const handleDelete = (requestId: string) => {
    setRequests((prev) => prev.filter((item) => item._id !== requestId))
    setDeletingRequest(null)
  }

  const handleViewModeChange = (mode: HelpRequestsViewMode) => {
    setViewMode(mode)
    setFilters(DEFAULT_HELP_REQUEST_FILTERS)
  }

  const emptyMessage =
    viewMode === "active"
      ? hasActiveFilters(filters)
        ? "No open requests match your filters."
        : "No open requests right now."
      : hasActiveFilters(filters)
        ? "No completed or inactive requests match your filters."
        : "No completed or inactive requests."

  const showFormDialog = canWrite || canEdit
  const formMode = editingRequest ? "edit" : "create"

  return (
    <PageShell
      size="wide"
      title="Help Requests"
      description={
        viewMode === "active"
          ? "Find requests that still need your help."
          : "Review completed, expired, or cancelled requests."
      }
      headerAction={
        !isProfileLoading && canWrite && viewMode === "active" ? (
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-full shadow-sm"
            onClick={openCreateDialog}
            aria-label="Add help request"
          >
            <Plus className="size-5" />
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 sm:gap-5">
        <HelpRequestsToolbar
          viewMode={viewMode}
          activeCount={active.length}
          archiveCount={archive.length}
          onViewModeChange={handleViewModeChange}
        />

        <HelpRequestFiltersBar
          filters={filters}
          governorates={governorates}
          onChange={setFilters}
        />

        {displayedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
            {hasActiveFilters(filters) ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setFilters(DEFAULT_HELP_REQUEST_FILTERS)}
              >
                Clear filters
              </Button>
            ) : null}
            {viewMode === "active" && canWrite && !hasActiveFilters(filters) ? (
              <Button
                type="button"
                className="mt-4"
                onClick={openCreateDialog}
              >
                <Plus className="size-4" />
                Add first request
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {displayedRequests.map((request) => (
              <li key={request._id}>
                <HelpRequestCard
                  request={request}
                  variant={viewMode}
                  canEdit={canEdit}
                  canManage={canManageHelpRequest(request, profile)}
                  canDelete={canDelete}
                  onEdit={() => openEditDialog(request)}
                  onManage={() => setManagingRequest(request)}
                  onDelete={() => setDeletingRequest(request)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {showFormDialog ? (
        <CreateHelpRequestDialogProvider
          mode={formMode}
          editingRequest={editingRequest}
          onOpenChange={handleFormDialogOpenChange}
          onSubmit={formMode === "edit" ? handleEdit : handleCreate}
        >
          <CreateHelpRequestDialog open={formDialogOpen} />
        </CreateHelpRequestDialogProvider>
      ) : null}

      <ManageHelpRequestDialogProvider
        request={managingRequest}
        onOpenChange={handleManageOpenChange}
        onSubmit={handleManage}
      >
        <ManageHelpRequestDialog open={managingRequest !== null} />
      </ManageHelpRequestDialogProvider>

      <DeleteHelpRequestDialog
        request={deletingRequest}
        open={deletingRequest !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingRequest(null)
          }
        }}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
