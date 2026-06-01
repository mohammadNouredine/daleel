---
name: backend-to-frontend-hooks
description: Wires existing NestJS API routes into Daleel client feature folders (types.ts, endpoints.ts, schemas/, hooks/) using useReadData, useInfiniteReadData, and mutation service hooks. Use when backend APIs exist, when adding React Query hooks for a feature, property-listings frontend, or when the user asks to connect endpoints to hooks.
---

# Backend APIs → Frontend hooks (Daleel)

Use when **backend routes already exist** (see [schema-to-nestjs-api](../schema-to-nestjs-api/SKILL.md)). For full-stack from UI mocks, use [frontend-to-backend-api](../frontend-to-backend-api/SKILL.md) instead.

## Feature folder layout

```
client/features/<feature>/
  types.ts              # API response + domain const objects (mirror backend enums)
  endpoints.ts          # All URL strings + query keys (no URLs in hooks/components)
  schemas/              # Zod for forms only (not for API transport unless needed)
  hooks/
    use-<action>.ts     # One hook per API action
  utils/                # map-form-to-*, filters (optional)
  components/           # Wire hooks here (out of scope unless asked)
```

Reference: [`client/features/help-requests/`](../../../client/features/help-requests/).

---

## Workflow

1. **Inventory backend** — Read controller + mapper/DTOs; list method, path, auth, request body, response shape.
2. **Add `types.ts`** — Match API JSON exactly (`_id` as string, ISO dates, enum string unions).
3. **Add `endpoints.ts`** — Base path `/api/v1/<resource>`; named exports + helper functions for `:id` routes; `as const` query keys.
4. **Add hooks** — One file per action; only use API service layer (never raw `axios`/`fetch` in feature hooks).
5. **Invalidate** — Mutations invalidate every query key that shows affected data.
6. **Wire UI** — Replace mocks/local state (only if requested).

---

## `endpoints.ts`

```ts
const BASE = "/api/v1/property-listings"

export const PROPERTY_LISTINGS_LIST = BASE
export const PROPERTY_LISTINGS_MINE = `${BASE}/mine`
export const PROPERTY_LISTINGS_PENDING = `${BASE}/moderation/pending`
export const PROPERTY_LISTINGS_CREATE = BASE

export const PROPERTY_LISTINGS_QUERY_KEY = ["property-listings"] as const
export const MY_PROPERTY_LISTINGS_QUERY_KEY = ["property-listings", "mine"] as const

export function propertyListingDetailEndpoint(id: string): string {
  return `${BASE}/${id}`
}

export function propertyListingApproveEndpoint(id: string): string {
  return `${BASE}/${id}/approve`
}
```

Rules:

- Every path starts with `/api/v1/` (axios `baseURL` is host only — see [`axios-client.ts`](../../../client/lib/axios-client.ts)).
- Dynamic segments → functions (`propertyListingUpdateEndpoint(id)`), not string concat in hooks.
- Export **query keys** next to endpoints; reuse in all hooks for that resource.

---

## `types.ts`

- Mirror backend mapper output field-for-field.
- Prefer `const` objects + derived types (same pattern as help-requests):

```ts
export const PropertyListingStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  // ...
} as const

export type PropertyListingStatusValue =
  (typeof PropertyListingStatus)[keyof typeof PropertyListingStatus]

export type PropertyListing = {
  _id: string
  ownerId: string
  status: PropertyListingStatusValue
  title: string
  // ...
  createdAt: string
  updatedAt: string
}
```

- Add **paginated wrapper** types when API returns `{ items, nextLastId }`:

```ts
export type PropertyListingPaginatedResponse = {
  items: PropertyListing[]
  nextLastId: string | null
}
```

- Request/input types only when the hook body differs from the entity (e.g. `CreatePropertyReportInput`).

Do not duplicate enums with different casing than the API (backend uses `SCREAMING_SNAKE`).

---

## `schemas/` (forms only)

- Zod schemas for react-hook-form in UI.
- Keep API payload building in `utils/map-form-to-*.ts` or FormData builders — not inside hooks.
- Do not add Zod schemas for every DTO unless the UI form needs them.

---

## Hook selection matrix

| API pattern | Service hook | Notes |
|-------------|--------------|-------|
| `GET` list/detail | `useReadData<T>` | Pass `params` for query string filters |
| `GET` cursor list (`lastId`) | `useInfiniteReadData<TPage>` | See below |
| `POST`/`PATCH` JSON body | `usePostData` / `useUpdateData` | Only if API wraps `{ data, message }` |
| `POST`/`PATCH` JSON direct entity | `useMutation` + `sendToApi` | Help-requests style — returns entity directly |
| `POST`/`PATCH` multipart `payload` + `files` | `usePostFormData` / `usePatchFormData` or custom `useMutation` + `sendFormDataToApi` | See help-requests |
| `DELETE` | `useDeleteData` or `useMutation` + `sendToApi` | |

**Default for Daleel domain modules** (help-requests, property-listings): responses are usually **unwrapped entities** — use `useReadData` / `useMutation` + `sendToApi` / `sendFormDataToApi`, not `usePostData`, unless the route uses the auth `{ data, message }` envelope.

---

## `useReadData` (list / detail)

```ts
"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import { HELP_REQUESTS_LIST, HELP_REQUESTS_QUERY_KEY } from "../endpoints"
import type { HelpRequest } from "../types"

export function useHelpRequests({ filters, enabled = true }: Params) {
  return useReadData<HelpRequest[]>({
    queryKey: [...HELP_REQUESTS_QUERY_KEY, /* filter dimensions */],
    endpoint: HELP_REQUESTS_LIST,
    params: {
      governorate: filters.governorate === "all" ? undefined : filters.governorate,
    },
    enabled,
    staleTime: 30_000,
  })
}
```

