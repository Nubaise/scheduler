# FAS — Implementation Learning Log

This document records the concepts learned, setup performed,
implementation steps, problems encountered, and lessons learned
while building the FAS MVP.

---

# Phase 1 — Foundation

## Step 1: Understand the Repository Structure

### What we're building

FAS will use a monorepo containing three independently runnable applications:

- apps/api — Backend REST API
- apps/worker — Background notification worker
- apps/web — React frontend

Additional repository areas:

- packages/ — Shared code
- infra/ — Infrastructure and deployment configuration
- scripts/ — Developer and automation scripts
- docs/ — Project documentation

### Why?

FAS has three distinct runtime responsibilities:

**API**

    Browser → REST API → Business Logic → PostgreSQL

Handles authentication, users, faculty, availability, appointments, and other synchronous application operations.

**Worker**

    PostgreSQL Durable Job
            ↓
         Worker
            ↓
    Transactional Email Provider

Handles asynchronous notification processing without making API requests wait for email delivery.

**Web**

    Student / Faculty / Admin
              ↓
        React Application
              ↓
           REST API

The applications live in one repository but can be built and deployed independently.

### Concept Learned

This structure is called a **monorepo**: multiple applications and packages are maintained in a single Git repository.

---

## Step 2: Why pnpm?

### What is pnpm?

pnpm is a JavaScript/TypeScript package manager used to install dependencies, run scripts, and manage workspace projects.

### Why FAS uses it

FAS contains multiple applications that share the same repository and may eventually share packages.

A pnpm workspace allows these applications to be managed together while maintaining separate application boundaries.

### Concept Learned

A package manager manages project dependencies and provides commands for installing packages and running project scripts.

A workspace manages multiple related packages/applications as one project.

---

## Step 3: Check the Development Environment

### What we're checking

Before creating the application, verify that the required development tools are installed.

### Commands

    node --version
    npm --version
    pnpm --version
    git --version

### Result

The development environment was verified successfully.

- Node.js: `v24.11.0`
- npm: `11.6.1`
- pnpm: `10.28.1`
- Git: `2.52.0.windows.1`

### Lesson

Node.js provides the runtime for the TypeScript/JavaScript applications.

npm and pnpm are package managers.

Git provides version control for the implementation repository.

## Step 4: Create the pnpm Workspace

### What we did

Created the root Node.js project and configured pnpm as the workspace package manager.

### Files

- `package.json` — defines the root project and package manager version.
- `pnpm-workspace.yaml` — tells pnpm that applications and shared packages live under `apps/*` and `packages/*`.

### Directories

- `apps/` — application projects
- `packages/` — shared code
- `infra/` — infrastructure configuration
- `scripts/` — development and automation scripts
- `docs/` — project documentation

### Commands

    pnpm init
    pnpm pkg set private=true --json
    pnpm pkg set "packageManager=pnpm@10.28.1"

### Result

The repository is now configured as a pnpm monorepo.

### Lesson

A monorepo is a single repository containing multiple related applications or packages.

A pnpm workspace provides the tooling needed to manage those projects together while keeping their boundaries separate.

---

## Step 5: Create the Applications

FAS uses three independently runnable applications:

- `apps/api` — Backend REST API
- `apps/worker` — Background notification worker
- `apps/web` — React frontend

The applications are being scaffolded incrementally while preserving the
existing pnpm workspace structure.

### Step 5.1: Create the API — NestJS

#### What we're building

The FAS backend API is implemented using NestJS + TypeScript + Node.js.

The application is located at:

    apps/api/

#### Official NestJS setup

The current official NestJS CLI was used to scaffold the application:

    pnpm dlx @nestjs/cli@12.0.0 new api --directory apps/api --package-manager pnpm --skip-git

The Nest CLI generated the standard Nest application structure.

The following choices were made during scaffolding:

- ES Modules (ESM)
- Vitest
- Oxlint
- Express platform adapter
- Auto-instrumented Nest observability was not enabled

#### Why ESM?

ESM is the native modern JavaScript module system supported by current
Node.js versions. FAS is using Node.js 24, so there is no runtime need to
use CommonJS for compatibility with an older Node.js release.

