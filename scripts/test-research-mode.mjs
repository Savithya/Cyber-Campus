import assert from "node:assert/strict";
const base = process.env.MODE_TEST_ORIGIN ?? "http://127.0.0.1:3006";
const config = await fetch(base + "/api/config");
assert.equal(config.status, 503);
assert.match((await config.json()).error, /not configured/i);
assert.equal((await fetch(base + "/api/demo/data")).status, 404);
const demoPage = await (await fetch(base + "/demo")).text();
assert.ok(demoPage.includes("This campus path"));
assert.ok(!demoPage.includes("A clearer view of your study"));
const home = await (await fetch(base)).text();
assert.ok(!home.includes("LOCAL DEMO"));
const result = await fetch(base + "/api/session/start", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({
    consented: true,
    eligible: true,
    priorExposure: false,
    practice: false,
    token: "a".repeat(64),
  }),
});
assert.ok(!result.ok);
assert.match((await result.json()).error, /not configured/i);
console.log(
  "PASS: 5 production-mode checks: missing configuration fails clearly, demo API and page are disabled, runtime banner is correct, and collection cannot silently fall back.",
);
