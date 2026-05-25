import { DEFAULT_PHONE_CODE, PHONE_CODES, type PhoneCodeOption } from "./phone-codes"

const SORTED_PHONE_CODES = [...PHONE_CODES].sort(
  (a, b) => b.value.length - a.value.length
)

export function countryCodeToFlag(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) return ""
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    )
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function formatWhatsAppUrl(fullPhone: string): string {
  const digits = fullPhone.replace(/\D/g, "")
  if (!digits) return ""
  return `https://wa.me/${digits}`
}

export function formatContactPhone(code: string, number: string): string {
  const digits = normalizePhoneDigits(number)
  if (!digits) return ""
  return `${code}${digits}`
}

export function splitContactPhone(full?: string): {
  phoneCode: string
  phoneNumber: string
} {
  const trimmed = full?.trim()
  if (!trimmed) {
    return { phoneCode: DEFAULT_PHONE_CODE, phoneNumber: "" }
  }

  const normalized = trimmed.startsWith("+") ? trimmed : `+${trimmed}`

  for (const item of SORTED_PHONE_CODES) {
    if (normalized.startsWith(item.value)) {
      return {
        phoneCode: item.value,
        phoneNumber: normalized.slice(item.value.length),
      }
    }
  }

  return {
    phoneCode: DEFAULT_PHONE_CODE,
    phoneNumber: normalizePhoneDigits(normalized),
  }
}

export function filterPhoneCodes(query: string): PhoneCodeOption[] {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, "")
  if (!normalized) {
    return PHONE_CODES
  }

  const digitsOnly = normalized.replace(/\D/g, "")

  return PHONE_CODES.filter((item) => {
    const labelLower = item.label.toLowerCase()
    const countryName = labelLower.split("+")[0]?.trim() ?? labelLower
    const dialDigits = item.value.replace(/\D/g, "")

    return (
      labelLower.replace(/\s+/g, "").includes(normalized) ||
      countryName.replace(/\s+/g, "").includes(normalized) ||
      item.code.toLowerCase().includes(normalized) ||
      item.value.toLowerCase().includes(normalized) ||
      (digitsOnly.length > 0 && dialDigits.includes(digitsOnly))
    )
  })
}
