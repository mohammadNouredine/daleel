"use client"

import { MoreHorizontal, Pencil, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DaleelProfile } from "@/features/users/types"
import {
  canDeleteUsers,
  canEditUsers,
  canManageUserPermissions,
} from "@/lib/permissions"
import type { AdminUser } from "../types"

type UserRowActionsProps = {
  user: AdminUser
  profile: DaleelProfile
  onEdit: (user: AdminUser) => void
  onPermissions: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
  isDeleting?: boolean
}

export function UserRowActions({
  user,
  profile,
  onEdit,
  onPermissions,
  onDelete,
  isDeleting,
}: UserRowActionsProps) {
  const canEdit = canEditUsers(profile.permissions)
  const canDelete =
    canDeleteUsers(profile.permissions) && user._id !== profile._id
  const canPermissions = canManageUserPermissions(profile.permissions)

  if (!canEdit && !canDelete && !canPermissions) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="User actions"
            disabled={isDeleting}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {canEdit ? (
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        ) : null}
        {canPermissions ? (
          <DropdownMenuItem onClick={() => onPermissions(user)}>
            <Shield className="size-4" />
            Permissions
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
