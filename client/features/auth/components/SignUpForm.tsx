"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormRoot } from "@/components/forms/FormRoot"
import { PasswordInput } from "@/components/forms/PasswordInput"
import { TextInput } from "@/components/forms/TextInput"
import { useRequestOtp } from "../hooks/use-request-otp"
import {
  signUpSchema,
  toSignUpBody,
  type SignUpFormValues,
} from "../schemas/sign-up.schema"
import { SignUpOtpStep } from "./SignUpOtpStep"

export function SignUpForm() {
  const requestOtp = useRequestOtp()
  const [step, setStep] = useState<"details" | "otp">("details")
  const [pendingEmail, setPendingEmail] = useState("")

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
    requestOtp.mutate(toSignUpBody(values), {
      onSuccess: () => {
        setPendingEmail(values.email.trim())
        setStep("otp")
      },
      onError: (error) => {
        const message =
          error.message.trim() || "Sign up failed. Please try again."
        form.setError("root", { message })
      },
    })
  }

  if (step === "otp") {
    return (
      <SignUpOtpStep
        email={pendingEmail}
        onBack={() => {
          setStep("details")
          setPendingEmail("")
        }}
      />
    )
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

      <Button type="submit" className="w-full" disabled={requestOtp.isPending}>
        {requestOtp.isPending ? "Sending code…" : "Continue"}
      </Button>
    </FormRoot>
  )
}
