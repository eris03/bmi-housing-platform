# BMI Housing Platform

Digital property platform for BMI Housing Society: an Android customer app, a public QR/project website, an admin dashboard and an API integrated with the existing CRM. Payments are excluded from the MVP.

**Status:** Milestone 01 (design). No application code yet.

## Docs
- [Requirements and assumptions](docs/requirements-and-assumptions.md)
- [Architecture](docs/architecture.md)
- [Database schema](docs/database-schema.md)
- [API contracts](docs/api-contracts.md)
- [CRM integration](docs/crm-integration.md)
- [Security](docs/security.md)
- [Milestones](docs/milestones.md)

## Planned layout
```
apps/mobile   Flutter Android app
apps/web      Next.js public site + admin
apps/api      NestJS REST API
packages/     contracts, api-client, config, validation
infrastructure/  docker, deployment, monitoring
docs/
```
