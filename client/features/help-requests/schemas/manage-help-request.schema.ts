import { z } from "zod"

export const manageHelpRequestSchema = z.object({
  lineId: z.string().min(1, "Select an item"),
  adjustmentType: z.enum(["add", "remove", "set"]),
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
      message: "Must be 0 or greater",
    }),
})

export type ManageHelpRequestFormValues = z.infer<typeof manageHelpRequestSchema>

export const manageHelpRequestDefaultValues: ManageHelpRequestFormValues = {
  lineId: "",
  adjustmentType: "add",
  amount: "",
}
