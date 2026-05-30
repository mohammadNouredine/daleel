"use client"

import { useSyncExternalStore } from "react"

export type AppLocale = "en" | "ar"

const SUPPORTED_LOCALES: AppLocale[] = ["en", "ar"]

function parseLocale(value: string | null | undefined): AppLocale {
  if (value === "ar") {
    return "ar"
  }
  return "en"
}

function getDocumentLocale(): AppLocale {
  if (typeof document === "undefined") {
    return "en"
  }
  return parseLocale(document.documentElement.lang)
}

function subscribeToLocale(onStoreChange: () => void) {
  if (typeof document === "undefined") {
    return () => undefined
  }

  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  })

  return () => observer.disconnect()
}

export function useAppLocale(): AppLocale {
  return useSyncExternalStore(
    subscribeToLocale,
    getDocumentLocale,
    () => "en"
  )
}

export function isAppLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale)
}
