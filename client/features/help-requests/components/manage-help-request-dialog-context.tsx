"use client"

import { createContext, useContext } from "react"
import type { HelpRequest } from "../types"

export type ManageHelpRequestPayload = {
  requestId: string
  lineId: string
  adjustmentType: "add" | "remove" | "set"
  amount: number
}

type ManageHelpRequestDialogHandlers = {
  request: HelpRequest | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: ManageHelpRequestPayload) => void
}

const ManageHelpRequestDialogContext =
  createContext<ManageHelpRequestDialogHandlers | null>(null)

export function ManageHelpRequestDialogProvider({
  request,
  onOpenChange,
  onSubmit,
  children,
}: ManageHelpRequestDialogHandlers & { children: React.ReactNode }) {
  return (
    <ManageHelpRequestDialogContext.Provider
      value={{ request, onOpenChange, onSubmit }}
    >
      {children}
    </ManageHelpRequestDialogContext.Provider>
  )
}

export function useManageHelpRequestDialogHandlers() {
  const context = useContext(ManageHelpRequestDialogContext)
  if (!context) {
    throw new Error(
      "useManageHelpRequestDialogHandlers must be used within ManageHelpRequestDialogProvider"
    )
  }
  return context
}
