"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Link2,
  UserRoundSearch,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Gamepad2,
  Sparkles,
  Info,
} from "lucide-react";

interface PreviewTab {
  id: string;
  name: string;
  threatType: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
  heading: string;
  sender: string;
  message: string;
  warningSigns: string[];
  safestAction: string;
  privacyImpact: string;
}

const PREVIEWS: PreviewTab[] = [
  {
    id: "email",
    name: "Simulated Email",
    threatType: "Phishing (IV1)",
    icon: Mail,
    tag: "Credential Harvesting Lure",
    heading: "The Urgent Account Deactivation Notice",
    sender: "University IT Account Services <security-notice@campus-serendib-verify.example>",
    message:
      "URGENT: Your university student account failed our quarterly security validation. Confirm your credentials within two hours at our external gate to avoid immediate LMS and exam portal suspension.",
    warningSigns: [
      "Sender domain @campus-serendib-verify.example does not match official @serendib.campus.example",
      "Artificial 2-hour deadline designed to induce psychological urgency",
      "Demands student single sign-on password via email link",
    ],
    safestAction:
      "Withhold password details. Open the official university portal independently via a trusted bookmark to verify your account status.",
    privacyImpact: "Prevents total unauthorized compromise of academic records and student communications.",
  },
  {
    id: "link",
    name: "Suspicious Link",
    threatType: "Malicious Link Threat (IV4)",
    icon: Link2,
    tag: "Deceptive Domain Dissection",
    heading: "The Subdomain Concealment Technique",
    sender: "Destination: https://serendib.campus.example.verify-login.example/security-gate",
    message:
      "At first glance, the URL includes 'serendib.campus.example'. However, inspecting the root domain reveals it actually connects to 'verify-login.example' — an external credential harvesting server.",
    warningSigns: [
      "Attacker places legitimate university keywords in subdomains to trick mobile users",
      "Valid HTTPS lock icon only encrypts connection to attacker; does not verify legitimate ownership",
      "Hosted outside official campus network infrastructure",
    ],
    safestAction:
      "Inspect the exact root domain before clicking. Legitimate campus services reside strictly on .campus.example domains.",
    privacyImpact: "Blocks transmission of login tokens and prevents malware download onto student devices.",
  },
  {
    id: "identity",
    name: "Identity Verification",
    threatType: "Impersonation (IV3)",
    icon: UserRoundSearch,
    tag: "Faculty Spoofing Profile",
    heading: "The Urgent Department Head Request",
    sender: "Prof. K. L. Wickramasinghe (Duplicate Social Profile)",
    message:
      "Hello! I am stuck in an urgent faculty meeting and my university bank transfer is delayed. Could you urgently send Rs. 5,000 for student badge printing? I will reimburse you tomorrow.",
    warningSigns: [
      "Newly registered social profile with zero mutual academic batchmates",
      "Senior academic staff members never request personal student bank transfers",
      "Pressure to act immediately without verifying through official channels",
    ],
    safestAction:
      "Verify the professor's identity through official departmental phone numbers or by visiting the department office directly.",
    privacyImpact: "Protects personal funds and personal contact details from social engineering syndicates.",
  },
  {
    id: "privacy",
    name: "Privacy Decision",
    threatType: "Pretexting & Privacy (IV2 / DV)",
    icon: Lock,
    tag: "Financial Data Protection",
    heading: "The Fake National Welfare Bursary",
    sender: "Ministry Welfare Grant SMS <+94 77 000 1234>",
    message:
      "Ministry Welfare Notice: Your undergraduate education grant of LKR 85,000 is approved. To disburse funds, reply with your 16-digit debit card number, CVV code, and National Identity Card (NIC) number.",
    warningSigns: [
      "Legitimate scholarship boards only require direct bank account and branch numbers, NEVER debit card CVVs",
      "Unsolicited cash grant notification without prior application",
      "SMS contains urgent requests for high-risk identity documents",
    ],
    safestAction:
      "Withhold financial details and card PINs. Check published scholarship recipient lists on official campus noticeboards.",
    privacyImpact: "Safeguards National Identity Card and banking funds against irreversible financial identity theft.",
  },
];

