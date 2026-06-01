---
name: feature-ui
description: Builds Daleel Next.js feature UI from existing API hooks—reusing shadcn/forms/layout, obeying PascalCase component structure, avoiding duplicate components, and placing shared primitives in client/components. Use when implementing screens, pages, dialogs, lists, forms, wiring hooks to UI, or replacing mocks with real data.
---

# Feature UI (Daleel client)

Build or extend **feature screens** under `client/features/<feature>/` and thin **app routes** under `client/app/**`. This skill is UI-only: APIs must already be exposed via feature hooks (see [backend-to-frontend-hooks](../backend-to-frontend-hooks/SKILL.md)).

---

## Mandatory rules (read before coding)

1. **[client-component-structure.mdc](../../rules/client-component-structure.mdc)** — PascalCase, flat `Component.tsx` vs folder + `index.tsx`, feature components under `features/<feature>/components/`.
2. **Client API rules** — `.cursor/rules/client-feature-api.mdc`, `client-react-query.mdc`, `client-api-hook-design.mdc`: **no** `fetch`/`axios` or raw `useQuery`/`useMutation` in components; use feature hooks only.
3. **Next.js** — `.cursor/rules/NextJs.mdc`: prefer server components for pages when no client interactivity; mark interactive trees with `"use client"`.
4. **Anti-bloat** — `.cursor/rules/Anti-Bloat.mdc`: no speculative abstractions or wrapper components without reuse.

---

## Workflow

Copy and track:

```
- [ ] 1. Inventory: hooks, types, schemas, utils in features/<feature>/
- [ ] 2. Search: existing UI in feature, home, other features, client/components/
- [ ] 3. Plan: page vs view, list vs detail, dialogs; what to reuse vs extend
- [ ] 4. Implement: compose from shadcn + forms + layout; wire hooks
- [ ] 5. Route: app/**/page.tsx imports one feature view (thin)
- [ ] 6. Verify: client build; loading/empty/error states
```

### Step 1 — Read the API layer first

Before any JSX:

| Read | Why |
|------|-----|
| `features/<feature>/types.ts` | Entity shape, enums, status values |
| `features/<feature>/hooks/*.ts` | What queries/mutations exist |
| `features/<feature>/schemas/` | Form fields + defaults |
| `features/<feature>/utils/` | Filters, `map-form-to-*`, `build-*-form-data` |

If hooks are missing, run **backend-to-frontend-hooks** first — do not call APIs from UI.

### Step 2 — Search before creating (required)

Search in this order; **prefer edit/extend over new files**:

1. `client/features/<feature>/components/`
2. `client/features/*/` (similar domain: cards, toolbars, filters, dialogs)
3. `client/components/forms/` — `TextInput`, `SelectInput`, `ButtonGroupInput`, `FormSection`, `FormRoot`, `PriorityPicker`, etc.
4. `client/components/layout/` — `PageShell`
5. `client/components/ui/` — shadcn primitives (`Button`, `Card`, `Dialog`, `Badge`, …)

```bash
# Examples (adjust terms)
rg "HelpRequestCard|ListingCard|FiltersBar" client/features client/components
rg "useInfiniteReadData|usePropertyListings" client/features/<feature>
```

**Reuse checklist**

- Same card/list row pattern → extend existing card or extract **one** shared prop-driven variant in the owning feature first.
- Same filter toolbar → reuse or parameterize existing toolbar; do not copy-paste filter UI.
- Same form field → use `client/components/forms/*` + react-hook-form + feature Zod schema.
- Mock data on home or elsewhere → replace with hook data; delete mock only when fully wired.

**When to create new**

- No reasonable match after search.
- Existing component is feature-specific and would become unclear if overloaded → new sibling under the same feature folder.

### Step 3 — Where files go

| What | Location |
|------|----------|
| Feature-only UI (cards, sections, dialogs for one domain) | `client/features/<feature>/components/` |
| App route entry | `client/app/<route>/page.tsx` — import `{ FeatureView }`, no business logic |
| Cross-feature reusable (2+ features need it **now** or clearly soon) | `client/components/<area>/` — e.g. `forms/`, `layout/`, or new `data/` for pagination |
| Design primitives | `client/components/ui/` (shadcn — keep lowercase filenames) |
| Business logic, API, mapping | **Not** in components — stay in `hooks/`, `utils/`, `schemas/` |

**Shared vs feature-specific**

| Signal | Place |
|--------|--------|
| Tied to one entity (e.g. `PropertyListingCard`) | Feature `components/` |
| Generic input, button group, empty state, cursor “load more” | `client/components/forms/` or `client/components/data/` |
| Page chrome (title, back link, max-width) | `PageShell` in `client/components/layout/` |

Do not move domain components to `client/components/` “for later” unless a second feature will use them in the same PR or immediate follow-up.

### Step 4 — Match existing theme and patterns

Mirror **help-requests** and **home** as references:

