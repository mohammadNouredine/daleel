"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import toast from "react-hot-toast"
import { CardGridSkeleton } from "@/components/data/CardGridSkeleton"
import { Button } from "@/components/ui/button"
import { HomeFooter } from "@/features/home/components/HomeFooter"
import { HomeHeader } from "@/features/home/components/HomeHeader"
import { SectionHeader } from "@/features/home/components/SectionHeader"
import { useIsAuthenticated } from "@/features/auth/hooks/use-is-authenticated"
import { useCurrentProfile } from "@/features/users/hooks/use-current-profile"
import type { HelpRequest } from "../types"
import { HelpRequestApprovalStatus } from "../types"
import {
  canDeleteHelpRequest,
  canEditHelpRequest,
  canHideHelpRequest,
  canManageHelpRequest,
  canRestoreHelpRequest,
  isHelpRequestOwner,
} from "../utils/help-request-access"
import {
  DEFAULT_HELP_REQUEST_FILTERS,
  extractGovernorates,
  filterHelpRequests,
  hasActiveFilters,
  partitionRequests,
  type HelpRequestFilters,
} from "../utils/request-filters"
import { DEFAULT_HELP_REQUEST_SORT } from "../utils/request-sort"
import type { HelpRequestSortValue } from "../types"
import { useUserLocation } from "../hooks/use-user-location"
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
import { useHideHelpRequest } from "../hooks/use-hide-help-request"
import { useRestoreHelpRequest } from "../hooks/use-restore-help-request"
import { useManageHelpRequestFulfillment } from "../hooks/use-manage-help-request-fulfillment"
import { CreateHelpRequestDialog } from "./CreateHelpRequestDialog"
import { CreateHelpRequestDialogProvider } from "./CreateHelpRequestDialog/CreateHelpRequestDialogContext"
import { DeleteHelpRequestDialog } from "./DeleteHelpRequestDialog"
import { HideHelpRequestDialog } from "./HideHelpRequestDialog"
import { HelpRequestCard } from "./HelpRequestCard"
import { HelpRequestFiltersBar } from "./HelpRequestFiltersBar"
import {
  HelpRequestsToolbar,
  type HelpRequestsViewMode,
} from "./HelpRequestsToolbar"
import { ManageHelpRequestDialog } from "./ManageHelpRequestDialog"
import {
  ManageHelpRequestDialogProvider,
  type ManageHelpRequestPayload,
} from "./ManageHelpRequestDialog/ManageHelpRequestDialogContext"

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
  const [hidingRequest, setHidingRequest] = useState<HelpRequest | null>(null)
  const [viewMode, setViewMode] = useState<HelpRequestsViewMode>("active")
  const [filters, setFilters] = useState<HelpRequestFilters>(
    DEFAULT_HELP_REQUEST_FILTERS
  )
  const [sort, setSort] = useState<HelpRequestSortValue>(
    DEFAULT_HELP_REQUEST_SORT
  )

  const { coords: userCoords, status: locationStatus } = useUserLocation({
    enabled: true,
  })

  useEffect(() => {
    if (sort !== "nearest") return
    if (locationStatus === "denied" || locationStatus === "unsupported") {
      toast.error("Location access is needed to sort by nearest")
      setSort(DEFAULT_HELP_REQUEST_SORT)
    }
  }, [sort, locationStatus])

  const sortHint =
    sort === "nearest" && locationStatus === "loading"
      ? "Getting your location…"
      : undefined

  const { data: profile } = useCurrentProfile()

  const listViewMode = viewMode === "mine" ? "active" : viewMode
  const publicQuery = useHelpRequests({
    filters,
    viewMode: listViewMode,
    sort,
    userCoords,
    enabled: viewMode !== "mine",
  })
  const mineQuery = useMyHelpRequests({
    enabled: isAuthenticated && viewMode === "mine",
    sort,
    userCoords,
  })

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

  const hideMutation = useHideHelpRequest({
    onSuccess: () => setHidingRequest(null),
  })

  const restoreMutation = useRestoreHelpRequest()

  const manageMutation = useManageHelpRequestFulfillment({
    onSuccess: () => setManagingRequest(null),
  })

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
    viewMode === "mine"
      ? mineQuery.isLoading || (sort === "nearest" && locationStatus === "loading")
      : publicQuery.isLoading ||
        (sort === "nearest" && locationStatus === "loading")

  const isError =
    viewMode === "mine" ? mineQuery.isError : publicQuery.isError

  const refetch = () => {
    if (viewMode === "mine") {
      void mineQuery.refetch()
      return
    }
    void publicQuery.refetch()
  }

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

  const handleHide = (requestId: string) => {
    hideMutation.mutate(requestId)
  }

  const handleRestore = (requestId: string) => {
    restoreMutation.mutate(requestId)
  }

  const handleViewModeChange = (mode: HelpRequestsViewMode) => {
    setViewMode(mode)
    setFilters(DEFAULT_HELP_REQUEST_FILTERS)
    setSort(DEFAULT_HELP_REQUEST_SORT)
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
  const showFormDialog =
    canCreate ||
    (editingRequest !== null && isHelpRequestOwner(editingRequest, profile))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeader
            title="Community Help Requests"
            subtitle="Browse open requests across Lebanon and offer support where it is needed most."
            badge="Live"
          />
          {viewMode !== "archive" ? (
            <div className="flex justify-end">
              <Button
                type="button"
                className="gap-1.5"
                onClick={openCreateDialog}
              >
                <Plus className="size-4" />
                Add help request
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-4">
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
            sort={sort}
            governorates={governorates}
            onChange={setFilters}
            onSortChange={setSort}
            sortHint={sortHint}
          />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <CardGridSkeleton
              columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            />
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">
                Could not load help requests. Please try again.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={refetch}
              >
                Retry
              </Button>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
              <p className="text-sm font-medium">{emptyMessage}</p>
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
              {viewMode === "active" && !hasActiveFilters(filters) ? (
                <Button
                  type="button"
                  className="mt-4 gap-1.5"
                  onClick={openCreateDialog}
                >
                  <Plus className="size-4" />
                  Add help request
                </Button>
              ) : null}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedRequests.map((request) => {
                const isOwner = isHelpRequestOwner(request, profile)

                return (
                  <li key={request._id}>
                    <HelpRequestCard
                      request={request}
                      variant={viewMode === "archive" ? "archive" : "active"}
                      showApprovalStatus={viewMode === "mine" || isOwner}
                      canEdit={isOwner && canEditHelpRequest(request, profile)}
                      canManage={
                        isOwner && canManageHelpRequest(request, profile)
                      }
                      canHide={isOwner && canHideHelpRequest(request, profile)}
                      canRestore={
                        isOwner && canRestoreHelpRequest(request, profile)
                      }
                      canDelete={
                        isOwner && canDeleteHelpRequest(request, profile)
                      }
                      onEdit={() => openEditDialog(request)}
                      onManage={() => setManagingRequest(request)}
                      onHide={() => setHidingRequest(request)}
                      onRestore={() => handleRestore(request._id)}
                      onDelete={() => setDeletingRequest(request)}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
      <HomeFooter />

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

      <HideHelpRequestDialog
        request={hidingRequest}
        open={hidingRequest !== null}
        onOpenChange={(open) => {
          if (!open) setHidingRequest(null)
        }}
        onConfirm={handleHide}
      />
    </div>
  )
}
