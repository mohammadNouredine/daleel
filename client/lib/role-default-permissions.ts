import type {
  DaleelProfile,
  UserPermissions,
} from "@/features/users/types"

function allRequestPermissions(): UserPermissions["requests"] {
  return {
    read: true,
    write: true,
    edit: true,
    verify: true,
    manage: true,
    delete: true,
  }
}

function orgRequestPermissions(): UserPermissions["requests"] {
  return {
    read: true,
    write: true,
    edit: true,
    verify: false,
    manage: false,
    delete: false,
  }
}

function userRequestPermissions(): UserPermissions["requests"] {
  return {
    read: true,
    write: true,
    edit: false,
    verify: false,
    manage: false,
    delete: false,
  }
}

function volunteerRequestPermissions(): UserPermissions["requests"] {
  return {
    read: true,
    write: true,
    edit: true,
    verify: true,
    manage: false,
    delete: false,
  }
}

const allPropertyPermissions: UserPermissions["properties"] = {
  canViewProperties: true,
  canEditProperty: true,
  canDeleteProperty: true,
  canHideProperty: true,
  canApproveProperty: true,
  canRejectProperty: true,
  canPermanentlyDeleteProperty: true,
}

const noPropertyPermissions: UserPermissions["properties"] = {
  canViewProperties: false,
  canEditProperty: false,
  canDeleteProperty: false,
  canHideProperty: false,
  canApproveProperty: false,
  canRejectProperty: false,
  canPermanentlyDeleteProperty: false,
}

const orgPropertyPermissions: UserPermissions["properties"] = {
  ...noPropertyPermissions,
  canViewProperties: true,
  canEditProperty: true,
}

const allUserAdminPermissions: UserPermissions["users"] = {
  read: true,
  edit: true,
  delete: true,
  managePermissions: true,
}

const noUserAdminPermissions: UserPermissions["users"] = {
  read: false,
  edit: false,
  delete: false,
  managePermissions: false,
}

export function defaultPermissionsForRole(
  role: DaleelProfile["role"]
): UserPermissions {
  switch (role) {
    case "ADMIN":
      return {
        requests: allRequestPermissions(),
        properties: allPropertyPermissions,
        users: allUserAdminPermissions,
      }
    case "VOLUNTEER":
      return {
        requests: volunteerRequestPermissions(),
        properties: noPropertyPermissions,
        users: noUserAdminPermissions,
      }
    case "ORGANIZATION":
      return {
        requests: orgRequestPermissions(),
        properties: orgPropertyPermissions,
        users: noUserAdminPermissions,
      }
    default:
      return {
        requests: userRequestPermissions(),
        properties: noPropertyPermissions,
        users: noUserAdminPermissions,
      }
  }
}
