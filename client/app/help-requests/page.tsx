import { PageShell } from "@/components/layout/page-shell"

export default function HelpRequestsPage() {
  return (
    <PageShell
      title="Help Requests"
      description="Browse and manage humanitarian help requests."
    >
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-16 text-center">
        <p className="text-muted-foreground">
          List and manage requests here soon.
        </p>
      </div>
    </PageShell>
  )
}
