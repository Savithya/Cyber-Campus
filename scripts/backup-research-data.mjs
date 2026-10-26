import fs from "node:fs/promises";
import path from "node:path";

async function runBackup() {
  const dir = path.join(process.cwd(), "artifacts", "backups");
  await fs.mkdir(dir, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(dir, `research_backup_${ts}.json`);

  let demoSubmissions = [];
  try {
    demoSubmissions = JSON.parse(await fs.readFile(".demo-data/submissions.json", "utf8"));
  } catch (e) {
    demoSubmissions = [];
  }

  let participantCounter = { counter: 0 };
  try {
    participantCounter = JSON.parse(await fs.readFile(".demo-data/participant_counter.json", "utf8"));
  } catch (e) {
    participantCounter = { counter: 0 };
  }

  let seedSubmissions = [];
  try {
    seedSubmissions = JSON.parse(await fs.readFile("src/data/seed-submissions.json", "utf8"));
  } catch (e) {
    seedSubmissions = [];
  }

  const payload = {
    created_at: new Date().toISOString(),
    environment: process.env.APP_MODE || "demo",
    files: {
      ".demo-data/submissions.json": demoSubmissions,
      ".demo-data/participant_counter.json": participantCounter,
      "src/data/seed-submissions.json": seedSubmissions,
    },
    counts: {
      demoSubmissions: demoSubmissions.length,
      seedSubmissions: seedSubmissions.length,
      counter: participantCounter.counter,
    },
  };

  await fs.writeFile(backupFile, JSON.stringify(payload, null, 2), "utf8");
  console.log("BACKUP CREATED SUCCESSFULLY:");
  console.log("File:", backupFile);
  console.log("Details:", JSON.stringify(payload.counts, null, 2));
  return backupFile;
}

runBackup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
