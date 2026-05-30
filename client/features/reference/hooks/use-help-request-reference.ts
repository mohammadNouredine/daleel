"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import { useAppLocale, type AppLocale } from "@/lib/locale"
import {
  HELP_REQUEST_REFERENCE_QUERY_KEY,
  REFERENCE_HELP_REQUEST_OPTIONS,
} from "../endpoints"
import type { HelpRequestReferenceResponse } from "../types"

const REFERENCE_STALE_TIME = 24 * 60 * 60 * 1000

export function useHelpRequestReference(locale?: AppLocale) {
  const appLocale = useAppLocale()
  const resolvedLocale = locale ?? appLocale

  const query = useReadData<HelpRequestReferenceResponse>({
    queryKey: [...HELP_REQUEST_REFERENCE_QUERY_KEY, resolvedLocale],
    endpoint: REFERENCE_HELP_REQUEST_OPTIONS,
    params: { locale: resolvedLocale },
    staleTime: REFERENCE_STALE_TIME,
    refetchOnWindowFocus: false,
  })

  return {
    locale: resolvedLocale,
    helpTypes: query.data?.helpTypes ?? [],
    subCategories: query.data?.subCategories ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
