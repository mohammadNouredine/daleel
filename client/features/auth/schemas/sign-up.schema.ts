import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>

export function toSignUpBody(values: SignUpFormValues) {
  const body: {
    email: string
    password: string
    name: string
    phoneNumber?: string
    whatsappNumber?: string
  } = {
    email: values.email,
    password: values.password,
    name: values.name,
  }

  if (values.phoneNumber?.trim()) {
    body.phoneNumber = values.phoneNumber.trim()
  }
  if (values.whatsappNumber?.trim()) {
    body.whatsappNumber = values.whatsappNumber.trim()
  }

  return body
}
