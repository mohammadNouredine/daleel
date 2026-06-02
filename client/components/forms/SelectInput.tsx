"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFormContext } from "react-hook-form"

type SelectOption = {
  value: string
  label: string
}

type SelectInputProps = {
  name: string
  label?: string
  placeholder?: string
  description?: string
  options: SelectOption[]
  disabled?: boolean
  /** Override trigger label when item text cannot be resolved (e.g. portaled selects). */
  displayValue?: string
}

function resolveSelectedLabel(
  value: string | undefined,
  options: SelectOption[],
  displayValue?: string
): string {
  if (displayValue) return displayValue
  if (!value) return ""
  return options.find((option) => option.value === value)?.label ?? value
}

export function SelectInput({
  name,
  label,
  placeholder = "Select…",
  description,
  options,
  disabled = false,
  displayValue,
}: SelectInputProps) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const rawValue = (field.value as string | undefined) ?? ""
        const selectedLabel = resolveSelectedLabel(
          rawValue,
          options,
          displayValue
        )

        return (
          <FormItem>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <Select
              value={rawValue}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="w-full" disabled={disabled}>
                  <SelectValue placeholder={placeholder}>
                    {selectedLabel || null}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
