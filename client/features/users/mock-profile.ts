import type { DaleelProfile } from "./types"

/** Mock profile until GET /api/v1/users/me is wired. Toggle `write` to test the add button. */
export const MOCK_PROFILE_WITH_WRITE: DaleelProfile = {
  _id: "mock_user_1",
  fullName: "Demo Volunteer",
  email: "demo@daleel.local",
  role: "VOLUNTEER",
  permissions: {
    requests: {
      read: true,
      write: true,
      edit: true,
      verify: true,
      manage: true,
      delete: true,
    },
    properties: {
      canViewProperties: true,
      canEditProperty: true,
      canDeleteProperty: true,
      canHideProperty: true,
      canApproveProperty: true,
      canRejectProperty: true,
    },
  },
  isVerified: true,
  isActive: true,
}

export const MOCK_PROFILE_READ_ONLY: DaleelProfile = {
  _id: "mock_user_2",
  fullName: "Read-only User",
  email: "readonly@daleel.local",
  role: "USER",
  permissions: {
    requests: {
      read: true,
      write: false,
      edit: false,
      verify: false,
      manage: false,
      delete: false,
    },
    properties: {
      canViewProperties: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canHideProperty: false,
      canApproveProperty: false,
      canRejectProperty: false,
    },
  },
  isVerified: true,
  isActive: true,
}

export function getMockProfile(): DaleelProfile {
  const canWrite =
    process.env.NEXT_PUBLIC_MOCK_REQUESTS_WRITE !== "false"
  return canWrite ? MOCK_PROFILE_WITH_WRITE : MOCK_PROFILE_READ_ONLY
}
