import { DashboardPlaceholderPage } from "../../components/DashboardPlaceholderPage"

export function PropertiesAllPage() {
  return (
    <DashboardPlaceholderPage
      title="All listings"
      description="Search and manage every property listing on the platform."
      moduleName="Property directory"
      note="An admin-wide property list API is not available yet. Use Approvals and Hidden & deleted for moderation queues."
    />
  )
}
