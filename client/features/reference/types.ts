import type { AppLocale } from "@/lib/locale"

export type ReferenceOption = {
  value: string
  label: string
}

export type HelpRequestReferenceResponse = {
  locale: AppLocale
  helpTypes: ReferenceOption[]
  subCategories: ReferenceOption[]
}
