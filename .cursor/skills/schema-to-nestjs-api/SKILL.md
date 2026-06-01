---
name: schema-to-nestjs-api
description: Implements NestJS REST APIs from existing Mongoose schemas in Daleel (DTOs, service, controller, mapper, auth). Use when a feature has schemas only (phase 1), when adding property-listings/help-requests endpoints, or when the user asks to move from schema to API, backend CRUD, or admin moderation routes.
---

# Schema → NestJS API (Daleel)

Use this skill when **`backend/src/modules/<feature>/schemas/` already exists** and you need HTTP APIs — not when designing schemas from scratch.

For full-stack wiring after APIs exist, also use [frontend-to-backend-api](../frontend-to-backend-api/SKILL.md).

## Reference implementation

Mirror [`help-requests`](../../../backend/src/modules/help-requests/):

| File | Role |
|------|------|
| `help-requests.controller.ts` | Thin HTTP; auth decorators; Swagger |
| `help-requests.service.ts` | Business logic; `assertAdmin`; ownership checks |
| `help-requests.mapper.ts` | Document → API response (IDs as hex strings) |
| `dto/*.dto.ts` | class-validator + `@ApiProperty` |
| `help-requests.module.ts` | `UsersModule` import; register controller + service |

Global prefix: **`api/v1`** ([`main.ts`](../../../backend/src/main.ts)).

---

## Step 0 — Discover existing schema

Before writing code, read:

1. `backend/src/modules/<feature>/schemas/*.schema.ts` — fields, enums, indexes, `deletedAt`, status workflow
2. `backend/src/common/enums/` — reuse enums; do not duplicate string literals
3. `backend/src/modules/<feature>/<feature>.module.ts` — what models are already registered
4. Related collections (e.g. favorites, reports) — separate services or nested in main service

**Property listings example:** [`property-listings/schemas/`](../../../backend/src/modules/property-listings/schemas/) — `PropertyListing`, `Amenity`, `PropertyFavorite`, `PropertyReport`, `SubscriptionPlan`; status via `PropertyListingStatus`.

Output a short endpoint map (public / owner / admin) before implementing.

---

## Step 1 — Module layout

Add under `backend/src/modules/<feature>/`:

```
dto/
  create-<entity>.dto.ts
  update-<entity>.dto.ts
  list-<entity>-query.dto.ts
  reject-<entity>.dto.ts          # if moderation exists
  <entity>-response.dto.ts        # optional; or type in mapper
<feature>.mapper.ts
<feature>.service.ts
<feature>.controller.ts
```

Update `<feature>.module.ts`:

```ts
@Module({
  imports: [
    MongooseModule.forFeature([...existing schemas...]),
    UsersModule,
  ],
  controllers: [<Feature>Controller],
  providers: [<Feature>Service],
  exports: [MongooseModule, <Feature>Service],
})
```

Register controller in module; module already in `app.module.ts`.

---

## Step 2 — DTOs

Rules:

- Every request body/query class uses **class-validator** (`@IsEnum`, `@IsOptional`, `@ValidateNested`, etc.)
- Mirror schema enums with `@IsEnum(PropertyListingStatus)` from `common/enums`
- Swagger: `@ApiProperty` / `@ApiPropertyOptional` on each field
- Nested subdocs: `@Type(() => LocationDto)` + `@ValidateNested()`
- **Whitelist only** fields that exist on schema — no speculative DTO properties
- List/query DTOs: filters the schema indexes support (status, listingType, governorate, price min/max, etc.)

---

## Step 3 — Mapper

- One function: `mapXToResponse(doc: XDocument): XResponse`
- Expose `_id`, `ownerId`, `reviewedBy`, `amenityIds` as **hex strings** (see [`help-requests.mapper.ts`](../../../backend/src/modules/help-requests/help-requests.mapper.ts))
- Do not `.populate()` users unless explicitly required — resolve via `UsersService` in service when needed
- Omit internal fields (`deletedAt` unless admin/owner)

---

## Step 4 — Service

Inject models with `@InjectModel(Entity.name)` and `UsersService`.

Patterns from help-requests:

```ts
private async assertAdmin(userId: string): Promise<void> {
  if (!(await this.isAdmin(userId))) {
    throw new ForbiddenException('Admin access required');
  }
}

private async isAdmin(userId: string): Promise<boolean> {
  const user = await this.usersService.findById(userId);
  return user?.role === UserRole.ADMIN;
}
```

