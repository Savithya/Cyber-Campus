-- Align PH01 answer key with scenarios.server.ts ('verify', as 'report' is not an option on PH01)
-- and award 10 educational XP points for any safe (unsafe = false) first decision.

insert into private.scenario_keys (scenario_id, correct_action)
values ('PH01', 'verify')
on conflict (scenario_id) do update set correct_action = excluded.correct_action;

create or replace function public.record_attempt(
  p_scenario text,
  p_action text,
  p_elapsed integer,
  p_key uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.participant_sessions;
  sc public.scenario_definitions;
  r public.game_runs;
  a public.game_attempts;
  n integer;
  right_action text;
  is_safe boolean;
  snap jsonb;
begin
  perform private.check_rate();
  select * into s from public.participant_sessions where owner_id = auth.uid() for update;
  if s.id is null or not exists(select 1 from public.questionnaire_submissions where session_id = s.id) then
    raise exception 'Baseline required';
  end if;
  select * into sc from public.scenario_definitions where id = p_scenario;
  if sc.id is null then
    raise exception 'Invalid scenario';
  end if;
  if p_action is not null and not exists(
    select 1 from jsonb_array_elements(sc.public_content->'choices') c where c->>'id' = p_action
  ) then
    raise exception 'Invalid action';
  end if;
  if p_elapsed is null or p_elapsed < 0 or p_elapsed > 86400000 or p_key is null then
    raise exception 'Invalid answer';
  end if;

  insert into public.game_runs(session_id, presented_order)
  values (s.id, (select jsonb_agg(id order by presented_order) from public.scenario_definitions))
  on conflict (session_id) do nothing;

  select * into r from public.game_runs where session_id = s.id;
  select * into a from public.game_attempts where idempotency_key = p_key;

  if a.id is not null then
    if a.run_id <> r.id or a.scenario_id <> p_scenario or a.selected_action is distinct from p_action then
      raise exception 'Invalid action';
    end if;
  else
    select coalesce(max(attempt_number), 0) + 1 into n
    from public.game_attempts
    where run_id = r.id and scenario_id = p_scenario;

    select correct_action into right_action
    from private.scenario_keys
    where scenario_id = p_scenario;

    select coalesce(not ((c->>'unsafe')::boolean), p_action = right_action) into is_safe
    from jsonb_array_elements(sc.public_content->'choices') c
    where c->>'id' = p_action
    limit 1;

    insert into public.game_attempts(
      run_id, scenario_id, scenario_version, primary_iv, attempt_number,
      selected_action, correct, points, elapsed_ms, presented_order, practice, idempotency_key
    )
    values (
      r.id,
      sc.id,
      sc.version,
      sc.primary_iv,
      n,
      p_action,
      case when p_action is null then null else p_action = right_action end,
      case when n = 1 and p_action is not null and coalesce(is_safe, p_action = right_action) then 10 else 0 end,
      p_elapsed,
      sc.presented_order,
      n > 1,
      p_key
    )
    returning * into a;
  end if;

  snap := private.snapshot(s.id);
  return jsonb_build_object(
    'session', snap,
    'attempt', (select x from jsonb_array_elements(snap->'attempts') x where x->>'id' = a.id::text)
  );
end;
$$;
