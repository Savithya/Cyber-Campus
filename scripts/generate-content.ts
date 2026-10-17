import fs from "node:fs";
import { questions, INSTRUMENT_VERSION } from "../src/content/questionnaire";
import { scenarios, answerKeys } from "../src/content/scenarios.server";
import { exportCsv } from "../src/lib/csv";
const quote = (s: string) => "'" + s.replace(/'/g, "''") + "'";
const sql = [
  "-- Generated from the shared questionnaire and server-only scenarios. Never serve this file as a public asset.",
  "begin;",
];
for (const q of questions)
  sql.push(
    "insert into public.question_definitions(id,definition,instrument_version) values(" +
      quote(q.id) +
      "," +
      quote(JSON.stringify(q)) +
      "::jsonb," +
      quote(INSTRUMENT_VERSION) +
      ");",
  );
for (const [i, s] of scenarios.entries()) {
  sql.push(
    "insert into public.scenario_definitions(id,version,primary_iv,mission,presented_order,public_content) values(" +
      [
        quote(s.id),
        quote(s.version),
        quote(s.primaryIV),
        quote(s.mission),
        i + 1,
        quote(JSON.stringify(s)) + "::jsonb",
      ].join(",") +
      ");",
  );
  const key = answerKeys[s.id];
  sql.push(
    "insert into private.scenario_keys values(" +
      [s.id, key.action, key.explanation, key.consequence]
        .map(quote)
        .join(",") +
      ");",
  );
}
sql.push("commit;");
fs.mkdirSync("supabase/migrations", { recursive: true });
fs.writeFileSync(
  "supabase/migrations/002_instrument_and_scenarios.sql",
  sql.join("\n"),
);
fs.writeFileSync("codebook.csv", exportCsv("codebook", [], {}, false));
console.log(
  "Generated SQL content for 25 questions and 16 scenarios, plus codebook.csv.",
);
