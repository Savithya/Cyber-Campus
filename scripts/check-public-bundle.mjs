import fs from "node:fs/promises";
import path from "node:path";
const forbidden = [
  "The sender and destination differ from the established campus domain",
  "A stolen password could expose university messages",
  "withdrawal_hash",
  "LOCAL_SESSION_SECRET",
  "tokenHash",
];
let count = 0;
async function scan(dir) {
  for (const file of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, file.name);
    if (file.isDirectory()) await scan(p);
    else if (/\.(js|map|json|html)$/.test(file.name)) {
      const text = await fs.readFile(p, "utf8");
      count++;
      for (const secret of forbidden)
        if (text.includes(secret))
          throw Error("Restricted server content found in " + p);
    }
  }
}
await scan(".next/static");
await scan("public");
console.log(
  "PASS: " +
    count +
    " public bundle/assets checked; no restricted answer-key text, private token fields, or session-secret names found.",
);