The Nest CLI provides ESM as a first-class application option.

#### Why Vitest?

The current NestJS CLI provides Vitest with the ESM application template.
Vitest provides the initial unit and integration testing foundation for
the API.

#### Node.js version adjustment

The initial environment used Node.js `v24.11.0`.

The current NestJS CLI requires Node.js `24.15.0+` on the Node 24 line for
project generation, so Node.js was upgraded to `v24.20.0`.

The repository's pnpm version remained unchanged at `10.28.1`.

#### Generated application structure

The NestJS scaffold created:

- `src/main.ts` — application bootstrap
- `src/app.module.ts` — root Nest module
- `src/app.controller.ts` — initial HTTP controller
- `src/app.service.ts` — initial provider
- `test/` — end-to-end testing foundation
- `nest-cli.json` — Nest CLI configuration
- TypeScript configuration
- Vitest configuration
- Oxlint configuration

#### Concepts learned

**NestFactory**

`NestFactory.create(AppModule)` creates the Nest application from the
root module.

**Module**

A Nest module organizes related controllers and providers. `AppModule`
is the root module of the application.

**Controller**

A controller defines HTTP routes and handles incoming requests.

**Provider**

A provider is an injectable class managed by Nest's dependency-injection
container.

**Dependency Injection**

Nest can create and supply providers to other classes rather than
requiring those classes to construct their dependencies manually.

#### Verification

The generated API was verified using:

    pnpm run build
    pnpm test
    pnpm run lint

Results:

- Build: passed
- Tests: 1 passed
- Lint: 0 warnings and 0 errors

The application was also started and tested over HTTP.

Request:

    GET http://localhost:3000

Result:

    HTTP 200 OK
    Hello World!

#### Result

The FAS API application now has a working NestJS foundation at
`apps/api/`.

The worker and web applications remain to be scaffolded.

### Step 5.2: Create the Worker — NestJS Standalone Application

#### What we're building

FAS requires an independent background worker for asynchronous notification
processing.

The worker will eventually process durable PostgreSQL notification jobs and
deliver transactional email without making API requests wait for email
delivery.

The application is located at:

    apps/worker/

#### Official NestJS setup

The worker was scaffolded using the official NestJS CLI:

    pnpm dlx @nestjs/cli@12.0.0 new worker --directory apps/worker --package-manager pnpm --skip-git

The following choices were made during scaffolding:

- ES Modules (ESM)
- Vitest
- Oxlint
- Express platform adapter was initially generated by the standard Nest scaffold
- Auto-instrumented Nest observability was not enabled

The generated HTTP-specific application code was then converted into a
NestJS standalone application.

#### Why a standalone NestJS application?

The worker does not need to expose an HTTP API.

NestJS supports standalone applications using:

    NestFactory.createApplicationContext(AppModule)

This creates the Nest application context without starting an HTTP server.

The worker therefore remains an independently runnable background process.

#### Worker bootstrap

The worker entry point uses:

    NestFactory.createApplicationContext(AppModule)

and closes the application context after initialization for the current
foundation milestone.

The durable worker processing loop has not yet been implemented. It belongs
to the later Notifications & Worker implementation phase.

#### HTTP isolation

The generated HTTP listener was removed from the worker.

The worker was started successfully and `AppModule` initialized without
starting an HTTP server.

Port verification confirmed:

    TcpTestSucceeded : False

for port `3000`.

#### Generated HTTP code removed

The standard Nest HTTP scaffold included controller and HTTP end-to-end
test files that are not required for the standalone worker foundation.

These were removed:

- `src/app.controller.ts`
- `src/app.controller.spec.ts`
- `test/app.e2e-spec.ts`

A worker module bootstrap test was added instead:

- `src/app.module.spec.ts`

#### Concepts learned

**Standalone Application**

A Nest standalone application creates a dependency-injection application
context without starting an HTTP server.

**Application Context**

The application context initializes Nest modules and providers so they can
be used by background processes, scripts, or other non-HTTP applications.

**createApplicationContext**

`NestFactory.createApplicationContext(AppModule)` is the NestJS mechanism
used to bootstrap the standalone worker.

