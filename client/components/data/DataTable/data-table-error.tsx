import { Button } from "@/components/ui/button"

type DataTableErrorProps = {
  message?: string
  onRetry?: () => void
}

export function DataTableError({
  message = "Something went wrong while loading data.",
  onRetry,
}: DataTableErrorProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
