import type { ReferenceOption } from "../types"

export function toSelectOptions(
  items: ReferenceOption[] | undefined
): { value: string; label: string }[] {
  return items ?? []
}

export function getReferenceLabel(
  items: ReferenceOption[] | undefined,
  value: string
): string {
  return items?.find((item) => item.value === value)?.label ?? value
}
