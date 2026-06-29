"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data/DataTable"
import { SelectControl } from "@/components/select/SelectControl"
import { useConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { UserEditDialog } from "@/features/users/components/UserEditDialog"
import { UserPermissionsDialog } from "@/features/users/components/UserPermissionsDialog"
import { UserRowActions } from "@/features/users/components/UserRowActions"
import { useDeleteUser } from "@/features/users/hooks/use-delete-user"
import { useUsersList } from "@/features/users/hooks/use-users-list"
import type { AdminUser, DaleelProfile } from "@/features/users/types"
import { canReadUsers } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { DashboardPageHeader } from "../../components/DashboardPageHeader"
import { useDashboardAuth } from "../../providers/DashboardAuthProvider"

const ROLE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All roles" },
  { value: "USER", label: "User" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "ADMIN", label: "Admin" },
]

function roleBadgeClass(role: DaleelProfile["role"]): string {
  switch (role) {
    case "ADMIN":
      return "bg-violet-500/15 text-violet-700 dark:text-violet-300"
    case "ORGANIZATION":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300"
    case "VOLUNTEER":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function UsersListPage() {
  const { profile } = useDashboardAuth()
  const canRead = canReadUsers(profile.permissions)
  const { confirmAsync } = useConfirmDialog()
  const deleteMutation = useDeleteUser()

  const [searchInput, setSearchInput] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [permissionsUser, setPermissionsUser] = useState<AdminUser | null>(null)

  const {
    items,
    isLoading,
    isError,
    error,
    refetch,
    pagination,
    resetPagination,
  } = useUsersList(
    {
      q: appliedSearch,
      role: roleFilter as DaleelProfile["role"] | "",
    },
    canRead
  )

  const handleDelete = useCallback(
    async (user: AdminUser) => {
      const confirmed = await confirmAsync({
        title: "Delete this user?",
        description: `Permanently remove ${user.fullName} (${user.email}). This cannot be undone.`,
        confirmText: "Delete",
        variant: "danger",
      })
      if (!confirmed) return
      deleteMutation.mutate(user._id)
    },
    [confirmAsync, deleteMutation]
  )

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.fullName}</span>
        ),
      },
      {
        id: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge className={cn("border-0", roleBadgeClass(row.original.role))}>
            {row.original.role}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? "secondary" : "outline"}
            className="border-0"
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "created",
        header: "Created",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })
            : "—",
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <UserRowActions
            user={row.original}
            profile={profile}
            onEdit={setEditingUser}
            onPermissions={setPermissionsUser}
            onDelete={(user) => void handleDelete(user)}
            isDeleting={deleteMutation.isPending}
          />
        ),
      },
    ],
    [deleteMutation.isPending, handleDelete, profile]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    resetPagination()
  }, [appliedSearch, roleFilter, resetPagination])

  if (!canRead) {
    return (
      <>
        <DashboardPageHeader
          title="Users"
          description="Browse and manage platform accounts."
        />
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
          You do not have permission to view users.
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardPageHeader
        title="Users"
        description="Browse and manage platform accounts."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search name or email…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="max-w-sm"
        />
        <SelectControl
          value={roleFilter}
          onValueChange={setRoleFilter}
          options={ROLE_FILTER_OPTIONS}
          placeholder="Filter by role"
          clearable
          clearValue=""
          className="w-full max-w-[200px]"
        />
      </div>

      <DataTable
        data={items}
        columns={columns}
        loading={isLoading}
        error={isError ? (error as Error) : null}
        onRetry={() => void refetch()}
        getRowId={(row) => row._id}
        pagination={pagination}
        emptyTitle="No users found"
        emptyDescription="Try adjusting search or role filters."
      />

      <UserEditDialog
        user={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
      />

      <UserPermissionsDialog
        user={permissionsUser}
        open={Boolean(permissionsUser)}
        onOpenChange={(open) => {
          if (!open) setPermissionsUser(null)
        }}
      />
    </>
  )
}
