-- Migration 006: Assign sequential zero-padded participant_code (01, 02, 03, ...) in start_session
begin;

create or replace function public.start_session(
  p_exposed boolean,
  p_token_hash text,
  p_consent boolean,
  p_eligible boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  c jsonb;
  sid uuid;
  a jsonb;
  next_num integer;
  next_code text;
begin
  perform private.check_rate();
  select public_config into c from public.study_config where id = 1;
  if not coalesce((c->>'collectionOpen')::boolean, false)
     or c->>'contact' = 'Not configured'
     or c->>'retention' = 'Not configured' then
    raise exception 'Study closed';
  end if;
  if p_consent is distinct from true
     or p_eligible is distinct from true
     or p_token_hash !~ '^[a-f0-9]{64}$'
     or p_exposed is null then
    raise exception 'Invalid answer';
  end if;

  select id into sid from public.participant_sessions where owner_id = auth.uid();
  if sid is not null then
    return private.snapshot(sid);
  end if;

  -- Generate the next unique sequential zero-padded code (01, 02, 03, ...)
  loop
    next_num := public.next_participant_counter();
    next_code := lpad(next_num::text, 2, '0');
    exit when not exists (
      select 1 from public.participant_sessions where participant_code = next_code
    );
  end loop;

  select jsonb_object_agg(id, jsonb_build_object('value', null, 'status', 'not_answered'))
    into a
    from public.question_definitions;

  insert into public.participant_sessions(
    owner_id,
    participant_code,
    consent_version,
    instrument_version,
    prior_exposure,
    draft_answers,
    draft_expires_at,
    withdrawal_hash,
    withdraw_deadline
  )
  values(
    auth.uid(),
    next_code,
    c->>'consentVersion',
    c->>'instrumentVersion',
    p_exposed,
    a,
    now() + make_interval(days => (c->>'draftDays')::integer),
    p_token_hash,
    now() + make_interval(days => (c->>'withdrawalDays')::integer)
  )
  returning id into sid;

  return private.snapshot(sid);
end;
$$;

grant execute on function public.start_session(boolean, text, boolean, boolean) to authenticated;

commit;
