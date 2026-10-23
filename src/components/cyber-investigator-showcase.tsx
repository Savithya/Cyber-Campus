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
  Gamepad2,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
  Globe,
  Smartphone,
  ShieldX,
  RotateCcw,
  HelpCircle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface InstinctOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

interface PreviewTab {
  id: string;
  name: string;
  threatType: string;
  ivCode: string;
  threatLevel: "CRITICAL" | "HIGH" | "ELEVATED";
  threatLevelColor: string;
  psychologicalTrigger: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
  heading: string;
  sender: string;
  senderWarning?: string;
  message: string;
  warningSigns: string[];
  safestAction: string;
  privacyImpact: string;
  instinctQuestion: string;
  instinctOptions: InstinctOption[];
}

const PREVIEWS: PreviewTab[] = [
  {
    id: "email",
    name: "Simulated Email",
    threatType: "Phishing",
    ivCode: "IV1",
    threatLevel: "CRITICAL",
    threatLevelColor: "text-red-400 bg-red-500/10 border-red-500/30",
    psychologicalTrigger: "Urgency & Fear of Academic Disruption",
    icon: Mail,
    tag: "Credential Harvesting Lure",
    heading: "The Urgent Account Deactivation Notice",
    sender: "University IT Account Services <security-notice@campus-serendib-verify.example>",
    senderWarning: "SPF/DKIM: Domain Unverified · Mismatches official @serendib.campus.example",
    message:
      "URGENT: Your university student account failed our quarterly security validation. Confirm your credentials within two hours at our external gate to avoid immediate LMS and exam portal suspension.",
    warningSigns: [
      "Sender domain @campus-serendib-verify.example does not match official @serendib.campus.example",
      "Artificial 2-hour deadline designed to induce psychological panic",
      "Demands student single sign-on password via external link",
    ],
    safestAction:
      "Withhold password details. Open the official university portal independently via a trusted bookmark to verify your account status.",
    privacyImpact: "Prevents total unauthorized compromise of academic records and student communications.",
    instinctQuestion: "How should you respond to this 2-hour account suspension email?",
    instinctOptions: [
      {
        id: "email-risky",
        label: "Click the link immediately to confirm password before exams get suspended",
        isCorrect: false,
        explanation: "Compromised! This hands your single-sign-on credentials directly to attackers hosting the fake portal.",
      },
      {
        id: "email-safe",
        label: "Withhold credentials and navigate to the real campus portal via an official bookmark",
        isCorrect: true,
        explanation: "Perfect! Never follow verification links in emails. Direct navigation circumvents credential harvesters.",
      },
      {
        id: "email-cautious",
        label: "Reply to the sender asking if this is a genuine email",
        isCorrect: false,
        explanation: "Ineffective! The attacker controls the inbox and will reply confirming the fake urgency.",
      },
    ],
  },
  {
    id: "link",
    name: "Suspicious Link",
    threatType: "Malicious Link Threat",
    ivCode: "IV4",
    threatLevel: "CRITICAL",
    threatLevelColor: "text-red-400 bg-red-500/10 border-red-500/30",
    psychologicalTrigger: "Deceptive Subdomain Concealment",
    icon: Link2,
    tag: "Deceptive Domain Dissection",
    heading: "The Subdomain Concealment Technique",
    sender: "Destination URL: https://serendib.campus.example.verify-login.example/security-gate",
    senderWarning: "Actual Destination Host: verify-login.example (External Server)",
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
    instinctQuestion: "The link shows 'serendib.campus.example' followed by 'verify-login.example'. What is the real domain?",
    instinctOptions: [
      {
        id: "link-safe",
        label: "The real destination is 'verify-login.example' — the university name is just a fake subdomain",
        isCorrect: true,
        explanation: "Exactly! The root domain directly precedes the first single slash '/'. Attackers prepend campus names to deceive.",
      },
      {
        id: "link-risky-1",
        label: "It starts with the campus name, so it is an official internal sub-page",
        isCorrect: false,
        explanation: "Trap! Anyone can purchase any domain and add arbitrary subdomains like 'serendib.campus.example'.",
      },
      {
        id: "link-risky-2",
        label: "Because it starts with https:// and a padlock, it is safe to enter passwords",
        isCorrect: false,
        explanation: "Myth! HTTPS padlocks only mean the connection is encrypted, not that the website owner is legitimate.",
      },
    ],
  },
  {
    id: "identity",
    name: "Identity Verification",
    threatType: "Impersonation",
    ivCode: "IV3",
    threatLevel: "HIGH",
    threatLevelColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    psychologicalTrigger: "Academic Authority & Social Trust",
    icon: UserRoundSearch,
    tag: "Faculty Spoofing Profile",
    heading: "The Urgent Department Head Request",
    sender: "Prof. K. L. Wickramasinghe (Duplicate Social Profile · 0 Mutuals)",
    senderWarning: "Account Created 2 Days Ago · No Official University Email Link",
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
    instinctQuestion: "A professor contacts you on social media asking for an emergency Rs. 5,000 badge transfer. What to do?",
    instinctOptions: [
      {
        id: "id-safe",
        label: "Refuse payment and verify in person or via the official departmental telephone directory",
        isCorrect: true,
        explanation: "Spot on! University professors never request peer-to-peer student bank transfers for departmental operations.",
      },
      {
        id: "id-risky",
        label: "Transfer the Rs. 5,000 quickly because you don't want to disappoint a faculty member",
        isCorrect: false,
        explanation: "Compromised! Attackers exploit respect for academic authority to extract irreversible mobile funds.",
      },
      {
        id: "id-cautious",
        label: "Ask the account to send a picture of their university staff card",
        isCorrect: false,
        explanation: "Risky! Attackers routinely paste stolen ID photos onto fake cards to validate their pretext.",
      },
    ],
  },
  {
    id: "privacy",
    name: "Privacy Decision",
    threatType: "Pretexting & Privacy",
    ivCode: "IV2 / DV",
    threatLevel: "CRITICAL",
    threatLevelColor: "text-red-400 bg-red-500/10 border-red-500/30",
    psychologicalTrigger: "Financial Lure & Advance Approval Bait",
    icon: Lock,
    tag: "Financial Data Protection",
    heading: "The Fake National Welfare Bursary",
    sender: "Ministry Welfare Grant SMS <+94 77 000 1234>",
    senderWarning: "Unregistered Sender · Demands 3-digit CVV & NIC Number",
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
    instinctQuestion: "The SMS promises LKR 85,000 but asks for your 16-digit card number and 3-digit CVV. What should you do?",
    instinctOptions: [
      {
        id: "priv-safe",
        label: "Withhold all debit card CVVs and verify grants through official campus student welfare",
        isCorrect: true,
        explanation: "Excellent! Direct deposits only ever require account and branch numbers. CVVs are strictly for charging money!",
      },
      {
        id: "priv-risky",
        label: "Reply with the card number and CVV so you do not lose the LKR 85,000 grant",
        isCorrect: false,
        explanation: "Critical Loss! Sharing CVVs allows attackers to drain student accounts via unauthorized online transactions.",
      },
      {
        id: "priv-cautious",
        label: "Send only your NIC number and withhold the debit card CVV",
        isCorrect: false,
        explanation: "Still Risky! Providing an NIC to unverified senders exposes you to identity theft and SIM-swap fraud.",
      },
    ],
  },
];

