# BMI Housing Platform

Digital property platform for BMI Housing Society: an Android customer app, a public QR/project website, an admin dashboard and an API integrated with the existing CRM. Payments are excluded from the MVP.

**Status:** Milestone 02 (foundation) complete. No business features or CRM integration yet.

## Layout

```
apps/api       NestJS REST API (Prisma + PostgreSQL)
apps/web       Next.js public site (+ admin later)
apps/mobile    Flutter Android app
apps/brief     Standalone single-file briefing page (QR demo)
packages/      contracts (shared enums/types), config (tsconfig + ESLint)
infrastructure/docker   Dockerfiles for api and web
docs/          Architecture, schema, API contracts, CRM, security, runbook
```

## Prerequisites

Node 22, pnpm 10, Docker (with Compose), Flutter 3.x stable. Android SDK only for building APKs.

## Run locally

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres      # database
pnpm db:migrate                    # apply Prisma migrations
pnpm dev                           # API on :4000, web on :3000
```

Or everything in containers: `docker compose up -d --build` (postgres → migrate → api → web).

Mobile: `cd apps/mobile && flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1`

## Health

| URL                                             | Meaning                                        |
| ----------------------------------------------- | ---------------------------------------------- |
| `GET http://localhost:4000/api/v1/health/live`  | API process is up (never touches dependencies) |
| `GET http://localhost:4000/api/v1/health/ready` | 200 when the database answers, 503 otherwise   |
| `GET http://localhost:4000/api/docs`            | OpenAPI / Swagger UI (not in production)       |
| `GET http://localhost:3000/api/health`          | Web app is up                                  |

## Checks

```bash
pnpm check          # prettier, eslint, tsc, all TypeScript tests
pnpm mobile:check   # flutter analyze, dart format, flutter test
pnpm build          # production builds
```

## Docs

[Architecture](docs/architecture.md) · [Database schema](docs/database-schema.md) · [API contracts](docs/api-contracts.md) · [CRM integration](docs/crm-integration.md) · [Security](docs/security.md) · [Runbook](docs/runbook.md) · [Milestones](docs/milestones.md)
