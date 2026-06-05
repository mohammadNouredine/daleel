---
name: nestjs-backend-standards
description: Enforces Daleel NestJS backend architecture limits and layering (service size, repositories, mapping, auth policies, CQRS, domain services). Use when adding or refactoring backend modules, services, controllers, repositories, or when code violates size, mongoose, mapping, or authorization boundaries.
---

# NestJS Backend Standards

Apply these rules to all NestJS backend work in Daleel (`backend/src/`).

## Hard rules

- No service > 300 lines
- No method > 40 lines
- No direct mongoose access outside repositories
- No DTO → entity manual mapping
- Authorization in guards/policies
- CQRS for complex modules
- Domain services for business rules

If existing code violates a rule, refactor toward compliance when touching that area — do not add more violations.

---

## Service size (≤ 300 lines, methods ≤ 40 lines)

**Services orchestrate; they do not accumulate every concern.**

When a service grows:

1. Extract **domain services** for pure business rules (validation, state transitions, approval logic).
2. Extract **repositories** for persistence queries and document loads/saves.
3. Extract **application handlers** (commands/queries) for complex flows.
4. Keep the Nest `@Injectable()` service as a thin coordinator or split into focused services per use case.

**Method length:** If a method exceeds 40 lines, extract private helpers, domain methods, or a dedicated handler. Prefer named functions over long inline blocks.

---

## Repositories (mongoose boundary)

**Only repositories** may use `@InjectModel`, `Model<T>`, `.find()`, `.findOne()`, `.create()`, `.save()`, aggregation, etc.

```
modules/<feature>/
├── repositories/
│   └── help-request.repository.ts   # mongoose only here
├── help-requests.service.ts         # calls repository, no Model injection
```

Repository responsibilities:

- CRUD and query composition
- Map Mongo `_id` / `ObjectId` at the persistence edge
- Return domain documents or plain persistence types — not HTTP DTOs

**Forbidden in services/controllers:** `@InjectModel`, direct `this.helpRequestModel.find(...)`.

---

## Mapping (no manual DTO → entity)

**Do not hand-assign DTO fields to entities field-by-field in services** (e.g. `doc.title = dto.title` repeated across dozens of lines).

Use one of:

| Direction | Approach |
|-----------|----------|
| DTO → entity / command | Mapper class, `toEntity(dto)`, or command factory |
| Entity → API response | Existing pattern: `*.mapper.ts` (e.g. `mapHelpRequestToResponse`) |
| Partial updates | Dedicated update mapper or patch builder |

Manual mapping in a service `update()` method is a smell — extract to `HelpRequestUpdateMapper` or similar.

---

## Authorization (guards / policies)

**Forbidden:** Scattered `if (!hasPermission(...)) throw new ForbiddenException` duplicated across many service methods without a shared policy layer.

**Required pattern:**

- **Guards** — authentication, route-level role/permission checks
- **Policies** — resource-level rules (owner, scope, moderation queue)

Centralize in `common/permissions/`, feature `policies/`, or dedicated guard classes. Services call `assertCanEdit(doc, user)` only when policy helpers are shared and named — prefer policy objects over ad-hoc checks.

New endpoints: define who can access **before** implementing business logic; wire guard/policy on the controller.

---

## CQRS (complex modules)

Use **commands and queries** when a module has multiple write paths, moderation workflows, staged edits, or heavy read models.

```
modules/<feature>/
├── commands/
│   ├── approve-help-request.handler.ts
│   └── stage-help-request-edit.handler.ts
├── queries/
│   ├── list-public-help-requests.handler.ts
│   └── list-pending-moderation.handler.ts
```

Apply CQRS when **any** of:

- 3+ distinct write operations with different authorization
- Moderation / approval / pending-edit flows
- Public vs admin vs owner list queries with different filters
- Service would exceed 300 lines without split

Simple CRUD modules (single create/read/update/delete) may stay in one service **if** it stays under limits and uses a repository.

---

## Domain services (business rules)

Put **business rules** in domain services, not controllers or repositories.

| Layer | Owns |
|-------|------|
| Controller | HTTP, DTO validation, status codes |
| Application service / handler | Orchestration, transactions, calling domain + repo |
| Domain service | Rules: approval eligibility, status derivation, pending-edit staging, fulfillment math |
| Repository | Persistence only |
| Mapper | Shape conversion |

Example domain concerns:

- `shouldStageOwnerEdit(user, doc)`
- `deriveStatusFromNeeds(needs, currentStatus)`
- `canTransitionToApproved(doc, actor)`

Domain services are plain `@Injectable()` classes with **no** mongoose imports.

---

## Refactor checklist

Before finishing backend work, verify:

- [ ] No service file over 300 lines
- [ ] No method over 40 lines
- [ ] Mongoose only in `*.repository.ts` (or legacy path being migrated)
- [ ] DTO/entity mapping in mappers or command builders, not inline in services
- [ ] New routes protected by guards/policies
- [ ] Complex flows use commands/queries or domain services
- [ ] Business rules live in domain services, not controllers

---

## Related skills

- [schema-to-nestjs-api](../schema-to-nestjs-api/SKILL.md) — bootstrap APIs from schemas (migrate results toward these standards)
- [frontend-to-backend-api](../frontend-to-backend-api/SKILL.md) — wire client after backend changes
