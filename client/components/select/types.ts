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
  /**
   * Value that means "no selection" / default. When current value differs,
   * a clear (X) button is shown. Omit to disable per-field clear.
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

export function canClearSelectValue(
  value: string | undefined,
  clearValue: string | undefined
): boolean {
  return clearValue !== undefined && (value ?? "") !== clearValue
}
