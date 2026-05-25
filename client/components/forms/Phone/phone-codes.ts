export type PhoneCodeOption = {
  label: string
  value: string
  code: string
}

export const PHONE_CODES: PhoneCodeOption[] = [
  { label: "Argentina +54", value: "+54", code: "AR" },
  { label: "Australia +61", value: "+61", code: "AU" },
  { label: "Bahrain +973", value: "+973", code: "BH" },
  { label: "Belgium +32", value: "+32", code: "BE" },
  { label: "Bosnia and Herzegovina +387", value: "+387", code: "BA" },
  { label: "Brazil +55", value: "+55", code: "BR" },
  { label: "Canada +1", value: "+1", code: "CA" },
  { label: "Chad +235", value: "+235", code: "TD" },
  { label: "Chile +56", value: "+56", code: "CL" },
  { label: "China +86", value: "+86", code: "CN" },
  { label: "Colombia +57", value: "+57", code: "CO" },
  { label: "Cuba +53", value: "+53", code: "CU" },
  { label: "Cyprus +357", value: "+357", code: "CY" },
  { label: "Denmark +45", value: "+45", code: "DK" },
  { label: "Egypt +20", value: "+20", code: "EG" },
  { label: "France +33", value: "+33", code: "FR" },
  { label: "Germany +49", value: "+49", code: "DE" },
  { label: "Ghana +233", value: "+233", code: "GH" },
  { label: "India +91", value: "+91", code: "IN" },
  { label: "Iran +98", value: "+98", code: "IR" },
  { label: "Iraq +964", value: "+964", code: "IQ" },
  { label: "Italy +39", value: "+39", code: "IT" },
  { label: "Japan +81", value: "+81", code: "JP" },
  { label: "Kuwait +965", value: "+965", code: "KW" },
  { label: "Lebanon +961", value: "+961", code: "LB" },
  { label: "Libya +218", value: "+218", code: "LY" },
  { label: "Mexico +52", value: "+52", code: "MX" },
  { label: "Morocco +212", value: "+212", code: "MA" },
  { label: "Netherlands +31", value: "+31", code: "NL" },
  { label: "New Zealand +64", value: "+64", code: "NZ" },
  { label: "Nigeria +234", value: "+234", code: "NG" },
  { label: "Oman +968", value: "+968", code: "OM" },
  { label: "Pakistan +92", value: "+92", code: "PK" },
  { label: "Palestine +970", value: "+970", code: "PS" },
  { label: "Poland +48", value: "+48", code: "PL" },
  { label: "Portugal +351", value: "+351", code: "PT" },
  { label: "Qatar +974", value: "+974", code: "QA" },
  { label: "Romania +40", value: "+40", code: "RO" },
  { label: "Russia +7", value: "+7", code: "RU" },
  { label: "Saudi Arabia +966", value: "+966", code: "SA" },
  { label: "Spain +34", value: "+34", code: "ES" },
  { label: "Switzerland +41", value: "+41", code: "CH" },
  { label: "Syria +963", value: "+963", code: "SY" },
  { label: "Tunisia +216", value: "+216", code: "TN" },
  { label: "Turkey +90", value: "+90", code: "TR" },
  { label: "Ukraine +380", value: "+380", code: "UA" },
  { label: "United Arab Emirates +971", value: "+971", code: "AE" },
  { label: "United Kingdom +44", value: "+44", code: "GB" },
  { label: "United States +1", value: "+1", code: "US" },
  { label: "Venezuela +58", value: "+58", code: "VE" },
  { label: "Yemen +967", value: "+967", code: "YE" },
]

export const DEFAULT_PHONE_CODE = "+961"

export function findPhoneCode(value: string) {
  return PHONE_CODES.find((item) => item.value === value)
}
