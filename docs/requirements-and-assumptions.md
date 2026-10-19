# Requirements and assumptions

## Goals (MVP)

- Customers can discover projects, view plots, submit an enquiry (app or QR web page, no install required), mark their interest, request a site visit, submit a booking request and track statuses.
- Staff can manage leads, visits, booking reviews, projects and inventory in a web dashboard.
- Every enquiry reaches the existing CRM through an adapter, without loss during CRM outages.

## Non-goals (MVP)

Payments, UPI, payment confirmation, AI voice calling, autonomous agents, predictive scoring, iOS, and unverified integrations.

## Assumptions (to be confirmed)

| #   | Assumption                                                         | Impact if wrong                                                        |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| A1  | The CRM has an HTTP API that can create, read and update leads     | Fall back to an approved import/export or webhook flow                 |
| A2  | Plot inventory is **not** currently held in the CRM                | If it is, the platform reads plots from the CRM instead of owning them |
| A3  | Customers log in with phone OTP                                    | Changes the identity provider choice                                   |
| A4  | Single currency (INR) and single default timezone (Asia/Kolkata)   | Schema already stores UTC and minor units; low impact                  |
| A5  | A booking approval places a time-bound **hold**, not a sale        | Hold duration is a business setting                                    |
| A6  | Staff accounts are created by admins, not self-registered          | Low                                                                    |
| A7  | Hosting will be a managed container platform plus managed Postgres | Deployment docs change                                                 |

## Open questions for the business

1. Which CRM is it (product, version, environment)? Is it the "Lead Diary" workflow?
2. API docs, auth method, rate limits and a sandbox account.
3. Lead dedup rule: same phone and same project within X days. What is X?
4. Lead status values in the CRM, and how they map to `InterestStatus`.
5. Who may approve booking requests, and what is the hold duration?
6. Which plot fields are public (price? availability?)?
7. Branding assets: logo, colours, fonts.
8. Consent purposes and wording (service updates, marketing, WhatsApp).
9. Data retention period and the account-deletion procedure.
10. Choice of identity provider and hosting, plus budget.
