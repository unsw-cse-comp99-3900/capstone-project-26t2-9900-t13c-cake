# Consumer Rep Remuneration Tool

UNSW COMP9900/3900 Capstone 26T2, Team T13C Cake

## Project Purpose

The Consumer Rep Remuneration Tool is an interactive decision-support web application for health consumer representatives in Australia.

It helps public users find evidence-based remuneration guidance by completing a short questionnaire and reviewing matched evidence. It also provides an administrator centre for maintaining the evidence base, importing and exporting records, reviewing anonymous feedback, and viewing anonymous usage analytics.

## Key Features

- Public questionnaire for jurisdiction and engagement context selection
- Evidence-based results filtered from the remuneration guidance database
- Side-by-side result comparison
- Print and PDF export for matched results
- Multilingual public interface support
- Privacy notice and anonymous feedback form
- Administrator login and account recovery
- Evidence record create, read, update, and soft delete workflows
- Excel import and export for bulk evidence management
- Anonymous feedback summary for administrators
- Anonymous website usage analytics
- Accessibility support, including high contrast, text controls, keyboard navigation, focus styles, and read-aloud settings
- Docker-based deployment package with PostgreSQL

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| API/backend | Next.js App Router API routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Signed cookie session for a single administrator account |
| Excel handling | SheetJS (`xlsx`) |
| Email recovery | Nodemailer, optional SMTP configuration |
| Testing | Vitest |
| Deployment | Docker, Docker Compose, Node.js 22 |

## High-Level Architecture

The project uses a full-stack Next.js architecture:

- `src/app` contains App Router pages and API routes.
- `src/components` contains reusable UI components for public, results, feedback, and admin pages.
- `src/server/services` contains backend business logic.
- `src/server/repositories` contains Prisma database access logic.
- `src/server/middleware` contains reusable admin authentication checks.
- `src/server/db` contains the shared Prisma client.
- `src/lib` contains shared client/server utilities, including filtering and result export logic.
- `prisma` contains the database schema, migrations, seed data, and seed scripts.
- `docker` contains the container entrypoint used during deployment.

## Main Data Models

