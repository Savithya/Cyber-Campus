"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Mail,
  Link2,
  MessagesSquare,
  UserRoundSearch,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle2,
  Lock,
  Gamepad2,
  ArrowRight,
  Eye,
  Crosshair,
} from "lucide-react";
import { useSession, api, randomToken } from "@/lib/client";
import { missions } from "@/content/missions";
import { scoreSummary, getOperativeRank } from "@/lib/scoring";

const BADGES = [
  {
    id: "phishing-sentinel",
    title: "Phishing Sentinel",
    mission: "phishing",
    icon: Mail,
    color: "purple",
    pointsRequired: 50,
    requirement: "Complete all 5 Phishing Investigation scenarios (IV1)",
    description:
      "Detect spoofed sender headers, urgent emotional manipulation, lookalike domains, and malicious attachments.",
    dvTakeaway: "Guards against credential harvesting and student portal compromise.",
  },
  {
    id: "pretexting-shield",
    title: "Pretexting Shield",
    mission: "pretexting",
    icon: MessagesSquare,
    color: "emerald",
    pointsRequired: 50,
    requirement: "Complete all 5 Pretexting Detection scenarios (IV2)",
    description:
      "Spot emotional urgency, fabricated campus authorities, and emergency password-reset stories.",
    dvTakeaway: "Withholds student verification data from psychological manipulation.",
  },
  {
    id: "privacy-guardian",
    title: "Identity Verifier",
    mission: "impersonation",
    icon: UserRoundSearch,
    color: "amber",
    pointsRequired: 50,
    requirement: "Complete all 5 Identity Verification scenarios (IV3)",
    description:
      "Verify student council, faculty, and tech support identities out-of-band using official campus directories.",
    dvTakeaway: "Protects personal documents and contact details from identity fraud.",
  },
  {
    id: "domain-sleuth",
    title: "Scam Hunter",
    mission: "links",
    icon: Link2,
    color: "cyan",
    pointsRequired: 50,
    requirement: "Complete all 5 Scam & Malicious Link scenarios (IV4)",
    description:
      "Unmask fraudulent e-commerce deals, accommodation deposits, and fake event registration links.",
    dvTakeaway: "Prevents financial disclosure and malicious code execution on personal devices.",
  },
  {
    id: "cyber-analyst",
    title: "Campus Cyber Sentinel",
    mission: "all",
    icon: Award,
    color: "rainbow",
    pointsRequired: 200,
    requirement: "Complete all 20 scenarios across all 4 research modules",
    description:
      "Comprehensive evaluation across Phishing, Pretexting, Impersonation, and Online Scams.",
    dvTakeaway: "Demonstrates complete threat awareness and rigorous privacy defense.",
  },
];

