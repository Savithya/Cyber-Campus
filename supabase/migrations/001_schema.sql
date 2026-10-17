-- Cyber Campus: PostgreSQL/Supabase migration. Apply 001, then generated 002.
begin;
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create table public.study_config(id integer primary key check(id=1),public_config jsonb not null);
insert into public.study_config values(1,'{"title":"Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka.","contact":"Not configured","retention":"Not configured","withdrawalDays":30,"draftDays":7,"collectionOpen":false,"consentVersion":"1.0.0","instrumentVersion":"1.0.0"}');
create table public.researcher_roles(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create table public.question_definitions(id text primary key,definition jsonb not null,instrument_version text not null);
create table public.scenario_definitions(id text primary key,version text not null,primary_iv text not null,mission text not null,presented_order integer not null unique,public_content jsonb not null);
create table private.scenario_keys(scenario_id text primary key references public.scenario_definitions(id),correct_action text not null,explanation text not null,consequence text not null);
create table public.participant_sessions(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null unique references auth.users(id) on delete cascade,
 participant_code text not null unique default ('CC-'||upper(encode(extensions.gen_random_bytes(6),'hex'))),
 consent_version text not null,instrument_version text not null,consented_at timestamptz not null default now(),
 prior_exposure boolean not null,draft_answers jsonb not null default '{}',draft_expires_at timestamptz not null,
 withdrawal_hash text not null check(length(withdrawal_hash)=64),withdraw_deadline timestamptz not null,mode text not null default 'research' check(mode='research')
);
create table public.questionnaire_submissions(
 id uuid primary key default gen_random_uuid(),session_id uuid not null unique references public.participant_sessions(id) on delete cascade,
 status text not null check(status in ('submitted_complete','submitted_with_missing')),submitted_at timestamptz not null default now(),
 idempotency_key uuid not null unique
);
create table public.questionnaire_answers(
 submission_id uuid references public.questionnaire_submissions(id) on delete cascade,question_id text references public.question_definitions(id),
 raw_value integer,exact_label text,missing_status text not null check(missing_status in ('answered','skipped','not_answered')),
 primary key(submission_id,question_id),
 check((missing_status='answered' and raw_value is not null and exact_label is not null) or (missing_status<>'answered' and raw_value is null and exact_label is null))
);
create table public.game_runs(
 id uuid primary key default gen_random_uuid(),session_id uuid not null unique references public.participant_sessions(id) on delete cascade,
 started_at timestamptz not null default now(),scoring_version text not null default '1.0.0',presented_order jsonb not null
);
create table public.game_attempts(
 id uuid primary key default gen_random_uuid(),run_id uuid not null references public.game_runs(id) on delete cascade,
 scenario_id text not null references public.scenario_definitions(id),scenario_version text not null,primary_iv text not null,
 attempt_number integer not null check(attempt_number>=1),selected_action text,correct boolean,points integer not null check(points in(0,10)),
 elapsed_ms integer not null check(elapsed_ms between 0 and 86400000),presented_order integer not null,created_at timestamptz not null default now(),
 practice boolean not null,idempotency_key uuid not null unique,
 unique(run_id,scenario_id,attempt_number),
 check((selected_action is null and correct is null and points=0) or selected_action is not null),
 check(points=0 or (attempt_number=1 and correct=true)),check(practice=(attempt_number>1))
);
create table public.admin_audit_events(id bigint generated always as identity primary key,actor_id uuid references auth.users(id) on delete set null,event text not null,details jsonb not null default '{}',created_at timestamptz not null default now());
create table private.request_limits(owner_id uuid primary key,window_start timestamptz not null,counter integer not null);

create function public.is_researcher() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.researcher_roles where user_id=auth.uid())$$;
create function private.check_rate() returns void language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 insert into private.request_limits values(auth.uid(),now(),1) on conflict(owner_id) do update
 set counter=case when private.request_limits.window_start < now()-interval '1 minute' then 1 else private.request_limits.counter+1 end,
 window_start=case when private.request_limits.window_start < now()-interval '1 minute' then now() else private.request_limits.window_start end returning counter into n;
 if n>90 then raise exception 'Too many requests';end if;
