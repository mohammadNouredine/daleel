import { z } from "zod"

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must contain only digits"),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>
