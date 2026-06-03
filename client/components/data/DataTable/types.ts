export type DataTableCursorPagination = {
  pageIndex: number
  pageCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onNextPage: () => void
  onPreviousPage: () => void
  pageSize: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}
