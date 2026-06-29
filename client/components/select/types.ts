import type { ReactNode } from "react"

export type SelectOption = {
  value: string
  label: string
}

/** Shared props for form and standalone selects (same shape). */
export type SelectControlProps = {
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  /** Standalone label above the control (e.g. filter bars). */
  label?: string
  description?: string
  helpText?: string
  lightLabelText?: string
  /** Shown below the control (e.g. sort hint). */
  hint?: ReactNode
  className?: string
  /** Override trigger label when the portaled list cannot resolve the value. */
  displayValue?: string
  /** When true, shows a small clear (×) when the value differs from `clearValue`. */
  clearable?: boolean
  /**
   * Value to reset to when clearing. Defaults to `""` when `clearable` is true.
   * `clearValue` alone (without `clearable`) still enables clear for backward compatibility.
   */
  clearValue?: string
}

export type SelectControlValueProps = SelectControlProps & {
  value: string
  onValueChange: (value: string) => void
}

export function resolveSelectedLabel(
  value: string | undefined,
  options: SelectOption[],
  displayValue?: string
): string {
  if (displayValue) return displayValue
  if (!value) return ""
  return options.find((option) => option.value === value)?.label ?? value
}

export function resolveSelectClearValue(
  clearable?: boolean,
  clearValue?: string
): string | undefined {
  if (clearValue !== undefined) return clearValue
  if (clearable) return ""
  return undefined
}

export function canClearSelectValue(
  value: string | undefined,
  clearable?: boolean,
  clearValue?: string
): boolean {
  const resetValue = resolveSelectClearValue(clearable, clearValue)
  return resetValue !== undefined && (value ?? "") !== resetValue
}
