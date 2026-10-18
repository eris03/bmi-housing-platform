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
To be filled in when the scaffold lands (Milestone 02).

## Environment notes
- The cloud dev container has Node 22, pnpm 10, Docker and psql 16. **Flutter is not installed**, so mobile changes cannot be built or tested there.
