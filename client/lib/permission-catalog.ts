export type PermissionPath =
  | `requests.${"read" | "write" | "edit" | "verify" | "manage" | "delete"}`
  | `properties.${"canViewProperties" | "canEditProperty" | "canDeleteProperty" | "canHideProperty" | "canApproveProperty" | "canRejectProperty" | "canPermanentlyDeleteProperty"}`
  | `users.${"read" | "edit" | "delete" | "managePermissions"}`

export type PermissionCatalogEntry = {
  path: PermissionPath
  label: string
  description: string
}

export type PermissionCatalogGroup = {
  id: string
  label: string
  permissions: PermissionCatalogEntry[]
}

export const PERMISSION_CATALOG: PermissionCatalogGroup[] = [
  {
    id: "requests",
    label: "Help requests",
    permissions: [
      { path: "requests.read", label: "Read", description: "View help requests" },
      {
        path: "requests.write",
        label: "Write",
        description: "Create help requests",
      },
      {
        path: "requests.edit",
        label: "Edit",
        description: "Update help requests",
      },
      {
        path: "requests.verify",
        label: "Verify",
        description: "Approve/reject pending help requests",
      },
      {
        path: "requests.manage",
        label: "Manage",
        description: "Fulfillment and management actions",
      },
      {
        path: "requests.delete",
        label: "Delete",
        description: "Delete help requests",
      },
    ],
  },
  {
    id: "properties",
    label: "Properties",
    permissions: [
      {
        path: "properties.canViewProperties",
        label: "View properties",
        description: "Access property listings in dashboard",
      },
      {
        path: "properties.canEditProperty",
        label: "Edit property",
        description: "Edit property listings",
      },
      {
        path: "properties.canDeleteProperty",
        label: "Delete property",
        description: "Soft-delete property listings",
      },
      {
        path: "properties.canHideProperty",
        label: "Hide property",
        description: "Hide or restore property listings",
      },
      {
        path: "properties.canApproveProperty",
        label: "Approve property",
        description: "Approve pending listings",
      },
      {
        path: "properties.canRejectProperty",
        label: "Reject property",
        description: "Reject pending listings",
      },
      {
        path: "properties.canPermanentlyDeleteProperty",
        label: "Permanently delete",
        description: "Hard-delete property listings",
      },
    ],
  },
  {
    id: "users",
    label: "Users",
    permissions: [
      { path: "users.read", label: "Read", description: "List and view users" },
      { path: "users.edit", label: "Edit", description: "Update user profiles" },
      { path: "users.delete", label: "Delete", description: "Delete users" },
      {
        path: "users.managePermissions",
        label: "Manage permissions",
        description: "Edit user permission overrides",
      },
    ],
  },
]
