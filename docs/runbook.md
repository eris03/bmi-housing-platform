# Runbook (development)

## Start / stop

- Database only: `docker compose up -d postgres` · stop: `docker compose stop postgres`
- Full stack: `docker compose up -d --build` · logs: `docker compose logs -f api`
- Reset the local database (destroys data): `docker compose down -v && docker compose up -d postgres && pnpm db:migrate`

## Migrations

- Create: edit `apps/api/prisma/schema.prisma`, then `pnpm --filter @bmi/api prisma:migrate:dev --name <change>`
- Apply (CI, containers, prod): `pnpm db:migrate` (`prisma migrate deploy`)
- Never edit a migration that has been applied anywhere; add a new one.
- When adding/changing an enum, update `packages/contracts/src/index.ts` too. `test/contracts-sync.spec.ts` fails otherwise.

## Configuration

The API validates its environment at startup (`apps/api/src/config/env.ts`). A bad value stops the process with a list such as:

```
Invalid environment configuration:
  - DATABASE_URL: DATABASE_URL is required
```

## Logs

The API writes one JSON line per event (pino). Every request carries a `correlationId`, echoed in the `x-correlation-id` response header; send your own header to trace a request across services. Authorization headers, cookies, and `phone`/`email`/`password`/`token` fields are redacted.

## Health checks

- Liveness `GET /api/v1/health/live` — restart the container only if this fails.
- Readiness `GET /api/v1/health/ready` — 503 while the database is unreachable; remove from load balancing, do not restart.

## Building images behind a TLS-intercepting proxy

Pass the proxy CA as a build secret; it is never stored in the image:

```bash
docker build --secret id=ca_cert,src=/path/to/ca.crt -f infrastructure/docker/api.Dockerfile .
```

## Backups

Not set up for local development. Production backup and restore drills are part of Milestone 07.