export function CyberInvestigatorShowcase() {
  const [activeTabId, setActiveTabId] = useState<string>("email");

  const currentPreview = PREVIEWS.find((p) => p.id === activeTabId) || PREVIEWS[0];
  const Icon = currentPreview.icon;

  return (
    <section id="challenges" className="cyber-showcase-section container my-16" aria-labelledby="showcase-heading">
      {/* Section Header */}
      <div className="section-header-centered">
        <div className="eyebrow mb-2">
          <Sparkles size={16} className="text-cyan" aria-hidden="true" />
          <span>INTERACTIVE CYBERSECURITY LAB · SRI LANKA</span>
        </div>
        <h2 id="showcase-heading" className="text-3xl font-extrabold tracking-tight">
          Think Like a Cyber Investigator
        </h2>
        <p className="text-muted max-w-2xl mx-auto mt-2 text-base leading-relaxed">
          Explore realistic digital threats, examine suspicious messages, and make decisions that help
          protect personal information.
        </p>
      </div>

      {/* Interactive Tabs Header */}
      <div className="showcase-tabs-bar flex items-center justify-center gap-2 mt-8 flex-wrap" role="tablist" aria-label="Investigation Previews">
        {PREVIEWS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`showcase-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <TabIcon size={16} aria-hidden="true" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Showcase Visual Card */}
      <div className="showcase-card card mt-6 p-6 lg:p-8" role="region" aria-label={`${currentPreview.name} Showcase`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Simulated Digital Artifact */}
          <div className="lg:col-span-7 showcase-artifact-col">
            <div className="artifact-window rounded-xl border bg-card/80 overflow-hidden shadow-sm">
              <div className="artifact-window-bar px-4 py-3 bg-muted/30 border-b flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" aria-hidden="true" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" aria-hidden="true" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
                  <span className="text-xs font-mono text-muted ml-2">{currentPreview.threatType}</span>
                </div>
                <span className="artifact-tag text-[11px] font-semibold uppercase tracking-wider text-cyan px-2 py-0.5 rounded bg-cyan/10">
                  {currentPreview.tag}
                </span>
              </div>

              <div className="artifact-body p-5 space-y-4">
                <div>
                  <span className="text-xs text-muted block font-mono">FROM / SENDER:</span>
                  <code className="text-xs font-semibold text-primary block mt-0.5 select-all break-all">
                    {currentPreview.sender}
                  </code>
                </div>

                <div className="artifact-message-box p-4 rounded-lg bg-card border">
                  <h4 className="text-sm font-bold mb-1.5">{currentPreview.heading}</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    &ldquo;{currentPreview.message}&rdquo;
                  </p>
                </div>

                {/* Warning Signs Box */}
                <div className="artifact-warnings-box p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-amber text-xs font-bold uppercase tracking-wider mb-2">
                    <AlertTriangle size={15} aria-hidden="true" />
                    <span>Investigator Warning Signs Detected:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {currentPreview.warningSigns.map((sign, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber mt-0.5 font-bold">•</span>
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Safe Decision & Action Callout */}
          <div className="lg:col-span-5 showcase-decision-col flex flex-col justify-between space-y-6">
            <div className="safe-decision-box p-5 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald text-sm font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Safest Protective Action:</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                {currentPreview.safestAction}
              </p>

              <div className="privacy-impact-callout mt-4 pt-3 border-t border-emerald-500/20 text-xs text-muted">
                <span className="font-semibold text-emerald">Privacy Defense Impact: </span>
                {currentPreview.privacyImpact}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="showcase-cta-card p-5 rounded-xl border bg-card/60 text-center">
              <span className="text-xs font-semibold text-cyan uppercase tracking-wider block mb-1">
                20 Interactive Research Challenges
              </span>
              <h3 className="text-lg font-bold">Ready to Test Your Threat Awareness?</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Take part in the academic research study examining social engineering threats and privacy among university students in Sri Lanka.
              </p>

              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <Link href="/consent" className="button primary large w-full sm:w-auto">
                  <span>Start Cyber Investigation</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link href="/play" className="button secondary large w-full sm:w-auto">
                  <Gamepad2 size={17} aria-hidden="true" />
                  <span>Practice Challenges</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
