# CRM integration

Status: **Blocked on discovery.** No real CRM endpoints are implemented or assumed. Until discovery is complete, only a clearly labelled `SandboxCrmAdapter` exists, and it never talks to any external system.

## Adapter interface

```ts
interface CrmAdapter {
  readonly name: string;            // e.g. "sandbox", "<vendor>"
  createLead(input: CreateCrmLeadInput): Promise<CrmLeadResult>;
  getLead(externalId: string): Promise<CrmLeadResult | null>;
  updateLead(externalId: string, input: UpdateCrmLeadInput): Promise<CrmLeadResult>;
  assignLead?(externalId: string, crmEmployeeId: string): Promise<void>; // only if supported
  healthCheck(): Promise<CrmHealthResult>;
}
```

Errors are classified as `TransientCrmError` (retry) or `PermanentCrmError` (fail and surface in admin).

## Delivery model: transactional outbox
- The enquiry and its `integration_events` row are written in the same transaction.
- A worker claims events with `SELECT … FOR UPDATE SKIP LOCKED`.
- The idempotency key is `enquiry:<uuid>` and is sent to the CRM if it supports one. Otherwise a `getLead`/search runs before any re-create.
- Retries use exponential backoff with full jitter (base 30s, cap 1h, max 8 attempts, all configurable). After that the event becomes `FAILED`.
- Reconciliation runs as a scheduled job over `PENDING`/`RETRY` events older than a threshold.
- Inbound webhooks: verify the signature, store the payload in `integration_events` keyed by the provider event ID (unique), then process it idempotently.

## Field mapping (to fill in during discovery)
| Platform field | CRM field | Owner | Direction |
|---|---|---|---|
| name | ? | CRM after create | → |
| phone (E.164) | ? | CRM | → |
| email | ? | CRM | → |
| project | ? | Platform | → |
| source / campaign | ? | Platform | → |
| interest status | ? | ? | ↔ |
| assigned staff | ? | CRM | ← |
| lead status | ? | CRM | ← |

## Status mapping (to fill in)
| Platform `InterestStatus` | CRM status |
|---|---|
| INTERESTED | ? |
| NOT_INTERESTED | ? |
| MAYBE_LATER | ? |

## Unresolved requirements (needed from the business or CRM vendor)
- [ ] CRM product name, version and hosting (SaaS or self-hosted)
- [ ] API documentation or another confirmed integration method
- [ ] Auth method (API key, OAuth2 client credentials, …) and required scopes
- [ ] Lead create, read, update and search operations, and their payloads
- [ ] Duplicate detection rules on the CRM side
- [ ] Employee identifiers and the assignment API
- [ ] Webhook events, payloads and the signature verification method
- [ ] Rate limits, error codes and idempotency support
- [ ] Sandbox or test environment and test credentials
- [ ] Existing lead statuses and the Lead Diary workflow to preserve
- [ ] Whether plot inventory exists in the CRM

## Rules
- Never connect directly to the CRM's production database.
- Never log tokens, or full phone or email values (log masked values).
- Never report "synced" before the CRM confirms it.
- Preserve existing lead ownership and assignments.
