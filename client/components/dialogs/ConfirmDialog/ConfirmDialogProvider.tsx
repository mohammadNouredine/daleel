"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ConfirmDialogOptions, ConfirmDialogState } from "./types"

const DEFAULT_TITLE = "Are you sure?"
const DEFAULT_DESCRIPTION =
  "Are you sure you want to complete this action?"

type ConfirmDialogContextValue = {
  confirmAsync: (options?: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(
  null
)

const initialState: ConfirmDialogState = {
  open: false,
  resolve: null,
  loading: false,
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  confirmText: "Yes",
  cancelText: "No",
  variant: "info",
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState>(initialState)
  const pendingRef = useRef(false)

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const closeWith = useCallback((result: boolean) => {
    resolveRef.current?.(result)
    resolveRef.current = null
    setState(initialState)
    pendingRef.current = false
  }, [])

  const confirmAsync = useCallback((options: ConfirmDialogOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setState({
        open: true,
        resolve,
        loading: false,
        title: options.title ?? DEFAULT_TITLE,
        description: options.description ?? DEFAULT_DESCRIPTION,
        confirmText: options.confirmText ?? "Yes",
        cancelText: options.cancelText ?? "No",
        variant: options.variant ?? "info",
        onConfirm: options.onConfirm,
      })
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    if (pendingRef.current) return
    pendingRef.current = true
    setState((prev) => ({ ...prev, loading: true }))
    try {
      if (state.onConfirm) {
        await state.onConfirm()
      }
      closeWith(true)
    } catch {
      setState((prev) => ({ ...prev, loading: false }))
      pendingRef.current = false
    }
  }, [closeWith, state.onConfirm])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !state.loading) {
        closeWith(false)
      }
    },
    [closeWith, state.loading]
  )

  const confirmButtonVariant =
    state.variant === "danger"
      ? "destructive"
      : state.variant === "warning"
        ? "secondary"
        : "default"

  const value = useMemo(() => ({ confirmAsync }), [confirmAsync])

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <Dialog open={state.open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={!state.loading}>
          <DialogHeader>
            <DialogTitle>{state.title}</DialogTitle>
            <DialogDescription>{state.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={state.loading}
              onClick={() => closeWith(false)}
            >
              {state.cancelText}
            </Button>
            <Button
              type="button"
              variant={confirmButtonVariant}
              disabled={state.loading}
              onClick={() => void handleConfirm()}
            >
              {state.loading ? "Please wait…" : state.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider")
  }
  return context
}
