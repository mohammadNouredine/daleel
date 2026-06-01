import { z } from "zod"

export const createPropertyReportSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
})

export type CreatePropertyReportFormValues = z.infer<
  typeof createPropertyReportSchema
>
