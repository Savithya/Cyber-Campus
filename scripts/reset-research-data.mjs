import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";

async function loadEnv() {
  try {
    const raw = await fs.readFile(".env.local", "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (match) {
        env[match[1]] = match[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
    return env;
  } catch {
    return {};
  }
}

export async function executeReset() {
  const env = await loadEnv();
  const mode = env.APP_MODE || "demo";
  console.log(`Starting Research Data Reset (Environment: ${mode})...`);

  const results = {
    mode,
    timestamp: new Date().toISOString(),
    localReset: {},
    remoteReset: {},
  };

  // 1. Reset Local Storage Files
  const dataDir = path.join(process.cwd(), ".demo-data");
  await fs.mkdir(dataDir, { recursive: true });

  await fs.writeFile(path.join(dataDir, "submissions.json"), "[]\n", "utf8");
  results.localReset["submissions.json"] = "reset to empty array []";

  await fs.writeFile(
    path.join(dataDir, "participant_counter.json"),
    JSON.stringify({ counter: 0 }, null, 2) + "\n",
    "utf8"
  );
  results.localReset["participant_counter.json"] = "counter reset to 0";

  const seedPath = path.join(process.cwd(), "src", "data", "seed-submissions.json");
  await fs.writeFile(seedPath, "[]\n", "utf8");
  results.localReset["seed-submissions.json"] = "reset to empty array []";

  // Check os.tmpdir() demo data if present
  const tmpDir = path.join(os.tmpdir(), ".demo-data");
  try {
    await fs.writeFile(path.join(tmpDir, "submissions.json"), "[]\n", "utf8");
    await fs.writeFile(
      path.join(tmpDir, "participant_counter.json"),
      JSON.stringify({ counter: 0 }, null, 2) + "\n",
      "utf8"
    );
    results.localReset["tmp-demo-data"] = "cleared";
  } catch {
    // tmp dir doesn't exist
  }

  // 2. If Research Mode with Supabase
  if (mode === "research" && env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });

      console.log("Connecting to Supabase to remove participant records...");

      // Order of deletion respecting foreign keys
      const { count: ansCount } = await supabase.from("questionnaire_answers").delete().neq("missing_status", "impossible_dummy_value");
      results.remoteReset["questionnaire_answers"] = ansCount ?? "cleared";

      const { count: subCount } = await supabase.from("questionnaire_submissions").delete().neq("status", "impossible_dummy_value");
      results.remoteReset["questionnaire_submissions"] = subCount ?? "cleared";

      const { count: attCount } = await supabase.from("game_attempts").delete().neq("primary_iv", "impossible_dummy_value");
      results.remoteReset["game_attempts"] = attCount ?? "cleared";

      const { count: runCount } = await supabase.from("game_runs").delete().neq("scoring_version", "impossible_dummy_value");
      results.remoteReset["game_runs"] = runCount ?? "cleared";

      const { count: sessCount } = await supabase.from("participant_sessions").delete().neq("mode", "impossible_dummy_value");
      results.remoteReset["participant_sessions"] = sessCount ?? "cleared";

      console.log("Supabase participant records reset successfully.");
    } catch (err) {
      results.remoteReset["error"] = err.message;
      console.warn("Supabase reset warning:", err.message);
    }
  }

  console.log("Research Data Reset completed successfully.");
  console.log(JSON.stringify(results, null, 2));
  return results;
}

if (process.argv[1]?.endsWith("reset-research-data.mjs")) {
  executeReset().catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  });
}
