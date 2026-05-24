"use client"

import { createContext, useContext } from "react"
import type { CreateHelpRequestInput } from "../types"

type CreateHelpRequestDialogHandlers = {
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateHelpRequestInput) => void
}

const CreateHelpRequestDialogContext =
  createContext<CreateHelpRequestDialogHandlers | null>(null)

export function CreateHelpRequestDialogProvider({
  onOpenChange,
  onSubmit,
  children,
}: CreateHelpRequestDialogHandlers & { children: React.ReactNode }) {
  return (
    <CreateHelpRequestDialogContext.Provider value={{ onOpenChange, onSubmit }}>
      {children}
    </CreateHelpRequestDialogContext.Provider>
  )
}

export function useCreateHelpRequestDialogHandlers() {
  const context = useContext(CreateHelpRequestDialogContext)
  if (!context) {
    throw new Error(
      "useCreateHelpRequestDialogHandlers must be used within CreateHelpRequestDialogProvider"
    )
  }
  return context
}
