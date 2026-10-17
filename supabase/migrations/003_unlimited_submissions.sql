-- Migration 003: Enable unlimited research submissions and track individual submission IDs
begin;

-- Enhance private snapshot to include submissionId
create or replace function private.snapshot(sid uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'id', s.id,
 'submissionId', coalesce(sub.id::text, s.id::text),
 'code', s.participant_code,
 'mode', s.mode,
 'status', coalesce(sub.status, 'draft'),
 'createdAt', s.consented_at,
 'submittedAt', sub.submitted_at,
 'draftExpiresAt', s.draft_expires_at,
 'withdrawDeadline', s.withdraw_deadline,
 'instrumentVersion', s.instrument_version,
 'consentVersion', s.consent_version,
 'priorExposure', s.prior_exposure,
 'answers', case when sub.id is null then s.draft_answers else coalesce((select jsonb_object_agg(a.question_id,jsonb_build_object('value',a.raw_value,'status',a.missing_status)) from public.questionnaire_answers a where a.submission_id=sub.id),'{}'::jsonb) end,
 'attempts', coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'runId',a.run_id,'scenarioId',a.scenario_id,'scenarioVersion',a.scenario_version,'scoringVersion',r.scoring_version,'primaryIV',a.primary_iv,'attemptNumber',a.attempt_number,'selectedAction',a.selected_action,'correct',a.correct,'points',a.points,'elapsedMs',a.elapsed_ms,'presentedOrder',a.presented_order,'createdAt',a.created_at,'practice',a.practice,'idempotencyKey',a.idempotency_key) order by a.created_at) from public.game_attempts a join public.game_runs r on r.id=a.run_id where r.session_id=s.id),'[]'::jsonb))
 from public.participant_sessions s left join public.questionnaire_submissions sub on sub.session_id=s.id where s.id=sid
$$;

commit;