#### Verification

The worker was verified using:

    pnpm run build
    pnpm test
    pnpm run lint

Results:

- Build: passed
- Tests: 1 passed
- Lint: 0 warnings and 0 errors

The worker was also started successfully and initialized `AppModule`.

HTTP isolation was verified separately:

    Test-NetConnection localhost -Port 3000

Result:

    TcpTestSucceeded : False

#### Result

The FAS worker now has a working NestJS standalone foundation at
`apps/worker/`.

The PostgreSQL durable notification job processing, retries, idempotency,
failure recovery, and transactional email integration remain to be
implemented during the later Notifications & Worker phase.

### Step 5.3: Create the Web Application — React + TypeScript + Vite

#### What we're building

FAS uses a separate React frontend application for Student, Faculty, and
Admin workflows.

The application is located at:

    apps/web/

#### Official React/Vite setup

The web application was scaffolded using the official Vite workflow with
the React TypeScript template:

    pnpm create vite apps/web --template react-ts

The Vite scaffolder was configured to use:

- React
- TypeScript
- Vite
- ES Modules (ESM)
- Oxlint

The application dependencies were installed using pnpm.

#### Why Vite?

Vite provides the build and development tooling for the React frontend.

The FAS architecture requires a separate React frontend communicating with
the backend through the REST API. Vite provides the required development
server and production build tooling without introducing an additional
application framework.

Create React App was not used.

#### Generated application structure

The Vite scaffold created:

- `src/main.tsx` — React application entry point
- `src/App.tsx` — initial application component
- `src/App.css` — component styling
- `src/index.css` — global styling
- `src/assets/` — frontend assets
- `public/` — static public assets
- `index.html` — application HTML entry point
- `vite.config.ts` — Vite configuration
- TypeScript configuration
- Oxlint configuration

#### Concepts learned

**React**

React provides the component-based UI layer for the FAS frontend.

**Vite**

Vite provides the frontend development server and production build
pipeline.

**TypeScript**

TypeScript provides static typing for the React application.

**ESM**

The web application uses the modern JavaScript module system supported by
current Node.js and browser tooling.

#### Verification

The generated web application was verified using:

    pnpm run build
    pnpm run lint

Results:

- Build: passed
- Lint: 0 warnings and 0 errors

The development server was also started successfully.

HTTP verification:

    GET http://localhost:5173

Result:

    HTTP 200 OK

#### Result

The FAS React frontend now has a working foundation at `apps/web/`.

Routing, authentication UI, API integration, Student workflows, Faculty
workflows, and Admin workflows remain for later implementation phases.

---

# Phase 2 — Database

## Step 1: Establish the Database Package

### What we're building

FAS uses PostgreSQL hosted by Neon, with TypeORM as the ORM.

The database implementation is isolated in a shared workspace package:

    packages/database/

This package will provide the shared database infrastructure used by the
API and worker.

### Technology

- PostgreSQL
- Neon PostgreSQL
- TypeORM
- PostgreSQL `pg` driver
- NestJS TypeORM integration
- TypeScript

### Why a shared database package?

The API and worker both need access to the same PostgreSQL database.

Keeping the database infrastructure in `packages/database/` avoids
duplicating connection and migration configuration across applications.

### Concepts Learned

**Workspace Package**

A shared package inside the pnpm monorepo that can be consumed by multiple
applications.

**TypeORM DataSource**

The TypeORM `DataSource` represents the application's database connection
configuration and is also used by the TypeORM migration tooling.

---

## Step 2: Configure TypeORM

### What we implemented

Created:

    packages/database/src/data-source.ts

The DataSource uses:

- PostgreSQL
- `DATABASE_URL`
- SSL
- `synchronize: false`
- TypeORM migrations
- TypeORM entities

### Why `synchronize: false`?

FAS will use version-controlled database migrations rather than allowing
the application to automatically modify the database schema.

This makes database schema changes explicit, reviewable, and reproducible.

### Concepts Learned

**Migration**

A version-controlled database change that can be applied and reverted in
a controlled sequence.

**Entity**

