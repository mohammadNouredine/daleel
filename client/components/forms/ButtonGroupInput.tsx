"use client"

import { Button } from "@/components/ui/button"
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

export type ButtonGroupOption = {
  value: string
  label: string
}

type ButtonGroupInputProps = {
  name: string
  label?: string
  description?: string
  options: readonly ButtonGroupOption[]
  columns?: 2 | 3 | 4
}

export function ButtonGroupInput({
  name,
  label,
  description,
  options,
  columns = 3,
}: ButtonGroupInputProps) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormControl>
            <div
              className={cn(
                "grid gap-2",
                columns === 2 && "grid-cols-2",
                columns === 3 && "grid-cols-3",
                columns === 4 && "grid-cols-4",
              )}
            >
              {options.map((option) => {
                const isSelected = field.value === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "h-8 text-xs",
                      isSelected && "ring-2 ring-primary ring-offset-2",
                    )}
                    onClick={() => field.onChange(option.value)}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
