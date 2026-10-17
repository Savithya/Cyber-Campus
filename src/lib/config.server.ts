import "server-only";
export const isResearch = () => {
  const mode = process.env.APP_MODE ?? "demo";
  if (!["demo", "research"].includes(mode))
    throw new Error("APP_MODE must be demo or research.");
  return mode === "research";
};
export const demoConfig = {
  title:
    "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka.",
  contact: "Not configured — local demonstration only",
  retention:
    "Demonstration records stay in this browser for up to 7 days. No research data is collected.",
  withdrawalDays: 7,
  draftDays: 7,
  collectionOpen: false,
  consentVersion: "1.0.0",
  instrumentVersion: "1.0.0",
};
export type StudyConfig = typeof demoConfig;
