"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"

type TextInputProps = {
  name: string
  label?: string
  placeholder?: string
  type?: React.ComponentProps<"input">["type"]
  description?: string
  min?: React.ComponentProps<"input">["min"]
  step?: React.ComponentProps<"input">["step"]
}

export function TextInput({
  name,
  label,
  placeholder,
  type = "text",
  description,
  min,
  step,
}: TextInputProps) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              min={min}
              step={step}
              {...field}
              value={(field.value as string) ?? ""}
            />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
