import { z } from "zod"

export const manageHelpRequestSchema = z.object({
  adjustmentType: z.enum(["add", "remove"]),
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Must be greater than 0",
    }),
})

export type ManageHelpRequestFormValues = z.infer<typeof manageHelpRequestSchema>

export const manageHelpRequestDefaultValues: ManageHelpRequestFormValues = {
  adjustmentType: "add",
  amount: "",
}
