import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

// Read .env.local manually
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
  } catch (e) {
    return {};
  }
}

async function main() {
  const env = await loadEnv();
  console.log("=== ENVIRONMENT CONFIGURATION ===");
  console.log("APP_MODE:", env.APP_MODE || "not set (default demo)");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", env.NEXT_PUBLIC_SUPABASE_URL || "not set");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", env.SUPABASE_SERVICE_ROLE_KEY ? "CONFIGURED (length: " + env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "NOT CONFIGURED");
  console.log("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:", env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "CONFIGURED" : "NOT CONFIGURED");

  console.log("\n=== LOCAL STORAGE / DEMO DATA ===");
  const files = [
    ".demo-data/submissions.json",
    ".demo-data/participant_counter.json",
    "src/data/seed-submissions.json"
  ];
  for (const f of files) {
    try {
      const content = await fs.readFile(f, "utf8");
      const parsed = JSON.parse(content);
      const count = Array.isArray(parsed) ? parsed.length : (typeof parsed === "object" ? JSON.stringify(parsed) : parsed);
      console.log(`${f}: exists, records/value:`, count);
    } catch (err) {
      console.log(`${f}: ${err.code || err.message}`);
    }
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("\nSupabase credentials not fully configured; skipping remote DB query.");
    return;
  }

  console.log("\n=== SUPABASE DATABASE INSPECTION ===");
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const tables = [
    "participant_sessions",
    "questionnaire_submissions",
    "questionnaire_answers",
    "game_runs",
    "game_attempts",
    "admin_audit_events",
    "study_config",
    "question_definitions",
    "scenario_definitions",
    "researcher_roles"
  ];

  for (const tbl of tables) {
    try {
      const { count, error } = await supabase.from(tbl).select("*", { count: "exact", head: true });
      if (error) {
        console.log(`Table '${tbl}': Error: ${error.message}`);
      } else {
        console.log(`Table '${tbl}': ${count} records`);
      }
    } catch (err) {
      console.log(`Table '${tbl}': Exception: ${err.message}`);
    }
  }

  // Check auth.users count via admin auth API
  try {
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError) {
      console.log(`Auth Users: Error: ${authError.message}`);
    } else {
      console.log(`Auth Users: ${users.length} users`);
    }
  } catch (err) {
    console.log(`Auth Users: Exception: ${err.message}`);
  }
}

main().catch(console.error);
