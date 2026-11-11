"use client";

import type { StudyConfig } from "@/lib/config.server";
import { ResearchConsentPage } from "./research-consent-page";

export default function Consent({ initialConfig }: { initialConfig?: StudyConfig | null }) {
  return <ResearchConsentPage initialConfig={initialConfig} />;
}
