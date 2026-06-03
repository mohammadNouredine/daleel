export type ConfirmDialogVariant = "danger" | "warning" | "info"

export type ConfirmDialogOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
  onConfirm?: () => void | Promise<void>
}

export type ConfirmDialogState = ConfirmDialogOptions & {
  open: boolean
  resolve: ((value: boolean) => void) | null
  loading: boolean
}
