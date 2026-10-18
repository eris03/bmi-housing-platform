# Security and privacy (baseline)

- **Authentication:** OIDC-compatible provider (candidates: Keycloak self-hosted, Auth0, Firebase Auth, Supabase Auth; decision pending cost and OTP needs). The API validates JWT signature, issuer, audience and expiry.
- **Authorization:** NestJS guards on every route. Customer data access is always filtered by `customer_id = token.sub`. Staff access is checked against role and `staff_project_scopes`. Requests for records the caller doesn't own return 404.
- **Secrets:** environment variables injected from the host's secret manager. Never stored in the APK, the web bundle or git. `.env` is git-ignored.
- **Rate limiting:** public enquiry, registration and OTP endpoints (per IP and per phone).
- **Uploads:** presigned PUT to a private bucket, MIME and size allow-list, server-side verification before registering media, randomised keys.
- **Headers:** Helmet, a strict CORS allow-list, and HSTS in production.
- **PII:** phone and email are masked in logs. Integration payloads are minimised. CSV exports are role-gated and audited.
- **Consent:** append-only records, with opt-out honoured before any notification is sent.
- **Audit:** every staff mutation of plots, bookings, assignments, roles or exports.
- **Data lifecycle:** retention period and the account-deletion process are pending business decisions.
- **Backups:** managed Postgres point-in-time recovery, with a restore drill documented in `runbook.md`.
- **Environments:** dev, staging and prod are separate, with separate databases, buckets, CRM credentials and Firebase projects.
- **Test data:** synthetic only.
