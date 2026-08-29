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

### Step 5.3: Create the Web Application

_To be completed._

---

# Phase 2 — Database

_To be completed._

---

# Phase 3 — Backend

_To be completed._

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
