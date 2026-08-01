# Consumer Rep Remuneration Tool

**UNSW COMP9900/3900 · Capstone 26T2 · Team T13C Cake**  
**Client:** Deborah Johnston & Loc Nguyen (i2i, UNSW Population Health)

Interactive decision-support web app that helps users find evidence-based remuneration guidance for health consumer representatives in Australia.

Public users complete a short questionnaire and compare matched evidence.  
Administrators maintain the evidence base, review anonymous feedback, and view usage analytics.

---

## Features

| Area | What it does |
|------|----------------|
| Public questionnaire | Jurisdiction + multi-context flow, filtered evidence results, side-by-side comparison |
| Results export | Print / PDF export of matched guidance |
| Multilingual UI | Language selector for the public interface |
| Privacy & feedback | Privacy notice + anonymous feedback survey |
| Admin centre | Login, account recovery, evidence CRUD, Excel import/export |
| Analytics | Anonymous website usage events for administrators |
| Accessibility | Keyboard navigation, focus styles, skip link, ARIA support |
| Deployment | Docker + PostgreSQL packaging for client handover |

---

## Tech stack

- **Frontend / API:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS  
- **Data:** Prisma ORM + **PostgreSQL**  
- **Auth:** Cookie session for a single administrator account  
- **Excel:** SheetJS (`xlsx`) for admin bulk import/export  
- **Runtime:** Node.js 22 · Docker Compose (app + Postgres 16)

---

## Quick start

### Option A — Docker (recommended for client handover)

Requirements: [Docker Desktop](https://www.docker.com/products/docker-desktop/) running.

```bash
cp .env.example .env
# Edit ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET (optional SMTP)
docker compose up --build
```

| Service | URL / port |
|---------|------------|
| Web app | http://localhost:3000 |
| PostgreSQL | `localhost:5432` — user / password / db: `cake` |

On first boot the app container:

1. Runs `prisma migrate deploy`
2. Seeds **71** evidence records (`RUN_SEED=true`)
3. Starts Next.js on port **3000**

After the first successful start, set in `.env`:

```env
RUN_SEED=false
```

Useful commands:

```bash
docker compose ps
docker compose logs -f app
docker compose down          # stop
docker compose down -v       # stop and delete DB volume
```

### Option B — Local Node (PostgreSQL required)

```bash
# 1) Start only the database
docker compose up db -d

# 2) Install and configure
npm install
cp .env.example .env
# DATABASE_URL=postgresql://cake:cake@localhost:5432/cake?schema=public

# 3) Migrate, seed, run
npx prisma migrate deploy
npm run db:seed
npm run dev
```

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
| `AUTH_COOKIE_SECURE` | Docker | `false` for HTTP demos; `true` when the site is served over HTTPS |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Optional | Email OTP recovery |
| `RUN_SEED` | Docker | `true` on first boot, then `false` |

Backup recovery codes are generated in-app after the first admin login (hashed in PostgreSQL; single-use after a password reset). They are not set via environment variables.

Docker Compose injects `DATABASE_URL` for the **app** service automatically (`…@db:5432…`).  
For local Node against Compose Postgres, use `…@localhost:5432…`.

---

## Docker layout

```
Dockerfile              # Multi-stage Next.js production image
docker-compose.yml      # app + postgres:16
docker/entrypoint.sh    # migrate → optional seed → node server.js
.dockerignore
```

**Dockerfile stages**

1. **deps** — `npm ci` (+ Prisma schema for `postinstall`)
2. **builder** — `prisma generate` + `next build` (`output: "standalone"`)
3. **runner** — production files, non-root `nextjs` user, entrypoint on port 3000

PostgreSQL is **not** inside the app image; it runs as the `db` Compose service.

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
| `npm run db:migrate` | Prisma migrate (dev) |
| `npm run db:seed` | Seed evidence data |
| `npm run db:import-excel` | Rebuild `seed-data.json` from Excel |
| `npm run db:studio` | Open Prisma Studio |
| `npm run reset:next` | Clear Next.js cache |
| `docker compose up --build` | Build & run app + Postgres |
| `docker compose up db -d` | Postgres only |

---

## Testing & CI

```bash
# Needs a reachable Postgres (e.g. docker compose up db -d)
npm test
npm run build
```

GitHub Actions (`.github/workflows/ci.yml`) on `main` / `dev`:

- Install → Prisma generate → lint → migrate → seed → test → build  
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
```

### Story ownership (summary)

| Story | Contributors |
|-------|--------------|
| CAKE-1 Landing page | Jiawei Dai |
| CAKE-2 Evidence database | Yihui Liu, Zeyu Yang |
| CAKE-3 Quiz wizard | Jiawei Dai |
| CAKE-4 Filter engine | Jialun Li, Zhengqian Zhang |
| CAKE-5 Results display | Jiawei Dai |
| CAKE-8 Accessibility | Yihui Liu |
| CAKE-9 Privacy notice | Zhengqian Zhang |
| CAKE-10 Admin authentication | Zeyu Yang |
| CAKE-12 Bulk Excel import/export | Yihui Liu |
| CAKE-14 Print / PDF export | Zeyu Yang |
| CAKE-15 Anonymous feedback | Zhengqian Zhang |

---

## Branch strategy

| Branch | Role |
|--------|------|
| `main` | Stable / release |
| `dev` | Integration |
| `feat/*` | Feature work (e.g. `feat/docker`) |

1. Branch from `dev`  
2. Open PR into `dev`  
3. Merge `dev` → `main` when ready to release  

---

## Client handover checklist

1. Install Docker Desktop  
2. Provide `.env` values (admin credentials, `SESSION_SECRET`, optional SMTP)  
3. Run `docker compose up --build -d`  
4. Open http://localhost:3000 — verify questionnaire + `/admin` login (complete backup recovery code setup when prompted)  
5. Set `RUN_SEED=false` for subsequent restarts  
6. Back up the `cake_pg_data` volume (or hosted Postgres) for long-term use  

For hosted Postgres (Neon / Supabase / i2i), point `DATABASE_URL` at that instance and run migrate + seed once before or on first app start.

---

## Team

| Name | Role |
|------|------|
| Xixi Wei | Project Owner |
| Zeyu Yang | Scrum Master |
| Yihui Liu | Test Engineer |
| Jiawei Dai | Frontend Engineer |
| Jialun Li | Backend Engineer |
| Zhengqian Zhang | UI/UX Engineer |

**Repository:** [capstone-project-26t2-9900-t13c-cake](https://github.com/unsw-cse-comp99-3900/capstone-project-26t2-9900-t13c-cake)
