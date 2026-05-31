"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import toast from "react-hot-toast"
import { PageShell } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { useIsAuthenticated } from "@/features/auth/hooks/use-is-authenticated"
import { useCurrentProfile } from "@/features/users/hooks/use-current-profile"
import type { HelpRequest } from "../types"
import { HelpRequestApprovalStatus } from "../types"
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
import { mapFormToCreateInput } from "../utils/map-form-to-request"
import {
  buildHelpRequestFormData,
  type HelpRequestFormFiles,
} from "../utils/build-help-request-form-data"
import type { CreateHelpRequestFormValues } from "../schemas/create-help-request.schema"
import { useHelpRequests } from "../hooks/use-help-requests"
import { useMyHelpRequests } from "../hooks/use-my-help-requests"
import { useCreateHelpRequest } from "../hooks/use-create-help-request"
import { useUpdateHelpRequest } from "../hooks/use-update-help-request"
import { useDeleteHelpRequest } from "../hooks/use-delete-help-request"
import { useManageHelpRequestFulfillment } from "../hooks/use-manage-help-request-fulfillment"
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
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()

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

  const listViewMode = viewMode === "mine" ? "active" : viewMode
  const publicQuery = useHelpRequests({ filters, viewMode: listViewMode })
  const mineQuery = useMyHelpRequests(isAuthenticated && viewMode === "mine")

  const createMutation = useCreateHelpRequest({
    showSuccessToast: false,
    onSuccess: (created) => {
      const autoApproved =
        created.approvalStatus === HelpRequestApprovalStatus.APPROVED
      toast.success(
        autoApproved
          ? "Help request published"
          : "Request submitted for review"
      )
      setFormDialogOpen(false)
    },
  })

  const updateMutation = useUpdateHelpRequest({
    onSuccess: () => {
      setFormDialogOpen(false)
      setEditingRequest(null)
    },
  })

  const deleteMutation = useDeleteHelpRequest({
    onSuccess: () => setDeletingRequest(null),
  })

  const manageMutation = useManageHelpRequestFulfillment({
    onSuccess: () => setManagingRequest(null),
  })

  const canEdit = canEditHelpRequest(profile)
  const canDelete = canDeleteHelpRequest(profile)
  const canCreate = isAuthenticated

  const sourceRequests = viewMode === "mine" ? (mineQuery.data ?? []) : (publicQuery.data ?? [])

  const { active, archive } = useMemo(
    () => partitionRequests(publicQuery.data ?? []),
    [publicQuery.data]
  )

  const governorates = useMemo(
    () =>
      extractGovernorates(
        viewMode === "mine" ? sourceRequests : (publicQuery.data ?? [])
      ),
    [viewMode, sourceRequests, publicQuery.data]
  )

  const sourceList =
    viewMode === "mine"
      ? sourceRequests
      : viewMode === "active"
        ? active
        : archive

  const displayedRequests = useMemo(
    () => filterHelpRequests(sourceList, filters),
    [sourceList, filters]
  )

  const isLoading =
    viewMode === "mine" ? mineQuery.isLoading : publicQuery.isLoading

  const openCreateDialog = () => {
    if (!canCreate) {
      router.push("/auth")
      return
    }
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

  const submitForm = (
    values: CreateHelpRequestFormValues,
    files: HelpRequestFormFiles
  ) => {
    const input = mapFormToCreateInput(values)
    const formData = buildHelpRequestFormData(input, files)

    if (editingRequest) {
      updateMutation.mutate({ id: editingRequest._id, formData })
      return
    }

    createMutation.mutate(formData)
  }

  const handleManage = (payload: ManageHelpRequestPayload) => {
    manageMutation.mutate(payload)
  }

  const handleDelete = (requestId: string) => {
    deleteMutation.mutate(requestId)
  }

  const handleViewModeChange = (mode: HelpRequestsViewMode) => {
    setViewMode(mode)
    setFilters(DEFAULT_HELP_REQUEST_FILTERS)
  }

  const emptyMessage =
    viewMode === "mine"
      ? "You have not submitted any requests yet."
      : viewMode === "active"
        ? hasActiveFilters(filters)
          ? "No open requests match your filters."
          : "No open requests right now."
        : hasActiveFilters(filters)
          ? "No completed or inactive requests match your filters."
          : "No completed or inactive requests."

  const formMode = editingRequest ? "edit" : "create"
  const showFormDialog = canCreate || (canEdit && editingRequest !== null)

  return (
    <PageShell
      size="wide"
      title="Help Requests"
      description={
        viewMode === "mine"
          ? "Track your submissions, including those awaiting approval."
          : viewMode === "active"
            ? "Find requests that still need your help."
            : "Review completed, expired, or cancelled requests."
      }
      headerAction={
        !isProfileLoading && canCreate && viewMode !== "archive" ? (
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
          mineCount={mineQuery.data?.length ?? 0}
          showMineTab={isAuthenticated}
          onViewModeChange={handleViewModeChange}
        />

        <HelpRequestFiltersBar
          filters={filters}
          governorates={governorates}
          onChange={setFilters}
        />

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-muted-foreground">
            Loading requests…
          </div>
        ) : displayedRequests.length === 0 ? (
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
            {viewMode === "active" && canCreate && !hasActiveFilters(filters) ? (
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
                  variant={viewMode === "archive" ? "archive" : "active"}
                  showApprovalStatus={viewMode === "mine"}
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
          onSubmit={submitForm}
        >
          <CreateHelpRequestDialog open={formDialogOpen} />
        </CreateHelpRequestDialogProvider>
      ) : null}

      <ManageHelpRequestDialogProvider
        request={managingRequest}
        onOpenChange={(open) => {
          if (!open) setManagingRequest(null)
        }}
        onSubmit={handleManage}
      >
        <ManageHelpRequestDialog open={managingRequest !== null} />
      </ManageHelpRequestDialogProvider>

      <DeleteHelpRequestDialog
        request={deletingRequest}
        open={deletingRequest !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingRequest(null)
        }}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
