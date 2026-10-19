# CLAUDE.md — BMI Housing Platform

Monorepo for the BMI Housing Society platform: Flutter Android app (`apps/mobile`), Next.js public site and admin (`apps/web`), NestJS API (`apps/api`), PostgreSQL via Prisma. Read `docs/architecture.md` first.

## Hard rules

- **No payments** in the MVP: no payment tables, endpoints, SDKs or credentials.
- **Never invent CRM endpoints, payloads or credentials.** Use `SandboxCrmAdapter` until `docs/crm-integration.md` is filled from real documentation.
- Never return or display a CRM ID before the CRM has confirmed it.
- A booking request never changes plot status by itself. Approval is transactional (row lock or conditional update) and audited.
- Authorization is enforced server-side on every route. Customer queries are always scoped to the authenticated user.
- No secrets in git, Flutter code or `NEXT_PUBLIC_*` variables. Use synthetic data only.
- Don't log tokens or full phone or email values.
- Never claim a build or test passed without running it and showing the output.
- Inspect files before overwriting them, and explain any removal of existing functionality.

## Workflow

- Work one vertical feature at a time, with tests in the same change.
- Schema changes go through `prisma migrate dev`. Never edit applied migrations.
- Keep shared enums in `packages/contracts` in sync with the Prisma schema.
- Update `docs/` when contracts or the schema change.
- Every milestone report lists files changed, features, tests run with results, limitations, dependencies, run commands and the next step.

## Commands

- Setup: `cp .env.example .env && pnpm install && docker compose up -d postgres && pnpm db:migrate`
- Run: `pnpm dev` (API :4000, web :3000) or `docker compose up -d --build`
- Verify: `pnpm check` (prettier, eslint, tsc, tests) and `pnpm mobile:check` (flutter analyze, format, test)
- New migration: `pnpm --filter @bmi/api prisma:migrate:dev --name <change>`; keep `packages/contracts` enums in sync.
- Health: `/api/v1/health/live`, `/api/v1/health/ready`, Swagger at `/api/docs`.

## Environment notes

- Cloud dev container: Node 22, pnpm 10, Docker CLI, Postgres 16 binaries. Flutter is not preinstalled (install to /opt/flutter); no Android SDK, so APKs cannot be built there.
- Docker Hub may rate-limit; `mirror.gcr.io/library/<image>` works. Image builds there need `--network host`, proxy build args and `--secret id=ca_cert,src=/root/.ccr/ca-bundle.crt`.
