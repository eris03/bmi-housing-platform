# API contracts (proposed)

Base path `/api/v1`. JSON only. OpenAPI is served at `/api/docs` (disabled in production unless authenticated).

## Conventions
- Success: `{ "data": ..., "meta"?: { "nextCursor": "...", "total"?: n } }`
- Error: `{ "error": { "code": "PLOT_UNAVAILABLE", "message": "...", "correlationId": "..." } }`
- Status codes: 400 malformed, 401 unauthenticated, 403 forbidden, 404 not found / not owned, 409 conflict, 422 business-rule violation, 429 rate-limited, 5xx server.
- `Idempotency-Key` header is **required** on POST `/enquiries`, `/site-visits` and `/booking-requests`.
- Lists use cursor pagination: `?cursor=&limit=` (max 100).
- `X-Correlation-Id` is accepted or generated, and echoed back.

## Public / customer
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /projects | public | published only |
| GET | /projects/:slug | public | |
| GET | /projects/:id/plots | public | public fields only, price only if `price_is_public` |
| POST | /auth/register | public | rate-limited |
| GET | /me | customer | |
| POST | /enquiries | public or customer | rate-limited, returns 202 |
| GET | /me/enquiries | customer | own only |
| POST | /site-visits | customer | |
| GET | /me/site-visits | customer | |
| POST | /booking-requests | customer | creates SUBMITTED, no plot change |
| GET | /me/booking-requests | customer | |
| POST | /me/notification-token | customer | |
| PATCH | /me/consents | customer | appends consent records |

### POST /enquiries
Request:
```json
{
  "projectId": "uuid",
  "name": "string",
  "phone": "+91…",
  "email": "optional",
  "source": "QR_CODE",
  "campaignId": null,
  "interestStatus": "INTERESTED",
  "consents": [{ "purpose": "SERVICE_UPDATES", "granted": true }]
}
```
Response `202`:
```json
{ "data": { "enquiryId": "uuid", "reference": "BMI-EQ-000042", "status": "RECEIVED", "crmSync": "PENDING",
            "message": "Your enquiry has been received." } }
```
`crmLeadId` is never returned to customers.

## Admin (role and project scope enforced server-side)
| Method | Path | Roles |
|---|---|---|
| GET | /admin/dashboard | SALES+ (scoped) |
| POST, PATCH | /admin/projects, /admin/projects/:id | PROJECT_MANAGER+ |
| POST | /admin/projects/:id/media/upload-url | PROJECT_MANAGER+ (presigned PUT) |
| POST | /admin/projects/:id/media | PROJECT_MANAGER+ |
| POST, PATCH | /admin/plots, /admin/plots/:id | PROJECT_MANAGER+ |
| GET | /admin/leads | SALES+ (scoped) |
| PATCH | /admin/leads/:id/assignment | PROJECT_MANAGER+ |
| POST | /admin/leads/:id/activities | SALES+ |
| PATCH | /admin/leads/:id/interest | SALES+ |
| GET, PATCH | /admin/site-visits, /admin/site-visits/:id | SALES+ |
| GET | /admin/booking-requests | PROJECT_MANAGER+ |
| POST | /admin/booking-requests/:id/review | PROJECT_MANAGER+ |
| POST | /admin/booking-requests/:id/approve | PROJECT_MANAGER+ (409 if plot unavailable) |
| POST | /admin/booking-requests/:id/reject | PROJECT_MANAGER+ (reason required) |
| GET, POST, PATCH | /admin/employees | ADMIN+ |
| GET | /admin/integrations/crm/health | ADMIN+ |
| GET | /admin/integrations/events?status=FAILED | ADMIN+ |
| POST | /admin/integrations/events/:id/retry | ADMIN+ |
| GET | /admin/audit-logs | ADMIN+ |
| GET | /admin/exports/leads.csv | ADMIN+ (audited) |

## Health
`GET /health/live` and `GET /health/ready` (checks the database; the CRM is reported but not required).
