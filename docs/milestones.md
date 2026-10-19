# Milestones and acceptance criteria

- [ ] **01 Discovery and design**
  - [x] Architecture, schema, API, CRM and security drafts written
  - [ ] Business answers to the open questions in `requirements-and-assumptions.md`
  - [ ] CRM integration method confirmed in writing
  - Accept: stakeholders sign off the design docs; CRM field and status mapping filled in.

- [x] **02 Foundation** (done 2026-10-19)
  - pnpm workspace (Turborepo not needed yet); NestJS API with Prisma, migrations, health checks, OpenAPI, logging and correlation IDs; Next.js web shell; Flutter app shell; Docker Compose with Postgres (MinIO optional, untested); CI running lint, typecheck and tests.
  - Accept: `docker compose up` plus `pnpm dev` start the API and web; `pnpm test` passes; migrations apply to a clean database; `/health/ready` returns 200.

- [ ] **03 Catalogue and QR enquiry**
  - Admin project, media and plot CRUD; public `/p/[slug]`; QR generation; `POST /enquiries` with dedup, idempotency, consent and rate limiting.
  - Accept: scanning a QR code opens the project page, a visitor submits an enquiry and it is stored with its attribution; a duplicate submission does not create a second lead.

- [ ] **04 CRM integration and lead dashboard**
  - Outbox worker, sandbox adapter, then the real adapter once docs are available; retries; failed-event screen; lead list, filters, assignment and activities.
  - Accept: test enquiries appear in the CRM sandbox with their mapping stored; a simulated CRM outage loses no data and recovers.

- [ ] **05 Android app**
  - Onboarding, auth, catalogue, details, interest, enquiry, visits, booking request, status, profile and consents.
  - Accept: a debug APK connects to the staging API and completes the customer journey.

- [ ] **06 Visits, bookings and notifications**
  - Visit scheduling, booking state machine with transactional approval and hold expiry, FCM push, audit.
  - Accept: concurrent approval test proves at most one approval per plot; customer receives status pushes.

- [ ] **07 Hardening and release**
  - Authorization and data-isolation tests, E2E tests, load test of the enquiry endpoint, backups, deployment, runbook.
  - Accept: release-candidate APK, deployed dashboard, acceptance report.