A TypeORM representation of a database table/domain object. The FAS domain
entities will be implemented in a later database-schema step.

---

## Step 3: Establish Migration Tooling

### What we implemented

The database package uses TypeORM's ESM CLI through `ts-node`.

Migration commands were established for:

- Creating migrations
- Generating migrations
- Running migrations
- Reverting migrations
- Showing migration status

### Verification

The TypeORM CLI was successfully executed from the database package.

The database package also builds successfully using TypeScript.

### Result

The migration tooling is ready for the initial FAS database schema.

---

## Step 4: Connect to Neon PostgreSQL

### Environment

The repository uses a root-level local environment file:

    .env

The environment contract is documented through:

    .env.example

The actual `.env` file is excluded from Git.

### Database Configuration

The application reads:

    DATABASE_URL

The connection string is provided by the Neon PostgreSQL project.

### Verification

The TypeORM migration status command was executed successfully against
Neon PostgreSQL.

No migrations currently exist, so there are no migration records to
display yet.

### Result

The FAS application can successfully connect to the Neon PostgreSQL
database through TypeORM.

### Security Lesson

Database credentials must remain in local/deployment environment
configuration and must never be committed to Git.

---

## Database Foundation Checkpoint

Completed:

- Neon PostgreSQL project established
- Shared `@fas/database` workspace package established
- TypeORM installed
- PostgreSQL `pg` driver installed
- NestJS TypeORM integration installed
- TypeORM DataSource established
- Migration tooling established
- Environment contract established
- `.env` protected by `.gitignore`
- Neon PostgreSQL connectivity verified
- `synchronize` disabled

### Next

- Define the initial FAS relational schema
- Create the initial migration
- Apply the migration to Neon
- Integrate database access with the API
- Integrate database access with the worker
- Add database integration tests

---

## Step 5: Implement the Initial FAS Relational Schema

### What we're building

The initial FAS relational database schema was implemented using TypeORM
entities and a version-controlled PostgreSQL migration.

The initial schema contains:

- `users`
- `departments`
- `faculty`
- `availability`
- `appointment_requests`
- `alternative_proposals`
- `appointments`

### Relational Model

The main relationships are:

    departments
         │
         │ 1:N
         ▼
      faculty
         │
         │ 1:N
         ▼
    availability

    users
       │
       ├── faculty
       │
       └── appointment_requests
                    │
                    ├── alternative_proposals
                    │
                    └── appointments

### Why separate these entities?

The schema separates different business concepts instead of placing all
scheduling information into a single table.

`users` represents the FAS application identity.

`faculty` represents faculty-specific information.

`departments` provides a normalized institutional reference instead of
storing department names repeatedly in faculty records.

`availability` represents periods during which faculty may be available.

`appointment_requests` represents a request before it becomes a confirmed
appointment.

`alternative_proposals` represents alternative times proposed for a
request.

`appointments` represents confirmed scheduling state.

### Concepts Learned

**Primary Key**

A primary key uniquely identifies a row in a database table.

FAS uses UUID primary keys for the initial schema.

**Foreign Key**

A foreign key connects records between related tables and allows the
database to enforce referential integrity.

Examples include:

    faculty.user_id → users.id

    faculty.department_id → departments.id

    availability.faculty_id → faculty.id

    appointment_requests.faculty_id → faculty.id

### One-to-One Relationship

A FAS user can have at most one faculty profile.

The `faculty.user_id` relationship is therefore unique.

### One-to-Many Relationship

A department can contain multiple faculty members.

A faculty member can have multiple availability periods.

An appointment request can have multiple alternative proposals.

### Appointment Request vs Appointment

A request and a confirmed appointment are separate concepts.

A student can submit an appointment request without immediately creating a
confirmed appointment.

A successful approval produces authoritative appointment state.

The database therefore models:

    appointment_request
            │
            │ 0..1
            ▼
        appointment

The appointment's `appointment_request_id` is unique so one request cannot
produce multiple confirmed appointments.

### Temporal Data

Scheduling timestamps use PostgreSQL `timestamptz`.

Time intervals are represented using:

    starts_at
    ends_at

rather than storing only a duration.

