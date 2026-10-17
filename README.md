# Cyber Campus: Spot the Social Engineering Threats

A working Next.js application for **Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka**.

The local project includes the 25-item questionnaire, consent and recovery flow, four optional missions with 16 scenarios, researcher views for every item, five CSV exports, SQL migrations, and automated checks. **No Supabase project or Vercel deployment is connected yet.** The default local mode is a labelled demonstration.

## Run on Windows / VS Code

Use Node.js 22.14 or newer (a maintained Node LTS release is recommended).

1. Open this folder in VS Code.
2. Open its integrated PowerShell terminal.
3. Run:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open <http://127.0.0.1:3005>. Leave the terminal running. The synthetic researcher workspace is <http://127.0.0.1:3005/demo>. Actual researcher sign-in is at `/admin/login`. No demonstration password is used.

To run an optimised local build:

```powershell
npm run build
npm start
```

The app can also be previewed through the Codex browser. Creating these local files does not mean the application connected to an editor or a hosted database.

## Demo, research, and practice

- **APP_MODE=demo** (the default): trial questionnaire/game state lives in an authenticated encrypted browser cookie, not a shared research database. A random local encryption key is created in ignored `.demo-data/secret.bin`. The researcher preview uses **48 deterministic synthetic fixtures**, never the trial participant’s responses. Demo exports explicitly identify the source. Demo cookies are capacity-limited and are not a production collection or anti-replay mechanism.
- **APP_MODE=research**: real anonymous Supabase Auth sessions own records in PostgreSQL. Missing credentials, closed collection, or failed database operations produce explicit errors. There is no fallback to demo storage.
- **Practice-only**: consenting to research is unnecessary. Practice lives in a separate encrypted browser session and is not inserted into Supabase. A local exposure marker persists to flag later known practice. This is not a cross-device tracking mechanism. In deployed research mode a server-only LOCAL_SESSION_SECRET is required for practice.

Temporary questionnaire drafts use localStorage for connection recovery. A draft contains the random participant code, answers, expiry, idempotency key, and private recovery token until submission. It is cleared after confirmed submission, withdrawal, discard, or expiry. The private receipt subsequently lives only in sessionStorage until the tab session ends or its deadline passes; participants should download it. Cookies are HttpOnly, SameSite protected and Secure in production.

## Supabase setup

Create a dedicated Supabase project. Do not send real participant data to a development database.

1. In Authentication settings, enable **anonymous sign-ins**. Keep researcher sign-ups invite/admin-only. Configure the allowed Site URL and redirect URLs for your real deployment.
2. Enable the **pgcrypto** extension in the `extensions` schema (normally supplied by Supabase). If needed, use the SQL editor:
   `create extension if not exists pgcrypto with schema extensions;`
3. Apply these files **in order**, using the trusted Supabase SQL editor or migration CLI:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_instrument_and_scenarios.sql`
4. Set the public Supabase project URL and publishable key in `.env.local`. The publishable key is not an admin credential. This app does **not** need a service-role key.
5. Generate a 32-byte server-only practice encryption secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to LOCAL_SESSION_SECRET. Do not put it in any NEXT_PUBLIC_ variable, source file, public asset, or chat message. Changing it invalidates local practice cookies, not research records.

6. Set APP_MODE=research and APP_ORIGIN to the exact site origin, without a trailing slash (locally `http://127.0.0.1:3005`).
7. Complete the configuration below and restart/rebuild the app.

### Study configuration and collection gate

The migration creates a **closed study**. Its contact and retention placeholders are deliberately not valid collection information. The example 30-day withdrawal window and seven-day draft expiry are editable operational defaults, not approved research policy.

Before opening collection, have the researcher and supervisor reconcile the matters in RESEARCH_NOTES.md. Then update the single `study_config.public_config` JSON object in the trusted SQL editor:

```sql
update public.study_config
set public_config = public_config || jsonb_build_object(
  'contact', 'REPLACE WITH THE APPROVED RESEARCH CONTACT',
  'retention', 'REPLACE WITH THE APPROVED RETENTION AND BACKUP POLICY',
  'withdrawalDays', 30,
  'draftDays', 7,
  'collectionOpen', false
)
where id = 1;
```

