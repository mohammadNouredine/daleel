"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormRoot } from "@/components/forms/form-root"
import { PasswordInput } from "@/components/forms/password-input"
import { TextInput } from "@/components/forms/text-input"
import { ApiError } from "@/lib/api/client"
import { useSignUp } from "../hooks/use-sign-up"
import {
  signUpSchema,
  toSignUpBody,
  type SignUpFormValues,
} from "../schemas/sign-up.schema"

export function SignUpForm() {
  const signUp = useSignUp()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      whatsappNumber: "",
    },
  })

  const onSubmit = (values: SignUpFormValues) => {
    signUp.mutate(toSignUpBody(values), {
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "Sign up failed. Please try again."
        form.setError("root", { message })
      },
    })
  }

  return (
    <FormRoot form={form} onSubmit={onSubmit} className="space-y-4">
      <TextInput name="name" label="Full name" placeholder="Your full name" />
      <TextInput
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />
      <PasswordInput
        name="password"
        description="At least 8 characters"
      />
      <TextInput
        name="phoneNumber"
        label="Phone (optional)"
        type="tel"
        placeholder="+96170123456"
      />
      <TextInput
        name="whatsappNumber"
        label="WhatsApp (optional)"
        type="tel"
        placeholder="+96170123456"
      />

      {form.formState.errors.root ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={signUp.isPending}>
        {signUp.isPending ? "Creating account…" : "Create account"}
      </Button>
    </FormRoot>
  )
}