The initial schema enforces:

    start < end

using database-level `CHECK` constraints for availability,
appointment requests, alternative proposals, and appointments.

This prevents invalid intervals from entering the database.

### Migration-First Schema Management

The schema is managed through a TypeORM migration rather than automatic
schema synchronization.

The initial migration was generated as:

    1788000378254-InitialSchema.ts

The migration was reviewed before execution.

### Verification

The database package was successfully built using:

    pnpm --filter @fas/database build

Migration discovery was verified using:

    pnpm --filter @fas/database migration:show

The initial migration was then applied successfully to Neon PostgreSQL
using:

    pnpm --filter @fas/database migration:run

TypeORM reported:

    Migration InitialSchema1788000378254 has been executed successfully.

Migration status was subsequently verified:

    [X] 1 InitialSchema1788000378254

### Concepts Learned

**Migration Generation**

TypeORM can compare the entity definitions with the current database
schema and generate a migration representing the required database
changes.

**Migration Execution**

A migration applies a version-controlled schema change to the database.

**Migration Tracking**

TypeORM records executed migrations in its migration tracking table,
allowing the application to determine which migrations have already been
applied.

**Database Constraints**

Important business invariants should be protected by the database where
possible rather than relying only on application code.

### Git Milestone

The initial relational schema was committed and pushed as:

    d694010 feat: implement initial relational schema

The working tree was verified clean after pushing.

### Result

The initial FAS relational schema is now implemented in TypeORM and
deployed to the Neon PostgreSQL development database.

The remaining Phase 2 work includes:

- Review and add required database indexes
- Development/seed data
- Final database verification
- Database integration testing

---

## Step 6: Add Scheduling Indexes

### What we're building

Database indexes were added for the main FAS scheduling and lookup
patterns.

The indexes cover:

- Faculty appointments by start time
- Student appointments by start time
- Faculty availability by start time
- Faculty appointment requests by status
- Student appointment requests by status
- Alternative proposals by appointment request

### Indexes Added

    appointments(faculty_id, starts_at)

    appointments(student_id, starts_at)

    availability(faculty_id, starts_at)

    appointment_requests(faculty_id, status)

    appointment_requests(student_id, status)

    alternative_proposals(appointment_request_id)

### Why indexes?

An index allows PostgreSQL to locate relevant rows more efficiently
without scanning the entire table.

For example, the index:

    appointments(faculty_id, starts_at)

supports queries that retrieve a faculty member's appointments in
chronological order.

The index:

    availability(faculty_id, starts_at)

supports retrieving a faculty member's availability periods by time.

### Important Distinction

An index improves data access performance but does not enforce the
appointment overlap invariant.

Preventing two concurrent confirmed appointments from occupying
overlapping time for the same faculty member is a separate database
concurrency problem.

That invariant will be implemented as part of the transactional
appointment scheduling work in Phase 6.

### Migration

A separate migration was generated:

    1788011061452-AddSchedulingIndexes.ts

The migration was reviewed before execution and contained only the six
intended indexes.

It was then applied successfully to Neon PostgreSQL.

Migration status was verified using:

    pnpm --filter @fas/database migration:show

Result:

    [X] 1 InitialSchema1788000378254
    [X] 2 AddSchedulingIndexes1788011061452

### Concepts Learned

**Index**

A database structure that helps PostgreSQL find rows efficiently based
on indexed columns.

**Composite Index**

An index containing multiple columns.

For example:

    (faculty_id, starts_at)

The column order matters because PostgreSQL can use the index most
effectively for queries matching the leading columns.

**Index vs Constraint**

An index primarily supports efficient data access.

A constraint protects data integrity.

They serve different purposes even though some constraints, such as
unique constraints, are implemented using indexes internally.

### Result

The initial FAS schema now has indexes supporting the main scheduling
lookup patterns.

The next Phase 2 task is development/seed data.

## Step 7: Development Seed Data

### What we're building

A deterministic development seed for the FAS database.

The seed provides a small but realistic dataset that can be used while
developing and testing the application without relying on production
data.

### Development Data

The seed creates or reuses:

