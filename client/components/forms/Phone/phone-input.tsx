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
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"
import { DEFAULT_PHONE_CODE } from "./phone-codes"
import { PhoneCodeSelect } from "./phone-code-select"
import { normalizePhoneDigits } from "./phone-utils"

export type PhoneInputProps = {
  /** Form field for dial code, e.g. "+961" */
  codeName?: string
  /** Form field for local number digits */
  phoneName?: string
  label?: string
  description?: string
  phonePlaceholder?: string
  className?: string
}

function PhoneCodeSelectField({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-0", className)}>
          <FormControl>
            <PhoneCodeSelect
              value={(field.value as string) || DEFAULT_PHONE_CODE}
              onChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

export function PhoneInput({
  codeName = "phoneCode",
  phoneName = "phoneNumber",
  label = "Phone number",
  description,
  phonePlaceholder = "e.g. 71 123 456",
  className,
}: PhoneInputProps) {
  const form = useFormContext()

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <FormLabel>{label}</FormLabel> : null}
      {description ? <FormDescription>{description}</FormDescription> : null}

      <div className="flex gap-2">
        <PhoneCodeSelectField name={codeName} className="w-[7.25rem] shrink-0" />
        <FormField
          control={form.control}
          name={phoneName}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1 space-y-0">
              <FormControl>
                <Input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder={phonePlaceholder}
                  {...field}
                  value={(field.value as string) ?? ""}
                  onChange={(event) => {
                    field.onChange(normalizePhoneDigits(event.target.value))
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={codeName}
        render={() => (
          <FormItem className="space-y-0">
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={phoneName}
        render={() => (
          <FormItem className="space-y-0">
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
