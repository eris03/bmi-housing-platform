# Architecture

Status: **Draft for approval** (Milestone 01). Nothing in this document is implemented yet.

## 1. Repository assessment (2026-10-18)

| Item              | Finding                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository        | `eris03/bmi-housing-platform`, empty (no commits) at inspection                                                                                                   |
| Node.js           | v22.22.0 available                                                                                                                                                |
| pnpm              | 10.28.0 available                                                                                                                                                 |
| Docker            | 29.8.2 available                                                                                                                                                  |
| PostgreSQL client | psql 16.15 available                                                                                                                                              |
| Java              | OpenJDK 21 available (needed for Android builds)                                                                                                                  |
| Flutter / Dart    | **Not installed** in the cloud dev container. Mobile code can be written but not built or tested here until Flutter is installed (setup script or local machine). |
| Android SDK       | Not installed. APK builds happen locally or in CI.                                                                                                                |

Conclusion: greenfield. The TypeScript workspace (API and web) can be built and tested in this environment. The Flutter app needs a Flutter-enabled environment.

## 2. System overview

```
 Customer entry points                Staff
 ┌──────────────┐ ┌──────────────┐    ┌──────────────────┐
 │ Flutter APK  │ │ QR → /p/slug │    │ Admin dashboard  │
 └──────┬───────┘ └──────┬───────┘    └────────┬─────────┘
        │                │  Next.js (web)      │
        └────────────────┴──────────┬──────────┘
                                    │ HTTPS /api/v1
                         ┌──────────▼──────────┐
                         │     NestJS API      │  auth · RBAC · validation
                         │                     │  business rules · audit
                         └──┬───────┬───────┬──┘
                            │       │       │
               ┌────────────▼┐ ┌────▼────┐ ┌▼──────────────┐
               │ PostgreSQL  │ │ S3 obj. │ │ FCM / notify  │
               │ (Prisma)    │ │ storage │ │ jobs          │
               └─────┬───────┘ └─────────┘ └───────────────┘
                     │ integration_events (outbox)
               ┌─────▼───────┐        ┌───────────────┐
               │ CRM worker  │──────▶ │ Existing CRM  │
               │ + adapter   │◀────── │ (webhooks)    │
               └─────────────┘        └───────────────┘
```

## 3. Components

| Component             | Tech                                                    | Responsibility                                                   |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `apps/mobile`         | Flutter + Dart                                          | Customer Android app                                             |
| `apps/web`            | Next.js (App Router) + TypeScript                       | Public project pages, QR landing, enquiry forms, admin dashboard |
| `apps/api`            | NestJS + TypeScript                                     | REST API, auth, RBAC, business rules, OpenAPI                    |
| Database              | PostgreSQL 16 + Prisma                                  | Transactional data and migrations                                |
| CRM worker            | NestJS module (same codebase, separate process in prod) | Drains the outbox and calls the CRM adapter                      |
| Object storage        | S3-compatible                                           | Project media; private bucket with signed URLs                   |
| Push                  | Firebase Cloud Messaging                                | Android notifications only, not used as a database               |
| `packages/contracts`  | TypeScript                                              | Shared enums and DTO types                                       |
| `packages/api-client` | Generated from OpenAPI                                  | Typed client for web                                             |

## 4. Ownership boundaries

**Existing CRM is the source of truth for:** lead records, CRM lead IDs, sales assignment, sales activity and lead lifecycle status (where the CRM supports each of these).

**The platform is the source of truth for:** projects, media, published pricing, plot inventory (unless the CRM already owns it; to confirm), QR codes and attribution, site visits, booking requests, consent records, app tokens and audit logs.

The platform keeps a **local lead read model** (`leads`) and a mapping to the CRM ID (`crm_mappings`). Fields the CRM owns are shown as read-only in the admin UI and labelled "from CRM".

## 5. Key flows

### Enquiry (app or QR)

1. Client POSTs `/api/v1/enquiries` with an `Idempotency-Key` header.
2. The API validates the request, normalises the phone number to E.164 and applies the dedup policy (see `crm-integration.md`).
3. In **one DB transaction** it writes the enquiry/lead, the consent records and an `integration_events` row (`PENDING`).
4. It responds `202 Accepted` with a local reference. It never returns a CRM ID it has not received.
5. The worker picks up the event and calls `CrmAdapter.createLead`. It stores the external ID in `crm_mappings` and marks the event `SYNCED`.
6. On failure it retries with exponential backoff and jitter, up to N attempts. After that the event is `FAILED` and visible in admin.
7. A scheduled reconciliation job re-checks `PENDING`/`RETRY` events.

### Booking request

1. Customer submits a request → `SUBMITTED`. The plot status does **not** change.
2. Staff moves it to `UNDER_REVIEW`.
3. On approval, the API runs in a transaction: `SELECT … FOR UPDATE` on the plot, checks it is `AVAILABLE`, then conditionally moves the plot to `ON_HOLD` (with `hold_expires_at`) or `RESERVED` according to business policy, and moves the request to `APPROVED`. Both changes are audited.
4. A conflicting approval gets `409 Conflict`.
5. Invalid status transitions are rejected by an explicit state machine.

## 6. Cross-cutting concerns

- **Auth:** an OIDC-compatible provider (to be chosen, see `security.md`). The API validates JWTs, and roles live in `users.role`. Customers authenticate by phone OTP or email (to confirm).
- **Authorization:** guards on every route. Customer routes derive identity from the token, never from the request body. Staff routes check role and project scope (`staff_project_scopes`).
- **Errors:** a consistent envelope `{ error: { code, message, correlationId } }`.
- **Observability:** structured JSON logs, a correlation ID per request, `/health/live` and `/health/ready`.
- **Time:** all instants stored as `timestamptz` in UTC and rendered in `Asia/Kolkata` by default (configurable).

## 7. Explicitly out of scope (MVP)

Payments of any kind, AI calling/agents, lead scoring, iOS, and unverified third-party integrations.

## 8. Decisions pending business input

See `requirements-and-assumptions.md` § Open questions.
