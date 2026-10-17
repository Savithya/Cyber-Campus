# Verification record

Verified locally on **4 October 2026**. The working preview is <http://127.0.0.1:3005>. The original port was occupied by another application after a server restart, so this project uses its own port.

## Passed

| Check                               | Observed result                                                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                          | `npm run typecheck` passed; production build type checking also passed                                                                                |
| ESLint                              | `npm run lint` passed without warnings                                                                                                                |
| Unit tests                          | **43 passed** across instrument fidelity, validation, every chart denominator, date boundaries, scoring, CSV protection and research failure handling |
| Local PostgreSQL security/integrity | **29 passed** using PGlite with documented Supabase Auth/pgcrypto compatibility shims                                                                 |
| Browser acceptance                  | **8 passed**, using Playwright with installed Microsoft Edge                                                                                          |
| Production compilation              | `npm run build` passed; all requested routes compiled                                                                                                 |
| Production configuration failure    | **5 checks passed** against the production server in research mode with no credentials                                                                |
| Public bundle boundary              | **22 public assets/bundles checked**; sampled restricted answer-key rationale and private-secret field names were absent                              |
| Runtime dependency audit            | `npm audit --omit=dev`: **0 vulnerabilities** reported                                                                                                |

### Browser coverage

- Consent and eligibility, no preselected questionnaire answers, separate skips, section navigation, review, submission and refresh.
- Local draft recovery and retry after interrupted saving/submission.
- Submitted answers are locked, temporary local draft clears, receipt token supports local-demo withdrawal.
- Pre-baseline scenario access is blocked. Unauthorised admin data and export requests are denied. Cross-origin writes are rejected.
- A separate browser cannot retrieve another browser's local session. Actual production row isolation is additionally exercised in PostgreSQL tests.
- All 16 scenarios completed with keyboard decision controls; first-attempt maximum is 160, and replay cannot change it.
- All 16 scenarios exercised with touch interaction, including portrait and landscape views.
- Practice-only flow, known exposure flag, and skip exclusion from accuracy.
- All Q1–Q25 chart views, filtered export, SVG and PNG downloads, and print view with 25 question reports.
- No horizontal page overflow in landing, survey and a question chart at **320, 375, 768, 1024 and 1440 px**.
- Reduced-motion emulation, a 200% root-text-size layout check, and automated axe checks on landing/survey (no serious or critical violations in the selected WCAG rule sets).
- Local screenshots: `artifacts/landing-desktop.png`, `artifacts/dashboard-desktop.png`, `artifacts/survey-mobile.png`, `artifacts/mission-mobile.png`.

The eight-test full browser run passed before the final server-only authentication failure guard and dynamic mode rendering change. Those changes were then covered by four additional unit tests, the final production build, five production-mode checks, and final lint. No participant component or scoring behaviour changed afterwards.

### PostgreSQL coverage

Both SQL migrations applied successfully to a local PostgreSQL engine. Tests used distinct participant and researcher identities and exercised:

- RLS isolation of sessions, answers and game attempts.
- Private withdrawal-hash and answer-key access rejection.
- Rejection of self-granted researcher roles and direct table/score edits.
- No game scoring before baseline submission.
- Invalid skipped/Neutral combinations rejected without changing the previous draft.
- Atomic 25-answer insertion, unique submission, idempotent retries and locked baseline.
- Server-computed first score, no duplicate award, practice replay, null correctness for skip.
- Trusted researcher dataset access, untrusted/unauthenticated analytics rejection.
- Incorrect deletion token and expired withdrawal rejected.
- Cross-device token deletion cascading through responses/games and expired-draft cleanup.

PGlite is a local test engine, not the user's hosted Supabase project. The test harness supplies Auth role/identity functions and maps the required pgcrypto calls to native PostgreSQL SHA-256/random UUID facilities. Supabase's actual Auth service, PostgREST configuration, cookies and deployment policies still require a staging integration check.

### Production failure and bundle checks

With APP_MODE=research and no Supabase credentials:

- Configuration returned an explicit 503 failure.
- Demo data API returned 404.
- The demo page rendered the not-found state without fixture data. Next.js streamed not-found rendering may carry HTTP 200; the API still rejects access.
- The root correctly omitted the local-demo banner at runtime.
- Starting collection failed with the explicit configuration error, rather than saving demo data.

The public-bundle scan checks for several known restricted rationale/secret field signatures. Together with Next.js server-only import boundaries, this provides evidence that the authored answer keys stay server-side; it is not a general penetration test or formal security proof.

## Remaining limits and setup

- No real Supabase project or Vercel deployment was connected or tested. No actual research data was collected.
- Real researcher sign-in, anonymous Supabase sessions, hosted RLS behaviour and withdrawal from a second physical device must be verified against an isolated staging project after configuration.
- Contact, retention, backup policy, withdrawal/draft periods, supervisor reconciliation and collection approval are not supplied. Production collection is closed by default.
- Local demo/practice state uses a size-limited encrypted cookie. Extensive replay histories can fill it; this is surfaced explicitly. Durable research records use PostgreSQL. Old demo cookie replay is not a production anti-tampering guarantee.
- Expired inactive drafts require the documented maintenance job for unattended removal. Downloaded exports and historical backups require the approved retention process.
- Automated accessibility checks are limited. No claim of perfect accessibility, screen-reader compatibility, every browser/device, or full physical browser zoom certification is made. The root-text-size check is not the same as testing every browser's zoom implementation.
- Load/penetration testing, Supabase CAPTCHA integration, distributed abuse mitigation and long-term retention operations were not verified.
- The full dependency audit reports **five high-severity development dependency findings**, all in the ESLint-config → fast-glob → micromatch → braces chain for GHSA-vfj7-8cjw-p6xm (deep-pattern denial of service). The installed/latest braces version is 3.0.3; the registry proposed downgrading the Next lint configuration to a different major version, not a compatible fixed update. No forced downgrade was applied. These packages are development lint tooling; the production-only audit reported zero. Avoid linting untrusted glob patterns and recheck upstream fixes before updating tooling.

## Reproduce

See README.md for Windows commands. The main test scripts are `npm test`, `npm run test:db` and `npm run test:e2e`. Browser tests refuse to submit test answers if the target reports research mode. `scripts/test-research-mode.mjs` is specifically for a local, unconfigured production-mode server on port 3006. `scripts/check-public-bundle.mjs` runs after a production build.