- **Layout**: `PageShell` for full pages; `cn()` from `@/lib/utils` for spacing.
- **Styling**: Tailwind + CSS variables from `client/app/globals.css` (`background`, `foreground`, `primary`, `muted`, `card`, gradients already used on home/help-requests).
- **Primitives**: `@/components/ui/*` — do not reinvent buttons, dialogs, inputs.
- **Forms**: `FormRoot` + `FormSection` + typed inputs; `zodResolver(featureSchema)`; defaults from schema export (e.g. `createPropertyListingDefaultValues`).
- **Icons**: `lucide-react` (consistent with codebase).
- **Feedback**: Loading via query `isLoading` / `isPending`; errors via hook/toast layer (mutations already toast in service hooks — avoid duplicate success toasts in UI).
- **i18n**: English copy inline like existing screens unless project adds i18n.

### Step 5 — Wire APIs in views (not in leaves unless isolated)

**Container / view** (e.g. `HelpRequestsView.tsx`, `PropertyListingsView.tsx`):

- Owns filter/sort state, dialog open state, selected entity.
- Calls feature hooks; passes **data + callbacks** to presentational children.
- Builds `FormData` via `build*FormData` + `mapFormTo*` before `mutate(formData)`.

**Presentational children** (cards, rows, field groups):

- Props in; events out.
- No hooks except rare localized UI (e.g. `useId`).

#### Hook patterns

| Pattern | UI usage |
|---------|----------|
| `useReadData` | `data`, `isLoading`, `isError`, `refetch` |
| `useInfiniteReadData` | `data?.pages.flatMap(p => p.items)`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage` |
| `useMutation` / `usePostFormData` | `mutate` / `mutateAsync`, `isPending` on submit buttons |
| Auth | `useIsAuthenticated`, `useCurrentProfile` from auth/users features |

```tsx
// Infinite list (property-listings style)
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
  usePropertyListingsInfinite({ filters })

const items = data?.pages.flatMap((p) => p.items) ?? []
```

```tsx
// Create with multipart
const create = useCreatePropertyListing()
const onSubmit = (values: CreatePropertyListingFormValues) => {
  const input = mapFormToCreatePropertyListingInput(values)
  create.mutate(
    buildPropertyListingFormData(input, {
      existingImages: values.imageUrls ?? [],
      newFiles: values.imageFiles ?? [],
    })
  )
}
```

- **Invalidate/cache**: handled in hooks — views do not call `queryClient` unless an exceptional local optimistic UI is required.
- **Enums in UI**: import const objects from `types.ts` (`PropertyListingStatus`, `ListingType`), not string literals scattered in JSX.

### Step 6 — App routes stay thin

```tsx
// client/app/property-listings/page.tsx
import { PropertyListingsView } from "@/features/property-listings/components/PropertyListingsView"

export default function PropertyListingsPage() {
  return <PropertyListingsView />
}
```

Admin/moderation: separate route under `client/app/admin/...` importing an admin view component (see `AdminHelpRequestsView`).

### Step 7 — States every list/form should handle

- **Loading**: skeleton or spinner consistent with sibling features.
- **Empty**: message + primary action (e.g. “Create listing”) when authenticated.
- **Error**: short message + retry if `refetch` exists.
- **Auth-gated actions**: disable or redirect like help-requests (`useIsAuthenticated` + router).
- **Permissions**: use feature utils (e.g. `canEditHelpRequest`) — do not duplicate role checks inline.

---

## Component structure (quick reference)

Follow [client-component-structure.mdc](../../rules/client-component-structure.mdc):

- One file, no children → `MyWidget.tsx`
- Multiple files or child components → `MyWidget/index.tsx` + children
- Never `MyWidget/index.tsx` as the only file in a folder

Example feature tree:

```
features/property-listings/components/
  PropertyListingsView.tsx
  PropertyListingCard/
    index.tsx
  CreatePropertyListingDialog/
    index.tsx
    ListingLocationFields.tsx
```

---

## Do not

- Add API hooks, endpoints, or types in this task unless hooks are missing (switch skill).
- Duplicate `Button`, `Input`, filter bars, or cards already in the repo.
- Create `components/ui` duplicates with different styling.
- Put domain-specific names in `client/components/` without cross-feature need.
- Use mock data in new screens when hooks exist.
- Large single files with many inline subcomponents — extract per structure rule.
- `useEffect` for data fetching (use React Query hooks).

---

## Related skills and references

| Skill / doc | Use when |
|-------------|----------|
| [backend-to-frontend-hooks](../backend-to-frontend-hooks/SKILL.md) | Hooks/types/endpoints not built yet |
| [frontend-to-backend-api](../frontend-to-backend-api/SKILL.md) | Full-stack from scratch |
| `client/features/help-requests/components/HelpRequestsView.tsx` | View + hooks + dialogs pattern |
| `client/features/help-requests/components/HelpRequestCard/` | Card + detail dialog pattern |
| `client/features/home/components/HousingListingsSection/` | Marketing list section (replace mocks with API when wiring home) |

---

## Final checklist

```
- [ ] Searched existing components; reused or extended where possible
- [ ] New files follow PascalCase + correct file vs folder rule
- [ ] UI uses feature hooks only; FormData/mappers in utils
- [ ] Matches PageShell, shadcn, forms, spacing of nearby features
- [ ] App page is a thin import
- [ ] Loading, empty, error, auth states covered
- [ ] No unnecessary new shared components
- [ ] npm run build in client/ passes
```