Replace the text with actual approved information, choose the approved time periods, and set collectionOpen=true **only when ready**. Never publish personal phone numbers or registration numbers from a proposal. Consent and instrument versions are initially 1.0.0. Substantial instrument edits require a new version and an intentional migration; do not overwrite old definitions after collection starts.

### Provision a researcher

In the trusted Supabase Authentication dashboard, invite/create a permanent email/password user. After identifying that user’s UUID, run:

```sql
insert into public.researcher_roles(user_id)
values ('REPLACE-WITH-THE-RESEARCHER-AUTH-UUID');
```

Use the resulting account at `/admin/login`. A permanent account without a researcher_roles row is denied. Do not use editable user metadata to assign this role. Participants cannot insert or modify roles, answers, submissions, or scores directly. To revoke access, delete the role row through the same trusted administrative route.

### Storage and security design

The public schema has study configuration, question/scenario definitions, owned participant sessions, submissions, answers, game runs/attempts, researcher roles, and audit events. Restricted answer keys and rate counters are in a private schema with no participant grants.

All participant writes use ownership-checked transactional functions. Row locks and unique idempotency keys make submission and scoring retries safe. First-attempt points and baseline immutability are enforced in PostgreSQL, including direct API calls. Raw category codes and exact labels are stored together at submission. Explicit missing statuses accompany null values. Nothing collects participant IP addresses in research tables.

HTTP responses containing session or research data use private/no-store caching. Mutations verify the browser origin and validate bounded request bodies using Zod. PostgreSQL limits authenticated writes to 90 per minute. The application also has a best-effort per-instance limiter; it does not provide globally distributed denial-of-service protection. Configure Supabase Auth rate limits and Vercel firewall/request limits before public collection. Enabling an anonymous-auth CAPTCHA would require adding its client token flow; that is not currently implemented.

The application does not log answers, passwords or tokens. Supabase/Vercel may still keep operational logs. The CSP permits Next.js inline code and development evaluation; no third-party participant trackers are installed.

### Retention and withdrawals

The deadline is calculated from the consent time and shown to participants in Asia/Colombo time. A SHA-256 digest of the high-entropy private deletion token is stored; the raw token is never stored in PostgreSQL or research exports. Research withdrawal works from a new device using the code and token, creating an anonymous session if necessary. Without the token there is no recovery promise.

Withdrawal cascades through active answers, submissions, game runs and attempts. Draft expiry is enforced on access and researcher dataset reads. Use the optional maintenance SQL in `supabase/maintenance.sql` for routine inactive-draft cleanup, and schedule it with Supabase Cron or your approved database operations process. Configure submitted-data retention according to the study’s actual approved policy; none is invented here.

Downloaded files are outside the database. Before each analysis, refresh exports and reconcile retained participant-code sets against the current full dataset, removing withdrawn/expired records from old copies. Destroy obsolete exports. Provider backups expire under the actual provider retention configuration; deletion cannot instantly erase historical backups. Anonymous Auth user records may need separate trusted provider maintenance after study records expire; research deletion does not delete the provider’s user/operational logs.

## Questionnaire and analysis

`src/content/questionnaire.ts` is the shared typed instrument. It drives controls, validation, aggregation and exports; the generated database seed contains the same values. The supplied request was imported verbatim for question texts/options/introductions and captured as a test fixture.

- A: Q1–Q5, demographics
- B: Q6–Q9, Phishing (IV1)
- C: Q10–Q12, Pretexting (IV2)
- D: Q13–Q15, Impersonation (IV3)
- E: Q16–Q18, Online Scams & Malicious Link Threats (one combined IV4)
- F: Q19–Q25, User Privacy (DV)

No default answers, invented composite scores, automatic reverse-coding, significance tests, validated-scale claims, or causal conclusions are supplied. EXPERIENCE codes are nominal. Frequency codes are ordered categories, not event counts.

Every chart includes all original options, counts, percentages, valid n, missing n, filters and a table. Date filters use Colombo midnight; exports contain UTC timestamps. Individual charts download as SVG/PNG and summary CSV. `/admin/report` is a print-friendly all-question report. Browser printing can save it as PDF.