| Model | Purpose |
|---|---|
| `EvidenceRecord` | Stores remuneration evidence records, including jurisdiction, context, engagement level, rates, links, and guidance flags. |
| `AdminAccount` | Stores the administrator account, password hash, recovery email state, and backup recovery code state. |
| `AnonymousFeedback` | Stores anonymous feedback responses and ratings. |
| `WebsiteUsageEvent` | Stores anonymous usage events for analytics. |

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/questionnaire` | Public decision questionnaire |
| `/privacy` | Privacy notice |
| `/feedback` | Anonymous feedback |
| `/admin` | Administrator centre |
| `/api/evidence` | Public evidence API and protected admin evidence creation |
| `/api/evidence/import` | Protected Excel import |
| `/api/evidence/export` | Protected Excel export |
| `/api/auth/*` | Admin login, logout, session, account settings, and recovery |
| `/api/feedback` | Public anonymous feedback submission |
| `/api/admin/feedback` | Protected feedback summary |
| `/api/usage` | Anonymous usage event collection and protected analytics summary |

## Environment Variables

Copy `.env.example` to `.env` and configure the required values.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_USERNAME` | Initial administrator username |
| `ADMIN_PASSWORD` | Initial administrator password |
| `SESSION_SECRET` | Secret used to sign admin session tokens |
| `AUTH_COOKIE_SECURE` | Controls secure cookie behavior |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Optional email recovery settings |
| `RUN_SEED` | Enables database seeding on Docker startup |

## Running with Docker

Docker is the recommended handover option.

```bash
cp .env.example .env
docker compose up --build
```

The application will be available at:

```text
http://localhost:3000
```

On startup, the app container applies Prisma migrations. If `RUN_SEED=true`, it also seeds the evidence database.

After the first successful seed, set:

```env
RUN_SEED=false
```

## Running Locally

Start PostgreSQL with Docker Compose:

```bash
docker compose up db -d
```

Install dependencies, migrate, seed, and start the development server:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

<<<<<<< Updated upstream
Key routes:

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/questionnaire` | Decision questionnaire |
| `/privacy` | Privacy notice |
| `/feedback` | Anonymous feedback |
| `/admin` | Administrator account centre |
| `/api/evidence` | Public evidence JSON API |

---

## Environment variables

Copy `.env.example` → `.env`. Do **not** commit real secrets.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_USERNAME` | Yes | Initial admin username |
| `ADMIN_PASSWORD` | Yes | Initial admin password |
| `SESSION_SECRET` | Yes | Session signing secret (long random string) |
| `AUTH_COOKIE_SECURE` | Docker | `false` for local HTTP (Compose default); `true` with HTTPS / `docker-compose.prod.yml` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Optional | Email OTP recovery |
| `RUN_SEED` | Docker | `true` on first boot, then `false` |

Backup recovery codes are generated in-app after the first admin login (hashed in PostgreSQL; single-use after a password reset). They are not set via environment variables.

Docker Compose injects `DATABASE_URL` for the **app** service automatically (`…@db:5432…`).  
For local Node against Compose Postgres, use `…@localhost:5432…`.

---

## Docker layout

```
Dockerfile                 # Multi-stage Next.js production image
docker-compose.yml         # local/default stack (HTTP :3000 + Postgres :5432)
docker-compose.prod.yml    # optional HTTPS-behind-proxy overrides
docker/entrypoint.sh       # migrate → optional seed → node server.js
.dockerignore
```

**Dockerfile stages**

1. **deps** — `npm ci` (+ Prisma schema for `postinstall`)
2. **builder** — `prisma generate` + `next build` (`output: "standalone"`)
3. **runner** — production files, non-root `nextjs` user, healthcheck, entrypoint on port 3000

PostgreSQL is **not** inside the app image; it runs as the `db` Compose service.

**Local (default)**

```bash
docker compose up --build
# http://localhost:3000 — AUTH_COOKIE_SECURE defaults to false
```

**Public HTTPS (reverse proxy on host → 127.0.0.1:3000)**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
# App bound to loopback only; Postgres not published; AUTH_COOKIE_SECURE defaults to true
```

---

## Database

- Provider: **PostgreSQL** (Prisma)
- Baseline migration: `prisma/migrations/20260802000000_init_postgres`
- Seed source: `prisma/seed-data.json` (71 supervisor evidence rows)

```bash
npx prisma migrate deploy   # apply migrations
npm run db:seed             # import seed data (skips if rows already exist)
npm run db:studio           # Prisma Studio GUI
npm run db:import-excel     # regenerate seed JSON from Excel (Python)
```

Main tables: `evidence_records`, `admin_account`, `anonymous_feedback`, `website_usage_events`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server (non-Docker) |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests (browser) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:regression` | Unit tests then E2E |
| `npm run db:migrate` | Prisma migrate (dev) |
| `npm run db:seed` | Seed evidence data |
| `npm run db:import-excel` | Rebuild `seed-data.json` from Excel |
=======
## Useful Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production server |
| `npm test` | Run Vitest tests |
| `npm run db:migrate` | Run Prisma migration in development |
| `npm run db:seed` | Seed database records |
>>>>>>> Stashed changes
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:import-excel` | Regenerate seed data from Excel |
| `docker compose up --build` | Build and run the app with PostgreSQL |

## Testing

Run the test suite with:

```bash
<<<<<<< Updated upstream
# Needs a reachable Postgres (e.g. docker compose up db -d)
# Unit/integration tests use cake_test by default (created automatically if missing)
npm test

# Browser E2E (Playwright). First time only: npx playwright install chromium
# Seed the app DB used by `npm run dev` so questionnaire results work:
#   npm run db:seed
npm run test:e2e

# Full automated regression (unit + E2E)
npm run test:regression
npm run build
```

E2E coverage: landing → questionnaire → results, feedback form, admin sign-in / hub tools (records, account, usage, surveys). Defaults match `.env.example` (`admin` / `change-me`) unless `ADMIN_*` is set.

Repository integration tests target `postgresql://cake:cake@localhost:5432/cake_test` (override with `TEST_DATABASE_URL`). They do not clear your local `cake` app database.

GitHub Actions (`.github/workflows/ci.yml`) on `main` / `dev`:

- Install → Prisma generate → lint → migrate → seed → unit tests → build → Playwright E2E  
- Uses a Postgres 16 service container

---

## Project structure (high level)

```
src/app/                 # Next.js App Router pages & API routes
src/components/          # UI (landing, quiz, results, admin, feedback, …)
src/server/              # Repositories, services, middleware
src/lib/                 # Filter engine, PDF export, shared utils
src/i18n/                # Public UI translations
prisma/                  # Schema, migrations, seed
docker/                  # Container entrypoint
=======
npm test
```

Some backend tests require a reachable PostgreSQL database, for example from:

```bash
docker compose up db -d
>>>>>>> Stashed changes
```

## Deployment Notes

The Docker setup contains two services:

- `app`: the Next.js production server
- `db`: PostgreSQL 16

The application image is built with a multi-stage Dockerfile. The runtime container applies database migrations, optionally seeds the database, and starts the standalone Next.js server on port 3000.

## Project Structure

```text
src/app/                 Next.js pages and API routes
src/components/          UI components
src/server/              Backend services, repositories, middleware, and database client
src/lib/                 Shared utilities and filtering/export logic
src/i18n/                Translation data
prisma/                  Prisma schema, migrations, and seed data
docker/                  Docker entrypoint
public/                  Static assets
scripts/                 Maintenance and import/translation scripts
```

## Summary

This project delivers a practical, evidence-driven remuneration guidance tool with a public decision workflow and a protected administrator backend. It combines Next.js, Prisma, PostgreSQL, Docker, and focused accessibility support to provide a maintainable client handover package.
