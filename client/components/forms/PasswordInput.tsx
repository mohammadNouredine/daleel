"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFormContext } from "react-hook-form"

type PasswordInputProps = {
  name: string
  label?: string
  placeholder?: string
  description?: string
}

export function PasswordInput({
  name,
  label = "Password",
  placeholder = "Enter your password",
  description,
}: PasswordInputProps) {
  const form = useFormContext()
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <div className="relative">
              <Input
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                className="pr-10"
                {...field}
                value={(field.value as string) ?? ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? (
                  <EyeOff className="size-4 text-muted-foreground" />
                ) : (
                  <Eye className="size-4 text-muted-foreground" />
                )}
              </Button>
            </div>
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
