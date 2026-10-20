"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  User,
  Link2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Search,
  FileText,
  Smartphone,
  QrCode,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  HelpCircle,
  Play,
  Pause,
  Volume2,
  Phone,
  PhoneCall,
  Video,
  CreditCard,
  Building,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Award,
  Check,
  Loader2,
  MessageSquare,
  Calendar,
  DollarSign,
  MapPin,
  Send,
} from "lucide-react";
import { api, useSession } from "@/lib/client";
import { missions } from "@/content/missions";
import type { Scenario, Attempt, ScenarioChoice, AnswerKey } from "@/lib/types";

interface InteractiveChallengeRunnerProps {
  scenario: Scenario;
  missionId: string;
  scenarioIndex: number; // 0..4
  totalInMission: number; // 5
  overallCompleted?: number; // 0..20
  totalOverall?: number; // 20
  overallXp?: number; // 0..200
  onCompleteScenario: (attempt: Attempt) => void;
  onPreviousScenario?: () => void;
  onNextScenario?: () => void;
  onSelectScenarioIndex?: (index: number) => void;
  onReturnToHub: () => void;
  previousAttempt?: Attempt;
  educationalMode?: boolean;
}

export function InteractiveChallengeRunner({
  scenario,
  missionId,
  scenarioIndex,
  totalInMission,
  overallCompleted = 0,
  totalOverall = 20,
  overallXp = 0,
  onCompleteScenario,
  onPreviousScenario,
  onNextScenario,
  onSelectScenarioIndex,
  onReturnToHub,
  previousAttempt,
  educationalMode = false,
}: InteractiveChallengeRunnerProps) {
  const state = useSession();
  const startTimeRef = useRef<number>(0);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Investigation Tool State
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<number>(0);
  const [headersExpanded, setHeadersExpanded] = useState<boolean>(false);
  const [qrScanned, setQrScanned] = useState<boolean>(false);
  const [qrLaserActive, setQrLaserActive] = useState<boolean>(false);
  const [attachmentInspected, setAttachmentInspected] = useState<boolean>(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState<string>("");
  const [directorySearchResults, setDirectorySearchResults] = useState<Array<{ name: string; title: string; dept: string; email: string }> | null>(null);
  const [activeBrowserTab, setActiveBrowserTab] = useState<"auth" | "replica">("replica");
  const [profileCompareTab, setProfileCompareTab] = useState<"real" | "fake">("fake");
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [activeChatBranch, setActiveChatBranch] = useState<string | null>(null);
  const [linkHovered, setLinkHovered] = useState<boolean>(false);

  // IM02 Dedicated WhatsApp / Classmate Simulation State
  const [classmateProfileOpen, setClassmateProfileOpen] = useState<boolean>(false);
  const [classmateCallActive, setClassmateCallActive] = useState<boolean>(false);
  const [classmateCallPhase, setClassmateCallPhase] = useState<"ringing" | "connected" | "ended">("ringing");
  const [im02ChatLog, setIm02ChatLog] = useState<Array<{ sender: "user" | "dilshan"; text: string; time: string }>>([]);
  const [im02Typing, setIm02Typing] = useState<boolean>(false);

  // E-Commerce, Accommodation, & Other Mini-Game Tools
  const [sc01Tab, setSc01Tab] = useState<"whois" | "reviews" | "checkout">("whois");
  const [sc02Tab, setSc02Tab] = useState<"photos" | "chat" | "reverseImage">("photos");
  const [libraryFineTab, setLibraryFineTab] = useState<"notice" | "account" | "policy">("notice");
  const [censusTab, setCensusTab] = useState<"form" | "calendar" | "policy">("form");
  const [twoFaSmsOpen, setTwoFaSmsOpen] = useState<boolean>(true);

  // Decision & Automatic Transition State
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    previousAttempt?.selectedAction ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasConfirmedSaved, setHasConfirmedSaved] = useState<boolean>(Boolean(previousAttempt));
  const [recordedAttempt, setRecordedAttempt] = useState<Attempt | null>(
    previousAttempt ?? null,
  );
  const [feedback, setFeedback] = useState<AnswerKey | null>(null);
  const [error, setError] = useState<string>("");

  // Reset state when scenario changes
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    startTimeRef.current = Date.now();
    setSelectedChoiceId(previousAttempt?.selectedAction ?? null);
    setRecordedAttempt(previousAttempt ?? null);
    setHasConfirmedSaved(Boolean(previousAttempt));
    setFeedback(null);
    setError("");
    setHeadersExpanded(false);
    setQrScanned(false);
    setQrLaserActive(false);
    setAttachmentInspected(false);
    setVideoPlaying(false);
    setAudioPlaying(false);
    setActiveEvidenceTab(0);
    setActiveChatBranch(null);
    setClassmateProfileOpen(false);
    setClassmateCallActive(false);
    setClassmateCallPhase("ringing");
    setIm02ChatLog([]);
    setIm02Typing(false);
    setDirectorySearchQuery("");
    setDirectorySearchResults(null);
    setSc01Tab("whois");
    setSc02Tab("photos");
    setLibraryFineTab("notice");
    setCensusTab("form");
    setTwoFaSmsOpen(true);
  }, [scenario.id, previousAttempt]);

  // Clean up auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const currentMission = missions.find((m) => m.id === missionId) ?? missions[0];

  // Directory Search simulation for IM03
  const handleDirectorySearch = (q: string) => {
    setDirectorySearchQuery(q);
    if (!q.trim()) {
      setDirectorySearchResults(null);
      return;
    }
    const campusStaff = [
      { name: "Dr. Anura Fernando", title: "Senior Lecturer & Head of Department", dept: "Department of Botany, Faculty of Science", email: "afernando@botany.campus.example" },
      { name: "Prof. Gamini Bandara", title: "Senior Proctor & Professor of Law", dept: "Office of the Proctor & Student Discipline", email: "proctor@campus.example" },
      { name: "Prof. K. L. Wickramasinghe", title: "Professor & Head of Department", dept: "Department of Computing & Cyber Systems", email: "klwick@computing.campus.example" },
      { name: "Dr. Sunil Karunaratne", title: "Deputy Proctor", dept: "Faculty of Engineering", email: "proctor.eng@campus.example" },
      { name: "Mrs. M. Senanayake", title: "Assistant Registrar", dept: "Examinations Branch", email: "exams@admin.campus.example" },
    ];
    const filtered = campusStaff.filter((s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.title.toLowerCase().includes(q.toLowerCase()) ||
      s.dept.toLowerCase().includes(q.toLowerCase())
    );
    setDirectorySearchResults(filtered);
  };

  // QR scanner animation helper
  const handleScanQr = () => {
    setQrLaserActive(true);
    setTimeout(() => {
      setQrLaserActive(false);
      setQrScanned(true);
    }, 600);
  };

  // IM02 Inquiry helper
  const handleIm02Inquiry = (questionText: string, replyText: string) => {
    if (im02Typing) return;
    setIm02ChatLog((prev) => [...prev, { sender: "user", text: questionText, time: "Just now" }]);
    setIm02Typing(true);
    setTimeout(() => {
      setIm02Typing(false);
      setIm02ChatLog((prev) => [...prev, { sender: "dilshan", text: replyText, time: "Just now" }]);
    }, 700);
  };

  // IM02 Simulated Phone Call
  const handleStartClassmateCall = () => {
    setClassmateCallActive(true);
    setClassmateCallPhase("ringing");
    setTimeout(() => {
      setClassmateCallPhase("connected");
    }, 1200);
  };

  // Choice selection - highlights the option without immediately locking
  const handleSelectChoice = (choiceId: string) => {
    if (isSubmitting) return;
    setSelectedChoiceId(choiceId);
    setError("");
  };

  // Action Button: Confirm My Answer
  const handleConfirmAnswer = async () => {
    if (!selectedChoiceId || isSubmitting || !state.session) return;

    setIsSubmitting(true);
    setError("");

    const elapsedMs = Math.min(
      86400000,
      Math.max(1000, Date.now() - (startTimeRef.current || Date.now())),
    );

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await api<{ session: typeof state.session; attempt: Attempt; feedback?: AnswerKey }>(
        "game/attempt",
        {
          scenarioId: scenario.id,
          action: selectedChoiceId,
          elapsedMs,
          idempotencyKey,
        },
      );

      setRecordedAttempt(res.attempt);
      setHasConfirmedSaved(true);
      onCompleteScenario(res.attempt);
    } catch (e) {
      setError((e as Error).message || "Failed to record response. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry action for failed saves: resubmits the chosen action
  const handleRetryDecision = async () => {
    if (!selectedChoiceId) return;
    await handleConfirmAnswer();
  };

  const missionIndex = missions.findIndex((m) => m.id === missionId);
  const globalQuestionNumber = (missionIndex >= 0 ? missionIndex : 0) * 5 + scenarioIndex + 1;
  const hasDecided = Boolean(recordedAttempt) || hasConfirmedSaved;

  return (
    <div className="interactive-challenge-runner" role="region" aria-label={`Cyber Investigation Challenge ${scenario.id}`}>
      {/* =========================================================================
          AREA A — MISSION HEADER
          ========================================================================= */}
      <header className="challenge-top-bar" aria-label="Investigation Mission Header">
        <div className="challenge-breadcrumbs">
          <button
            type="button"
            className="back-to-hub-btn"
            onClick={onReturnToHub}
            aria-label="Back to Mission Control Hub"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Mission Control</span>
          </button>
          <span className="crumb-separator" aria-hidden="true">/</span>
          <span className="crumb-threat-cat">
            MISSION 0{missionIndex + 1} — {currentMission.name.toUpperCase()} · {currentMission.iv}
          </span>
          <span className="crumb-separator" aria-hidden="true">/</span>
          <span className="crumb-challenge-num">Challenge 0{scenarioIndex + 1} of 05</span>
        </div>

        <div className="challenge-header-right flex items-center gap-4">
          <span className="global-q-pill-header font-mono text-xs">
            Question {globalQuestionNumber < 10 ? `0${globalQuestionNumber}` : globalQuestionNumber} of 20
          </span>
          {/* Overall Research Progress */}
          <div className="runner-overall-telemetry">
            <div className="runner-overall-labels">
              <span className="runner-overall-title">Overall:</span>
              <strong className="runner-overall-count font-mono">{overallCompleted} / {totalOverall}</strong>
              <span className="runner-overall-xp">({Math.round((overallCompleted / Math.max(1, totalOverall)) * 100)}%)</span>
            </div>
            <div
              className="runner-overall-track"
              role="progressbar"
              aria-valuenow={overallCompleted}
              aria-valuemin={0}
              aria-valuemax={totalOverall}
              aria-label="Overall research progress"
            >
              <div
                className="runner-overall-fill"
                style={{ width: `${Math.max(4, (overallCompleted / Math.max(1, totalOverall)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Challenge Jump Selector Bar */}
      <div className="challenge-pills-selector-bar flex items-center gap-2 mb-4" role="tablist" aria-label="Mission Challenges Selector">
        <span className="text-xs font-semibold text-muted mr-1">Challenges:</span>
        {Array.from({ length: totalInMission }, (_, idx) => {
          const isCurrent = idx === scenarioIndex;
          const isDone = Boolean(state.session?.attempts.some((a) => a.scenarioId === currentMission.ids[idx] && a.attemptNumber === 1 && a.selectedAction !== null));
          return (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              className={`challenge-jump-pill ${isCurrent ? "active" : ""} ${isDone ? "done" : ""}`}
              onClick={() => onSelectScenarioIndex?.(idx)}
              title={`Jump to Challenge 0${idx + 1}`}
            >
              <span>0{idx + 1}</span>
              {isDone && <Check size={11} strokeWidth={3} className="ml-1 text-emerald" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {/* Saving and Error Banners */}
      {isSubmitting && (
        <div className="subtle-saving-banner" role="status" aria-live="polite">
          <Loader2 size={16} className="animate-spin text-cyan" aria-hidden="true" />
          <span>Saving decision securely to research session…</span>
        </div>
      )}

      {hasConfirmedSaved && !isSubmitting && (
        <div className="subtle-saved-banner" role="status" aria-live="polite">
          <CheckCircle2 size={16} className="text-emerald" aria-hidden="true" />
          <span>Answer confirmed &amp; saved to research session. Click Next Challenge to proceed.</span>
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <div className="error-banner-content">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="button secondary small retry-save-btn"
            onClick={handleRetryDecision}
            disabled={isSubmitting}
          >
            <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} aria-hidden="true" />
            <span>Retry Recording Decision</span>
          </button>
        </div>
      )}

      {/* Main Responsive Investigation Grid */}
      <div className="challenge-main-grid">
        {/* =========================================================================
            AREA B — INTERACTIVE INVESTIGATION WORKSPACE (LEFT COLUMN)
            ========================================================================= */}
        <div className="challenge-simulation-col">
          {/* Mission Briefing Card */}
          <div className="briefing-box">
            <div className="briefing-header">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="mission-tag-pill font-mono text-xs text-primary font-semibold">
                  MISSION 0{missionIndex + 1} — {currentMission.name.toUpperCase()} ({currentMission.iv})
                </span>
                <span className="challenge-tag-pill font-mono text-xs text-muted">
                  · Challenge 0{scenarioIndex + 1} of 05
                </span>
              </div>
              <h2 className="text-xl font-bold">{scenario.title}</h2>
            </div>
            <div className="briefing-situation-box mt-3 p-3.5 rounded-lg border bg-card/60">
              <span className="text-xs uppercase font-semibold text-cyan tracking-wider block mb-1">Scenario:</span>
              <p className="briefing-situation text-sm leading-relaxed">&ldquo;{scenario.situation}&rdquo;</p>
            </div>
          </div>

          {/* SIMULATION CONTAINER BY INTERACTION TYPE */}
          <div className="simulation-viewport" aria-label="Interactive Cyber Simulation Workspace">
            {/* 1. EMAIL INBOX INTERFACE (PH01, PH04) */}
            {(scenario.interaction === "email" || scenario.interaction === "attachment") && (
              <div className="sim-email-client">
                <div className="email-client-header">
                  <div className="email-controls">
                    <span className="window-dot red" aria-hidden="true" />
                    <span className="window-dot yellow" aria-hidden="true" />
                    <span className="window-dot green" aria-hidden="true" />
                    <span className="email-client-title">Campus Webmail Client · Student Inbox</span>
                  </div>
                  <button
                    type="button"
                    className="email-headers-toggle"
                    onClick={() => setHeadersExpanded(!headersExpanded)}
                    aria-expanded={headersExpanded}
                  >
                    <Info size={14} aria-hidden="true" />
                    <span>{headersExpanded ? "Hide RFC Headers" : "Inspect RFC Headers"}</span>
                    <ChevronDown size={14} className={`transition-transform ${headersExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Sender Metadata Bar */}
                <div className="email-meta-bar">
                  <div className="meta-row">
                    <span className="meta-key">From:</span>
                    <strong className="meta-name">{scenario.senderName}</strong>
                    <code className="meta-address">&lt;{scenario.senderAddress}&gt;</code>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">To:</span>
                    <span className="meta-val">student-id@serendib.campus.example</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Subject:</span>
                    <strong className="meta-subject">{scenario.title}</strong>
                  </div>

                  {/* Expandable RFC Header Details */}
                  {headersExpanded && (
                    <div className="email-raw-headers">
                      <pre>
                        {`Return-Path: <bounce@${scenario.senderAddress.split("@")[1] || "unknown.example"}>
Authentication-Results: spf=softfail (sender IP 198.51.100.42 not in authorized SPF record)
DKIM-Signature: v=1; d=${scenario.senderAddress.split("@")[1] || "external.example"}; s=mail;
X-Originating-IP: [198.51.100.42] (External Non-Campus Gateway)
Message-ID: <${scenario.id.toLowerCase()}-audit@gateway-relay.example>`}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Email Body */}
                <div className="email-body-content">
                  <p className="email-text">{scenario.message}</p>

                  {/* Attachment Card if applicable (PH04) */}
                  {scenario.mediaDetails?.attachmentName && (
                    <div className="email-attachment-box">
                      <div className="attachment-icon">
                        <FileText size={28} className="text-amber" aria-hidden="true" />
                      </div>
                      <div className="attachment-info">
                        <strong>{scenario.mediaDetails.attachmentName}</strong>
                        <small>{scenario.mediaDetails.attachmentSize ?? "2.4 MB"} · {scenario.mediaDetails.attachmentType ?? "Executable Document"}</small>
                      </div>
                      <button
                        type="button"
                        className="button secondary small"
                        onClick={() => setAttachmentInspected(true)}
                        aria-label="Inspect attachment properties in safe sandbox"
                      >
                        <Search size={14} aria-hidden="true" />
                        <span>Inspect in Safe Sandbox</span>
                      </button>
                    </div>
                  )}

                  {/* Simulated Embedded Link if applicable (PH01) */}
                  {scenario.mediaDetails?.destinationUrl && (
                    <div className="email-embedded-link-wrapper">
                      <span className="link-action-label">Action required in email:</span>
                      <a
                        href="#preview"
                        className="simulated-link-button"
                        onMouseEnter={() => setLinkHovered(true)}
                        onMouseLeave={() => setLinkHovered(false)}
                        onClick={(e) => {
                          e.preventDefault();
                          setLinkHovered(!linkHovered);
                        }}
                      >
                        <ExternalLink size={14} aria-hidden="true" />
                        <span>Open Verification Gateway</span>
                      </a>
                      {linkHovered && (
                        <div className="link-hover-tooltip" role="tooltip">
                          <span className="tooltip-title">Destination URL Preview:</span>
                          <code>{scenario.mediaDetails.destinationUrl}</code>
                          <span className="tooltip-sub">
                            Actual Root Host: <strong>{scenario.mediaDetails.hostDomain ?? "external.example"}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. SMARTPHONE MESSAGING INTERFACE (PH02, PT04) */}
            {scenario.interaction === "sms" && (
              <div className="sim-smartphone-frame">
                <div className="phone-notch">
                  <span className="phone-speaker" aria-hidden="true" />
                  <span className="phone-cam" aria-hidden="true" />
                </div>
                <div className="phone-status-bar">
                  <span>9:41 AM</span>
                  <div className="phone-status-icons">
                    <span>Mobitel 4G</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="phone-header">
                  <div className="sms-avatar">
                    <Smartphone size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <strong>{scenario.senderName}</strong>
                    <small>{scenario.senderAddress}</small>
                  </div>
                </div>

                <div className="phone-message-thread">
                  <div className="sms-timestamp">Today · SMS Notification</div>
                  <div className="sms-bubble incoming">
                    <p>{scenario.message}</p>
                    {scenario.mediaDetails?.destinationUrl && (
                      <div className="sms-link-card">
                        <Link2 size={15} aria-hidden="true" />
                        <span>{scenario.mediaDetails.destinationUrl}</span>
                      </div>
                    )}
                    <span className="sms-time">9:41 AM · Delivered</span>
                  </div>

                  {/* 2FA System Code Simulator for PT04 */}
                  {scenario.id === "PT04" && twoFaSmsOpen && (
                    <div className="sms-bubble system-auth-bubble">
                      <div className="auth-alert-badge">
                        <ShieldAlert size={14} aria-hidden="true" />
                        <span>SYSTEM TWO-FACTOR AUTHENTICATION SMS</span>
                      </div>
                      <p className="auth-code-text">Campus SSO Security Code: <strong>849-204</strong></p>
                      <p className="auth-warning-text">WARNING: NEVER share this code with anyone, including university staff. IT personnel will NEVER ask for your code.</p>
                      <span className="sms-time">Just now · System Gateway</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. QR CODE SCANNER SIMULATOR (PH03) */}
            {scenario.interaction === "qr" && (
              <div className="sim-qr-investigation">
                <div className="qr-poster-preview">
                  <div className="poster-header">
                    <span className="poster-pin" aria-hidden="true" />
                    <strong>Campus Cafeteria Noticeboard Poster</strong>
                  </div>
                  <div className="poster-content">
                    <div className="poster-badge">TECH SYMPOSIUM 2026</div>
                    <h3>Free Student Vouchers &amp; Passes</h3>
                    <p>Scan with smartphone to register instantly!</p>

                    <div className="qr-code-interactive-target">
                      <div className="qr-box relative">
                        <QrCode size={110} aria-hidden="true" />
                        {qrLaserActive && <div className="qr-laser-scanner-line" aria-hidden="true" />}
                      </div>
                      <button
                        type="button"
                        className="button secondary small"
                        onClick={handleScanQr}
                        aria-label="Scan QR Code with Safe Decoder"
                      >
                        <Search size={14} aria-hidden="true" />
                        <span>{qrScanned ? "Re-scan with Safe Decoder" : "Scan with Safe Decoder"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {qrScanned && (
                  <div className="qr-decoded-panel">
                    <div className="decoded-header">
                      <CheckCircle2 size={16} className="text-emerald" aria-hidden="true" />
                      <strong>Decoded Safe Target Analysis</strong>
                    </div>
                    <div className="decoded-detail">
                      <span className="decoded-label">Decoded Destination URL:</span>
                      <code>{scenario.mediaDetails?.destinationUrl ?? "https://event-ticket-claim.example/student-voucher?ref=campus"}</code>
                    </div>
                    <div className="decoded-meta-grid">
                      <div>
                        <span>Registered Domain:</span>
                        <strong>{scenario.mediaDetails?.hostDomain ?? "event-ticket-claim.example"}</strong>
                      </div>
                      <div>
                        <span>Official Campus Domain:</span>
                        <strong>{scenario.mediaDetails?.legitDomain ?? "soc.campus.example"}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. DUAL BROWSER / URL INSPECTION (PH05, SC03) */}
            {(scenario.interaction === "dual_browser" || scenario.interaction === "payment_gateway") && (
              <div className="sim-dual-browser">
                <div className="browser-tabs-header" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeBrowserTab === "replica"}
                    className={`browser-tab ${activeBrowserTab === "replica" ? "active" : ""}`}
                    onClick={() => setActiveBrowserTab("replica")}
                  >
                    <AlertTriangle size={14} className="text-amber" aria-hidden="true" />
                    <span>View: Received Link Destination</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeBrowserTab === "auth"}
                    className={`browser-tab ${activeBrowserTab === "auth" ? "active" : ""}`}
                    onClick={() => setActiveBrowserTab("auth")}
                  >
                    <ShieldCheck size={14} className="text-emerald" aria-hidden="true" />
                    <span>View: Official Bookmarked Portal</span>
                  </button>
                </div>

                {/* Simulated Address Bar */}
                <div className="browser-chrome-bar">
                  <div className="address-bar-input">
                    {activeBrowserTab === "replica" ? (
                      scenario.interaction === "payment_gateway" ? (
                        <>
                          <span className="ssl-badge unencrypted">
                            <AlertCircle size={13} aria-hidden="true" /> Not Secure (HTTP Plaintext)
                          </span>
                          <span className="address-url">http://pay-secure.campus-billing.example/checkout</span>
                        </>
                      ) : (
                        <>
                          <span className="ssl-badge generic">
                            <Lock size={13} aria-hidden="true" /> Valid SSL (Generic DV)
                          </span>
                          <span className="address-url">https://portal-campus.account-auth.example/exam-login</span>
                        </>
                      )
                    ) : (
                      <>
                        <span className="ssl-badge official">
                          <ShieldCheck size={13} aria-hidden="true" /> Verified Campus Org EV
                        </span>
                        <span className="address-url">https://portal.campus.example/exams/schedule</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="browser-viewport-content">
                  {activeBrowserTab === "replica" ? (
                    <div className="replica-portal-form">
                      <div className="form-watermark">
                        {scenario.interaction === "payment_gateway" ? "Simulated Examination Fee Gateway" : "Simulated Exam Portal Login"}
                      </div>
                      <h3>{scenario.title}</h3>
                      <p>{scenario.message}</p>
                      <div className="simulated-input-fields">
                        {scenario.interaction === "payment_gateway" ? (
                          <>
                            <div className="sim-input">
                              <label>Cardholder Name</label>
                              <input type="text" placeholder="e.g. K. Perera" disabled readOnly />
                            </div>
                            <div className="sim-input">
                              <label>Card Number (16 Digits)</label>
                              <input type="text" placeholder="4111 •••• •••• 1234" disabled readOnly />
                            </div>
                            <div className="sim-input warning-field">
                              <label>ATM Card PIN / Banking Password *High Risk Plaintext</label>
                              <input type="password" value="••••" disabled readOnly />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="sim-input">
                              <label>University Student ID</label>
                              <input type="text" placeholder="e.g. SE/2023/048" disabled readOnly />
                            </div>
                            <div className="sim-input">
                              <label>Portal Password</label>
                              <input type="password" value="••••••••••••" disabled readOnly />
                            </div>
                            <div className="sim-input warning-field">
                              <label>National Identity Card (NIC) Number *Extra field not on real SSO</label>
                              <input type="text" placeholder="200201234567" disabled readOnly />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="authentic-portal-form">
                      <div className="official-crest-row">
                        <GraduationCap size={28} className="text-primary" aria-hidden="true" />
                        <div>
                          <strong>Serendib Campus · Official Examination Services</strong>
                          <small>Central Student Single Sign-On Gateway</small>
                        </div>
                      </div>
                      <p>The authentic bookmarked portal uses EV SSL encryption and standard student credentials only. Fines and administrative fees are never routed through unencrypted HTTP endpoints.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. DEDICATED CLASSMATE CHAT SIMULATION (IM02) */}
            {scenario.interaction === "compromised_chat" && (
              <div className="sim-classmate-chat-app" role="region" aria-label="Simulated Classmate Chat Interface">
                {/* WhatsApp / Messenger Style Header */}
                <div className="classmate-chat-top-header">
                  <div className="classmate-user-cluster">
                    <div className="classmate-avatar-tile">
                      <span>DP</span>
                      <span className="classmate-online-dot" aria-label="Online" />
                    </div>
                    <div className="classmate-meta-col">
                      <div className="classmate-name-row">
                        <strong>Dilshan (Classmate)</strong>
                        <span className="classmate-relation-tag">Batchmate</span>
                      </div>
                      <small className="classmate-online-text">Online · +94 71 234 5678</small>
                    </div>
                  </div>

                  <div className="classmate-header-actions">
                    <button
                      type="button"
                      className="button secondary small call-action-btn"
                      onClick={handleStartClassmateCall}
                      aria-label="Call Dilshan on his regular mobile phone"
                    >
                      <PhoneCall size={14} aria-hidden="true" />
                      <span>Call Known Mobile</span>
                    </button>
                    <button
                      type="button"
                      className="button ghost small profile-drawer-btn"
                      onClick={() => setClassmateProfileOpen(!classmateProfileOpen)}
                      aria-label="View Classmate Contact Info"
                    >
                      <Info size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Simulated Phone Call Overlay for IM02 */}
                {classmateCallActive && (
                  <div className="simulated-call-overlay">
                    <div className="call-overlay-card">
                      <div className="call-pulse-avatar">
                        <PhoneCall size={28} className="text-cyan animate-pulse" aria-hidden="true" />
                      </div>
                      <h4>Out-of-Band Call to Dilshan (+94 71 234 5678)</h4>
                      {classmateCallPhase === "ringing" ? (
                        <p className="call-status-ringing">Ringing Dilshan&apos;s personal mobile phone…</p>
                      ) : (
                        <div className="call-connected-transcript">
                          <span className="transcript-speaker">Dilshan (Voice Answer):</span>
                          <p>&ldquo;Hello? Bro! Good thing you called! My chat account got hijacked an hour ago! Someone is messaging my whole contact list asking for LMS passwords and emergency money! Do NOT send anything!&rdquo;</p>
                        </div>
                      )}
                      <button
                        type="button"
                        className="button secondary small end-call-btn"
                        onClick={() => setClassmateCallActive(false)}
                      >
                        <span>Hang Up Call</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Classmate Contact Drawer Modal */}
                {classmateProfileOpen && (
                  <div className="classmate-drawer-panel">
                    <div className="drawer-header">
                      <strong>Contact Info: Dilshan Perera</strong>
                      <button
                        type="button"
                        className="drawer-close"
                        onClick={() => setClassmateProfileOpen(false)}
                        aria-label="Close contact info"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="drawer-body">
                      <div><span>Student ID:</span> <strong>CS/2023/048</strong></div>
                      <div><span>Registered Mobile:</span> <strong>+94 71 234 5678</strong></div>
                      <div><span>Faculty:</span> <strong>Computing &amp; Cyber Systems</strong></div>
                      <div><span>Status:</span> <em>&ldquo;Studying for Computer Architecture lab final&rdquo;</em></div>
                    </div>
                  </div>
                )}

                {/* Chat History Log */}
                <div className="classmate-chat-scroll-viewport">
                  {/* Earlier Authentic Conversation */}
                  <div className="chat-date-separator">Yesterday</div>
                  <div className="chat-msg incoming">
                    <p>Machan, did you finish the Computer Architecture lab sheet?</p>
                    <span className="msg-time">4:12 PM</span>
                  </div>
                  <div className="chat-msg outgoing">
                    <p>Yeah sent you the notes yesterday afternoon. Did you get them?</p>
                    <span className="msg-time">4:15 PM</span>
                  </div>
                  <div className="chat-msg incoming">
                    <p>Got them bro thanks! Almost done with my lab conclusion.</p>
                    <span className="msg-time">4:18 PM</span>
                  </div>

                  {/* Today's Urgent Request */}
                  <div className="chat-date-separator">Today · 10:14 PM</div>
                  <div className="chat-msg incoming suspicious-urgent-bubble">
                    <div className="urgent-badge-micro">
                      <AlertTriangle size={12} aria-hidden="true" />
                      <span>ABRUPT TONE CHANGE</span>
                    </div>
                    <p>{scenario.message}</p>
                    <span className="msg-time">10:14 PM</span>
                  </div>

                  {/* Dynamic Conversation Inquiry Log */}
                  {im02ChatLog.map((item, idx) => (
                    <div key={idx} className={`chat-msg ${item.sender === "user" ? "outgoing" : "incoming"}`}>
                      <p>{item.text}</p>
                      <span className="msg-time">{item.time}</span>
                    </div>
                  ))}

                  {im02Typing && (
                    <div className="chat-msg incoming typing-bubble">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  )}
                </div>

                {/* Natural Dialogue Response Options for Classmates */}
                <div className="classmate-quick-inquiries">
                  <span className="inquiries-label">Inquire with natural classmate replies:</span>
                  <div className="inquiries-buttons-wrap">
                    <button
                      type="button"
                      className="inquiry-chip"
                      onClick={() =>
                        handleIm02Inquiry(
                          "Wait, Dr. Perera extended the LMS deadline to next Monday, didn't you see the announcement?",
                          "Oh really? But my group partner said it's tonight! Please machan just give me your login quickly so I don't risk missing it, only 15 minutes left!"
                        )
                      }
                    >
                      &ldquo;Wait, the lecturer extended the deadline to Monday, didn&apos;t you see?&rdquo;
                    </button>
                    <button
                      type="button"
                      className="inquiry-chip"
                      onClick={() =>
                        handleIm02Inquiry(
                          "I can submit the PDF for you from my own portal if you email the file to me.",
                          "My phone is totally wiped so I can't access my email either! I just need to log in directly. Please help me out, I'll log off right after!"
                        )
                      }
                    >
                      &ldquo;I can submit the PDF for you from my own portal if you email it to me.&rdquo;
                    </button>
                    <button
                      type="button"
                      className="inquiry-chip"
                      onClick={() =>
                        handleIm02Inquiry(
                          "Why don't you use your backup SMS 2FA code or click 'Forgot Password' on the campus portal?",
                          "SMS verification isn't working with my SIM right now. Just need your username and password quickly!"
                        )
                      }
                    >
                      &ldquo;Why don&apos;t you use your backup SMS 2FA or click Forgot Password?&rdquo;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. TECHNICAL SUPPORT CHAT (PT01) */}
            {scenario.interaction === "tech_support" && (
              <div className="sim-live-chat">
                <div className="chat-window-top">
                  <div className="chat-contact-info">
                    <span className="contact-status-dot online" aria-hidden="true" />
                    <div>
                      <strong>{scenario.senderName}</strong>
                      <small>{scenario.senderAddress}</small>
                    </div>
                  </div>
                  <span className="chat-network-tag">Campus IT Support Chat</span>
                </div>

                <div className="chat-message-log">
                  <div className="chat-bubble received">
                    <p>{scenario.message}</p>
                    <span className="bubble-meta">Just now · Priority Support</span>
                  </div>

                  {activeChatBranch && (
                    <div className="chat-bubble sent">
                      <p>{activeChatBranch}</p>
                      <span className="bubble-meta">Sent by you</span>
                    </div>
                  )}
                </div>

                <div className="chat-branch-options">
                  <span className="branch-label">Investigation inquiry responses:</span>
                  <div className="branch-buttons">
                    <button
                      type="button"
                      className="branch-chip"
                      onClick={() => setActiveChatBranch("Campus policy states IT staff never request student passwords or authentication codes.")}
                    >
                      &ldquo;Campus policy states IT never requests student passwords.&rdquo;
                    </button>
                    <button
                      type="button"
                      className="branch-chip"
                      onClick={() => setActiveChatBranch("Can you verify your staff ID and ticket reference with the campus directory?")}
                    >
                      &ldquo;Can you verify your staff ID and official ticket reference?&rdquo;
                    </button>
                    <button
                      type="button"
                      className="branch-chip"
                      onClick={() => setActiveChatBranch("I will walk over to the faculty IT center in person with my student ID.")}
                    >
                      &ldquo;I will visit the faculty IT center in person.&rdquo;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. NOTIFICATION & CENSUS PORTAL (PT02, PT03, PT05) */}
            {(scenario.interaction === "notification" || scenario.interaction === "admin_portal" || scenario.interaction === "emergency_story") && (
              <div className="sim-admin-portal">
                <div className="admin-portal-header">
                  <Building size={22} className="text-cyan" aria-hidden="true" />
                  <div>
                    <strong>{scenario.senderName}</strong>
                    <small>Official Campus Communications Protocol</small>
                  </div>
                </div>

                <div className="admin-notice-box">
                  <div className="notice-stamp">OFFICIAL NOTICE</div>
                  <h3>{scenario.title}</h3>
                  <p>{scenario.message}</p>

                  {/* PT02 Library Fine Tabs */}
                  {scenario.id === "PT02" && (
                    <div className="admin-sub-tabs">
                      <div className="sub-tab-nav">
                        <button
                          type="button"
                          className={`sub-tab-btn ${libraryFineTab === "notice" ? "active" : ""}`}
                          onClick={() => setLibraryFineTab("notice")}
                        >
                          Payment Instructions
                        </button>
                        <button
                          type="button"
                          className={`sub-tab-btn ${libraryFineTab === "account" ? "active" : ""}`}
                          onClick={() => setLibraryFineTab("account")}
                        >
                          My Library Loans (0)
                        </button>
                        <button
                          type="button"
                          className={`sub-tab-btn ${libraryFineTab === "policy" ? "active" : ""}`}
                          onClick={() => setLibraryFineTab("policy")}
                        >
                          Fee Policy
                        </button>
                      </div>
                      <div className="sub-tab-content">
                        {libraryFineTab === "notice" && (
                          <div className="sim-payment-details-box">
                            <span className="text-red font-semibold">Payment Destination in Claim:</span>
                            <p>Direct Wire Transfer to Personal Bank Account (Bank of Ceylon · Account # 8492019401)</p>
                            <small className="text-muted">Notice: University never requests wire transfers to private personal accounts.</small>
                          </div>
                        )}
                        {libraryFineTab === "account" && (
                          <div className="sim-account-records">
                            <p><strong>Active Loans:</strong> 0 Books Overdue</p>
                            <p><strong>Outstanding Balance:</strong> LKR 0.00 (Good Standing)</p>
                          </div>
                        )}
                        {libraryFineTab === "policy" && (
                          <p className="text-xs text-muted">Official University Library Policy: All library fines must be settled in person at the Faculty Cashier or via the official student banking portal.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PT03 Census Tabs */}
                  {scenario.id === "PT03" && (
                    <div className="admin-sub-tabs">
                      <div className="sub-tab-nav">
                        <button
                          type="button"
                          className={`sub-tab-btn ${censusTab === "form" ? "active" : ""}`}
                          onClick={() => setCensusTab("form")}
                        >
                          Examine Data Requested
                        </button>
                        <button
                          type="button"
                          className={`sub-tab-btn ${censusTab === "calendar" ? "active" : ""}`}
                          onClick={() => setCensusTab("calendar")}
                        >
                          Academic Calendar
                        </button>
                      </div>
                      <div className="sub-tab-content">
                        {censusTab === "form" && (
                          <div className="sim-input-audit">
                            <span className="text-red font-semibold">Demanded Input Fields:</span>
                            <ul>
                              <li>• Mother&apos;s maiden name</li>
                              <li>• Annual household family income</li>
                              <li>• Student Single Sign-On password</li>
                            </ul>
                          </div>
                        )}
                        {censusTab === "calendar" && (
                          <p className="text-xs text-muted">Official Academic Calendar: Undergraduate census re-registration is scheduled for December, not mid-semester.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. SOCIAL PROFILE COMPARISON (IM01, IM04) */}
            {(scenario.interaction === "profile_compare" || scenario.interaction === "society_profile") && (
              <div className="sim-profile-compare">
                <div className="compare-tabs-row" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={profileCompareTab === "fake"}
                    className={`compare-tab ${profileCompareTab === "fake" ? "active" : ""}`}
                    onClick={() => setProfileCompareTab("fake")}
                  >
                    <AlertTriangle size={14} className="text-amber" aria-hidden="true" />
                    <span>Account Requesting Information</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={profileCompareTab === "real"}
                    className={`compare-tab ${profileCompareTab === "real" ? "active" : ""}`}
                    onClick={() => setProfileCompareTab("real")}
                  >
                    <ShieldCheck size={14} className="text-emerald" aria-hidden="true" />
                    <span>Verified Official Account</span>
                  </button>
                </div>

                <div className="profile-card-display">
                  {profileCompareTab === "fake" ? (
                    <div className="profile-view replica">
                      <div className="profile-banner-sim" />
                      <div className="profile-avatar-circle">?</div>
                      <div className="profile-meta">
                        <h4>{scenario.senderName}</h4>
                        <span className="profile-handle">{scenario.mediaDetails?.profileComparison?.fake.handle ?? scenario.senderAddress}</span>
                        <div className="profile-stats">
                          <span><strong>{scenario.mediaDetails?.profileComparison?.fake.followers ?? "19"}</strong> followers</span>
                          <span>Joined: <strong>{scenario.mediaDetails?.profileComparison?.fake.created ?? "4 days ago"}</strong></span>
                        </div>
                        <p className="profile-bio-text">{scenario.mediaDetails?.profileComparison?.fake.bio ?? "Academic Inquiries · Direct Message"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-view verified">
                      <div className="profile-banner-sim official-banner" />
                      <div className="profile-avatar-circle verified-circle">✓</div>
                      <div className="profile-meta">
                        <h4>{scenario.senderName} <span className="verified-badge">✓ Verified</span></h4>
                        <span className="profile-handle">{scenario.mediaDetails?.profileComparison?.real.handle ?? "@prof_wickramasinghe"}</span>
                        <div className="profile-stats">
                          <span><strong>{scenario.mediaDetails?.profileComparison?.real.followers ?? "1,420"}</strong> followers</span>
                          <span>Joined: <strong>{scenario.mediaDetails?.profileComparison?.real.created ?? "September 2018"}</strong></span>
                        </div>
                        <p className="profile-bio-text">{scenario.mediaDetails?.profileComparison?.real.bio ?? "Head of Department, Computing · Serendib Campus"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 9. CAMPUS STAFF DIRECTORY LOOKUP (IM03, IM05) */}
            {(scenario.interaction === "staff_directory" || scenario.interaction === "vendor_verify") && (
              <div className="sim-staff-directory">
                <div className="directory-header">
                  <UserRoundSearch size={20} className="text-primary" aria-hidden="true" />
                  <strong>Campus Staff &amp; Faculty Directory Search</strong>
                </div>
                <div className="directory-search-bar">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search staff name or department (e.g. Bandara, Proctor, Fernando)..."
                    value={directorySearchQuery}
                    onChange={(e) => handleDirectorySearch(e.target.value)}
                    aria-label="Search campus directory"
                  />
                </div>

                <div className="directory-results-container">
                  {directorySearchResults ? (
                    directorySearchResults.length > 0 ? (
                      <div className="directory-results-list">
                        {directorySearchResults.map((staff, idx) => (
                          <div key={idx} className="directory-item">
                            <div className="item-name-row">
                              <strong>{staff.name}</strong>
                              <span className="item-email">{staff.email}</span>
                            </div>
                            <div className="item-title">{staff.title}</div>
                            <small className="item-dept">{staff.dept}</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="directory-empty">No campus records found matching &quot;{directorySearchQuery}&quot;</div>
                    )
                  ) : (
                    <div className="directory-hint">
                      <Info size={14} aria-hidden="true" />
                      <span>Search for staff members to verify if their claimed role and email address exist in the official directory.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 10. E-COMMERCE & ACCOMMODATION LISTINGS (SC01, SC02, SC05) */}
            {(scenario.interaction === "ecommerce" || scenario.interaction === "accommodation" || scenario.interaction === "internship_fee") && (
              <div className="sim-ecommerce-view">
                <div className="shop-header">
                  <span className="shop-badge">
                    {scenario.interaction === "accommodation" ? "CAMPUS HOUSING LISTING" : scenario.interaction === "internship_fee" ? "INTERNSHIP RECRUITMENT" : "SPECIAL STUDENT CLEARANCE"}
                  </span>
                  <h3>{scenario.title}</h3>
                </div>
                <div className="shop-offer-row">
                  <div className="price-tag-box">
                    <span className="price-old">{scenario.mediaDetails?.priceOriginal ?? "LKR 365,000"}</span>
                    <strong className="price-new">{scenario.mediaDetails?.priceDiscounted ?? "LKR 68,000"}</strong>
                  </div>
                  <div className="flash-timer-box">
                    <Clock size={16} className="text-amber animate-pulse" aria-hidden="true" />
                    <span>Offer ends in: <strong>08:34</strong> (Resetting)</span>
                  </div>
                </div>
                <p className="shop-description">{scenario.message}</p>

                {/* SC01 Extra Tools */}
                {scenario.id === "SC01" && (
                  <div className="admin-sub-tabs">
                    <div className="sub-tab-nav">
                      <button
                        type="button"
                        className={`sub-tab-btn ${sc01Tab === "whois" ? "active" : ""}`}
                        onClick={() => setSc01Tab("whois")}
                      >
                        Domain WHOIS Check
                      </button>
                      <button
                        type="button"
                        className={`sub-tab-btn ${sc01Tab === "reviews" ? "active" : ""}`}
                        onClick={() => setSc01Tab("reviews")}
                      >
                        Customer Reviews (4)
                      </button>
                    </div>
                    <div className="sub-tab-content">
                      {sc01Tab === "whois" && (
                        <p className="text-xs font-mono">Domain registered: 2 days ago · Registrant: Privacy Redacted · Hosted on offshore VPS</p>
                      )}
                      {sc01Tab === "reviews" && (
                        <p className="text-xs text-muted">All 4 reviews are 5-star ratings posted at the exact same minute with identical wording.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 11. OAUTH AUTHORIZATION PROMPT (SC04) */}
            {scenario.interaction === "event_link" && (
              <div className="sim-oauth-prompt">
                <div className="oauth-window-header">
                  <Lock size={18} aria-hidden="true" />
                  <strong>OAuth Single Sign-On Access Request</strong>
                </div>
                <div className="oauth-body">
                  <p><strong>HackSL 2026</strong> wants to access your University Google Account:</p>
                  <ul className="oauth-scopes-list">
                    <li className="scope-danger">
                      <AlertTriangle size={15} className="text-red" aria-hidden="true" />
                      <span>Read, compose, send, and permanently delete all your Gmail emails</span>
                    </li>
                    <li className="scope-danger">
                      <AlertTriangle size={15} className="text-red" aria-hidden="true" />
                      <span>See, edit, create, and delete all of your Google Drive files</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} className="text-emerald" aria-hidden="true" />
                      <span>See your primary Google Account email address and basic profile info</span>
                    </li>
                  </ul>
                  <small className="oauth-warning-note">
                    By clicking Allow, you authorize this unverified third-party app to access sensitive files.
                  </small>
                </div>
              </div>
            )}

            {/* 12. PROPOSED IV5 DEEPFAKE INTERACTION (DF01 - DF05) */}
            {scenario.interaction === "deepfake_video" && (
              <div className="sim-video-player">
                <div className="video-viewport">
                  <div className="video-overlay-banner">FACULTY SENATE BROADCAST (SIMULATED)</div>
                  <div className="video-center-controls">
                    <button
                      type="button"
                      className="play-btn-circle"
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      aria-label={videoPlaying ? "Pause video" : "Play video"}
                    >
                      {videoPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                    </button>
                  </div>
                  <div className="video-bottom-controls">
                    <div className="video-scrubber">
                      <div className="scrubber-fill" style={{ width: videoPlaying ? "65%" : "0%" }} />
                    </div>
                    <div className="video-control-row">
                      <span>{videoPlaying ? "0:28" : "0:00"} / {scenario.mediaDetails?.audioDuration ?? "0:42"}</span>
                      <span className="video-cue-pill">Lip-Sync &amp; Collar Artifact Cues Present</span>
                    </div>
                  </div>
                </div>

                <div className="video-transcript-box">
                  <span className="transcript-label">Spoken Video Audio Transcript:</span>
                  <p>&ldquo;{scenario.mediaDetails?.transcript ?? scenario.message}&rdquo;</p>
                </div>
              </div>
            )}

            {(scenario.interaction === "voice_memo" || scenario.interaction === "ai_support_bot") && (
              <div className="sim-audio-player">
                <div className="audio-memo-header">
                  <Volume2 size={20} className="text-cyan" aria-hidden="true" />
                  <div>
                    <strong>{scenario.senderName}</strong>
                    <small>Audio Voice Recording ({scenario.mediaDetails?.audioDuration ?? "0:19"})</small>
                  </div>
                </div>

                <div className="audio-memo-controls">
                  <button
                    type="button"
                    className="audio-play-button"
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    aria-label={audioPlaying ? "Pause voice message" : "Play voice message"}
                  >
                    {audioPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  <div className="audio-waveform-bars" aria-hidden="true">
                    {[40, 75, 90, 60, 30, 85, 100, 70, 45, 80, 95, 60, 40, 75, 90, 50, 30].map((h, i) => (
                      <span
                        key={i}
                        className={`wave-bar ${audioPlaying ? "animated" : ""}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  <span className="audio-timer">{audioPlaying ? "0:14" : "0:00"}</span>
                </div>

                <div className="audio-transcript-box">
                  <span className="transcript-label">Voice Transcription:</span>
                  <p>&ldquo;{scenario.mediaDetails?.transcript ?? scenario.message}&rdquo;</p>
                </div>
              </div>
            )}
          </div>

          {/* Investigation Clues & Evidence Inspector */}
          <div className="evidence-inspector-box">
            <div className="evidence-header">
              <span className="evidence-label">INVESTIGATION CLUES &amp; EVIDENCE</span>
              <div className="evidence-tabs" role="tablist">
                {scenario.evidence.map((ev, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={activeEvidenceTab === idx}
                    className={`evidence-tab-btn ${activeEvidenceTab === idx ? "active" : ""}`}
                    onClick={() => setActiveEvidenceTab(idx)}
                  >
                    <span>Clue {idx + 1}: {ev.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="evidence-tab-body">
              <p className="evidence-detail-text">
                {scenario.evidence[activeEvidenceTab]?.detail}
              </p>
              {scenario.evidence[activeEvidenceTab]?.url && (
                <div className="evidence-url-preview">
                  <span className="preview-label">Dissected Destination:</span>
                  <code>{scenario.evidence[activeEvidenceTab]?.url}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            AREA C — CHOOSE YOUR ACTION (RIGHT COLUMN)
            ========================================================================= */}
        <aside className="challenge-decision-col">
          <div className="decision-panel-card">
            {/* Standard Question Header */}
            <div className="decision-header">
              <span className="decision-badge">YOUR TASK</span>
              <h3 className="task-heading">What would you do first?</h3>
              <p className="decision-prompt">
                Carefully examine the scenario and interactive evidence above. Select the safest action you would take, then click <strong>Confirm My Answer</strong>.
              </p>
            </div>

            {/* Interactive Answer Options: Large Accessible Selection Cards (A, B, C, D) */}
            <div className="decision-options-group" role="radiogroup" aria-label="Interactive answer options">
              {scenario.choices.map((choice, cIndex) => {
                const letter = String.fromCharCode(65 + cIndex);
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSubmitting}
                    className={`decision-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectChoice(choice.id)}
                  >
                    <div className="option-letter-badge" aria-hidden="true">
                      {letter}
                    </div>

                    <div className="decision-card-left flex-1 text-left">
                      <span className="decision-label-text block font-medium text-sm leading-snug">{choice.label}</span>
                      {choice.reply && (
                        <small className="decision-reply-preview text-xs text-muted block mt-1">&ldquo;{choice.reply}&rdquo;</small>
                      )}
                    </div>

                    <div className="option-selection-indicator ml-2 flex-shrink-0" aria-hidden="true">
                      <div className={`radio-outer ${isSelected ? "active" : ""}`}>
                        {isSelected && <div className="radio-inner" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Button: Confirm My Answer */}
            <div className="decision-action-section mt-5">
              <button
                type="button"
                className={`button primary large w-full confirm-answer-btn ${hasConfirmedSaved ? "confirmed" : ""}`}
                disabled={!selectedChoiceId || isSubmitting || hasConfirmedSaved}
                onClick={handleConfirmAnswer}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    <span>Saving Answer…</span>
                  </>
                ) : hasConfirmedSaved ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald" aria-hidden="true" />
                    <span>Answer Confirmed &amp; Saved</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>Confirm My Answer</span>
                  </>
                )}
              </button>

              {hasConfirmedSaved && !isSubmitting && (
                <div className="save-success-note mt-2 text-center text-xs text-emerald flex items-center justify-center gap-1.5">
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  <span>Answer saved to research session. Click Next Challenge to proceed.</span>
                </div>
              )}
            </div>

            {/* Navigation Controls: Previous / Next */}
            <div className="challenge-nav-buttons mt-6 pt-4 border-t flex items-center justify-between gap-3">
              <button
                type="button"
                className="button secondary small flex-1 flex items-center justify-center gap-1.5"
                disabled={scenarioIndex === 0 && !onPreviousScenario}
                onClick={onPreviousScenario}
              >
                <ArrowLeft size={15} aria-hidden="true" />
                <span>Previous Challenge</span>
              </button>

              <button
                type="button"
                className="button primary small flex-1 flex items-center justify-center gap-1.5"
                onClick={onNextScenario}
              >
                <span>
                  {scenarioIndex < totalInMission - 1
                    ? "Next Challenge"
                    : overallCompleted >= 19
                      ? "Finish & Review"
                      : "Next Mission"}
                </span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="text-center mt-3">
              <button
                type="button"
                className="button ghost text-xs text-muted"
                onClick={onReturnToHub}
              >
                Return to Mission Control Hub
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Static File Inspection Modal (PH04) */}
      {attachmentInspected && (
        <div className="modal-backdrop" onClick={() => setAttachmentInspected(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <span className="modal-title">
                <Search size={18} aria-hidden="true" />
                <span>Sandbox Static File Analysis</span>
              </span>
              <button
                type="button"
                className="close-btn"
                onClick={() => setAttachmentInspected(false)}
                aria-label="Close inspection modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-meta-grid">
                <div>
                  <span>Reported Name:</span>
                  <strong>{scenario.mediaDetails?.attachmentName}</strong>
                </div>
                <div>
                  <span>Actual File Type:</span>
                  <strong className="text-red">PE32 Executable (.exe)</strong>
                </div>
                <div>
                  <span>File Size:</span>
                  <strong>{scenario.mediaDetails?.attachmentSize}</strong>
                </div>
                <div>
                  <span>True MIME Type:</span>
                  <code>{scenario.mediaDetails?.attachmentType}</code>
                </div>
              </div>
              <div className="modal-security-warning">
                <AlertTriangle size={18} className="text-red" aria-hidden="true" />
                <span>
                  <strong>High Risk Executable:</strong> This file is an executable application disguised
                  with a PDF icon and a double extension. Running it executes code on your device.
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button secondary small"
                onClick={() => setAttachmentInspected(false)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
