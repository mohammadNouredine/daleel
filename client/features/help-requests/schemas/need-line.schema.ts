import { z } from "zod"
import { HelpRequestNeedKind } from "../types"

const needKindValues = Object.values(HelpRequestNeedKind) as [
  string,
  ...string[],
]

function isBlankNeedLine(line: {
  label: string
  required: string
  notes?: string
}): boolean {
  return (
    !line.label.trim() &&
    !line.notes?.trim() &&
    (line.required === "" || line.required === "1")
  )
}

export const needLineFormSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    required: z.string(),
    unit: z.string().optional(),
    notes: z.string().optional(),
    kind: z.enum(needKindValues),
  })
  .superRefine((line, ctx) => {
    if (isBlankNeedLine(line)) {
      return
    }

    if (!line.label.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["label"],
        message: "Describe what is needed",
      })
    }

    if (!line.required.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["required"],
        message: "Quantity is required",
      })
      return
    }

    if (Number.isNaN(Number(line.required)) || Number(line.required) <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["required"],
        message: "Must be greater than 0",
      })
    }
  })

export type NeedLineFormValue = z.infer<typeof needLineFormSchema>

export function isFilledNeedLine(line: NeedLineFormValue): boolean {
  return !isBlankNeedLine(line) && Boolean(line.label.trim())
}
