import { z } from "zod"

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
