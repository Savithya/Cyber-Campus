export interface Mission {
  readonly id: string;
  readonly code: string;
  readonly iv: string;
  readonly name: string;
  readonly topic: string;
  readonly description: string;
  readonly color: string;
  readonly icon: string;
  readonly ids: readonly string[];
  readonly proposed?: boolean;
}

export const missions: readonly Mission[] = [
  {
    id: "phishing",
    code: "M01",
    iv: "IV1",
    name: "Phishing Investigation",
    topic: "Phishing",
    description: "Inspect deceptive university security calls, SMS smishing alerts, and malicious attachments.",
    color: "lavender",
    icon: "mail",
    ids: ["PH01", "PH02", "PH03", "PH04", "PH05"],
  },
  {
    id: "pretexting",
    code: "M02",
    iv: "IV2",
    name: "Pretexting Detection",
    topic: "Pretexting",
    description: "Analyze psychological manipulation through fabricated crisis stories and false authority.",
    color: "teal",
    icon: "chat",
    ids: ["PT01", "PT02", "PT03", "PT04", "PT05"],
  },
  {
    id: "impersonation",
    code: "M03",
    iv: "IV3",
    name: "Impersonation Investigation",
    topic: "Impersonation",
    description: "Verify faculty profiles, classmate accounts, and official university representatives.",
    color: "peach",
    icon: "profile",
    ids: ["IM01", "IM02", "IM03", "IM04", "IM05"],
  },
  {
    id: "links",
    code: "M04",
    iv: "IV4",
    name: "Scam & Malicious Link Investigation",
    topic: "Online Scams & Malicious Link Threats",
    description: "Dissect deceptive instant messages, e-commerce offers, rental scams, and fraudulent event links.",
    color: "amber",
    icon: "link",
    ids: ["SC01", "SC02", "SC03", "SC04", "SC05"],
  },
  {
    id: "deepfake",
    code: "M05",
    iv: "IV5",
    name: "AI Deepfake Investigation",
    topic: "AI-Generated Deepfake Deception",
    description: "Investigate synthetic video announcements, cloned audio memos, and automated AI agents.",
    color: "cyan",
    icon: "sparkles",
    ids: ["DF01", "DF02", "DF03", "DF04", "DF05"],
    proposed: true,
  },
] as const;

export const SCENARIO_VERSION = "2.0.0";
export const SCORING_VERSION = "2.0.0";

export const activeMissions = missions.filter((m) => !m.proposed);

/**
 * Returns missions configured for the platform.
 * By default returns the 4 active research IVs.
 * If includeProposed is true, includes archived/proposed IV5.
 */
export function getActiveMissions(includeProposed = false): readonly Mission[] {
  return includeProposed ? missions : activeMissions;
}
