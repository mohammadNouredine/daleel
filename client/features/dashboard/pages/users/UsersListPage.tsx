import { DashboardPlaceholderPage } from "../../components/DashboardPlaceholderPage"

export function UsersListPage() {
  return (
    <DashboardPlaceholderPage
      title="Users"
      description="Browse and manage platform accounts."
      moduleName="User listing"
      note="An admin user list API is not available yet. This page will show search, filters, and user actions once the backend is ready."
    />
  )
}
