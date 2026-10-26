-- =====================================================================
-- CYBER CAMPUS: PARTICIPANT RESEARCH DATA RESET SCRIPT
-- =====================================================================
-- Objective:
-- Permanently delete all participant response data and reset research analytics.
--
-- Safety Guarantees:
-- 1. Preserves public.study_config (study title, contact, consent settings)
-- 2. Preserves public.researcher_roles (PIN/authenticated researcher users)
-- 3. Preserves public.question_definitions (instrument questionnaire Q1-Q25)
-- 4. Preserves public.scenario_definitions (mission challenges PH, PT, IM, SC)
-- 5. Preserves private.scenario_keys (scoring rules, explanations, consequences)
-- 6. Preserves public.admin_audit_events for dataset reads & exports (deletes only participant withdrawals)
-- 7. Maintains all tables, schemas, constraints, RLS policies, and indexes.
-- =====================================================================

begin;

-- 1. Remove individual questionnaire responses (Q1-Q25)
delete from public.questionnaire_answers;

-- 2. Remove questionnaire submissions
delete from public.questionnaire_submissions;

-- 3. Remove scenario challenge attempts (Phishing, Pretexting, Impersonation, Scams)
delete from public.game_attempts;

-- 4. Remove challenge game runs
delete from public.game_runs;

-- 5. Remove participant sessions (demographics, drafts, anonymous codes)
delete from public.participant_sessions;

-- 6. Clear session rate-limiting tracking
delete from private.request_limits;

-- 7. Remove participant withdrawal events from audit
delete from public.admin_audit_events where event = 'participant_withdrawal';

-- 8. Remove anonymous participant auth accounts (preserves researcher accounts)
delete from auth.users where id not in (select user_id from public.researcher_roles);

commit;