- Put **filter dimensions in `queryKey`** so cache splits correctly.
- Omit `undefined` params (do not send `"all"` to API).

---

## `useInfiniteReadData` (cursor / `lastId`)

Backend contract (property-listings public feed):

```json
{ "items": [...], "nextLastId": "..." | null }
```

Hook in [`use-infinite-read-data.ts`](../../../client/lib/api/services/use-infinite-read-data.ts) appends `?lastId=` on pages after the first; **filters stay in `params`**.

```ts
"use client"

import { useInfiniteReadData } from "@/lib/api/services/use-infinite-read-data"
import { PROPERTY_LISTINGS_LIST, PROPERTY_LISTINGS_QUERY_KEY } from "../endpoints"
import type { PropertyListingPaginatedResponse } from "../types"

type Filters = { listingType?: string; governorate?: string; limit?: number }

export function usePropertyListingsInfinite(filters: Filters) {
  return useInfiniteReadData<PropertyListingPaginatedResponse, string | null>({
    queryKey: [...PROPERTY_LISTINGS_QUERY_KEY, "infinite", filters],
    endpoint: PROPERTY_LISTINGS_LIST,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextLastId,
    params: {
      listingType: filters.listingType,
      governorate: filters.governorate,
      limit: filters.limit ?? 20,
    },
    staleTime: 30_000,
  })
}
```

UI consumption: `data?.pages.flatMap((p) => p.items) ?? []`, `fetchNextPage`, `hasNextPage: !!hasNextPage`.

---

## Mutations (one action per hook)

### JSON PATCH/POST (direct entity response)

```ts
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingApproveEndpoint,
} from "../endpoints"
import type { PropertyListing } from "../types"

export function useApprovePropertyListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<PropertyListing>(propertyListingApproveEndpoint(id), {}, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_LISTINGS_QUERY_KEY })
      toast.success("Listing approved")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
```

### Multipart create (help-requests pattern)

```ts
export function useCreateHelpRequest(options?: { onSuccess?: (data: HelpRequest) => void }) {
  return usePostFormData<HelpRequest>({
    endpoint: HELP_REQUESTS_CREATE,
    queryKeysToInvalidate: [HELP_REQUESTS_QUERY_KEY, MY_HELP_REQUESTS_QUERY_KEY],
    callBackOnSuccess: options?.onSuccess,
  })
}
```

Caller builds `FormData`: `formData.append("payload", JSON.stringify(dto))`, then files.

### Delete

```ts
import { useDeleteData } from "@/lib/api/services/use-delete-data"

export function useDeletePropertyListing() {
  return useDeleteData({
    endpoint: PROPERTY_LISTINGS_CREATE, // pass full path via mutation arg if hook supports it
    queryKeysToInvalidate: [PROPERTY_LISTINGS_QUERY_KEY, MY_PROPERTY_LISTINGS_QUERY_KEY],
  })
}
```

If `useDeleteData` only accepts a static endpoint, use `useMutation` + `sendToApi(url, undefined, "DELETE")` with `propertyListingDeleteEndpoint(id)` (help-requests pattern).

---

## Hook file rules

| Rule | Detail |
|------|--------|
| Single responsibility | `use-create-property-listing.ts` only creates |
| `"use client"` | Top of every hook file |
| No UI logic | No `toast` in feature hook if using `usePostFormData` (toasts centralized there) |
| `onSuccess` | Optional callback param when parent needs side effects |
| No hardcoded URLs | Import from `../endpoints` only |
| Strong typing | `useReadData<Entity>`, mutation generics for body/response |

---

## Map backend routes → hooks (template)

| Backend | Hook file |
|---------|-----------|
| `GET /resource` (paginated) | `use-resource-infinite.ts` or `use-resource-list.ts` |
| `GET /resource/mine` | `use-my-resource.ts` |
| `GET /resource/moderation/pending` | `use-pending-resource.ts` |
| `GET /resource/:id` | `use-resource-detail.ts` |
| `POST /resource` | `use-create-resource.ts` |
| `PATCH /resource/:id` | `use-update-resource.ts` |
| `DELETE /resource/:id` | `use-delete-resource.ts` |
| `PATCH /resource/:id/approve` | `use-approve-resource.ts` |
| `POST /resource/:id/favorite` | `use-favorite-resource.ts` |
| `POST /property-reports` | `use-create-property-report.ts` |
| `GET /amenities` | `use-amenities.ts` |

---

## Checklist

```
- [ ] Backend routes documented (method, path, body, response)
- [ ] types.ts matches API responses; paginated wrapper if applicable
- [ ] endpoints.ts has paths, helpers, query keys
- [ ] One hook per action; uses useReadData / useInfiniteReadData / service mutations only
- [ ] queryKey includes filter dimensions; mutations invalidate affected keys
- [ ] No URLs in components; no raw axios in feature hooks
- [ ] schemas/ only for forms; utils/ for FormData + mapping
- [ ] client tsc passes
```

---

## Related rules

- `.cursor/rules/client-feature-api.mdc`
- `.cursor/rules/client-api-hook-design.mdc`
- `.cursor/rules/client-endpoints.mdc`
- `.cursor/rules/client-react-query.mdc`

## Related skills

- Backend APIs: [schema-to-nestjs-api](../schema-to-nestjs-api/SKILL.md)
- End-to-end: [frontend-to-backend-api](../frontend-to-backend-api/SKILL.md)
