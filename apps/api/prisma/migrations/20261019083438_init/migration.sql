-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CUSTOMER', 'SALES', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'PENDING_DELETION');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO_LINK');

-- CreateEnum
CREATE TYPE "public"."PlotStatus" AS ENUM ('AVAILABLE', 'ON_HOLD', 'RESERVED', 'SOLD', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."LeadSource" AS ENUM ('ANDROID_APP', 'QR_CODE', 'META_AD', 'WEBSITE', 'PHONE', 'STAFF_CREATED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InterestStatus" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'MAYBE_LATER');

-- CreateEnum
CREATE TYPE "public"."VisitStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."BookingRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'RETRY', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ConsentStatus" AS ENUM ('GRANTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('PUSH', 'EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."IntegrationDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "identity_subject" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone_e164" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff_project_scopes" (
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,

    CONSTRAINT "staff_project_scopes_pkey" PRIMARY KEY ("user_id","project_id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location_text" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "map_url" TEXT,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_media" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "media_type" "public"."MediaType" NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plots" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "plot_number" TEXT NOT NULL,
    "area_sqft" DECIMAL(12,2) NOT NULL,
    "dimensions" TEXT,
    "facing" TEXT,
    "price_per_sqft_minor" BIGINT,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "price_is_public" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."PlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "hold_expires_at" TIMESTAMPTZ,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" UUID NOT NULL,
    "customer_id" UUID,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "email" TEXT,
    "source" "public"."LeadSource" NOT NULL,
    "campaign_id" TEXT,
    "interest_status" "public"."InterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "assigned_staff_id" UUID,
    "sync_status" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "dedup_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enquiries" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "customer_id" UUID,
    "idempotency_key" TEXT NOT NULL,
    "message" TEXT,
    "utm" JSONB NOT NULL DEFAULT '{}',
    "submitted_via" "public"."LeadSource" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_activities" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "body" TEXT,
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crm_mappings" (
    "id" UUID NOT NULL,
    "system" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "local_id" UUID NOT NULL,
    "sync_status" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "last_synced_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_visits" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "customer_id" UUID,
    "project_id" UUID NOT NULL,
    "requested_for" TIMESTAMPTZ NOT NULL,
    "scheduled_at" TIMESTAMPTZ,
    "assigned_staff_id" UUID,
    "status" "public"."VisitStatus" NOT NULL DEFAULT 'REQUESTED',
    "outcome_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking_requests" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "lead_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "plot_id" UUID NOT NULL,
    "status" "public"."BookingRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "terms_version" TEXT NOT NULL,
    "customer_note" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "decision_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consent_records" (
    "id" UUID NOT NULL,
    "customer_id" UUID,
    "lead_id" UUID,
    "phone_e164" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL,
    "status" "public"."ConsentStatus" NOT NULL,
    "source" TEXT NOT NULL,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "fcm_token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_jobs" (
    "id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL,
    "template" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "scheduled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ,
    "last_error" TEXT,

    CONSTRAINT "notification_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."integration_events" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "direction" "public"."IntegrationDirection" NOT NULL,
    "event_type" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ip" INET,
    "correlation_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_identity_subject_key" ON "public"."users"("identity_subject");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_e164_key" ON "public"."users"("phone_e164");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "public"."users"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "public"."projects"("slug");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "public"."projects"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_media_storage_key_key" ON "public"."project_media"("storage_key");

-- CreateIndex
CREATE INDEX "project_media_project_id_sort_order_idx" ON "public"."project_media"("project_id", "sort_order");

-- CreateIndex
CREATE INDEX "plots_project_id_status_idx" ON "public"."plots"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "plots_project_id_plot_number_key" ON "public"."plots"("project_id", "plot_number");

-- CreateIndex
CREATE UNIQUE INDEX "leads_dedup_key_key" ON "public"."leads"("dedup_key");

-- CreateIndex
CREATE INDEX "leads_phone_e164_idx" ON "public"."leads"("phone_e164");

-- CreateIndex
CREATE INDEX "leads_project_id_created_at_idx" ON "public"."leads"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "public"."leads"("source");

-- CreateIndex
CREATE INDEX "leads_assigned_staff_id_idx" ON "public"."leads"("assigned_staff_id");

-- CreateIndex
CREATE INDEX "leads_sync_status_idx" ON "public"."leads"("sync_status");

-- CreateIndex
CREATE UNIQUE INDEX "enquiries_idempotency_key_key" ON "public"."enquiries"("idempotency_key");

-- CreateIndex
CREATE INDEX "lead_activities_lead_id_occurred_at_idx" ON "public"."lead_activities"("lead_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "crm_mappings_system_entity_type_external_id_key" ON "public"."crm_mappings"("system", "entity_type", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_mappings_system_entity_type_local_id_key" ON "public"."crm_mappings"("system", "entity_type", "local_id");

-- CreateIndex
CREATE INDEX "site_visits_scheduled_at_idx" ON "public"."site_visits"("scheduled_at");

-- CreateIndex
CREATE INDEX "site_visits_assigned_staff_id_scheduled_at_idx" ON "public"."site_visits"("assigned_staff_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "site_visits_status_idx" ON "public"."site_visits"("status");

-- CreateIndex
CREATE UNIQUE INDEX "booking_requests_reference_key" ON "public"."booking_requests"("reference");

-- CreateIndex
CREATE INDEX "booking_requests_status_created_at_idx" ON "public"."booking_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "booking_requests_plot_id_status_idx" ON "public"."booking_requests"("plot_id", "status");

-- CreateIndex
CREATE INDEX "consent_records_phone_e164_purpose_recorded_at_idx" ON "public"."consent_records"("phone_e164", "purpose", "recorded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_fcm_token_key" ON "public"."device_tokens"("fcm_token");

-- CreateIndex
CREATE INDEX "notification_jobs_status_scheduled_at_idx" ON "public"."notification_jobs"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "integration_events_status_next_attempt_at_idx" ON "public"."integration_events"("status", "next_attempt_at");

-- CreateIndex
CREATE UNIQUE INDEX "integration_events_provider_idempotency_key_key" ON "public"."integration_events"("provider", "idempotency_key");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "public"."audit_logs"("entity_type", "entity_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."staff_project_scopes" ADD CONSTRAINT "staff_project_scopes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."staff_project_scopes" ADD CONSTRAINT "staff_project_scopes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_media" ADD CONSTRAINT "project_media_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plots" ADD CONSTRAINT "plots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enquiries" ADD CONSTRAINT "enquiries_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_activities" ADD CONSTRAINT "lead_activities_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_visits" ADD CONSTRAINT "site_visits_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_visits" ADD CONSTRAINT "site_visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_visits" ADD CONSTRAINT "site_visits_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_visits" ADD CONSTRAINT "site_visits_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "public"."plots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consent_records" ADD CONSTRAINT "consent_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_jobs" ADD CONSTRAINT "notification_jobs_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
