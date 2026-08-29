# FAS — Implementation Learning Log

This document records the concepts learned, setup performed,
implementation steps, problems encountered, and lessons learned
while building the FAS MVP.

---

# Phase 1 — Foundation

## Step 1: Understand the Repository Structure

### What we're building

FAS will use a monorepo containing three independently runnable applications:

- pps/api — Backend REST API
- pps/worker — Background notification worker
- pps/web — React frontend

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
