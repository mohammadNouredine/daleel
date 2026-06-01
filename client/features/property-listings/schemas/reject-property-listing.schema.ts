import { z } from "zod"

export const rejectPropertyListingSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
})

export type RejectPropertyListingFormValues = z.infer<
  typeof rejectPropertyListingSchema
>
