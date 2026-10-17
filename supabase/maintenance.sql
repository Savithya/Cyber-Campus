-- Run with a trusted administrative database role.
-- Optional example: schedule via the Supabase Cron dashboard after approving the policy.
-- This operation removes only expired, unsubmitted drafts and dependent empty game records.
delete from public.participant_sessions s
where s.draft_expires_at < now()
and not exists (
  select 1 from public.questionnaire_submissions sub where sub.session_id=s.id
);
-- Remove obsolete rate buckets; they contain only private auth IDs and counters.
delete from private.request_limits where window_start < now()-interval '1 day';
-- Do not invent a submitted-data retention interval. Implement the approved policy here,
-- reconcile downloaded exports, and document provider backup and Auth-user cleanup.
