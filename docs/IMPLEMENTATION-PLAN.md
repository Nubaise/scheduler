# FAS — Implementation Plan

**Status:** Ready for Implementation
**Architecture Baseline:** `77a3148`
**Implementation Repository:** `scheduler`

## 1. Objective

Implement the FAS MVP according to the frozen architecture baseline.

## 2. Final Technology Stack

- Frontend: React + TypeScript
- Backend: NestJS + TypeScript + Node.js
- API: REST over HTTPS
- API contract: OpenAPI
- Database: PostgreSQL via Neon
- ORM: TypeORM
- Async processing: PostgreSQL durable notification jobs / transactional outbox
- Worker: Independent background worker
- Email: Transactional email provider
- Local/container tooling: Docker
- Database hosting: Neon PostgreSQL
- Application hosting: Managed application/container platform
- IaC: Terraform/OpenTofu
- CI/CD: Managed CI/CD
- Observability: Structured logging + monitoring + alerts

## 3. Repository Structure

```
scheduler/
├── apps/
│   ├── api/
│   ├── worker/
│   └── web/
├── packages/
├── infra/
├── scripts/
└── docs/
```

## 4. Implementation Order

### Phase 1 — Foundation

- Monorepo setup
- TypeScript/tooling configuration
- API, worker, and web scaffolding
- Environment/configuration management
- Docker development tooling

### Phase 2 — Database

- Neon PostgreSQL setup
- TypeORM configuration
- Database entities
- Migrations
- Constraints and indexes
- Seed/development data

### Phase 3 — Backend

- NestJS module structure
- Configuration
- Validation
- Error handling
- Logging
- OpenAPI

### Phase 4 — Authentication & Users

- Authentication
- Roles
- Authorization
- User management

### Phase 5 — Faculty & Availability

- Faculty management
- Availability
- Scheduling constraints

### Phase 6 — Appointments

- Appointment lifecycle
- Conflict prevention
- Transactional scheduling
- Concurrency protection

### Phase 7 — Notifications & Worker

- Durable notification jobs
- Background worker
- Retries
- Idempotency
- Failure recovery
- Transactional email integration

### Phase 8 — Frontend

- Application shell
- Authentication
- Student workflows
- Faculty workflows
- Admin workflows
- Appointment workflows

### Phase 9 — Testing & Hardening

- Unit tests
- Integration tests
- API tests
- E2E tests
- Security testing
- Failure/recovery testing
- Performance verification

### Phase 10 — Deployment

- Production containers
- Neon PostgreSQL production configuration
- Infrastructure as Code
- CI/CD
- Monitoring and alerts
- Backup/recovery verification

## 5. Quality Gates

Each phase must:

- Build successfully
- Pass applicable automated tests
- Preserve architecture invariants
- Keep database migrations reproducible
- Keep secrets out of source control
- Leave the working tree clean before completion

## 6. Definition of Done

The MVP is complete when:

- Approved MVP requirements are implemented
- Scheduling concurrency invariants are enforced
- Notification jobs are durable and recoverable
- Authentication and authorization are enforced server-side
- Automated tests pass
- Production deployment is reproducible
- Monitoring and recovery mechanisms are operational
- Neon PostgreSQL is configured securely for the required environments

## 7. Architecture Change Rule

The architecture baseline is frozen at `77a3148`.

Implementation must follow it.

If implementation exposes a genuine architectural contradiction, stop the affected work and document an explicit architecture decision before changing the implementation.

## 8. Implementation Principle

Build incrementally, verify each phase, commit stable milestones, and avoid introducing infrastructure that is not required by the frozen MVP architecture.

Neon is the selected managed PostgreSQL provider and does not alter the PostgreSQL-based architecture.