- One Computer Science and Engineering department
- One development admin user
- One development faculty user
- One development student user
- One faculty profile
- Two faculty availability periods
- One pending appointment request
- One pending appointment request with an alternative proposal
- One approved appointment request with a confirmed appointment

Development users use `.test` email addresses:

    admin@example.test
    faculty@example.test
    student@example.test

These are development identities only. Authentication and institutional
email registration rules remain part of the later authentication and
user-management work.

### Idempotency

The seed is designed to be safely repeatable.

Existing records are looked up using stable development identifiers
before new records are created.

The seed was executed twice against the development Neon database.

Both executions completed successfully and returned the same record IDs,
confirming that the second execution reused the existing development
records instead of creating duplicates.

### Seed Command

A package script was added:

    pnpm --filter @fas/database seed

The seed is executed directly through the TypeScript ESM loader.

### Concepts Learned

**Seed Data**

Development data inserted into a database to provide a known state for
local development and testing.

**Deterministic Seed**

A seed whose records can be reliably identified and reused, producing a
predictable development database state.

**Idempotent Operation**

An operation that can be executed multiple times without producing an
incorrect additional effect.

For the FAS seed, running the command repeatedly does not create
duplicate development users, faculty profiles, availability periods,
requests, proposals, or appointments.

### Important Boundary

The seed does not implement authentication, password handling,
institutional email validation, or authorization.

Those concerns belong to the appropriate later implementation phases.

### Result

The FAS database now has reproducible development data that can be used
by subsequent backend and integration work.

The next Phase 2 task is final database verification before moving to
backend implementation.

---

# Phase 3 — Backend

## Step 1: Establish Backend Configuration

### What we're building

The FAS backend needs centralized configuration and environment validation so
that required configuration is checked when the application starts.

### What we implemented

The API now uses NestJS `ConfigModule` with:

- A configuration factory
- Joi environment validation
- Global configuration availability

The configuration is loaded during application startup.

### Environment Validation

The API validates the `PORT` environment variable.

An invalid value such as:

```
PORT=invalid
```

causes application startup to fail with a configuration validation error:

```
Config validation error: PORT: "PORT" must be a number
```

When `PORT` is not provided, the application continues using the default
port configured by the bootstrap code.

### Why validate configuration at startup?

Invalid configuration should be detected when the application starts rather
than causing unexpected failures later during request processing.

Failing early makes configuration problems easier to identify and prevents
the application from starting with an invalid runtime configuration.

### Concepts Learned

**Configuration Module**

NestJS `ConfigModule` provides application configuration through the NestJS
dependency-injection system.

**Environment Validation**

Environment variables can be validated against a defined schema before the
application starts.

**Fail Fast**

Configuration errors are detected during startup instead of being allowed
to propagate into runtime behavior.

---

## Step 2: Establish Request Validation

### What we're building

The API must validate incoming request data before it reaches application
logic.

### What we implemented

A shared application setup function was created:

```
apps/api/src/app.setup.ts
```

