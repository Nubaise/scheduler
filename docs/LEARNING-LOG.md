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

### Step 5.2: Create the Worker

_To be completed._

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
