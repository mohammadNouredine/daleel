import { DashboardPageHeader } from "./DashboardPageHeader"

type DashboardPlaceholderPageProps = {
  title: string
  description: string
  moduleName: string
  note?: string
}

export function DashboardPlaceholderPage({
  title,
  description,
  moduleName,
  note = "This module will be connected to the API in a future release.",
}: DashboardPlaceholderPageProps) {
  return (
    <>
      <DashboardPageHeader title={title} description={description} />
      <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center">
        <p className="text-sm font-medium">{moduleName}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{note}</p>
      </div>
    </>
  )
}
