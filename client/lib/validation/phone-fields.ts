import { z } from "zod"

export const phoneCodeField = z.string().min(1, "Select a country code")

export const phoneNumberField = z
  .string()
  .min(1, "Phone number is required")
  .refine((value) => {
    const digits = value.replace(/\D/g, "")
    return digits.length >= 6 && digits.length <= 15
  }, "Enter a valid phone number (6–15 digits)")

export const phoneFormFields = {
  phoneCode: phoneCodeField,
  phoneNumber: phoneNumberField,
} as const
