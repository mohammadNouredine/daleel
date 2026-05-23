# Daleel

Humanitarian crisis-management platform for Lebanon — coordinating aid requests, tracking fulfillment, and connecting displaced families with organizations and volunteers.

## Repository layout

```text
Daleel/
├── backend/     # NestJS API + MongoDB (Mongoose + Better Auth)
└── client/      # Next.js frontend (planned)
```

## MVP focus

Help Requests Management System:

- User accounts and roles
- Help requests with quantity tracking
- Request updates and audit history
- Geographic filtering
- Anti-fraud reporting

## Backend setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas (or local MongoDB)

### Install and run

```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run start:dev
```

API base path: `http://localhost:3001/api/v1`

Swagger UI: [http://localhost:3001/api/docs](http://localhost:3001/api/docs) (also redirects from `/api-docs`)

OpenAPI JSON: `http://localhost:3001/api/docs-json`

### First-time Better Auth database setup

After configuring `.env`, create Better Auth tables/collections:

```bash
cd backend
npx @better-auth/cli@latest migrate
```

Better Auth uses collections `users`, `sessions`, `accounts`, and `verifications`. All Daleel data lives on the same `users` document. **User references use MongoDB `_id` only** (hex string in API JSON). Better Auth session `user.id` is that same `_id` value.

### Environment variables

| Variable | Description |
| -------- | ----------- |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (default `3001`) |
| `NODE_ENV` | `development` or `production` |
| `BETTER_AUTH_SECRET` | Auth encryption secret (min 32 chars; `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Public API URL (e.g. `http://localhost:3001`) |
| `TRUSTED_ORIGINS` | Comma-separated CORS origins |
| `ADMIN_EMAIL` | Startup admin email (created once if missing) |
| `ADMIN_PASSWORD` | Startup admin password |
| `ADMIN_FULL_NAME` | Admin display name (default `Daleel Admin`) |

### Startup admin user

On first boot, if no admin exists for `ADMIN_EMAIL`, the server:

1. Registers the admin via Better Auth
2. Syncs a Daleel profile in `users`
3. Promotes the account to `ADMIN` with full permissions

Subsequent starts skip seeding if the admin already exists.

## Authentication API

Better Auth is mounted at `/api/v1/auth`. Use **cookies** (browser) or **Bearer token** (API clients).

### Register

```bash
curl -X POST http://localhost:3001/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "Full Name",
    "phoneNumber": "+96170123456"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

Save the session token from the response for bearer requests, or use the session cookie.

### Get session

```bash
curl http://localhost:3001/api/v1/auth/get-session \
  -H "Authorization: Bearer <token>"
```

### Current Daleel profile

```bash
curl http://localhost:3001/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

Returns Better Auth session data plus the full Mongoose user profile (role, permissions, location, etc.).

### Logout

```bash
curl -X POST http://localhost:3001/api/v1/auth/sign-out \
  -H "Authorization: Bearer <token>"
```

## MongoDB collections

| Collection | Purpose |
| ---------- | ------- |
| `users`, `sessions`, `accounts`, `verifications` | Better Auth (credentials, sessions, single user profile) |
| `help_requests` | Humanitarian aid cases |
| `help_updates` | Audit log for request changes |
| `reports` | Anti-fraud / moderation reports |

**Note:** If you migrated from an older setup, delete the legacy `user` collection in Atlas (singular) — only `users` is used now.

## Next steps

- Help request REST APIs
- Role-based guards on protected routes
- Next.js client with Better Auth client
