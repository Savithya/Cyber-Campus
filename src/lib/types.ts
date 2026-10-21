export type MissingStatus = "answered" | "skipped" | "not_answered";
export type Answer = { value: number | null; status: MissingStatus };
export type Answers = Record<string, Answer>;

export type Question = {
  id: string;
  number: number;
  section: string;
  role: string;
  text: string;
  type: "dropdown" | "choice" | "scale";
  scale: string | null;
  variable: string;
  dimension: string | null;
  options: { code: number; label: string }[];
};

export type Section = {
  id: string;
  title: string;
  introduction: string;
  role: string;
  questions: string[];
};

export type ScenarioChoice = {
  id: string;
  label: string;
  reply?: string;
  privacyRiskScore: number; // 0 = protective, 1 = minor risk, 2 = moderate engagement, 3 = personal/identifiable disclosure, 4 = severe credential/financial disclosure
  unsafe: boolean; // binary unsafe-decision indicator
  disclosedInfoCategory: string; // e.g., "Account Credentials", "Financial / Payment Data", "Personal Identification", "Academic / Registration Records", "None"
};

export type Evidence = {
  label: string;
  detail: string;
  kind: "sender" | "link" | "context" | "profile" | "information" | "media" | "certificate";
  url?: string;
  displayText?: string;
  metadata?: Record<string, string>;
};

export type InteractionType =
  | "email"
  | "sms"
  | "qr"
  | "attachment"
  | "dual_browser"
  | "chat"
  | "notification"
  | "admin_portal"
  | "tech_support"
  | "emergency_story"
  | "profile_compare"
  | "compromised_chat"
  | "staff_directory"
  | "society_profile"
  | "vendor_verify"
  | "ecommerce"
  | "accommodation"
  | "payment_gateway"
  | "event_link"
  | "internship_fee"
  | "deepfake_video"
  | "voice_memo"
  | "synthetic_notice"
  | "video_call"
  | "ai_support_bot"
  | "url"
  | "profile";

export type Scenario = {
  id: string;
  mission: string;
  primaryIV: string;
  secondaryTags: string[];
  version: string;
  title: string;
  situation: string;
  senderName: string;
  senderAddress: string;
  message: string;
  evidence: Evidence[];
  choices: ScenarioChoice[];
  interaction: InteractionType;
  mediaDetails?: {
    videoPoster?: string;
    audioDuration?: string;
    transcript?: string;
    attachmentName?: string;
    attachmentSize?: string;
    attachmentType?: string;
    destinationUrl?: string;
    hostDomain?: string;
    legitDomain?: string;
    warningIndicators?: string[];
    priceOriginal?: string;
    priceDiscounted?: string;
    sellerName?: string;
    profileComparison?: {
      real: { handle: string; followers: string; created: string; bio: string };
      fake: { handle: string; followers: string; created: string; bio: string };
    };
  };
};

export type AnswerKey = {
  action: string;
  explanation: string;
  consequence: string;
  privacyRiskScore?: number;
  sensitiveDataAtStake?: string;
};

export type Attempt = {
  id: string;
  runId: string;
  scenarioId: string;
  scenarioVersion: string;
  scoringVersion: string;
  primaryIV: string;
  attemptNumber: number;
  selectedAction: string | null;
  correct: boolean | null;
  points: number; // XP points (10 for correct/safe first attempt, 0 otherwise)
  privacyRiskScore: number; // 0 = safe, 1 = minor risk, 2 = moderate, 3 = personal disclosure, 4 = severe credential/financial disclosure
  unsafe: boolean; // binary unsafe-decision indicator
  disclosedInfoCategory: string; // e.g., "Account Credentials", "Financial / Payment Data", "Personal Identification", "Academic / Registration Records", "None"
  elapsedMs: number;
  presentedOrder: number;
  createdAt: string;
  practice: boolean;
  idempotencyKey: string;
};

export type Demographics = {
  ageGroup?: string;
  gender?: string;
  yearOfStudy?: string;
  fieldOfStudy?: string;
  universityType?: string;
};

export type ThreatMetric = {
  threatKey: string;
  threatName: string;
  primaryIV: string;
  totalAttempts: number;
  completedAttempts: number;
  unsafeCount: number;
  unsafeRate: number; // percentage (0..100)
  totalRiskPoints: number;
  maxRiskPoints: number;
  privacyRiskScore: number; // percentage: (totalRiskPoints / maxRiskPoints) * 100
  meanPrivacyRisk: number; // 0..4
  stdDevPrivacyRisk: number;
  confidenceInterval95: [number, number];
  ciLow: number;
  ciHigh: number;
};

export type Session = {
  id: string;
  code: string;
  mode: "demo" | "research" | "practice";
  status: "draft" | "submitted_complete" | "submitted_with_missing";
  createdAt: string;
  submittedAt: string | null;
  draftExpiresAt: string;
  withdrawDeadline: string | null;
  instrumentVersion: string;
  consentVersion: string;
  priorExposure: boolean;
  answers: Answers; // Q1-Q5 demographics stored here
  attempts: Attempt[];
  submissionId?: string;
  participantId?: string;
  assignedModuleOrder?: string[];
  demographics?: Demographics;
  threatScores?: Record<string, number>;
  overallPrivacyRiskScore?: number;
};

export type Filters = {
  from?: string;
  to?: string;
  code?: string;
  Q1?: string;
  Q2?: string;
  Q3?: string;
  Q4?: string;
  Q5?: string;
  exposure?: string;
  status?: string;
  mission?: string;
};
