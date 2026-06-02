"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"
import { FieldHelpHint } from "./FieldHelpHint"

type RangeSelectGroupProps = {
  name: string
  min: number
  max: number
  multiple?: boolean
  label: string
  description?: string
  helpText?: string
}

export function RangeSelectGroup({
  name,
  min,
  max,
  multiple = false,
  label,
  description,
  helpText,
}: RangeSelectGroupProps) {
  const form = useFormContext()
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selected = multiple
          ? ((field.value as string[] | undefined) ?? [])
          : [String(field.value ?? "")]

        const toggle = (value: number) => {
          const str = String(value)
          if (multiple) {
            const next = selected.includes(str)
              ? selected.filter((v) => v !== str)
              : [...selected, str]
            field.onChange(next)
          } else {
            field.onChange(str)
          }
        }

        return (
          <FormItem>
            <div className="flex items-center gap-1.5">
              <FormLabel>{label}</FormLabel>
              {helpText ? <FieldHelpHint text={helpText} /> : null}
            </div>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const str = String(option)
                  const active = selected.includes(str)
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggle(option)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-sm transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