export function CyberInvestigatorShowcase() {
  const [activeTabId, setActiveTabId] = useState<string>("email");
  const [investigatorMode, setInvestigatorMode] = useState<boolean>(true);
  const [selectedInstinct, setSelectedInstinct] = useState<string | null>(null);

  const currentPreview = PREVIEWS.find((p) => p.id === activeTabId) || PREVIEWS[0];
  const Icon = currentPreview.icon;

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    setSelectedInstinct(null); // Reset instinct quiz for the new tab
  };

  const currentChoice = currentPreview.instinctOptions.find((opt) => opt.id === selectedInstinct);

  return (
    <section
      id="challenges"
      className="cyber-showcase-section container my-16 lg:my-24"
      aria-labelledby="showcase-heading"
    >
      {/* Section Header */}
      <div className="section-header-centered text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
          <Sparkles size={14} className="animate-pulse" aria-hidden="true" />
          <span>INTERACTIVE CYBERSECURITY LAB · SRI LANKA</span>
        </div>
        <h2 id="showcase-heading" className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Think Like a Cyber Investigator
        </h2>
        <p className="text-muted-foreground mt-3 text-base md:text-lg leading-relaxed">
          Explore realistic digital threats, examine suspicious messages, and make decisions that help
          protect personal information.
        </p>
      </div>

      {/* Lab Control Strip: Tab Pills + Investigator Lens Toggle */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
        {/* Interactive Tabs Header */}
        <div
          className="showcase-tabs-bar flex items-center justify-center gap-2 flex-wrap"
          role="tablist"
          aria-label="Investigation Previews"
        >
          {PREVIEWS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-primary/50"
                    : "bg-card/70 text-muted-foreground border border-border/70 hover:bg-card hover:text-foreground"
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <TabIcon size={15} aria-hidden="true" />
                <span>{tab.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {tab.ivCode}
                </span>
              </button>
            );
          })}
        </div>

        {/* Investigator Mode Toggle Button */}
        <button
          type="button"
          onClick={() => setInvestigatorMode(!investigatorMode)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
            investigatorMode
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-card/80 border-border text-muted-foreground hover:text-foreground"
          }`}
          title="Toggle highlighted investigator warning signs"
        >
          {investigatorMode ? (
            <>
              <Eye size={15} className="text-amber-400" />
              <span>Investigator Lens: ON</span>
            </>
          ) : (
            <>
              <EyeOff size={15} />
              <span>Investigator Lens: OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Main Showcase Visual Card */}
      <div
        className="showcase-card mt-6 p-6 lg:p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto"
        role="region"
        aria-label={`${currentPreview.name} Showcase`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Simulated Digital Artifact */}
          <div className="lg:col-span-7 showcase-artifact-col space-y-5">
            {/* Window Container */}
            <div className="artifact-window rounded-xl border border-border/80 bg-background/90 overflow-hidden shadow-lg">
              {/* Window Titlebar */}
              <div className="px-4 py-3 bg-muted/20 border-b border-border/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" aria-hidden="true" />
                  <span className="text-xs font-mono font-bold text-foreground/80 ml-2">
                    {currentPreview.threatType} ({currentPreview.ivCode})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentPreview.threatLevelColor}`}
                  >
                    THREAT: {currentPreview.threatLevel}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {currentPreview.tag}
                  </span>
                </div>
              </div>

              {/* Artifact Body */}
              <div className="p-5 space-y-4">
                {/* Sender Bar with Warning Banner */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground block font-mono">
                      FROM / SENDER ADDRESS:
                    </span>
                    {investigatorMode && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
                        FLAGGED ADDRESS
                      </span>
                    )}
                  </div>
                  <code className="text-xs font-semibold text-primary block mt-1 select-all break-all bg-card/80 p-2 rounded border border-border/60">
                    {currentPreview.sender}
                  </code>
                  {investigatorMode && currentPreview.senderWarning && (
                    <div className="mt-1 text-[11px] text-amber-300 font-mono">
                      ↳ {currentPreview.senderWarning}
                    </div>
                  )}
                </div>

                {/* Specific Message Body */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    investigatorMode
                      ? "bg-amber-500/5 border-amber-500/30"
                      : "bg-card/70 border-border"
                  }`}
                >
                  <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    {currentPreview.heading}
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                    &ldquo;{currentPreview.message}&rdquo;
                  </p>
                </div>

                {/* Subdomain Breakdown for the Link Tab */}
                {activeTabId === "link" && investigatorMode && (
                  <div className="p-3.5 rounded-lg bg-card/80 border border-cyan-500/30 space-y-2 text-xs">
                    <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Globe size={14} />
                      <span>URL Structural Analysis:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-center">
                      <div className="p-2 rounded bg-background/60 border border-border">
                        <span className="text-muted-foreground block text-[9px] uppercase">Subdomain Lure</span>
                        <span className="text-amber-400 font-bold break-all">serendib.campus</span>
                      </div>
                      <div className="p-2 rounded bg-red-500/10 border border-red-500/40">
                        <span className="text-red-400 block text-[9px] uppercase font-bold">Root Domain (Trap)</span>
                        <span className="text-red-400 font-bold break-all">verify-login.example</span>
                      </div>
                      <div className="p-2 rounded bg-background/60 border border-border">
                        <span className="text-muted-foreground block text-[9px] uppercase">Path</span>
                        <span className="text-muted-foreground break-all">/security-gate</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Signs Box (Shows when Investigator Mode is ON) */}
                {investigatorMode ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <AlertTriangle size={15} aria-hidden="true" />
                      <span>Investigator Red Flags Detected:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-foreground/80">
                      {currentPreview.warningSigns.map((sign, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold mt-0.5">•</span>
                          <span className="leading-snug">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-card/40 border border-border/60 text-center">
                    <p className="text-xs text-muted-foreground">
                      Investigator Lens is OFF. Turn ON to inspect hidden deception elements.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive "Test Your Threat Instinct" Micro-Quiz */}
            <div className="rounded-xl border border-border/80 bg-card/40 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-cyan-400" />
                  Test Your Threat Instinct:
                </span>
                {selectedInstinct && (
                  <button
                    type="button"
                    onClick={() => setSelectedInstinct(null)}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-3 font-medium">
                {currentPreview.instinctQuestion}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {currentPreview.instinctOptions.map((opt) => {
                  const isChosen = selectedInstinct === opt.id;
                  let optStyle =
                    "bg-background/70 border-border hover:bg-card hover:border-primary/50 text-foreground";

                  if (isChosen) {
                    optStyle = opt.isCorrect
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/40";
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedInstinct(opt.id)}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-start gap-2.5 ${optStyle}`}
                    >
                      <span className="mt-0.5 flex-shrink-0">
                        {isChosen ? (
                          opt.isCorrect ? (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          ) : (
                            <ShieldX size={14} className="text-red-400" />
                          )
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/60 inline-block" />
                        )}
                      </span>
                      <span className="leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Feedback Result */}
              {currentChoice && (
                <div
                  className={`mt-3 p-3 rounded-lg border text-xs animate-fadeIn ${
                    currentChoice.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  <div className="font-bold mb-0.5 flex items-center gap-1.5">
                    {currentChoice.isCorrect ? "Threat Defended!" : "Vulnerability Triggered!"}
                  </div>
                  <p className="leading-relaxed">{currentChoice.explanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Safe Decision & Telemetry & Action Callout */}
          <div className="lg:col-span-5 showcase-decision-col flex flex-col justify-between space-y-6">
            {/* Threat Telemetry Card */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card/50 space-y-3">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Threat Telemetry &amp; Psychology
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-border/50">
                <span className="text-muted-foreground">Attack Variable:</span>
                <span className="font-bold text-foreground">{currentPreview.threatType} ({currentPreview.ivCode})</span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-border/50">
                <span className="text-muted-foreground">Risk Rating:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${currentPreview.threatLevelColor}`}>
                  {currentPreview.threatLevel}
                </span>
              </div>

              <div className="text-xs pt-1">
                <span className="text-muted-foreground block mb-1">Psychological Vector:</span>
                <span className="font-semibold text-foreground/90 block">
                  {currentPreview.psychologicalTrigger}
                </span>
              </div>
            </div>

            {/* Safest Protective Action Box */}
            <div className="safe-decision-box p-6 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2.5">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Safest Protective Action:</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/95 leading-relaxed font-medium">
                {currentPreview.safestAction}
              </p>

              <div className="privacy-impact-callout mt-4 pt-3.5 border-t border-emerald-500/20 text-xs text-muted-foreground">
                <span className="font-bold text-emerald-400">Privacy Defense Impact: </span>
                {currentPreview.privacyImpact}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="showcase-cta-card p-6 rounded-2xl border border-border/80 bg-gradient-to-br from-card/80 to-card/50 text-center shadow-lg">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                20 Interactive Research Challenges
              </span>
              <h3 className="text-lg font-bold text-foreground">
                Ready to Test Your Threat Awareness?
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Take part in the academic research study examining social engineering threats and privacy among university students in Sri Lanka.
              </p>

              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/consent"
                  prefetch={true}
                  className="button primary large w-full sm:w-auto font-bold shadow-md shadow-primary/20"
                >
                  <span>Start Cyber Investigation</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link
                  href="/play"
                  prefetch={true}
                  className="button secondary large w-full sm:w-auto font-medium"
                >
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