The researcher exports are responses-wide.csv, responses-long.csv, game-attempts.csv, question-summary.csv and codebook.csv. They default to submitted, nonwithdrawn research records only. Baseline and game exports are separate; join by participant_code only for an explicitly planned analysis. UTF-8 BOM, RFC-style quoting and formula-injection protection are included. Numeric columns remain numeric; formula-like text cells receive a leading apostrophe.

## Games and versions

`src/content/scenarios.server.ts` has the 16 complete situations, evidence, decisions, rationales and privacy consequences. It is a server-only module. Authored links use reserved .example domains and never navigate or resolve externally. All named people and organisations are fictional.

Each mission has a benign scenario supported by independently verified context. The best decision is defined by the **whole** scenario. Points: 10 for a correct first final decision, 0 for incorrect or skipped, 40 maximum per mission, 160 total. Skips are not attempted decisions in accuracy calculations. Replays are recorded as practice and cannot change the first score. Elapsed times are client-reported descriptive values bounded to 24 hours, not trusted timing measurements or speed bonuses. Presented order, scenario version and scoring version are recorded.

## Tests and verification

```powershell
npm run typecheck
npm run lint
npm test
npm run test:db
npx playwright install chromium
npm run test:e2e
npm run build
```

Alternatively, to test using an installed Microsoft Edge browser:

```powershell
$env:PLAYWRIGHT_CHANNEL='msedge'
npm run test:e2e
```

Unit tests cover instrument fidelity, category validation, all 25 chart denominators, date boundaries, scoring and CSV safety. The database suite applies both migrations to a local PGlite PostgreSQL engine and tests RLS and transactions using Supabase-auth compatibility shims. This is **not** a hosted Supabase integration test. Playwright exercises actual routes, refresh/retry, all missions, chart downloads, permissions and responsive views.

See VERIFICATION.md for the actual run results and remaining limits. Playwright artifacts are local and ignored by Git. Do not run synthetic test submissions against your live collection project.

If questionnaire/scenario content is intentionally edited before collection, regenerate checked-in seed/codebook artifacts:

```powershell
npm run content:generate
```

The original attachment and any proposal/PDF sources are not modified. The import helper is retained for traceability; it requires the original request path and should not be run casually after collection starts.

## Vercel deployment

1. Commit this project and package-lock.json to a private Git repository.
2. Import the repository into Vercel as a **Next.js** project. Use a supported Node 22+ runtime and the normal `npm run build` command; do not configure a static export.
3. Configure APP_MODE=research, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, LOCAL_SESSION_SECRET, and APP_ORIGIN for each intended deployment environment.
4. Apply migrations and configure the study in the matching Supabase project. Configure the Vercel origin in Supabase Auth settings.
5. Deploy with collection closed. On a separate staging database, verify anonymous session creation, researcher login, row isolation, one submission, an idempotent retry, a game attempt, and token withdrawal from another browser.
6. Inspect the production browser for errors; verify all security and no-store headers. Open collection only after the supervisor/researcher approves the configuration.

Preview deployments must use a separate Supabase project or keep collection closed. Never point automated tests at live research storage. Vercel’s filesystem and process memory are not used to store production responses.

### Still needed from the project owner

- A Supabase project URL and publishable key, migrations applied, anonymous sign-in enabled.
- Approved researcher contact, retention/backup policy, withdrawal/draft periods, and study collection decision.
- One trusted, provisioned researcher account and role.
- A server-only practice session secret.
- Vercel project/account access, production origin, environment variables and deployment.
- Live Supabase/Vercel verification and the supervisor reconciliation recorded in RESEARCH_NOTES.md.

## Project map

- `src/app`: Next.js routes and authenticated API boundary.
- `src/components`: participant, game and researcher interfaces.
- `src/content`: typed questionnaire, mission metadata and server-only authored scenarios.
- `src/lib`: validation, scoring, aggregation, exports, session adapters and auth.
- `supabase`: migrations and maintenance instructions.
- `tests`: unit fixtures, browser acceptance tests and supporting files.
- `scripts/test-database.mjs`: local PostgreSQL access and integrity checks.

Framework references: [Next.js App Router](https://nextjs.org/docs/app), [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous), [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Motion for React](https://motion.dev/docs/react).
