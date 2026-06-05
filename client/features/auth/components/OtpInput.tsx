"use client"

import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

const OTP_LENGTH = 6

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function OtpInput({
  value,
  onChange,
  disabled = false,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH)

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join("").replace(/\s/g, "").slice(0, OTP_LENGTH))
  }

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = digit || " "
    updateValue(next)
    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      if (digits[index]?.trim()) {
        const next = [...digits]
        next[index] = " "
        updateValue(next)
        return
      }
      if (index > 0) {
        focusInput(index - 1)
        const next = [...digits]
        next[index - 1] = " "
        updateValue(next)
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1)
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
    onChange(pasted)
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-12 w-10 rounded-md border border-input bg-background text-center text-lg font-semibold",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  )
}

export function useOtpCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  const reset = useCallback((seconds: number = initialSeconds) => {
    setSecondsLeft(seconds)
  }, [initialSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft])

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    reset,
  }
}
