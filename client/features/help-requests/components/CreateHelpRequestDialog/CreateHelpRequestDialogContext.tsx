"use client"

import { createContext, useContext } from "react"
import type { HelpRequest } from "../../types"
import type { CreateHelpRequestFormValues } from "../../schemas/create-help-request.schema"
import type { HelpRequestFormFiles } from "../../utils/build-help-request-form-data"

export type HelpRequestFormMode = "create" | "edit"

type CreateHelpRequestDialogHandlers = {
  mode: HelpRequestFormMode
  editingRequest: HelpRequest | null
  onOpenChange: (open: boolean) => void
  onSubmit: (
    values: CreateHelpRequestFormValues,
    files: HelpRequestFormFiles
  ) => void
}

const CreateHelpRequestDialogContext =
  createContext<CreateHelpRequestDialogHandlers | null>(null)

export function CreateHelpRequestDialogProvider({
  mode,
  editingRequest,
  onOpenChange,
  onSubmit,
  children,
}: CreateHelpRequestDialogHandlers & { children: React.ReactNode }) {
  return (
    <CreateHelpRequestDialogContext.Provider
      value={{ mode, editingRequest, onOpenChange, onSubmit }}
    >
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
