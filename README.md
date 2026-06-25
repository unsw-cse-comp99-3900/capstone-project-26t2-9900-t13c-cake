# Capstone Project 26T2 T13C Cake

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- Evidence API: [http://localhost:3000/api/evidence](http://localhost:3000/api/evidence)

## CAKE-2: Evidence table (database)

**Contributors:** Yihui Liu, Zeyu Yang

### Schema

The `evidence_records` table mirrors the supervisor evidence-table columns:

| Column | Type | Notes |
|--------|------|-------|
| `publisher` | string | Publishing organisation |
| `title` | string | Framework title |
| `year` | int? | Publication year |
| `link` | string? | Source document URL |
| `jurisdictions` | string | Jurisdiction code (e.g. `NSW`, `National`) |
| `context` | string | Health/research context |
| `subCategory` | string? | Optional sub-category |
| `engagementLevel` | string | Consumer engagement level |
| `minHourlyRate` / `maxHourlyRate` | float? | Indicative hourly rate range (AUD) |
| `reimbursementGuidance` | boolean | Reimbursement guidance included |
| `unpaidEngagementGuidance` | boolean | Unpaid engagement guidance included |
| `exampleOrganisations` | string? | Example adopting organisations |
| `createdAt` / `updatedAt` | datetime | Audit timestamps |
| `deletedAt` | datetime? | Soft delete |

### Seed data

- **Source:** `prisma/seed-data.json` (71 records)
- **Runner:** `prisma/seed.ts` — imports all rows on an empty database; skips if records already exist
- **Validation:** `prisma/seed-data.validation.ts` — checks required fields and rate ranges before insert

Regenerate seed JSON from an updated Excel file:

```bash
npm run db:import-excel
npm run db:seed
```

### Public API

```
GET /api/evidence
```

Returns all non-deleted evidence records as JSON.

**Example response shape:**

```json
[
  {
    "id": "clx…",
    "publisher": "Canberra Health Services",
    "title": "Consumer, carer and community representative reimbursement",
    "year": 2025,
    "link": "https://…",
    "jurisdictions": "ACT",
    "context": "General Public",
    "subCategory": null,
    "engagementLevel": "Inform",
    "minHourlyRate": 50,
    "maxHourlyRate": 100,
    "reimbursementGuidance": true,
    "unpaidEngagementGuidance": false,
    "exampleOrganisations": null,
    "createdAt": "…",
    "updatedAt": "…"
  }
]
```

### Tests

```bash
npm test
```

Covers seed JSON integrity (row count, required fields, jurisdiction codes, rate ranges) and database seeding behaviour (record count, soft delete, audit timestamps).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run db:migrate` | Create / apply Prisma migrations |
| `npm run db:seed` | Seed evidence table from `seed-data.json` |
| `npm run db:import-excel` | Regenerate `seed-data.json` from Excel |
| `npm run db:studio` | Open Prisma Studio |
| `npm run reset:next` | Clear Next.js build cache |