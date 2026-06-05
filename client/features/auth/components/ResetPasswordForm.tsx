"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormRoot } from "@/components/forms/FormRoot"
import { PasswordInput } from "@/components/forms/PasswordInput"
import { useResetPassword } from "../hooks/use-reset-password"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password.schema"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const resetPassword = useResetPassword()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">
          This reset link is invalid or has expired.
        </p>
        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPassword.mutate(
      {
        newPassword: values.newPassword,
        token,
      },
      {
        onError: (error) => {
          form.setError("root", {
            message: error.message || "Could not reset password.",
          })
        },
      }
    )
  }

  return (
    <FormRoot form={form} onSubmit={onSubmit} className="space-y-4">
      <PasswordInput name="newPassword" label="New password" />
      <PasswordInput name="confirmPassword" label="Confirm new password" />

      {form.formState.errors.root ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
        {resetPassword.isPending ? "Updating…" : "Reset password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </FormRoot>
  )
}