export function CyberChallengeZone() {
  const router = useRouter();
  const state = useSession();
  const shouldReduceMotion = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"challenges" | "badges" | "scenarios">("challenges");

  const session = state.session;
  const attempts = session?.attempts ?? [];
  const stats = scoreSummary(attempts);
  const rank = getOperativeRank(stats.completed * 10);

  async function launchPractice(missionId?: string) {
    const targetUrl = missionId ? `/play/${missionId}` : "/play";
    if (session && session.status !== "draft") {
      router.push(targetUrl);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = randomToken();
      const res = await api<{ session: typeof session }>("session/start", {
        consented: false,
        eligible: false,
        priorExposure: false,
        practice: true,
        token,
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("cc-practice-exposure", "yes");
      }
      if (res.session) {
        state.setSession(res.session);
      }
      router.push(targetUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="challenges" className="challenge-zone-section" aria-labelledby="challenge-zone-heading">
      <div className="container">
        {/* Section Header */}
        <div className="challenge-zone-header">
          <div className="challenge-eyebrow">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>OPTIONAL CYBER CHALLENGE ZONE · PRACTICE LAB</span>
          </div>

          <h1 id="challenge-zone-heading" className="challenge-title">
            Explore Cybersecurity Challenges
          </h1>

          <p className="challenge-subtitle">
            Discover realistic social engineering scenarios and practice identifying suspicious digital interactions.
          </p>

          {/* Academic Isolation Disclaimer */}
          <div className="academic-isolation-banner" role="note">
            <ShieldCheck size={18} className="text-emerald-400" aria-hidden="true" />
            <div>
              <strong>Strict Academic Research Separation:</strong>
              <span>
                {" "}
                Optional educational challenge activities are kept completely separate from the academic research dataset.
                Participating in learning challenges never alters or influences your research responses.
              </span>
            </div>
          </div>
        </div>

        {/* XP Points & Level Progress Dashboard */}
        <div className="gaming-telemetry-hud">
          <div className="hud-metric-row">
            {/* Rank / Level */}
            <div className="hud-metric-tile">
              <span className="hud-metric-label">CURRENT RANK</span>
              <div className="hud-rank-box">
                <span className="hud-rank-badge">LVL {rank.level}</span>
                <strong className="hud-rank-title">{rank.title}</strong>
              </div>
            </div>

            {/* Total XP Points */}
            <div className="hud-metric-tile">
              <span className="hud-metric-label">TOTAL XP POINTS</span>
              <div className="hud-xp-box">
                <strong className="hud-xp-value">
                  {stats.completed * 10}
                  <small className="hud-xp-max"> / 200 XP</small>
                </strong>
                <span className="hud-xp-tag">10 XP / completed challenge</span>
              </div>
            </div>

            {/* Scenarios Reviewed */}
            <div className="hud-metric-tile">
              <span className="hud-metric-label">SCENARIOS EVALUATED</span>
              <div className="hud-scenarios-box">
                <strong className="hud-scenarios-value">
                  {stats.completed}
                  <small className="hud-scenarios-max"> / 20</small>
                </strong>
                <span className="hud-scenarios-tag">{stats.attempted} attempted</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="hud-action-tile">
              <button
                type="button"
                className="button primary hud-launch-btn"
                onClick={() => launchPractice()}
                disabled={busy}
              >
                <Gamepad2 size={18} aria-hidden="true" />
                <span>{busy ? "Starting Practice…" : session?.mode === "practice" ? "Resume Challenges" : "Enter Practice Lab"}</span>
              </button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="hud-progress-wrapper">
            <div className="hud-progress-labels">
              <span>Overall Evaluation Progress</span>
              <strong>{Math.round((stats.completed / 20) * 100)}% Complete</strong>
            </div>
            <div className="hud-progress-track">
              <div
                className="hud-progress-fill"
                style={{ width: `${Math.max(4, (stats.completed / 20) * 100)}%` }}
              />
            </div>
          </div>

          {error && <p className="hud-error-msg">{error}</p>}
        </div>

        {/* Challenge Zone Tab Switcher */}
        <div className="challenge-tabs-nav" role="tablist" aria-label="Challenge Zone Views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "challenges"}
            className={`challenge-tab-btn ${activeTab === "challenges" ? "active" : ""}`}
            onClick={() => setActiveTab("challenges")}
          >
            <Crosshair size={16} aria-hidden="true" />
            <span>4 Threat Modules</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "badges"}
            className={`challenge-tab-btn ${activeTab === "badges" ? "active" : ""}`}
            onClick={() => setActiveTab("badges")}
          >
            <Award size={16} aria-hidden="true" />
            <span>5 Research Badges</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "scenarios"}
            className={`challenge-tab-btn ${activeTab === "scenarios" ? "active" : ""}`}
            onClick={() => setActiveTab("scenarios")}
          >
            <Eye size={16} aria-hidden="true" />
            <span>Interactive Simulator</span>
          </button>
        </div>

        {/* TAB 1: The 4 Core Challenge Zones */}
        {activeTab === "challenges" && (
          <div className="challenge-cards-grid">
            {/* 1. IV1 — Phishing */}
            <div className="challenge-game-card card-phishing">
              <div className="card-top-header">
                <span className="card-category-tag">IV1 · PHISHING</span>
                <span className="card-xp-badge">+50 XP</span>
              </div>
              <div className="card-main-icon purple-glow">
                <Mail size={28} aria-hidden="true" />
              </div>
              <h3 className="card-title">IV1 — Phishing</h3>
              <p className="card-desc">
                Investigate suspicious emails and urgent credential traps. Detect deceptive lookalike domains, spoofed university notices, and malicious attachments.
              </p>

              {/* Realistic Simulated Email Preview Illustration */}
              <div className="mission-preview-mini-card bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 my-3 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/20 text-[10px] text-muted-foreground font-mono">
                  <span>Simulated Webmail</span>
                  <span className="text-red-400 font-bold">Unverified Sender</span>
                </div>
                <div className="mt-1.5 text-foreground/90 font-mono text-[11px] truncate">
                  IT Helpdesk &lt;security@campus-portal-verify.example&gt;
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic">
                  &ldquo;Urgent 2-hour deadline to confirm student password...&rdquo;
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="card-progress-bar-wrap mb-3">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Module Progress</span>
                  <span className="font-bold text-indigo-400">
                    {(() => {
                      const m = missions.find((x) => x.id === "phishing");
                      const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                      return `${done}/5 Completed`;
                    })()}
                  </span>
                </div>
                <div className="hud-progress-track">
                  <div
                    className="hud-progress-fill bg-indigo-500"
                    style={{
                      width: `${(() => {
                        const m = missions.find((x) => x.id === "phishing");
                        const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                        return (done / 5) * 100;
                      })()}%`,
                    }}
                  />
                </div>
              </div>

              <div className="card-skills-list">
                <span className="skill-chip">Header Analysis</span>
                <span className="skill-chip">Urgency Flags</span>
                <span className="skill-chip">Sender Spoofing</span>
              </div>
              <div className="card-footer">
                <span className="card-scenarios-count">5 Scenarios (PH01–PH05)</span>
                <button
                  type="button"
                  className="button secondary card-play-btn"
                  onClick={() => launchPractice("phishing")}
                >
                  <span>Start Mission</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* 2. IV2 — Pretexting */}
            <div className="challenge-game-card card-pretexting">
              <div className="card-top-header">
                <span className="card-category-tag">IV2 · PRETEXTING</span>
                <span className="card-xp-badge">+50 XP</span>
              </div>
              <div className="card-main-icon emerald-glow">
                <MessagesSquare size={28} aria-hidden="true" />
              </div>
              <h3 className="card-title">IV2 — Pretexting</h3>
              <p className="card-desc">
                Dissect fabricated crisis stories and support conversations. Identify psychological manipulation, false administrative emergencies, and one-time password (OTP) solicitations.
              </p>

              {/* Fabricated Support Conversation Simulation Preview */}
              <div className="mission-preview-mini-card bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 my-3 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/20 text-[10px] text-muted-foreground font-mono">
                  <span>Support Chat Simulation</span>
                  <span className="text-amber-400 font-bold">Unverified Bot</span>
                </div>
                <div className="mt-1.5 text-foreground/90 font-mono text-[11px] truncate">
                  Campus IT Support Assistant
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic">
                  &ldquo;Emergency server failure: share your phone OTP to restore...&rdquo;
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="card-progress-bar-wrap mb-3">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Module Progress</span>
                  <span className="font-bold text-emerald-400">
                    {(() => {
                      const m = missions.find((x) => x.id === "pretexting");
                      const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                      return `${done}/5 Completed`;
                    })()}
                  </span>
                </div>
                <div className="hud-progress-track">
                  <div
                    className="hud-progress-fill bg-emerald-500"
                    style={{
                      width: `${(() => {
                        const m = missions.find((x) => x.id === "pretexting");
                        const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                        return (done / 5) * 100;
                      })()}%`,
                    }}
                  />
                </div>
              </div>

              <div className="card-skills-list">
                <span className="skill-chip">Psychological Analysis</span>
                <span className="skill-chip">Pretexting Stories</span>
                <span className="skill-chip">Independent Channels</span>
              </div>
              <div className="card-footer">
                <span className="card-scenarios-count">5 Scenarios (PT01–PT05)</span>
                <button
                  type="button"
                  className="button secondary card-play-btn"
                  onClick={() => launchPractice("pretexting")}
                >
                  <span>Start Mission</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* 3. IV3 — Impersonation */}
            <div className="challenge-game-card card-impersonation">
              <div className="card-top-header">
                <span className="card-category-tag">IV3 · IMPERSONATION</span>
                <span className="card-xp-badge">+50 XP</span>
              </div>
              <div className="card-main-icon amber-glow">
                <UserRoundSearch size={28} aria-hidden="true" />
              </div>
              <h3 className="card-title">IV3 — Impersonation</h3>
              <p className="card-desc">
                Defend personal credentials and privacy against deceptive identities. Recognize spoofed professors, unverified student council profiles, and unauthorized staff contacts.
              </p>

              {/* Deceptive Identity / Social Profile Preview */}
              <div className="mission-preview-mini-card bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 my-3 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/20 text-[10px] text-muted-foreground font-mono">
                  <span>Social Profile Simulation</span>
                  <span className="text-amber-400 font-bold">0 Mutual Friends</span>
                </div>
                <div className="mt-1.5 text-foreground/90 font-mono text-[11px] truncate">
                  Prof. K. L. Wickramasinghe (Duplicate Account)
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic">
                  &ldquo;Stuck in an urgent meeting; transfer Rs. 5,000 for badges...&rdquo;
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="card-progress-bar-wrap mb-3">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Module Progress</span>
                  <span className="font-bold text-amber-400">
                    {(() => {
                      const m = missions.find((x) => x.id === "impersonation");
                      const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                      return `${done}/5 Completed`;
                    })()}
                  </span>
                </div>
                <div className="hud-progress-track">
                  <div
                    className="hud-progress-fill bg-amber-500"
                    style={{
                      width: `${(() => {
                        const m = missions.find((x) => x.id === "impersonation");
                        const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                        return (done / 5) * 100;
                      })()}%`,
                    }}
                  />
                </div>
              </div>

              <div className="card-skills-list">
                <span className="skill-chip">Account Verification</span>
                <span className="skill-chip">Withholding OTPs</span>
                <span className="skill-chip">Anti-Impersonation</span>
              </div>
              <div className="card-footer">
                <span className="card-scenarios-count">5 Scenarios (IM01–IM05)</span>
                <button
                  type="button"
                  className="button secondary card-play-btn"
                  onClick={() => launchPractice("impersonation")}
                >
                  <span>Start Mission</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* 4. IV4 — Online Scams & Malicious Links */}
            <div className="challenge-game-card card-links">
              <div className="card-top-header">
                <span className="card-category-tag">IV4 · SCAMS &amp; LINKS</span>
                <span className="card-xp-badge">+50 XP</span>
              </div>
              <div className="card-main-icon cyan-glow">
                <Link2 size={28} aria-hidden="true" />
              </div>
              <h3 className="card-title">IV4 — Online Scams &amp; Malicious Links</h3>
              <p className="card-desc">
                Inspect fraudulent offers and dangerous URLs before clicking. Identify deceptive subdomains, advance-fee laptop discounts, fake scholarship messages, and malware traps.
              </p>

              {/* Fraudulent Website / Link Preview */}
              <div className="mission-preview-mini-card bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 my-3 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20 text-[10px] text-muted-foreground font-mono">
                  <span>Link Inspection Panel</span>
                  <span className="text-red-400 font-bold">Subdomain Trick</span>
                </div>
                <div className="mt-1.5 text-foreground/90 font-mono text-[11px] truncate">
                  serendib.campus.example.verify-login.example
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic">
                  Root domain is verify-login.example (external harvesting host)
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="card-progress-bar-wrap mb-3">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Module Progress</span>
                  <span className="font-bold text-cyan-400">
                    {(() => {
                      const m = missions.find((x) => x.id === "links");
                      const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                      return `${done}/5 Completed`;
                    })()}
                  </span>
                </div>
                <div className="hud-progress-track">
                  <div
                    className="hud-progress-fill bg-cyan-500"
                    style={{
                      width: `${(() => {
                        const m = missions.find((x) => x.id === "links");
                        const done = attempts.filter((a) => (m?.ids as readonly string[] | undefined)?.includes(a.scenarioId)).length;
                        return (done / 5) * 100;
                      })()}%`,
                    }}
                  />
                </div>
              </div>

              <div className="card-skills-list">
                <span className="skill-chip">Domain Inspection</span>
                <span className="skill-chip">Typo-squatting</span>
                <span className="skill-chip">Subdomain Traps</span>
              </div>
              <div className="card-footer">
                <span className="card-scenarios-count">5 Scenarios (SC01–SC05)</span>
                <button
                  type="button"
                  className="button secondary card-play-btn"
                  onClick={() => launchPractice("links")}
                >
                  <span>Start Mission</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Achievement Badges Showcase */}
        {activeTab === "badges" && (
          <div className="badges-showcase-grid">
            {BADGES.map((badge) => {
              const Icon = badge.icon;
              const isComplete =
                badge.mission === "all"
                  ? stats.completed === 20
                  : (() => {
                      const m = missions.find((x) => x.id === badge.mission);
                      if (!m) return false;
                      const done = attempts.filter((a) =>
                        (m.ids as readonly string[]).includes(a.scenarioId),
                      );
                      return scoreSummary(done).completed === m.ids.length;
                    })();

              return (
                <div
                  key={badge.id}
                  className={`badge-card-item ${isComplete ? "unlocked" : "locked"}`}
                >
                  <div className="badge-visual-container">
                    <div className={`badge-ring ${badge.color}`}>
                      <Icon size={26} aria-hidden="true" />
                    </div>
                    {isComplete && (
                      <span className="badge-unlocked-tag">
                        <CheckCircle2 size={12} aria-hidden="true" /> UNLOCKED
                      </span>
                    )}
                  </div>
                  <div className="badge-info">
                    <h4 className="badge-title">{badge.title}</h4>
                    <span className="badge-req">{badge.requirement}</span>
                    <p className="badge-desc">{badge.description}</p>
                    <div className="badge-dv-takeaway">
                      <Lock size={12} aria-hidden="true" />
                      <span>{badge.dvTakeaway}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Interactive Cybersecurity Simulator Overview */}
        {activeTab === "scenarios" && (
          <div className="simulator-feature-showcase">
            <div className="simulator-feature-card">
              <div className="simulator-mockup-header">
                <div className="mockup-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="mockup-title">INERT CAMPUS SIMULATOR · REAL-TIME EVIDENCE DOSSIER</span>
                <span className="mockup-safe-badge">100% INERT SANDBOX</span>
              </div>
              <div className="simulator-mockup-body">
                <div className="simulator-step-item">
                  <div className="step-badge">01</div>
                  <div className="step-info">
                    <h4>Examine Primary Evidence</h4>
                    <p>
                      Inspect authentic simulated campus interfaces including campus email inboxes,
                      instant messaging threads, unverified profile cards, and link inspection panels.
                    </p>
                  </div>
                </div>

                <div className="simulator-step-item">
                  <div className="step-badge">02</div>
                  <div className="step-info">
                    <h4>Analyze Expanded Clues</h4>
                    <p>
                      Toggle deep evidentiary clues: extract raw sender SMTP addresses, compare
                      visible link text against actual DNS hostnames, and review out-of-band verification paths.
                    </p>
                  </div>
                </div>

                <div className="simulator-step-item">
                  <div className="step-badge">03</div>
                  <div className="step-info">
                    <h4>Execute Privacy Defense Decisions</h4>
                    <p>
                      Choose between: (A) Proceeding, (B) Verifying through an established channel,
                      or (C) Withholding credentials and reporting. First correct decisions earn 10 XP points.
                    </p>
                  </div>
                </div>

                <div className="simulator-step-item">
                  <div className="step-badge">04</div>
                  <div className="step-info">
                    <h4>Immediate Educational Debrief</h4>
                    <p>
                      Learn immediately why the choice succeeded or failed, with clear feedback on
                      how the threat specifically impacts user privacy autonomy in real academic life.
                    </p>
                  </div>
                </div>
              </div>

              <div className="simulator-mockup-footer">
                <button
                  type="button"
                  className="button primary"
                  onClick={() => launchPractice()}
                >
                  <Gamepad2 size={18} aria-hidden="true" />
                  <span>Launch Interactive Simulator</span>
                </button>
                <Link href="/privacy" className="button secondary">
                  <span>Learn About Research Methodology</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTAs for Challenge Zone */}
        <div className="challenge-zone-bottom-strip">
          <div className="bottom-strip-text">
            <h4>Ready to participate in the actual research study?</h4>
            <p>
              Your survey responses help researchers analyze the real-world impact of these threats
              on undergraduate privacy across state and non-state Sri Lankan universities.
            </p>
          </div>
          <div className="bottom-strip-actions">
            <Link href="/consent" className="button primary large">
              <span>Join Academic Survey</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="button secondary large"
              onClick={() => launchPractice()}
            >
              <span>Practice Missions Only</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
