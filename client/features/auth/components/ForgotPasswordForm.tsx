"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormRoot } from "@/components/forms/FormRoot"
import { TextInput } from "@/components/forms/TextInput"
import { useRequestPasswordReset } from "../hooks/use-request-password-reset"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgot-password.schema"

export function ForgotPasswordForm() {
  const requestReset = useRequestPasswordReset()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (values: ForgotPasswordFormValues) => {
    requestReset.mutate(
      {
        email: values.email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      },
      {
        onSuccess: () => {
          form.reset()
        },
        onError: (error) => {
          form.setError("root", {
            message: error.message || "Could not send reset email.",
          })
        },
      }
    )
  }

  return (
    <FormRoot form={form} onSubmit={onSubmit} className="space-y-4">
      <TextInput
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />

      {form.formState.errors.root ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={requestReset.isPending}>
        {requestReset.isPending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </FormRoot>
  )
}
