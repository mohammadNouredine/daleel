"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormRoot } from "@/components/forms/form-root"
import { PasswordInput } from "@/components/forms/password-input"
import { TextInput } from "@/components/forms/text-input"
import { ApiError } from "@/lib/api/client"
import { useSignIn } from "../hooks/use-sign-in"
import {
  signInSchema,
  type SignInFormValues,
} from "../schemas/sign-in.schema"

export function SignInForm() {
  const signIn = useSignIn()

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: SignInFormValues) => {
    signIn.mutate(values, {
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "Sign in failed. Please try again."
        form.setError("root", { message })
      },
    })
  }

  return (
    <FormRoot form={form} onSubmit={onSubmit} className="space-y-4">
      <TextInput
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />
      <PasswordInput name="password" />

      {form.formState.errors.root ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={signIn.isPending}>
        {signIn.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </FormRoot>
  )
}
