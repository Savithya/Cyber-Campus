# Research scope and decisions requiring reconciliation

Study: Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka.

## Authoritative instrument

The supplied pasted request provides Q1–Q25, scale labels, option order and section introductions. These are implemented in one typed definition and frozen in tests/fixtures/questionnaire.json. No proposal PDF or questionnaire PDF was present in the initial project folder. Claims about proposal content below are recorded from the supplied request, not from an independently inspected proposal. Original attachments and any PDFs/sources are left unchanged.

There are exactly four independent variables: Phishing; Pretexting; Impersonation; and **Online Scams & Malicious Link Threats together as IV4**. User Privacy is the dependent variable. Q1–Q5 are profiling variables. Administrative consent, eligibility and known prior exposure fields are outside Q1–Q25.

## Gaps to discuss with the supervisor

1. The proposal mentions digital-platform usage and deepfake-specific awareness, but Q1–Q25 do not directly measure them. No new survey questions or deepfake-specific findings have been added.
2. The proposal describes Google Forms collection. This application changes the collection platform and adds optional educational games. The researcher must reconcile this change with the supervisor and any applicable study documentation before use.
3. No sampling plan, sample size, hypotheses, validated scales, ethics approval or approval number has been invented.
4. Eligibility is initially configured as consenting students aged **18 or older** studying at a Sri Lankan higher education institution, consistent with the age options. This is an explicit implementation assumption requiring researcher confirmation.
5. Contact information, retention, backup limitations and withdrawal periods must be approved and configured. Collection remains closed in the production migration until configured.
6. The initial questionnaire language is English. Instrument content is separate from presentation code to support a future reviewed translation; no unreviewed translated instrument is published.

## Baseline integrity

Research participants see no threat demonstrations, hints, game questions, correct-answer feedback or points before submitting all six sections (with missing items permitted). Landing content is neutral. Submission is atomic and immutable. Consent is voluntary; participants can skip or leave. Submission with missing items is separately identified.

Skipped items are null with status skipped; untouched items are null with status not_answered. Not sure, Prefer not to say, and Other remain legitimate categories. Questionnaire answers carry no points. Reviews do not label particular responses as safe or unsafe.

Practice-only activities are excluded from research storage and charts. Exposure may influence a later baseline; a known browser exposure marker and participant declaration are recorded. Anonymous cross-device duplicates and exposure cannot be completely detected. No IP fingerprinting or invasive duplicate-control claims are used.

## Coding and interpretation

Codes preserve the supplied order. The codebook documents all labels and coding levels. Frequency is ordered, not an exact count. EXPERIENCE is nominal: 1=Yes, definitely; 2=Yes, possibly; 3=No; 4=Not sure.

Awareness, exposure, response behaviour, perceived risk, susceptibility and recognition difficulty are different dimensions. Q19–Q22 concern risks/concerns, Q23–Q24 concern behaviours, and Q25 concerns an overall perceived impact. They must not automatically become one privacy score. No automatic reverse-coding is applied to Q12, Q15 or privacy items.

Charts are item distributions with nonmissing denominators. Gender, field, institution and EXPERIENCE are not averaged. No p-values, significance, causal effects or reliability claims are generated. Future composites require a researcher-approved, documented rule and appropriate analysis.

## Supplementary educational game

PH01–PH04, PT01–PT04, IM01–IM04 and SC01–SC04 are independent scenario IDs, not questionnaire items or validated measures. Each mission includes a benign comparison with explicit independent confirmation. Scenarios use reserved domains, fictional people and institutions, inert destinations and prefilled fictional information.

The exact best decision is selected in relation to the complete context. Some safe real-world responses can overlap; the game’s documented action key is an educational rubric rather than a universal risk judgement. The server records a decision before revealing its rationale.

Scoring version 1.0.0: 10 for a correct first decision, 0 otherwise; maximum 40 per mission and 160 overall. First skip is not counted as an incorrect attempted answer. Replays never replace first results. Completion badges are not evidence of high privacy protection or low real-world risk.

Feedback can teach subsequent scenarios. Results therefore describe **performance during an educational game**, not an uncontaminated baseline. Optional participation introduces selection effects. Client-reported elapsed time is approximate, can include inactivity, and should not be treated as a validated response-time measure.

## Confidentiality and operational limits

The app requests no participant names, email addresses, passwords, student IDs, phone numbers, actual OTPs or uploaded identity documents. Anonymous Auth still creates a private service identifier. Operational provider logs may include IP addresses. Demographic combinations can be identifying in small samples; review disclosure risk before sharing tables or exports.

Participants must retain their private deletion token. It cannot be recovered from the stored hash. Withdrawal deletes active research records before the configured deadline; provider backups and researcher downloads require the documented retention/cleanup process.

The local demo uses encrypted browser state and synthetic fixtures; it is not a durable multi-participant research database. Hosted research collection requires the Supabase setup and live security checks in README.md.
