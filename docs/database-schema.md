# Database schema (proposed)

PostgreSQL 16, managed by Prisma migrations. Conventions:
- `id uuid` primary keys (default `gen_random_uuid()`).
- `created_at` and `updated_at` are `timestamptz` (UTC).
- Money is stored as `bigint` minor units (paise) plus a `currency` char(3) default `INR`.
- Areas are stored as `numeric(12,2)`.
- Soft delete is used only where noted. Otherwise foreign keys use `RESTRICT`.

## Enums
```
UserRole:            CUSTOMER | SALES | PROJECT_MANAGER | ADMIN | SUPER_ADMIN
UserStatus:          ACTIVE | DISABLED | PENDING_DELETION
ProjectStatus:       DRAFT | PUBLISHED | ARCHIVED
MediaType:           IMAGE | DOCUMENT | VIDEO_LINK
PlotStatus:          AVAILABLE | ON_HOLD | RESERVED | SOLD | INACTIVE
LeadSource:          ANDROID_APP | QR_CODE | META_AD | WEBSITE | PHONE | STAFF_CREATED | OTHER
InterestStatus:      INTERESTED | NOT_INTERESTED | MAYBE_LATER
VisitStatus:         REQUESTED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
BookingRequestStatus: SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED | CANCELLED
SyncStatus:          PENDING | SYNCED | RETRY | FAILED
ConsentStatus:       GRANTED | WITHDRAWN
NotificationChannel: PUSH | EMAIL | SMS | WHATSAPP
NotificationStatus:  PENDING | SENT | FAILED | CANCELLED
IntegrationDirection: OUTBOUND | INBOUND
```
CRM statuses are mapped explicitly in the adapter. The CRM's values are not copied into these enums.

## Tables

### users
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| identity_subject | text UNIQUE NULL | subject ID from the identity provider |
| name | text | |
| email | citext UNIQUE NULL | |
| phone_e164 | text UNIQUE NULL | normalised |
| role | UserRole | default CUSTOMER |
| status | UserStatus | |
Index: (role, status).

### staff_project_scopes
`user_id` FK users CASCADE, `project_id` FK projects CASCADE. PK (user_id, project_id). Limits which projects SALES and PROJECT_MANAGER users can access.

### projects
id, `slug` UNIQUE, name, description, location_text, latitude/longitude numeric NULL, map_url, amenities jsonb, status ProjectStatus, published_at.
Index: (status).

### project_media
id, project_id FK projects CASCADE, storage_key text UNIQUE, media_type, mime_type, size_bytes, caption, sort_order int, is_public bool.
Index: (project_id, sort_order).

### plots
id, project_id FK RESTRICT, plot_number text, area_sqft numeric, dimensions text, facing text NULL, price_per_sqft_minor bigint NULL, currency, price_is_public bool, status PlotStatus, hold_expires_at timestamptz NULL, version int (optimistic locking).
UNIQUE (project_id, plot_number). Index: (project_id, status).

### leads (local read model)
id, customer_id FK users NULL SET NULL, project_id FK RESTRICT, name, phone_e164, email NULL, source LeadSource, campaign_id text NULL (validated server-side), interest_status, assigned_staff_id FK users NULL SET NULL, sync_status SyncStatus, dedup_key text.
Indexes: (phone_e164), (project_id, created_at), (source), (assigned_staff_id), (sync_status).
UNIQUE (dedup_key) WHERE window applies. The final dedup policy is still pending (see the CRM doc).

### enquiries
id, lead_id FK CASCADE, customer_id NULL, idempotency_key text UNIQUE, message text NULL, utm jsonb, submitted_via LeadSource.
Each submission is kept for history. Several enquiries can attach to one lead.

### lead_activities
id, lead_id FK CASCADE, actor_id FK users, type (NOTE | CALL | MEETING | STATUS_CHANGE), body, occurred_at.

### crm_mappings
id, system text (e.g. `sandbox`, `<vendor>`), entity_type text (`lead`, `employee`), external_id text, local_id uuid, sync_status, last_synced_at.
UNIQUE (system, entity_type, external_id). UNIQUE (system, entity_type, local_id).

### site_visits
id, lead_id FK RESTRICT, customer_id NULL, project_id FK RESTRICT, requested_for timestamptz, scheduled_at NULL, assigned_staff_id NULL, status VisitStatus, outcome_notes.
Indexes: (scheduled_at), (assigned_staff_id, scheduled_at), (status).

### booking_requests
id, reference text UNIQUE (human-readable, e.g. `BMI-BR-000123`), lead_id FK RESTRICT, customer_id FK RESTRICT, plot_id FK RESTRICT, status BookingRequestStatus, terms_version text, customer_note, reviewed_by FK users NULL, reviewed_at, decision_reason.
Indexes: (status, created_at), (plot_id, status).
Partial UNIQUE (plot_id) WHERE status = 'APPROVED' stops two approved requests existing for one plot.

### consent_records (append-only)
id, customer_id NULL, lead_id NULL, phone_e164, purpose text, channel NotificationChannel, status ConsentStatus, source text, recorded_at.
Index: (phone_e164, purpose, recorded_at DESC).

### device_tokens
id, user_id FK CASCADE, fcm_token text UNIQUE, platform, last_seen_at.

### notification_jobs
id, recipient_id FK users, channel, template, payload jsonb, status, attempts int, scheduled_at, sent_at, last_error.
Index: (status, scheduled_at).

### integration_events
id, provider text, direction, event_type, idempotency_key text, payload jsonb (minimised PII), status SyncStatus, attempts, next_attempt_at, last_error.
UNIQUE (provider, idempotency_key). Index: (status, next_attempt_at).

### audit_logs (append-only)
id, actor_id NULL, action text, entity_type, entity_id uuid, before jsonb, after jsonb, ip inet NULL, correlation_id, created_at.
Index: (entity_type, entity_id, created_at).

## Explicitly absent
No payment, transaction, gateway or invoice tables in the MVP.
