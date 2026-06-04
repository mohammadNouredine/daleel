"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PERMISSION_CATALOG,
  type PermissionCatalogGroup,
  type PermissionPath,
} from "@/lib/permission-catalog"
import { defaultPermissionsForRole } from "@/lib/role-default-permissions"
import { useUpdateUserPermissions } from "../hooks/use-update-user-permissions"
import type { AdminUser, UserPermissions } from "../types"

function getPermissionValue(
  permissions: UserPermissions,
  path: PermissionPath
): boolean {
  const [group, key] = path.split(".") as [keyof UserPermissions, string]
  const section = permissions[group] as Record<string, boolean>
  return section[key] === true
}

function setPermissionValue(
  permissions: UserPermissions,
  path: PermissionPath,
  value: boolean
): UserPermissions {
  const [group, key] = path.split(".") as [keyof UserPermissions, string]
  return {
    ...permissions,
    [group]: {
      ...permissions[group],
      [key]: value,
    },
  }
}

type PermissionGroupPanelProps = {
  group: PermissionCatalogGroup
  draft: UserPermissions
  roleDefaults: UserPermissions
  onToggle: (path: PermissionPath, value: boolean) => void
}

function PermissionGroupPanel({
  group,
  draft,
  roleDefaults,
  onToggle,
}: PermissionGroupPanelProps) {
  return (
    <ul className="space-y-2">
      {group.permissions.map((entry) => {
        const roleDefault = getPermissionValue(roleDefaults, entry.path)
        const checked = getPermissionValue(draft, entry.path)
        const differs = checked !== roleDefault

        return (
          <li
            key={entry.path}
            className="flex items-start gap-3 rounded-lg border border-border/60 px-3 py-2"
          >
            <input
              id={entry.path}
              type="checkbox"
              className="mt-1 size-4 rounded border-border"
              checked={checked}
              onChange={(event) => onToggle(entry.path, event.target.checked)}
            />
            <div className="min-w-0 flex-1">
              <Label htmlFor={entry.path} className="cursor-pointer font-medium">
                {entry.label}
              </Label>
              <p className="text-xs text-muted-foreground">{entry.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Role default: {roleDefault ? "on" : "off"}
                {differs ? " · overridden" : ""}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

type UserPermissionsDialogProps = {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_TAB = PERMISSION_CATALOG[0]?.id ?? "requests"

export function UserPermissionsDialog({
  user,
  open,
  onOpenChange,
}: UserPermissionsDialogProps) {
  const mutation = useUpdateUserPermissions({
    onSuccess: () => onOpenChange(false),
  })
  const [draft, setDraft] = useState<UserPermissions | null>(null)
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)

  useEffect(() => {
    if (user && open) {
      setDraft({
        requests: { ...user.permissions.requests },
        properties: { ...user.permissions.properties },
        users: { ...user.permissions.users },
      })
      setActiveTab(DEFAULT_TAB)
    }
  }, [user, open])

  if (!user || !draft) {
    return null
  }

  const roleDefaults = defaultPermissionsForRole(user.role)

  const handleToggle = (path: PermissionPath, value: boolean) => {
    setDraft((prev) => (prev ? setPermissionValue(prev, path, value) : prev))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>Permissions — {user.fullName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Overrides apply on top of role defaults ({user.role}). Checked values
            are stored on the user profile.
          </p>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value) setActiveTab(value)
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="mx-6 mt-4 shrink-0 flex w-auto flex-wrap gap-1">
            {PERMISSION_CATALOG.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            {PERMISSION_CATALOG.map((group) => (
              <TabsContent key={group.id} value={group.id} className="mt-0">
                <PermissionGroupPanel
                  group={group}
                  draft={draft}
                  roleDefaults={roleDefaults}
                  onToggle={handleToggle}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ id: user._id, permissions: draft })
            }
          >
            Save permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
