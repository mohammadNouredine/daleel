import { z } from "zod"
import { HelpRequestNeedKind } from "../types"

const needKindValues = Object.values(HelpRequestNeedKind) as [
  string,
  ...string[],
]

export const needLineFormSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Describe what is needed"),
  required: z
    .string()
    .min(1, "Quantity is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Must be greater than 0",
    }),
  unit: z.string().optional(),
  notes: z.string().optional(),
  kind: z.enum(needKindValues),
})

export type NeedLineFormValue = z.infer<typeof needLineFormSchema>
