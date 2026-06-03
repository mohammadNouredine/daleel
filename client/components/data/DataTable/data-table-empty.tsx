type DataTableEmptyProps = {
  title?: string
  description?: string
}

export function DataTableEmpty({
  title = "No results",
  description = "Try adjusting filters or check back later.",
}: DataTableEmptyProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
