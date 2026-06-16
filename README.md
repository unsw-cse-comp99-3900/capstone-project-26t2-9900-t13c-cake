# Capstone Project 26T2 T13C Cake

Interactive decision tool to support remuneration for health consumer representatives in Australia (COMP9900 / COMP3900 Project 07).

This repository contains a **blank starter scaffold** only — layered folder structure, route stubs, and Prisma schema aligned to `docs/architecture.drawio`. Feature implementation is left to each sprint.

## Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers (Controller layer)
- **Data:** Prisma ORM, SQLite (local dev), PostgreSQL (production)
- **Architecture:** Presentation → Controller → Service → Repository → Database

## Quick start

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project structure

```
src/
  app/
    page.tsx                  # Public home (placeholder)
    admin/page.tsx            # Admin shell (Sprint 2)
    api/
      evidence/route.ts       # GET /api/evidence
      evidence/import/route.ts
      evidence/export/route.ts
      auth/login/route.ts
  components/
    landing/                  # CAKE-1 stubs
    quiz/                     # CAKE-3 stubs
    results/                  # CAKE-5 stubs
    admin/                    # CAKE-10–12 stubs
    layout/
  contexts/                   # QuizStateContext stub
  lib/
    api/                      # EvidenceApiClient stub
    filter/                   # FilterService stub (CAKE-4)
    quiz/
    constants/
  server/
    services/                 # EvidenceService, AuthService, etc.
    repositories/             # EvidenceRepository
    middleware/               # AuthMiddleware
    db/                       # Prisma client
prisma/
  schema.prisma               # evidence_records table
  seed.ts                     # empty seed runner
  seed-data.json              # add Excel export here (CAKE-2)
docs/                         # proposal, wireframes, architecture
```

## User story mapping

| Layer / path | Sprint stories |
|--------------|----------------|
| `components/landing` | CAKE-1 |
| `prisma/`, `api/evidence` | CAKE-2 |
| `components/quiz`, `contexts/` | CAKE-3 |
| `lib/filter/` | CAKE-4 |
| `components/results` | CAKE-5 |
| `components/admin`, `api/auth`, import/export | CAKE-10–12 |

See `docs/Project_07_Proposal_Draft.docx` and wireframes in `docs/wireframes/` for requirements.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:seed` | Run seed script (no-op until data added) |
| `npm run db:studio` | Open Prisma Studio |

## Branch strategy

- `main`: stable branch for final and reviewed code
- `dev`: development integration branch
- `feature/*`: feature branches for individual tasks

## Team members

- Yihui Liu
- Xixi Wei
- Jiawei Dai
- Jialun Li
- Zhengqian Zhang
- Zeyu Yang

## Client

Deborah Johnston & Loc Nguyen (i2i, UNSW Population Health)
