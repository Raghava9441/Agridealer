# AgriDealer ERP

Multi-tenant SaaS for pesticide & fertilizer dealers. See
`AgriDealer_ERP_Technical_Design_Document.docx` for the full technical design;
this repo is Phase 0 (Foundations) of the phased delivery plan in that
document — dev environment, monorepo layout, auth/tenant/RBAC scaffolding,
and the shared contracts package.

## Stack

- **Frontend** (`apps/web`): React 18, Vite, TypeScript (strict), TanStack
  Router (file-based) + TanStack Query v5, Zustand, Tailwind CSS, Radix UI,
  React Hook Form + Zod, i18next (en/te/hi), Workbox (PWA/offline shell).
- **Backend** (`apps/api`): Node 20, Express 4, TypeScript (strict), Mongoose 8,
  Redis (`ioredis`), BullMQ, JWT + argon2 + TOTP (MFA), Zod, Pino.
- **Shared** (`packages/contracts`): Zod schemas, RBAC permission map, and
  error codes consumed by both apps so validation and permissions can't drift
  between frontend and backend.
- **Infra**: MongoDB replica set (required for multi-document transactions),
  Redis, MinIO (S3-compatible object storage) — via Docker Compose for local
  dev.

## Prerequisites

- Node.js >= 18 (project developed against 20 — see `.nvmrc`)
- Docker Desktop (for MongoDB/Redis/MinIO locally)

## First-time setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run docker:up
npm run build --workspace=packages/contracts
npm run dev
```

The API runs on `http://localhost:8090`, the web app on
`http://localhost:5173`. `npm run dev` starts both concurrently.

`packages/contracts` must be built at least once (`npm run build --workspace=packages/contracts`)
before the other apps can resolve it — its `dev` script (`npm run dev --workspace=packages/contracts`)
watches and rebuilds on change if you're actively editing shared schemas.

## Repository layout

```
apps/
  api/                  Express backend — see apps/api/src/{app.ts,server.ts}
  web/                  React frontend — see apps/web/src/{app,routes,features,shared}
packages/
  contracts/            Shared Zod schemas, RBAC permission map, error codes
docker/
  docker-compose.yml    Mongo (replica set) + Redis + MinIO for local dev
```

Backend follows `route -> controller -> service -> repository -> model`
layering per module (`apps/api/src/modules/<name>/`); only the repository
layer touches Mongoose models directly, and it's where tenant scoping is
applied. Frontend follows a feature-folder structure (`apps/web/src/features/<name>/`)
with file-based routes in `apps/web/src/routes/`.

Most business modules (billing, customers, products, inventory, purchases,
credit, expenses, cashbook, reports, messaging, recommendations,
subscriptions) are scaffolded as empty folders with a `.gitkeep` note — they
follow the phased plan in the technical design doc (§16) and aren't
implemented yet. `auth`, `users`, `tenants`, `audit`, and `health` are
implemented as the Phase 0 exit criterion: a user can log in, and a request
is tenant-scoped, permission-checked, and audited end to end.

## Commands (run from repo root)

```bash
npm run dev              # API + web concurrently
npm run dev:api          # API only
npm run dev:web          # web only
npm run build             # build all workspaces
npm run typecheck        # tsc --noEmit across all workspaces
npm run lint              # eslint across all workspaces
npm run test               # jest (api) + vitest (web)
npm run docker:up        # start Mongo/Redis/MinIO
npm run docker:down      # stop them
```

## Known gaps (tracked in code comments, not hidden)

- `authenticate.ts` verifies JWT signature/expiry but does not yet check
  `tokenVersion` against the database, so a password/role change doesn't
  immediately revoke already-issued access tokens (needs a cheap
  revocation cache — see the comment in `apps/api/src/middleware/authenticate.ts`).
- No queue/worker is wired up yet (`apps/api/src/jobs/`) — there's nothing
  to defer work to until a module that needs it (billing → PDF/WhatsApp)
  exists.
- `apps/web`'s PWA/offline runtime caching strategy is the Vite plugin
  default; the catalogue-specific caching described in the design doc
  (§5.9, §12.2) needs the products module to exist first.


Role	Email	Password
Owner (full access — sees everything, including Settings)	owner@dummy.test	Test1234!
Manager	manager@dummy.test	Test1234!
Sales	sales@dummy.test	Test1234!
Accountant	accountant@dummy.test	Test1234!
Warehouse	warehouse@dummy.test	Test1234!