end;$$;
create function private.validate_answers(a jsonb) returns void language plpgsql set search_path='' as $$
declare q record; v jsonb;
begin
 if jsonb_typeof(a)<>'object' or (select count(*) from jsonb_object_keys(a))<>25 then raise exception 'Invalid answer';end if;
 for q in select * from public.question_definitions loop
  v:=a->q.id;
  if v is null or jsonb_typeof(v)<>'object' or (select count(*) from jsonb_object_keys(v))<>2 or not(v ? 'value' and v ? 'status') or v->>'status' is null or (v->>'status') not in('answered','skipped','not_answered') then raise exception 'Invalid answer';end if;
  if v->>'status'='answered' then
   if jsonb_typeof(v->'value')<>'number' or not exists(select 1 from jsonb_array_elements(q.definition->'options') o where o->'code'=v->'value') then raise exception 'Invalid answer';end if;
  elsif v->'value'<>'null'::jsonb then raise exception 'Invalid answer';
  end if;
 end loop;
end;$$;
create function private.snapshot(sid uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'id',s.id,'code',s.participant_code,'mode',s.mode,'status',coalesce(sub.status,'draft'),
 'createdAt',s.consented_at,'submittedAt',sub.submitted_at,'draftExpiresAt',s.draft_expires_at,'withdrawDeadline',s.withdraw_deadline,
 'instrumentVersion',s.instrument_version,'consentVersion',s.consent_version,'priorExposure',s.prior_exposure,
 'answers',case when sub.id is null then s.draft_answers else coalesce((select jsonb_object_agg(a.question_id,jsonb_build_object('value',a.raw_value,'status',a.missing_status)) from public.questionnaire_answers a where a.submission_id=sub.id),'{}'::jsonb) end,
 'attempts',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'runId',a.run_id,'scenarioId',a.scenario_id,'scenarioVersion',a.scenario_version,'scoringVersion',r.scoring_version,'primaryIV',a.primary_iv,'attemptNumber',a.attempt_number,'selectedAction',a.selected_action,'correct',a.correct,'points',a.points,'elapsedMs',a.elapsed_ms,'presentedOrder',a.presented_order,'createdAt',a.created_at,'practice',a.practice,'idempotencyKey',a.idempotency_key) order by a.created_at) from public.game_attempts a join public.game_runs r on r.id=a.run_id where r.session_id=s.id),'[]'::jsonb))
 from public.participant_sessions s left join public.questionnaire_submissions sub on sub.session_id=s.id where s.id=sid
$$;
create function public.current_session() returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.participant_sessions;
begin
 select * into s from public.participant_sessions where owner_id=auth.uid();
 if s.id is null then return null;end if;
 if s.draft_expires_at<now() and not exists(select 1 from public.questionnaire_submissions where session_id=s.id) then
 delete from public.participant_sessions where id=s.id;return null;end if;
 return private.snapshot(s.id);
