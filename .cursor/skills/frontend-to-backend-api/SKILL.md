---
name: frontend-to-backend-api
description: Wires an existing frontend feature to a real NestJS/MongoDB backend by reading UI types and forms first, aligning schemas, building APIs, adding thin React Query hooks, replacing mock state, and deleting dummy data. Use when connecting frontend to backend, replacing mock-data, implementing CRUD for a feature, or when the user asks to make the UI use real APIs.
---

# Frontend-to-Backend API Integration

Follow this workflow **in order**. Do not skip steps or add speculative fields/endpoints.

## Workflow

1. look for the frontend implementation
2. go to the schema and edit or create needed collections & fields and make the necessary relations
3. then make apis for the feature
4. then go to the frontend
5. make the necessary hooks to call the apis using the current structure and not wasting extra code
6. then implement them in the interface
7. and lastly remove any dummy data was used to display on the frontend

---

## Step 1 — Read the frontend first

Start in `client/features/<feature>/`:

| Read | Why |
|------|-----|
| `types.ts` | Domain shapes the API must return |
| `schemas/*.schema.ts` | Validation rules → DTO constraints |
| `utils/map-form-to-request.ts` | Form ↔ API payload mapping |
| `components/*-view.tsx` | What actions the UI performs (list, create, edit, delete, manage) |
| `mock-data.ts` / `mock-*.ts` | Current dummy shapes — delete after wiring |
| `constants.ts` | Keep client-only config; move shared labels/options to backend reference API if needed |

Note every user action currently handled by local state (e.g. `useState(MOCK_*)`, manual `setRequests`).

**Align frontend types with backend reality.** If the frontend model diverged from an existing Mongoose schema (e.g. `needs[]` vs legacy `quantity`), update the backend schema to match the **current frontend contract**, not the other way around — unless the user says otherwise.

---

## Step 2 — Schema & relations (backend)

Location: `backend/src/modules/<feature>/`

```
schemas/<entity>.schema.ts   # Mongoose @Schema classes
dto/                         # Request/response DTOs + class-validator
<feature>.service.ts         # Business logic
<feature>.controller.ts      # Thin HTTP layer
<feature>.module.ts
```

Rules:
- Reuse enums from `backend/src/common/enums/` — do not duplicate string literals
- Use `Types.ObjectId` + `ref` for relations (e.g. `createdBy → users`)
- Add indexes for fields used in filters/sorts
- Validate incoming DTOs; never trust client shapes blindly
- Register module in `backend/src/app.module.ts`
- Global prefix is `api/v1`

---

## Step 3 — Build the APIs

One endpoint per UI action. Typical set:

| UI action | Method | Pattern |
|-----------|--------|---------|
| List / feed | `GET` | Paginate if list can grow |
| Detail | `GET /:id` | |
| Create | `POST` | Return created entity |
| Update | `PATCH /:id` | |
| Delete | `DELETE /:id` | Soft-delete if schema has `deletedAt` |
| Domain-specific (manage progress, etc.) | `POST` or `PATCH` | Match existing dialog payload |

Controller stays thin — logic in service. Add Swagger decorators. Auth-protected routes use `@Session()` like `users.controller.ts`; public reference data goes in a `reference` module.

**After adding routes:** rebuild/restart backend and confirm routes appear in startup logs (`Mapped {/api/v1/...}`).

---

## Step 4 — Frontend hooks (feature folder)

Location: `client/features/<feature>/`

```
types.ts          # Request/response DTOs (mirror backend)
endpoints.ts      # All URL strings — no hardcoded paths in hooks/components
hooks/            # One hook per API action
schemas/          # Zod (keep existing)
```

### Hook rules (mandatory)

- Use `useReadData`, `usePostData`, `useUpdateData`, `useDeleteData`, `useInfiniteReadData` from `client/lib/api/services/`
- **Never** call `fetch`/`axios` directly in feature hooks
- One hook = one API action; strongly typed input/output
- Centralize query keys in `endpoints.ts` or next to hooks
- Mutations must `queryKeysToInvalidate` for affected lists/detail
- Toasts and error handling stay in the API service layer — not in components
- Keep hooks thin; domain mapping stays in `utils/map-form-to-request.ts`

Example read hook:
```ts
export function useHelpRequests() {
  return useReadData<HelpRequest[]>({
    queryKey: HELP_REQUESTS_QUERY_KEY,
    endpoint: HELP_REQUESTS_LIST,
    staleTime: 30_000,
  })
}
```

Example mutation hook:
```ts
export function useCreateHelpRequest() {
  return usePostData<CreateHelpRequestInput, HelpRequest>({
    endpoint: HELP_REQUESTS_CREATE,
    queryKeysToInvalidate: [HELP_REQUESTS_QUERY_KEY],
  })
}
```

---

## Step 5 — Wire the UI

Replace local/mock state with hook data:

| Before | After |
|--------|-------|
| `useState(MOCK_*)` | `useReadData` / `useInfiniteReadData` |
| Manual `setRequests([...])` on create | `usePostData` + query invalidation |
| Inline edit handlers mutating array | `useUpdateData` + invalidation |
| Delete from local array | `useDeleteData` + invalidation |

- Use `isLoading` / `isError` from hooks for loading and error UI
- Keep existing components; change data source only
- Do not add wrapper abstractions unless reuse is real
- Server components by default; `"use client"` only where needed

---

## Step 6 — Remove dummy data

Delete or stop importing:
- `mock-data.ts`, `mock-profile.ts`, and similar
- Hardcoded `useState` seed data
- Fake delays (`setTimeout` in queryFn)
- Local-only mutation helpers that duplicate API behavior

Grep the feature for `MOCK_`, `mock-`, and `getMock` to catch stragglers.

---

## Checklist

Copy and track per feature:

```
- [ ] Frontend types, schemas, and UI actions documented
- [ ] Mongoose schema + enums + relations match frontend contract
- [ ] DTOs validated; controller thin; module registered
- [ ] Backend restarted; routes verified
- [ ] endpoints.ts + types.ts added/updated
- [ ] One thin hook per API action using API service layer
- [ ] UI wired to hooks; loading/error states handled
- [ ] Mock data and local fake mutations removed
- [ ] tsc passes in client and backend
```

---

## Daleel paths quick reference

| Layer | Path |
|-------|------|
| Frontend feature | `client/features/<feature>/` |
| API service hooks | `client/lib/api/services/use-*-data.ts` |
| Backend module | `backend/src/modules/<feature>/` |
| Shared enums | `backend/src/common/enums/` |
| Reference/constants API | `backend/src/modules/reference/` |

For detailed client API rules, also follow `.cursor/rules/client-feature-api.mdc`, `client-api-hook-design.mdc`, and `client-react-query.mdc`.