The function configures a global NestJS `ValidationPipe` with:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`

### Why global validation?

Request validation should be applied consistently across the API rather
than requiring every controller to configure validation independently.

### Validation Behavior

The API rejects invalid request bodies.

For example, a DTO containing an invalid email address or a name shorter
than the required minimum length produces:

```
HTTP 400 Bad Request
```

The API also rejects unexpected properties that are not defined by the DTO.

### Concepts Learned

**DTO**

A Data Transfer Object defines the expected structure of data entering or
leaving an application boundary.

**ValidationPipe**

NestJS provides `ValidationPipe` to validate and transform incoming
request data.

**Whitelist**

The whitelist option allows only properties defined by validation metadata.

**Forbid Non-Whitelisted**

This option rejects requests containing properties that are not allowed
instead of silently removing them.

---

## Step 3: Establish Request IDs

### What we're building

Each API request needs a stable identifier that can later be used to
correlate requests, logs, and errors.

### What we implemented

Created:

```
apps/api/src/common/middleware/request-id.middleware.ts
```

The middleware:

1. Checks for an incoming `X-Request-Id` header.
2. Preserves the supplied value when present.
3. Generates a UUID when no request ID is supplied.
4. Stores the ID on the request.
5. Returns the ID through the `X-Request-Id` response header.

### Verification

A request without a request ID produced a generated UUID:

```
30ba4760-cba3-409e-a811-41225e084018
```

A request with:

```
X-Request-Id: fas-test-request-123
```

returned:

```
X-Request-Id: fas-test-request-123
```

### Why request IDs?

A request ID provides a common identifier that can connect an HTTP request
with application logs and error responses.

This becomes particularly useful when diagnosing failures in a distributed
system containing the API, worker, database, and external services.

### Concepts Learned

**Request Correlation**

A request identifier allows events belonging to the same request to be
connected during troubleshooting.

**Middleware**

Middleware executes during the HTTP request/response lifecycle and can
perform cross-cutting operations before the request reaches a controller.

---

## Step 4: Establish Global Error Handling

### What we're building

The API needs a consistent error response format and should avoid exposing
unnecessary internal implementation details.

### What we implemented

Created:

```
apps/api/src/common/filters/all-exceptions.filter.ts
```

The global exception filter handles both NestJS HTTP exceptions and
unexpected exceptions.

HTTP exceptions return a structured response containing:

- `statusCode`
- `message`
- `error` when available
- `requestId`

Unexpected exceptions return:

```
statusCode: 500
message: "Internal server error"
```

The request ID is included in both cases.

### Error Response

An unknown route was tested using:

```
GET /does-not-exist
```

The API returned:

```
{
  "statusCode": 404,
  "message": "Cannot GET /does-not-exist",
  "error": "Not Found",
  "requestId": "e5e6d828-51ae-49c6-ae73-b56a120d18eb"
}
```

The response header was also verified using a known request ID:

```
X-Request-Id: fas-error-test-123
```

The returned response header contained:

```
X-Request-Id: fas-error-test-123
```

### Why a global exception filter?

Centralizing exception handling provides a consistent API error contract and
prevents individual controllers from having to implement the same error
formatting behavior.

The filter also prevents unexpected server exceptions from being returned
with potentially sensitive implementation details.

### Concepts Learned

**Exception Filter**

A NestJS exception filter intercepts exceptions and controls how they are
converted into HTTP responses.

**Error Contract**

An API error contract defines the structure clients can consistently expect
when requests fail.

**Internal Error Isolation**

Unexpected server errors should expose a generic message to clients while
allowing detailed diagnostic information to be handled by server-side
logging.

---

## Backend Foundation Checkpoint

Completed:

- Centralized application configuration
- Environment validation with Joi
- Global request validation
- Whitelist enforcement
- Request ID middleware
- Request ID propagation through responses
- Global exception handling
- Consistent HTTP error responses
- Generic handling for unexpected server errors

### Verification

The API backend foundation was verified using:

```
pnpm --filter api build
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api lint
```

Results:

- Build: passed
- Unit tests: 1 passed
- E2E tests: 1 passed
- Lint: 0 warnings and 0 errors

Additional manual verification confirmed:

- Invalid `PORT` configuration prevents application startup.
- Generated request IDs are returned through `X-Request-Id`.
- Supplied request IDs are preserved.
- Unknown routes return the standardized error response.
- Error response request IDs are preserved.

### Git Milestone

The backend foundation checkpoint was committed and pushed as:

```
2b07f45 feat: establish backend validation and error handling
```

The working tree was verified clean after pushing.

### Result

The FAS API now has a validated configuration foundation, global request
validation, request correlation, and centralized error handling.

The remaining Phase 3 work includes:

- Structured logging
- OpenAPI API documentation
- Final Phase 3 verification

---

# Phase 4 — Authentication & Users

_To be completed._

---

# Phase 5 — Faculty & Availability

_To be completed._

---

# Phase 6 — Appointments

_To be completed._

---

# Phase 7 — Notifications & Worker

_To be completed._

---

# Phase 8 — Frontend

_To be completed._

---

# Phase 9 — Testing & Hardening

_To be completed._

---

# Phase 10 — Deployment

_To be completed._

---

# Problems & Lessons

_To be completed as implementation progresses._
