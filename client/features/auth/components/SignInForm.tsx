"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormRoot } from "@/components/forms/FormRoot"
import { PasswordInput } from "@/components/forms/PasswordInput"
import { TextInput } from "@/components/forms/TextInput"
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
          error.message.trim() || "Sign in failed. Please try again."
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

      <div className="text-right">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Forgot password?
        </Link>
      </div>

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
