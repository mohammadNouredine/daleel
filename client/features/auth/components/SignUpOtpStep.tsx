"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormRoot } from "@/components/forms/FormRoot"
import { useResendOtp } from "../hooks/use-resend-otp"
import { useVerifyOtp } from "../hooks/use-verify-otp"
import {
  verifyOtpSchema,
  type VerifyOtpFormValues,
} from "../schemas/verify-otp.schema"
import { OtpInput, useOtpCountdown } from "./OtpInput"

const RESEND_COOLDOWN_SECONDS = 60

type SignUpOtpStepProps = {
  email: string
  onBack: () => void
}

export function SignUpOtpStep({ email, onBack }: SignUpOtpStepProps) {
  const verifyOtp = useVerifyOtp()
  const resendOtp = useResendOtp()
  const { secondsLeft, canResend, reset } = useOtpCountdown(
    RESEND_COOLDOWN_SECONDS
  )

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  })

  const otpValue = form.watch("otp")

  const onSubmit = (values: VerifyOtpFormValues) => {
    verifyOtp.mutate(
      { email, otp: values.otp },
      {
        onError: (error) => {
          const message =
            error.message.trim() || "Verification failed. Please try again."
          form.setError("root", { message })
        },
      }
    )
  }

  const handleResend = () => {
    if (!canResend || resendOtp.isPending) return

    resendOtp.mutate(
      { email },
      {
        onSuccess: () => {
          reset(RESEND_COOLDOWN_SECONDS)
          form.clearErrors("root")
        },
        onError: (error) => {
          const message =
            error.message.trim() || "Unable to resend code. Please try again."
          form.setError("root", { message })
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <FormRoot form={form} onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" {...form.register("otp")} />

        <OtpInput
          value={otpValue}
          onChange={(value) =>
            form.setValue("otp", value, { shouldValidate: true })
          }
          disabled={verifyOtp.isPending}
        />

        {form.formState.errors.otp ? (
          <p className="text-center text-sm text-destructive">
            {form.formState.errors.otp.message}
          </p>
        ) : null}

        {form.formState.errors.root ? (
          <p className="text-center text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={verifyOtp.isPending || otpValue.length !== 6}
        >
          {verifyOtp.isPending ? "Verifying…" : "Verify and create account"}
        </Button>
      </FormRoot>

      <div className="flex flex-col items-center gap-2 text-sm">
        {canResend ? (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            disabled={resendOtp.isPending}
            onClick={handleResend}
          >
            {resendOtp.isPending ? "Sending…" : "Resend code"}
          </Button>
        ) : (
          <p className="text-muted-foreground">
            Resend code in {secondsLeft}s
          </p>
        )}

        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-muted-foreground"
          onClick={onBack}
        >
          Use a different email
        </Button>
      </div>
    </div>
  )
}
