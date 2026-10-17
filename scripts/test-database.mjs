import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
const db = new PGlite();
let checks = 0;
function ok(value, message) {
  assert.ok(value, message);
  checks++;
  console.log("PASS " + message);
}
async function rejects(fn, message) {
  await assert.rejects(fn);
  checks++;
  console.log("PASS " + message);
}
try {
  await db.exec(`create role anon;create role authenticated;create schema auth;create schema extensions;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;
 -- PGlite compatibility shims for Supabase's pgcrypto namespace. Uses PostgreSQL's native SHA-256.
 create function extensions.gen_random_bytes(n integer) returns bytea language sql volatile as $$select decode(substr(replace(gen_random_uuid()::text,'-',''),1,n*2),'hex')$$;
 create function extensions.digest(t text,algorithm text) returns bytea language sql immutable as $$select sha256(convert_to(t,'UTF8'))$$;`);
  await db.exec(
    await fs.readFile("supabase/migrations/001_schema.sql", "utf8"),
  );
  await db.exec(
    await fs.readFile(
      "supabase/migrations/002_instrument_and_scenarios.sql",
      "utf8",
    ),
  );
  ok(true, "both migrations apply to a PostgreSQL engine");
  const [a, b, r, c] = Array.from({ length: 4 }, () => randomUUID());
  for (const id of [a, b, r, c])
    await db.query("insert into auth.users values($1)", [id]);
  await db.query("insert into public.researcher_roles(user_id) values($1)", [
    r,
  ]);
  await db.exec(
    `update public.study_config set public_config=public_config||'{"collectionOpen":true,"contact":"test@example.invalid","retention":"Test only"}'::jsonb`,
  );
  async function as(id, sql, params = []) {
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    try {
      return await db.query(sql, params);
    } finally {
      await db.exec("reset role");
    }
  }
  const token = "a".repeat(64),
    hash = createHash("sha256").update(token).digest("hex");
  const start = async (id) =>
    (
      await as(id, "select public.start_session(false,$1,true,true) as s", [
        hash,
      ])
    ).rows[0].s;
  const sa = await start(a),
    sb = await start(b);
  ok(sa.code !== sb.code, "participants have different random research codes");
  ok(
    (
      await as(b, "select id from public.participant_sessions where id=$1", [
        sa.id,
      ])
    ).rows.length === 0,
    "participant B cannot read participant A session",
  );
  await rejects(
    () => as(b, "select withdrawal_hash from public.participant_sessions"),
    "withdrawal hashes cannot be selected through authenticated API roles",
  );
  await rejects(
    () => as(a, "update public.participant_sessions set draft_answers='{}'"),
    "direct participant writes are denied",
  );
  await rejects(
    () => as(a, "insert into public.researcher_roles(user_id) values($1)", [a]),
    "participants cannot grant themselves researcher status",
  );
  await rejects(
    () => as(a, "select * from private.scenario_keys"),
    "answer keys are unavailable to participants",
  );
  await rejects(
    () => as(a, "select public.research_dataset()"),
    "ordinary participants cannot fetch researcher analytics",
  );
  await db.exec("set role anon");
  await rejects(
    () => db.query("select public.research_dataset()"),
    "unauthenticated analytics are denied",
  );
  await db.exec("reset role");
  const empty = Object.fromEntries(
    Array.from({ length: 25 }, (_, i) => [
      "Q" + (i + 1),
      { value: null, status: "not_answered" },
    ]),
  );
  await as(a, "select public.save_draft($1)", [JSON.stringify(empty)]);
  const bad = { ...empty, Q6: { value: 3, status: "skipped" } };
  await rejects(
    () => as(a, "select public.save_draft($1)", [JSON.stringify(bad)]),
    "skipped values cannot be stored as Neutral",
  );
  const before = (await as(a, "select public.current_session() as s")).rows[0]
    .s;
  ok(
    before.answers.Q6.value === null &&
      before.answers.Q6.status === "not_answered",
    "invalid writes leave the original draft unchanged",
  );
  await rejects(
    () =>
      as(a, "select public.record_attempt($1,$2,1000,$3)", [
        "PH01",
        "report",
        randomUUID(),
      ]),
    "direct game submissions are blocked before baseline",
  );
  const answers = {
      ...empty,
      Q1: { value: 1, status: "answered" },
      Q6: { value: null, status: "skipped" },
    },
    key = randomUUID();
  const submitted = (
    await as(a, "select public.submit_baseline($1,$2) as s", [
      JSON.stringify(answers),
      key,
    ])
  ).rows[0].s;
  ok(
    submitted.status === "submitted_with_missing",
    "submission records an explicit missing-answer status",
  );
  const again = (
    await as(a, "select public.submit_baseline($1,$2) as s", [
      JSON.stringify(answers),
      key,
    ])
  ).rows[0].s;
  ok(
    again.code === submitted.code &&
      (
        await db.query(
          "select * from public.questionnaire_submissions where session_id=$1",
          [sa.id],
        )
      ).rows.length === 1,
    "retrying the submission is idempotent",
  );
  ok(
    (await db.query("select * from public.questionnaire_answers")).rows
      .length === 25,
    "all 25 answer rows are saved atomically",
  );
  await rejects(
    () => as(a, "select public.save_draft($1)", [JSON.stringify(empty)]),
    "submitted baseline is immutable through the API",
  );
  await rejects(
    () =>
      as(a, "select public.submit_baseline($1,$2)", [
        JSON.stringify(empty),
        randomUUID(),
      ]),
    "a different submission key cannot overwrite the baseline",
  );
  ok(
    (await as(b, "select * from public.questionnaire_answers")).rows.length ===
      0,
    "participant B cannot read participant A answers",
  );
  const k = randomUUID();
  const attempt = (
    await as(a, "select public.record_attempt($1,$2,1000,$3) as r", [
      "PH01",
      "proceed",
      k,
    ])
  ).rows[0].r;
  ok(
    attempt.attempt.points === 0 && attempt.attempt.correct === false,
    "server decides the first score from the restricted answer key",
  );
  const retry = (
    await as(a, "select public.record_attempt($1,$2,1000,$3) as r", [
      "PH01",
      "proceed",
      k,
    ])
  ).rows[0].r;
  ok(
    retry.session.attempts.length === 1,
    "network retry does not award or record a duplicate attempt",
  );
  const replay = (
    await as(a, "select public.record_attempt($1,$2,1000,$3) as r", [
      "PH01",
      "report",
      randomUUID(),
    ])
  ).rows[0].r;
  ok(
    replay.attempt.correct &&
      replay.attempt.points === 0 &&
      replay.attempt.practice,
    "correct replay cannot replace an incorrect first score",
  );
  const skip = (
    await as(a, "select public.record_attempt($1,null,1000,$2) as r", [
      "PH02",
      randomUUID(),
    ])
  ).rows[0].r;
  ok(
    skip.attempt.correct === null && skip.attempt.points === 0,
    "game skip is not an incorrect answer",
  );
  await rejects(
    () => as(a, "update public.game_attempts set points=10"),
    "direct score tampering is denied",
  );
  ok(
    (await as(b, "select * from public.game_attempts")).rows.length === 0,
    "participant B cannot read participant A game records",
  );
  ok(
    (await as(r, "select public.research_dataset() as data")).rows[0].data
      .length === 2,
    "trusted researcher role can read the study dataset",
  );
  await rejects(
    () =>
      as(c, "select public.withdraw_response($1,$2)", [
        sa.code,
        "b".repeat(64),
      ]),
    "wrong deletion token is rejected",
  );
  await as(c, "select public.withdraw_response($1,$2)", [sa.code, token]);
  ok(
    (await db.query("select * from public.questionnaire_answers")).rows
      .length === 0 &&
      (await db.query("select * from public.game_attempts")).rows.length === 0,
    "token-based cross-device withdrawal cascades through answers and games",
  );
  await db.query(
    "update public.participant_sessions set withdraw_deadline=now()-interval '1 day' where id=$1",
    [sb.id],
  );
  await rejects(
    () => as(c, "select public.withdraw_response($1,$2)", [sb.code, token]),
    "withdrawal deadline is enforced by the database",
  );
  await db.query(
    "update public.participant_sessions set draft_expires_at=now()-interval '1 day' where id=$1",
    [sb.id],
  );
  ok(
    (await as(b, "select public.current_session() as s")).rows[0].s === null,
    "expired inactive draft is removed during access",
  );
  console.log(
    "\n" +
      checks +
      " PostgreSQL integrity/security checks passed. Supabase hosted integration is still unconfigured.",
  );
} finally {
  await db.close();
}
