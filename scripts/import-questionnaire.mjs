import fs from "node:fs";
const source = fs.readFileSync(process.argv[2], "utf8");
const scales = {
  FAMILIARITY: [
    "Not at all familiar",
    "Slightly familiar",
    "Moderately familiar",
    "Very familiar",
    "Extremely familiar",
  ],
  LIKELIHOOD: ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"],
  AGREEMENT: [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
  ],
  FREQUENCY: ["Never", "Once or twice", "A few times", "Often", "Very often"],
  EXPERIENCE: ["Yes, definitely", "Yes, possibly", "No", "Not sure"],
};
const sectionMatches = [
  ...source.matchAll(
    /SECTION ([A-F]): ([^\r\n]+)\r?\n\r?\nIntroduction: ([^\r\n]+)/g,
  ),
];
const sections = sectionMatches.map((m, i) => ({
  id: m[1],
  title: m[2]
    .split(" — ")[0]
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(
      "Online Scams & Malicious Link Threats",
      "Online Scams & Malicious Link Threats",
    ),
  introduction: m[3],
  role: i === 0 ? "Profile" : i === 5 ? "DV" : "IV" + i,
  questions: [],
}));
const matches = [
  ...source.matchAll(
    /(?:^|\n)Q(\d+)\. ([^\r\n]+)\r?\n([\s\S]*?)(?=\r?\nQ\d+\.|\r?\nSECTION |\r?\n5\. INTERACTIVE)/g,
  ),
];
const qs = matches.map((m) => {
  const n = Number(m[1]);
  const sec =
    n <= 5 ? 0 : n <= 9 ? 1 : n <= 12 ? 2 : n <= 15 ? 3 : n <= 18 ? 4 : 5;
  const block = m[3];
  const scale =
    n >= 19 ? "AGREEMENT" : Object.keys(scales).find((k) => block.includes(k));
  const opts = scale
    ? scales[scale]
    : block
        .match(/Options: ([^\r\n]+)/)?.[1]
        .replace(/\.$/, "")
        .split("; ");
  if (!opts) throw Error("Missing options " + m[1]);
  const id = "Q" + n;
  sections[sec].questions.push(id);
  return {
    id,
    number: n,
    section: sections[sec].id,
    role: sections[sec].role,
    text: m[2],
    type: block.includes("Dropdown")
      ? "dropdown"
      : scale && ["FAMILIARITY", "LIKELIHOOD", "AGREEMENT"].includes(scale)
        ? "scale"
        : "choice",
    scale: scale ?? null,
    variable:
      sec === 0
        ? block.match(/Variable: ([^\r\n]+)/)?.[1].replace(/\.$/, "")
        : sections[sec].title,
    dimension:
      block.match(/Dimension: ([^\r\n]+)/)?.[1].replace(/\.$/, "") ?? null,
    options: opts.map((label, i) => ({ code: i + 1, label })),
  };
});
if (qs.length !== 25) throw Error("Expected 25, got " + qs.length);
fs.mkdirSync("src/content", { recursive: true });
fs.mkdirSync("tests/fixtures", { recursive: true });
fs.writeFileSync(
  "src/content/questionnaire.ts",
  "import type { Question, Section } from '@/lib/types';\nexport const INSTRUMENT_VERSION = '1.0.0';\nexport const CONSENT_VERSION = '1.0.0';\nexport const sections: Section[] = " +
    JSON.stringify(sections, null, 2) +
    ";\nexport const questions: Question[] = " +
    JSON.stringify(qs, null, 2) +
    ";\n",
);
fs.writeFileSync(
  "tests/fixtures/questionnaire.json",
  JSON.stringify({ sections, questions: qs }, null, 2),
);
console.log("Imported all 25 original items and 6 introductions verbatim.");