| Concern | Pattern |
|---------|---------|
| Find by id | `findDocumentOrThrow` + `toObjectId(id)` from `common/utils/object-id.util` |
| Public list | Filter `status === APPROVED`, `deletedAt: null` |
| Owner list | Filter `ownerId`, `deletedAt: null` |
| Create | Set `ownerId`, default status `DRAFT` or `PENDING_APPROVAL` per product rules |
| Update/delete | `assertOwnerOrAdmin` before mutate |
| Soft delete | Set `deletedAt: new Date()`; exclude in public queries |
| Moderation | `assertAdmin` then transition status; set `reviewedBy`, `reviewedAt`, `rejectionReason` |

Use schema indexes in `find()` filters. Keep controllers free of business rules.

---

## Step 5 — Controller (thin)

```ts
function requireUserId(session: UserSession | null): string {
  if (!session?.user?.id) throw new UnauthorizedException('Authentication required');
  return session.user.id;
}
```

Decorators from `@thallesp/nestjs-better-auth`:

| Access | Decorator | Swagger |
|--------|-----------|---------|
| Public feed | `@AllowAnonymous()` | No bearer |
| Optional viewer | `@OptionalAuth()` | Optional bearer |
| Logged-in only | `@Session()` + `requireUserId` | `@ApiBearerAuth('bearer')` |

`@ApiTags('<Feature>')` on controller. `@ApiOperation({ summary: '...' })` per route — mention **admin dashboard** in summary when route is admin-only.

**Route order:** static paths before `:id` (e.g. `GET moderation/pending` before `GET :id`).

---

## Step 6 — Auth & admin / dashboard routes

### Public vs protected

- **Browse approved listings** → `@AllowAnonymous()` on `GET /`
- **Detail** → `@OptionalAuth()` if owner/admin may see non-approved
- **Create / update / delete / mine / favorites** → auth required

### Admin moderation (dashboard)

Use a clear URL segment and Swagger text so frontend admin pages map 1:1:

| Action | Method | Path pattern | Swagger summary hint |
|--------|--------|--------------|----------------------|
| Pending queue | `GET` | `moderation/pending` | `(admin dashboard)` |
| Approve | `PATCH` | `:id/approve` | `(admin dashboard)` |
| Reject | `PATCH` | `:id/reject` | `(admin dashboard)` + body DTO |

Service must call `assertAdmin(userId)` on every moderation handler.

For property listings, filter `status: PENDING_APPROVAL` (not a separate approval enum unless schema has one).

### Owner routes

| Action | Path |
|--------|------|
| My items | `GET mine` |
| CRUD | `POST /`, `PATCH :id`, `DELETE :id` |

---

## Step 7 — Typical endpoint set

Derive from schema + product rules; do not implement unused routes.

**PropertyListing (suggested minimal set):**

```
GET    /property-listings              @AllowAnonymous   — approved, filterable
GET    /property-listings/mine         auth              — owner’s listings
GET    /property-listings/moderation/pending   auth + admin
GET    /property-listings/:id          @OptionalAuth
POST   /property-listings              auth
PATCH  /property-listings/:id          auth (owner/admin)
DELETE /property-listings/:id          auth (soft delete)
PATCH  /property-listings/:id/approve  admin
PATCH  /property-listings/:id/reject   admin

GET    /amenities                      @AllowAnonymous   — reference list (or reference module)
POST   /property-listings/:id/favorite auth
DELETE /property-listings/:id/favorite auth
POST   /property-reports               auth
```

Defer subscription enforcement (`currentPlanId`, plan limits) until User schema is extended.

---

## Step 8 — Verify

```bash
cd backend && npm run build
```

Restart backend; confirm logs: `Mapped {/api/v1/<feature>/...}`.

- No new routes without DTO validation
- Admin routes fail with `403` for non-admin users
- Public list never returns `DRAFT` / `PENDING_APPROVAL` / soft-deleted docs

---

## Checklist

```
- [ ] Read existing schemas + enums; endpoint map written
- [ ] DTOs match schema fields only; enums from common/enums
- [ ] Mapper returns stable API shapes (hex IDs)
- [ ] Service: assertAdmin / owner checks; soft-delete respected
- [ ] Controller thin; auth decorators correct; admin routes under moderation/*
- [ ] Swagger tags/summaries mention admin dashboard where applicable
- [ ] Module registers controller + service + UsersModule
- [ ] npm run build passes
```

---

## Anti-patterns

- Implementing APIs before schemas exist (use schema phase plan first)
- Storing duplicate enums in DTOs instead of importing from `common/enums`
- Business logic in controllers
- Admin approve/reject without `assertAdmin`
- Generic paths like `PATCH :id/status` without documenting dashboard use in Swagger
- Adding analytics, cron, or User plan fields in the same PR unless explicitly requested

---

## Related

- Property schema phase 1: `backend/src/modules/property-listings/schemas/`
- NestJS rules: `.cursor/rules/NestJs.mdc`
- Full client wiring: [frontend-to-backend-api](../frontend-to-backend-api/SKILL.md)
