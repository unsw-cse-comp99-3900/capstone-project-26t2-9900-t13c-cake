# Consumer Representative Remuneration Tool

UNSW COMP9900/3900 Capstone 26T2, Team T13C Cake

## Project Overview

The Consumer Rep Remuneration Tool is a full-stack web application that helps Australian health consumer representatives find evidence-based remuneration guidance.

Public users complete a short questionnaire, select their jurisdiction and engagement context, and receive matched evidence records. Administrators can manage the evidence database, import and export records, review anonymous feedback, and view anonymous usage analytics.

## Main Features

- Public landing page introducing the tool
- Questionnaire for jurisdiction, context, subcategory, and engagement level selection
- Evidence matching based on selected questionnaire answers
- Grouped results with result cards and side-by-side comparison
- Print and PDF export for results
- Multilingual public interface
- Accessibility controls for text, contrast, keyboard use, and read-aloud support
- Anonymous feedback form
- Administrator login and session-based access control
- Evidence record CRUD management
- Excel import and export for bulk evidence updates
- Administrator feedback summary
- Anonymous website usage analytics
- Docker Compose deployment with PostgreSQL

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, global CSS |
| Backend/API | Next.js App Router API routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Signed admin session cookie |
| Excel import/export | SheetJS (`xlsx`) |
| PDF/print export | jsPDF, browser print helpers |
| Email recovery | Nodemailer with optional SMTP |
| Testing | Vitest |
| Deployment | Docker, Docker Compose, Node.js 22 |

## Architecture Summary

The application uses a full-stack Next.js architecture.

- `src/app` defines pages, layouts, global styles, and API routes.
- `src/components` contains feature-based React components.
- `src/contexts` stores shared client state such as questionnaire state and language selection.
- `src/lib` contains reusable filtering, formatting, export, constants, and API client logic.
- `src/server` contains backend services, repositories, middleware, utilities, and the Prisma client.
- `prisma` contains the schema, migrations, seed data, and seed scripts.
- `docker` contains the production startup entrypoint.

## Frontend Structure

| Path | Purpose |
|---|---|
| `src/components/landing` | Public landing page components |
| `src/components/quiz` | Questionnaire wizard, progress, jurisdiction step, and context step |
| `src/components/results` | Results display, result cards, comparison, disclaimer, print, and PDF export |
| `src/components/admin` | Admin layout, login gate, records, import/export, analytics, and account pages |
| `src/components/feedback` | Anonymous feedback UI |
| `src/components/accessibility` | Accessibility shell and controls |
| `src/components/language` | Language selector and translated header text |
| `src/contexts` | Quiz state and language context providers |
| `src/i18n` | Translation dictionaries and option translations |

## Backend Structure

| Path | Purpose |
|---|---|
| `src/app/api` | API route handlers |
| `src/server/services` | Business logic and validation workflows |
| `src/server/repositories` | Prisma database access layer |
| `src/server/middleware` | Admin authentication guard |
| `src/server/db` | Shared Prisma client |
| `src/server/utils` | Password and recovery-code helpers |
| `prisma` | PostgreSQL schema, migrations, and seed data |

## Main Data Models

| Model | Purpose |
|---|---|
| `EvidenceRecord` | Stores remuneration evidence records, rates, jurisdictions, contexts, links, and guidance flags |
| `AdminAccount` | Stores the single admin account, password hash, and recovery state |
| `AnonymousFeedback` | Stores anonymous feedback ratings and comments |
| `WebsiteUsageEvent` | Stores anonymous public usage events for analytics |

## Key Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/questionnaire` | Public questionnaire |
| `/privacy` | Privacy notice |
| `/feedback` | Anonymous feedback form |
| `/admin` | Admin account centre |
| `/admin/records` | Evidence record management |
| `/admin/import-export` | Excel import/export |
| `/admin/analytics` | Usage analytics |
| `/api/evidence` | Public evidence API and protected admin create endpoint |
| `/api/evidence/[id]` | Protected update/delete endpoint |
| `/api/evidence/import` | Protected Excel import |
| `/api/evidence/export` | Protected Excel export |
| `/api/auth/*` | Login, logout, session, account settings, and recovery |
| `/api/feedback` | Anonymous feedback submission |
| `/api/admin/feedback` | Protected feedback summary |
| `/api/usage` | Anonymous usage event collection and protected usage summary |

## Environment Variables

Create `.env` from `.env.example`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_USERNAME` | Initial administrator username |
| `ADMIN_PASSWORD` | Initial administrator password |
| `SESSION_SECRET` | Secret for signing admin sessions |
| `AUTH_COOKIE_SECURE` | Controls secure cookie behavior |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Optional email recovery settings |
| `RUN_SEED` | Enables seed data during Docker startup |

## Run with Docker

Docker Compose is the recommended handover setup.

```bash
cp .env.example .env
docker compose up --build
```

Open:

```text
http://localhost:3000
```

On startup, the app container runs Prisma migrations. If `RUN_SEED=true`, it also seeds the initial evidence dataset.

After the first successful seed, set:

```env
RUN_SEED=false
```

## Run Locally

Start PostgreSQL:

```bash
docker compose up db -d
```

Install dependencies and run the app:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production app |
| `npm run start` | Start production server |
| `npm test` | Run Vitest tests |
| `npm run db:migrate` | Run Prisma migration in development |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:import-excel` | Regenerate seed data from Excel |
| `docker compose up --build` | Build and run app with PostgreSQL |

## Testing

Run:

```bash
npm test
```

Some backend tests require PostgreSQL to be running:

```bash
docker compose up db -d
```

## Deployment Notes

The Docker setup contains:

- `app`: Next.js production server
- `db`: PostgreSQL 16 database
- `cake_pg_data`: persistent database volume

The application image uses a multi-stage Dockerfile. The runtime entrypoint applies migrations, optionally seeds data, and starts the standalone Next.js server on port 3000.

## Summary

The project provides a public evidence-guidance workflow and a protected administrator backend. Its architecture separates frontend components, shared client logic, API routes, backend services, repository/database access, and deployment configuration, making the system easier to maintain and hand over.