end;$$;
create function public.start_session(p_exposed boolean,p_token_hash text,p_consent boolean,p_eligible boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; sid uuid; a jsonb;
begin
 perform private.check_rate();
 select public_config into c from public.study_config where id=1;
 if not coalesce((c->>'collectionOpen')::boolean,false) or c->>'contact'='Not configured' or c->>'retention'='Not configured' then raise exception 'Study closed';end if;
 if p_consent is distinct from true or p_eligible is distinct from true or p_token_hash !~ '^[a-f0-9]{64}$' or p_exposed is null then raise exception 'Invalid answer';end if;
 select id into sid from public.participant_sessions where owner_id=auth.uid();
 if sid is not null then return private.snapshot(sid);end if;
 select jsonb_object_agg(id,jsonb_build_object('value',null,'status','not_answered')) into a from public.question_definitions;
 insert into public.participant_sessions(owner_id,consent_version,instrument_version,prior_exposure,draft_answers,draft_expires_at,withdrawal_hash,withdraw_deadline)
 values(auth.uid(),c->>'consentVersion',c->>'instrumentVersion',p_exposed,a,now()+make_interval(days=>(c->>'draftDays')::integer),p_token_hash,now()+make_interval(days=>(c->>'withdrawalDays')::integer)) returning id into sid;
 return private.snapshot(sid);
end;$$;
create function public.save_draft(p_answers jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.participant_sessions;
begin
 perform private.check_rate();perform private.validate_answers(p_answers);
 select * into s from public.participant_sessions where owner_id=auth.uid() for update;
 if s.id is null then raise exception 'Not authorised';end if;
 if exists(select 1 from public.questionnaire_submissions where session_id=s.id) then raise exception 'Baseline is locked';end if;
 if s.draft_expires_at<now() then raise exception 'Session expired';end if;
 update public.participant_sessions set draft_answers=p_answers where id=s.id;
 return private.snapshot(s.id);
end;$$;
create function public.submit_baseline(p_answers jsonb,p_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.participant_sessions; sub public.questionnaire_submissions; q record; stat text; val integer;
begin
 perform private.check_rate();perform private.validate_answers(p_answers);
 select * into s from public.participant_sessions where owner_id=auth.uid() for update;
 if s.id is null then raise exception 'Not authorised';end if;
 select * into sub from public.questionnaire_submissions where session_id=s.id;
 if sub.id is not null then
 if sub.idempotency_key=p_key then return private.snapshot(s.id);else raise exception 'Baseline is locked';end if;end if;
 if s.draft_expires_at<now() then raise exception 'Session expired';end if;
 stat:=case when exists(select 1 from jsonb_each(p_answers) x where x.value->>'status'<>'answered') then 'submitted_with_missing' else 'submitted_complete' end;
 insert into public.questionnaire_submissions(session_id,status,idempotency_key) values(s.id,stat,p_key) returning * into sub;
 for q in select * from public.question_definitions loop
 val:=(p_answers->q.id->>'value')::integer;
 insert into public.questionnaire_answers values(sub.id,q.id,val,(select o->>'label' from jsonb_array_elements(q.definition->'options') o where (o->>'code')::integer=val),p_answers->q.id->>'status');
 end loop;
 update public.participant_sessions set draft_answers='{}' where id=s.id;
 return private.snapshot(s.id);
end;$$;
create function public.record_attempt(p_scenario text,p_action text,p_elapsed integer,p_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.participant_sessions; sc public.scenario_definitions; r public.game_runs; a public.game_attempts; n integer; right_action text; snap jsonb;
begin
 perform private.check_rate();
 select * into s from public.participant_sessions where owner_id=auth.uid() for update;
 if s.id is null or not exists(select 1 from public.questionnaire_submissions where session_id=s.id) then raise exception 'Baseline required';end if;
 select * into sc from public.scenario_definitions where id=p_scenario;
 if sc.id is null then raise exception 'Invalid scenario';end if;
 if p_action is not null and not exists(select 1 from jsonb_array_elements(sc.public_content->'choices') c where c->>'id'=p_action) then raise exception 'Invalid action';end if;
 if p_elapsed is null or p_elapsed<0 or p_elapsed>86400000 or p_key is null then raise exception 'Invalid answer';end if;
 insert into public.game_runs(session_id,presented_order) values(s.id,(select jsonb_agg(id order by presented_order) from public.scenario_definitions)) on conflict(session_id) do nothing;
 select * into r from public.game_runs where session_id=s.id;
 select * into a from public.game_attempts where idempotency_key=p_key;
 if a.id is not null then
 if a.run_id<>r.id or a.scenario_id<>p_scenario or a.selected_action is distinct from p_action then raise exception 'Invalid action';end if;
 else
 select coalesce(max(attempt_number),0)+1 into n from public.game_attempts where run_id=r.id and scenario_id=p_scenario;
 select correct_action into right_action from private.scenario_keys where scenario_id=p_scenario;
 insert into public.game_attempts(run_id,scenario_id,scenario_version,primary_iv,attempt_number,selected_action,correct,points,elapsed_ms,presented_order,practice,idempotency_key)
 values(r.id,sc.id,sc.version,sc.primary_iv,n,p_action,case when p_action is null then null else p_action=right_action end,case when n=1 and p_action=right_action then 10 else 0 end,p_elapsed,sc.presented_order,n>1,p_key) returning * into a;
 end if;
 snap:=private.snapshot(s.id);
 return jsonb_build_object('session',snap,'attempt',(select x from jsonb_array_elements(snap->'attempts') x where x->>'id'=a.id::text));
end;$$;
create function public.discard_draft() returns void language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 perform private.check_rate();select id into sid from public.participant_sessions where owner_id=auth.uid() for update;
 if exists(select 1 from public.questionnaire_submissions where session_id=sid) then raise exception 'Baseline is locked';end if;
 delete from public.participant_sessions where id=sid;
end;$$;
create function public.withdraw_response(p_code text,p_token text) returns void language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 perform private.check_rate();
 if p_token !~ '^[a-f0-9]{64}$' or p_code !~ '^CC-[A-F0-9]{12}$' then raise exception 'Invalid token';end if;
 select id into sid from public.participant_sessions where participant_code=p_code and withdrawal_hash=encode(extensions.digest(p_token,'sha256'),'hex') and withdraw_deadline>=now() for update;
 if sid is null then raise exception 'Withdrawal unavailable';end if;
 delete from public.participant_sessions where id=sid;
 -- No response contents, participant code, or withdrawal secret enters the audit.
 insert into public.admin_audit_events(event) values('participant_withdrawal');
end;$$;
create function public.research_dataset() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_researcher() then raise exception 'Not authorised';end if;
 perform private.check_rate();
 delete from public.participant_sessions s where s.draft_expires_at<now() and not exists(select 1 from public.questionnaire_submissions q where q.session_id=s.id);
 insert into public.admin_audit_events(actor_id,event) values(auth.uid(),'dataset_read');
 return coalesce((select jsonb_agg(private.snapshot(id) order by consented_at desc) from public.participant_sessions),'[]'::jsonb);
end;$$;
create function public.audit_export(p_kind text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_researcher() then raise exception 'Not authorised';end if;
 insert into public.admin_audit_events(actor_id,event,details) values(auth.uid(),'export',jsonb_build_object('kind',left(p_kind,50)));
end;$$;

-- All writes are through authenticated transactional functions, never editable metadata.
alter table public.study_config enable row level security;
alter table public.researcher_roles enable row level security;
alter table public.question_definitions enable row level security;
alter table public.scenario_definitions enable row level security;
alter table public.participant_sessions enable row level security;
alter table public.questionnaire_submissions enable row level security;
alter table public.questionnaire_answers enable row level security;
alter table public.game_runs enable row level security;
alter table public.game_attempts enable row level security;
alter table public.admin_audit_events enable row level security;
alter table private.scenario_keys enable row level security;
alter table private.request_limits enable row level security;
create policy public_config on public.study_config for select to anon,authenticated using(true);
create policy public_instrument on public.question_definitions for select to anon,authenticated using(true);
create policy own_role on public.researcher_roles for select to authenticated using(user_id=auth.uid());
create policy own_session on public.participant_sessions for select to authenticated using(owner_id=auth.uid() or public.is_researcher());
create policy own_submission on public.questionnaire_submissions for select to authenticated using(exists(select 1 from public.participant_sessions s where s.id=session_id and (s.owner_id=auth.uid() or public.is_researcher())));
create policy own_answers on public.questionnaire_answers for select to authenticated using(exists(select 1 from public.questionnaire_submissions sub join public.participant_sessions s on s.id=sub.session_id where sub.id=submission_id and (s.owner_id=auth.uid() or public.is_researcher())));
create policy own_runs on public.game_runs for select to authenticated using(exists(select 1 from public.participant_sessions s where s.id=session_id and (s.owner_id=auth.uid() or public.is_researcher())));
create policy own_attempts on public.game_attempts for select to authenticated using(exists(select 1 from public.game_runs r join public.participant_sessions s on s.id=r.session_id where r.id=run_id and (s.owner_id=auth.uid() or public.is_researcher())));
create policy unlocked_scenarios on public.scenario_definitions for select to authenticated using(public.is_researcher() or exists(select 1 from public.questionnaire_submissions q join public.participant_sessions s on s.id=q.session_id where s.owner_id=auth.uid()));
create policy admin_audit on public.admin_audit_events for select to authenticated using(public.is_researcher());
revoke all on all tables in schema public from anon,authenticated;
grant select on public.study_config,public.question_definitions to anon,authenticated;
grant select on public.researcher_roles,public.scenario_definitions,public.participant_sessions,public.questionnaire_submissions,public.questionnaire_answers,public.game_runs,public.game_attempts,public.admin_audit_events to authenticated;
-- Never expose ownership or withdrawal hashes even via PostgREST column selection.
revoke select on public.participant_sessions from authenticated;
grant select(id,participant_code,consent_version,instrument_version,consented_at,prior_exposure,draft_answers,draft_expires_at,withdraw_deadline,mode,owner_id) on public.participant_sessions to authenticated;
revoke all on all functions in schema public from public,anon,authenticated;
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function public.is_researcher(),public.current_session(),public.start_session(boolean,text,boolean,boolean),public.save_draft(jsonb),public.submit_baseline(jsonb,uuid),public.record_attempt(text,text,integer,uuid),public.discard_draft(),public.withdraw_response(text,text),public.research_dataset(),public.audit_export(text) to authenticated;
commit;
