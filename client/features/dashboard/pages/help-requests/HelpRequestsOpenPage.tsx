import { DashboardPlaceholderPage } from "../../components/DashboardPlaceholderPage"

export function HelpRequestsOpenPage() {
  return (
    <DashboardPlaceholderPage
      title="Open help requests"
      description="Active help requests visible on the platform."
      moduleName="Open requests"
      note="An admin list for open help requests is not available yet. Use Pending approval for the moderation queue."
    />
  )
}
