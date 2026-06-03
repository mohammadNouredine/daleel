"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DataTableEmpty } from "./data-table-empty"
import { DataTableError } from "./data-table-error"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableSkeleton } from "./data-table-skeleton"
import type { DataTableCursorPagination } from "./types"

export type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  pagination?: DataTableCursorPagination
  enableRowSelection?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  getRowId,
  onRowClick,
  pagination,
  enableRowSelection = false,
  emptyTitle,
  emptyDescription,
  className,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => getRowId(row),
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  })

  const columnCount = useMemo(() => table.getAllColumns().length, [table])

  if (error) {
    return <DataTableError message={error.message} onRetry={onRetry} />
  }

  if (loading && data.length === 0) {
    return <DataTableSkeleton columnCount={columnCount} />
  }

  if (!loading && data.length === 0) {
    return (
      <DataTableEmpty title={emptyTitle} description={emptyDescription} />
    )
  }

  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border border-border", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {loading ? (
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Updating…
        </p>
      ) : null}
      {pagination ? (
        <DataTablePagination pagination={pagination} isLoading={loading} />
      ) : null}
    </div>
  )
}
