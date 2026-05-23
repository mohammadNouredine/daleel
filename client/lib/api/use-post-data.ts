"use client"

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { apiFetch } from "./client"

type UsePostDataOptions<TBody, TResponse> = Omit<
  UseMutationOptions<TResponse, Error, TBody>,
  "mutationFn"
> & {
  skipAuth?: boolean
}

export function usePostData<TBody, TResponse>(
  endpoint: string,
  options?: UsePostDataOptions<TBody, TResponse>
) {
  const { skipAuth, ...mutationOptions } = options ?? {}

  return useMutation({
    mutationFn: (body: TBody) =>
      apiFetch<TResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        skipAuth,
      }),
    ...mutationOptions,
  })
}
