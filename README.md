# Capstone Project 26T2 T13C Cake

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

- Landing page: [http://localhost:3000](http://localhost:3000)
- Questionnaire: [http://localhost:3000/questionnaire](http://localhost:3000/questionnaire)
- Evidence API: [http://localhost:3000/api/evidence](http://localhost:3000/api/evidence)
- Admin account centre: [http://localhost:3000/admin](http://localhost:3000/admin)

## Contributors

| Story | Contributors |
|-------|--------------|
| CAKE-1 Landing page | Jiawei Dai |
| CAKE-2 Evidence table (database) | Yihui Liu, Zeyu Yang |
| CAKE-3 Quiz wizard | Jiawei Dai |
| CAKE-4 Filter engine | Jialun Li, Zhengqian Zhang |
| CAKE-5 Results display | Jiawei Dai |
| CAKE-8 Public and admin accessibility | Yihui Liu |
| CAKE-9 Privacy notice and data scope | Zhengqian Zhang |
| CAKE-10 Admin authentication | Zeyu Yang |
| CAKE-12 Bulk Excel import / export | Yihui Liu |
| CAKE-14 Print / export results | Zeyu Yang |
| CAKE-15 Anonymous feedback survey | Zhengqian Zhang |

---

## CAKE-1: Landing page

**Route:** `/`  
**Key files:** `src/components/landing/LandingPage.tsx`, `src/components/landing/CitationCopyButton.tsx`

The public entry point introduces the tool and links users into the questionnaire flow.

**Implemented:**
- Hero section with project title, purpose statement, and **Start the questionnaire** CTA
- **How the tool works** — three-step instructions (describe context → view matched evidence → cite the tool)
- Important notice that the tool is decision support only, not a substitute for organisational policy or legal advice
- **How to cite the tool** — suggested APA-style citation with one-click copy
- Footer with project attribution (i2i / UNSW Population Health)

---

## CAKE-2: Evidence table (database)

**API:** `GET /api/evidence`  
**Key files:** `prisma/`, `src/server/repositories/evidenceRepository.ts`, `src/app/api/evidence/route.ts`

Stores 71 supervisor evidence-table rows in SQLite (local dev) and exposes them through a public read API.

### Schema

| Column | Type | Notes |
|--------|------|-------|
| `publisher` | string | Publishing organisation |
| `title` | string | Framework title |
| `year` | int? | Publication year |
| `link` | string? | Source document URL |
| `jurisdictions` | string | Jurisdiction code (e.g. `NSW`, `National`) |
| `context` | string | Health/research context |
| `subCategory` | string? | Optional sub-category |
| `engagementLevel` | string | Engagement level |
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
    "engagementLevel": "1",
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

Covers seed JSON integrity and database seeding behaviour (record count, soft delete, audit timestamps).

---

## CAKE-3: Quiz wizard

**Route:** `/questionnaire`  
**Key files:** `src/components/quiz/`, `src/contexts/QuizStateContext.tsx`

A three-step guided questionnaire that collects the user's project context before filtering evidence.

**Implemented:**

| Step | Component | Behaviour |
|------|-----------|-----------|
| 1 | `JurisdictionStep` | Multi-select Australian jurisdictions (`National`, `ACT`, `NSW`, …) |
| 2 | `ContextStep` | Single-select context; optional sub-category when applicable |
| 3 | `EngagementStep` | Single-select engagement level, then submit |

**Other behaviour:**
- Progress indicator across all three steps (`QuizProgress`)
- Quiz answers held in `QuizStateContext` (jurisdiction, context, sub-category, engagement level)
- Context, sub-category, and engagement options are **loaded dynamically** from `GET /api/evidence`, so dropdown values always reflect current database content
- Back / next navigation with step validation
- On submit, results replace the wizard on the **same page** (no redirect)

---

## CAKE-4: Filter engine

**Key files:** `src/lib/filter/filterService.ts`, `src/lib/filter/filterService.test.ts`

Client-side engine that applies quiz answers as filters against the evidence table.

### Filter rules

| Field | Logic |
|-------|-------|
| `jurisdictions` | **OR** — record matches if any selected jurisdiction applies, or if the record is `National` |
| `context` | **AND** — exact match (case-insensitive) |
| `subCategory` | **AND** — exact match when provided; omitted from filter when user leaves it blank |
| `engagementLevel` | **AND** — exact match (case-insensitive) |

### Sort order

1. State/territory-specific records before `National`
2. Newer `year` first
3. `publisher` → `title` → `id` as deterministic tie-breakers

### Tests

```bash
npm test
# or filter tests only:
npm run test:filter
```

15 unit tests cover jurisdiction OR logic, National matching, AND filters, normalisation, engagement levels, sort order, empty-input handling, and sub-second performance on a large dataset.

---

## CAKE-5: Results display

**Key files:** `src/components/results/ResultsPanel.tsx`, `src/components/results/ResultCard.tsx`, `src/components/results/DisclaimerBanner.tsx`

Shows filtered remuneration guidance inline below the questionnaire on `/questionnaire`.

**Implemented:**
- Summary line with match count and selected filter values
- **Result cards** per matching framework:
  - Publisher, title, year, jurisdiction
  - Hourly rate range (AUD)
  - Reimbursement guidance and unpaid engagement guidance flags
  - Example organisations and source link (when available)
- **Disclaimer banner** — indicative guidance only; confirm with publishing organisation
- **Start over** — clears answers and returns to step 1
- Error state with retry when the evidence API fails
- Empty state with suggestions when no records match

**Related (CAKE-14):** Print results and Export PDF are active on the results toolbar. Compare side by side is available when 2–4 results are selected.

---

## CAKE-8: Public and admin accessibility

**Routes:** All public and administrator routes
**Key files:** `src/components/accessibility/AccessibilityShell.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/quiz/`, `src/components/admin/`

Improves keyboard, screen-reader, focus, and form accessibility across the public questionnaire and administrator workspace.

**Implemented:**
- Global **Skip to main content** link and consistent `main-content` targets for keyboard users
- Route-specific document titles and polite screen-reader announcements when a page loads
- Visible keyboard focus styles, screen-reader-only utility content, and reduced-motion support
- Semantic headings, landmarks, fieldsets, legends, labels, and progress information throughout the questionnaire
- Accessible names and descriptions for interactive controls, including result selection and Excel upload
- `aria-live` status and error feedback for asynchronous forms, authentication, imports, and administrator data
- Improved touch targets, colour contrast, disabled states, and responsive layouts on public and administrator pages

---

## CAKE-14: Print / export results

**Route:** `/questionnaire` (results step)
**Key files:** `src/components/results/ResultsExportActions.tsx`, `src/lib/results/resultFormatters.ts`, `src/lib/results/exportResultsPdf.ts`, `src/lib/results/printResults.ts`, `src/app/globals.css`

Researchers can save or print their matched remuneration guidance for project documentation.

**Implemented:**
- **Print results** — opens the browser print dialog with print-friendly styles (hides navigation, action buttons, and comparison controls; shows tool title; preserves result cards and disclaimer; appends source URLs after links)
- **Export PDF** — downloads a text-based PDF summary (`remuneration-results-YYYY-MM-DD.pdf`) with filter selections, each matching record, and the indicative-guidance disclaimer
- Shared result formatting helpers reused by result cards and export output
- Works for both populated and empty result sets; disabled when the evidence API fails

---

## CAKE-9: Privacy notice and data scope

**Route:** `/privacy`
**Key files:** `src/components/privacy/PrivacyNoticePage.tsx`, `src/components/landing/LandingPage.tsx`

Explains what the public tool does and does not store.

**Implemented:**
- Footer link from the landing page to the privacy/data scope page
- Clear data scope for questionnaire answers, evidence records, administrator areas, and anonymous feedback
- Disclaimer that the tool is indicative guidance only and should be checked against current source policies
- Link from the privacy page to the anonymous feedback survey

---

## CAKE-10: Admin authentication

**Routes:** `/admin`, `/admin/account`, `/admin/forgot-password`  
**API:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`, `POST /api/auth/change-username`, `POST /api/auth/change-password`, `GET|PUT /api/auth/recovery/contacts`, `GET /api/auth/recovery/options`, `POST /api/auth/recovery/request`, `POST /api/auth/recovery/verify`, `POST /api/auth/reset-password`  

**Key files:** `src/components/admin/`, `src/lib/admin/adminNavigation.ts`, `src/server/services/authService.ts`, `src/server/services/sessionService.ts`, `src/server/repositories/adminAccountRepository.ts`, `src/server/middleware/authMiddleware.ts`

Protected maintenance area for supervisors and i2i staff. Public users access the questionnaire without an account. The entry point is a low-emphasis **Administrator account centre** link in the landing page footer.

### Admin routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/admin` | Guest or signed in | Login form, then account centre hub |
| `/admin/account` | Signed in | Change username, password, and recovery email |
| `/admin/forgot-password` | Guest | Reset password by email code or supervisor recovery code |
| `/admin/records` | Signed in | Evidence CRUD workspace scaffold (CAKE-11 / CAKE-12) |
| `/admin/analytics` | Signed in | Anonymous website usage metrics |
| `/admin/surveys` | Signed in | Anonymous feedback survey data |

Legacy paths `/admin/username` and `/admin/password` redirect to `/admin/account`. `/admin/import-export` redirects to `/admin/records`.

### Authentication

- Session-based sign-in using a signed **httpOnly** cookie (`admin_session`, 8-hour expiry)
- Credentials stored in the `admin_account` SQLite table after first bootstrap
- `.env` values `ADMIN_USERNAME` and `ADMIN_PASSWORD` are used only when the table is empty
- `AdminLoginGate` shows the login form for guests and protects child routes when authenticated
- **Sign out** and successful **sign in** redirect to `/admin`
- Successful **account recovery** also redirects to `/admin` with a one-time success message

### Account centre

Signed-in administrators land on `/admin` and can open:

- **Account settings** — update username or password (requires current password)
- **Evidence records** — future CRUD + Excel import/export workspace
- **Website usage** — anonymised page views, quiz starts, quiz completions, and completion rate
- **Anonymous survey data** — review anonymous feedback survey responses

### Account recovery

Signed-in administrators first configure a recovery email address in **Account settings**. The current password is required when the recovery email is changed.

On **Forgot password?**, administrators can:

- receive a six-digit code at the configured recovery email (SMTP), verify the code, then set a new password;
- use the supervisor `ADMIN_RECOVERY_CODE` as a fallback.

One-time codes expire after 10 minutes, can be requested once per minute, are stored only as HMAC hashes, and are invalidated after a successful reset. Five incorrect attempts require a new code. Email recovery changes only the password; supervisor recovery can reset both username and password.

#### Design justification: why email-only (no SMS recovery)

SMS delivery of recovery codes was prototyped with Twilio and deliberately removed. The decision record:

1. **Australian regulatory barrier.** Since the ACMA SMS Sender ID register came into effect, sending SMS to Australian (+61) numbers through providers such as Twilio requires a registered business identity (ABN and sender ID registration). A student capstone team cannot complete this registration, so delivery to the client's own jurisdiction fails outright (Twilio error `60250: Australian destination requires a business registration`).
2. **Unreliable international delivery.** Delivery to other jurisdictions (for example Chinese +86 numbers) is aggressively filtered by carriers; even Twilio's own number-verification SMS frequently failed during testing. A recovery channel that fails unpredictably is worse than no channel, because it blocks an administrator precisely when they are locked out.
3. **Cost and account constraints.** Trial SMS accounts only deliver to pre-verified numbers and prepend trial banners; production use would introduce an ongoing paid dependency for the client with no maintainer.
4. **Email meets the actual requirement.** The tool has a single administrator account. A recovery email via standard SMTP is free, provider-agnostic, reliable, and easy for i2i staff to reconfigure at handover. Combined with the offline supervisor recovery code (`ADMIN_RECOVERY_CODE`), there are already two independent recovery paths, so SMS added operational cost without adding meaningful resilience.

The delivery layer (`recoveryDeliveryService`) remains a separate module, so an SMS or other channel can be reinstated later by an organisation that holds the required sender registration, without changing the recovery workflow.

### AdminAccount schema

| Column | Type | Notes |
|--------|------|-------|
| `id` | string | Singleton row (`default`) |
| `username` | string | Unique administrator username |
| `passwordHash` | string | scrypt hash |
| `recoveryEmail` | nullable string | Administrator-managed recovery email |
| `recoveryCodeHash` | nullable string | Active one-time code (HMAC hash only) |
| `recoveryCodeExpiresAt` / `recoveryCodeSentAt` | nullable datetime | Expiry and resend-rate-limit timestamps |
| `recoveryCodeAttempts` | integer | Failed verification count |
| `createdAt` / `updatedAt` | datetime | Audit timestamps |

### Environment variables

| Variable | Purpose |
|----------|---------|
| `ADMIN_USERNAME` | Bootstrap username when `admin_account` is empty |
| `ADMIN_PASSWORD` | Bootstrap password when `admin_account` is empty |
| `SESSION_SECRET` | Signs admin session cookies |
| `ADMIN_RECOVERY_CODE` | Supervisor recovery code for `/admin/forgot-password` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | SMTP email recovery delivery |

**Configure locally:**

```bash
cp .env.example .env
# Edit admin and SMTP settings
npx prisma migrate dev
npm run dev
```

Default local sign-in after bootstrap: `admin` / `change-me`

### Protected APIs

`requireAdmin()` guards admin write routes. Import/export endpoints return `401` when unsigned:

- `POST /api/evidence/import` (CAKE-12 stub)
- `GET /api/evidence/export` (CAKE-12 stub)

### Tests

```bash
npm test
```

Covers session signing, credential verification, username/password/contact changes, one-time recovery delivery and rate limiting, recovery-code validation, and `admin_account` repository behaviour.

---

## CAKE-12: Bulk Excel import / export

**Route:** `/admin/records`

**API:** `GET /api/evidence/export`, `POST /api/evidence/import`
**Key files:** `src/components/admin/ExcelImportExportPanel.tsx`, `src/components/admin/RecordListPage.tsx`, `src/app/api/evidence/import/route.ts`, `src/app/api/evidence/export/route.ts`, `src/server/services/excelParseService.ts`, `src/server/services/validationService.ts`

Allows signed-in administrators to maintain the evidence table in bulk using XLSX workbooks from the same protected records workspace.

**Implemented:**
- **Download template** — exports a blank `evidence-template.xlsx` workbook with the required ordered columns
- **Export data** — downloads all active evidence records as `evidence-records.xlsx`
- **Import Excel** — accepts one `.xlsx` workbook and validates its worksheet headers and row values
- Preview phase classifies every row as **create**, **update**, or **invalid** before any database changes
- New rows use a blank `id`; updates require the ID of an existing active evidence record
- Invalid rows display row numbers and validation messages and prevent the import from being applied
- Valid previews require administrator confirmation before records are created or updated
- Successful imports refresh the records workspace and announce the created and updated totals
- Import and export APIs require an authenticated administrator session and return structured error responses

---

## CAKE-15: Anonymous feedback survey

**Routes:** `/feedback`, `/admin/surveys`
**API:** `POST /api/feedback`
**Key files:** `src/components/feedback/`, `src/app/api/feedback/route.ts`, `src/server/services/feedbackService.ts`, `src/server/repositories/feedbackRepository.ts`

Stores optional anonymous feedback without asking for contact or identity information.

**Implemented:**
- Public feedback form with a 1-5 usefulness rating, tool-area selector, and two optional comment fields
- Required confirmation that the response is anonymous and should not include contact details
- Server-side validation for rating, known tool areas, text length, and obvious contact details
- Prisma `AnonymousFeedback` table with a migration
- Administrator review page showing total responses, average rating, rating spread, and recent comments

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all unit tests |
| `npm run test:filter` | Run filter engine tests only |
| `npm run db:migrate` | Create / apply Prisma migrations |
| `npm run db:seed` | Seed evidence table from `seed-data.json` |
| `npm run db:import-excel` | Regenerate `seed-data.json` from Excel |
| `npm run db:studio` | Open Prisma Studio |
| `npm run reset:next` | Clear Next.js build cache |

## Branch strategy

- `main` — stable, reviewed code
- `dev` — integration branch
- `feat/*` — feature branches (e.g. `feat/database` for CAKE-2)

### Workflow

1. Pull latest from `dev`
2. Create a `feat/*` branch for your task
3. Open a Pull Request into `dev`
4. After testing, merge `dev` into `main` via Pull Request

## Team

| Name | Role |
|------|------|
| Xixi Wei | Project Owner |
| Zeyu Yang | Scrum Master |
| Yihui Liu | Test Engineer |
| Jiawei Dai | Frontend Engineer |
| Jialun Li | Backend Engineer |
| Zhengqian Zhang | UI/UX Engineer |

**Client:** Deborah Johnston & Loc Nguyen (i2i, UNSW Population Health)
