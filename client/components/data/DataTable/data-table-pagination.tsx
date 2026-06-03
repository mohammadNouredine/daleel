import { Button } from "@/components/ui/button"
import type { DataTableCursorPagination } from "./types"

type DataTablePaginationProps = {
  pagination: DataTableCursorPagination
  isLoading?: boolean
}

export function DataTablePagination({
  pagination,
  isLoading = false,
}: DataTablePaginationProps) {
  const {
    pageIndex,
    pageCount,
    hasNextPage,
    hasPreviousPage,
    onNextPage,
    onPreviousPage,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
  } = pagination

  return (
    <div className="flex flex-col gap-3 border-t border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Page {pageIndex + 1}
        {pageCount > 0 ? ` of ${pageCount}` : ""}
        {" · "}
        {pageSize} per page
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Rows
            <select
              className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
              value={pageSize}
              disabled={isLoading}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage || isLoading}
          onClick={onPreviousPage}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage || isLoading}
          onClick={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
