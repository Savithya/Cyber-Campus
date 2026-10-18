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
  Maximize2,
  FileText,
  Smartphone,
  QrCode,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  HelpCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  CreditCard,
  Building,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";
import { api, useSession } from "@/lib/client";
import { missions } from "@/content/missions";
import { scoreDecision } from "@/lib/scoring";
import type { Scenario, Attempt, ScenarioChoice, AnswerKey } from "@/lib/types";

interface InteractiveChallengeRunnerProps {
  scenario: Scenario;
  missionId: string;
  scenarioIndex: number; // 0..4
  totalInMission: number; // 5
  onCompleteScenario: (attempt: Attempt) => void;
  onReturnToHub: () => void;
  previousAttempt?: Attempt;
  educationalMode?: boolean;
}

export function InteractiveChallengeRunner({
  scenario,
  missionId,
  scenarioIndex,
  totalInMission,
  onCompleteScenario,
  onReturnToHub,
  previousAttempt,
  educationalMode = false,
}: InteractiveChallengeRunnerProps) {
  const state = useSession();
  const startTimeRef = useRef<number>(0);

  // Interactive UI State
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<number>(0);
  const [headersExpanded, setHeadersExpanded] = useState<boolean>(false);
  const [qrScanned, setQrScanned] = useState<boolean>(false);
  const [attachmentInspected, setAttachmentInspected] = useState<boolean>(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState<string>("");
  const [directorySearchResults, setDirectorySearchResults] = useState<Array<{ name: string; title: string; dept: string; email: string }> | null>(null);
  const [activeBrowserTab, setActiveBrowserTab] = useState<"auth" | "replica">("replica");
  const [profileCompareTab, setProfileCompareTab] = useState<"real" | "fake">("fake");
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [activeChatBranch, setActiveChatBranch] = useState<string | null>(null);
  const [linkHovered, setLinkHovered] = useState<boolean>(false);

  // Decision State
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    previousAttempt?.selectedAction ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recordedAttempt, setRecordedAttempt] = useState<Attempt | null>(
    previousAttempt ?? null,
  );
  const [feedback, setFeedback] = useState<AnswerKey | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedChoiceId(previousAttempt?.selectedAction ?? null);
    setRecordedAttempt(previousAttempt ?? null);
    setFeedback(null);
    setError("");
    setHeadersExpanded(false);
    setQrScanned(false);
    setAttachmentInspected(false);
    setVideoPlaying(false);
    setAudioPlaying(false);
    setActiveEvidenceTab(0);
  }, [scenario.id, previousAttempt]);

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

  // Submit Decision
  const handleConfirmDecision = async () => {
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
      if (educationalMode && res.feedback) {
        setFeedback(res.feedback);
      }
      onCompleteScenario(res.attempt);
    } catch (e) {
      setError((e as Error).message || "Failed to record response. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasDecided = Boolean(recordedAttempt);

  return (
    <div className="interactive-challenge-runner">
      {/* Top Navigation & Status Bar */}
      <div className="challenge-top-bar">
        <div className="challenge-breadcrumbs">
          <button
            type="button"
            className="back-to-hub-btn"
            onClick={onReturnToHub}
            aria-label="Return to Cyber Mission Control Hub"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Mission Control</span>
          </button>
          <span className="crumb-separator">/</span>
          <span className="crumb-mission">{currentMission.name}</span>
          <span className="crumb-separator">/</span>
          <span className="crumb-scenario">Challenge {scenarioIndex + 1} of {totalInMission} ({scenario.id})</span>
        </div>

        <div className="challenge-badge-cluster">
          <span className="challenge-code-pill">{scenario.id}</span>
          <span className="challenge-threat-pill">
            <ShieldAlert size={14} aria-hidden="true" />
            <span>{currentMission.topic}</span>
          </span>
          {educationalMode && (
            <span className="educational-mode-pill">
              <Award size={14} aria-hidden="true" />
              <span>Educational Review</span>
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Investigation Split Container */}
      <div className="challenge-main-grid">
        {/* Left Column: Briefing & Authentic Simulation Environment */}
        <div className="challenge-simulation-col">
          {/* Mission Briefing Card */}
          <div className="briefing-box">
            <div className="briefing-header">
              <span className="briefing-label">MISSION BRIEFING</span>
              <h2>{scenario.title}</h2>
            </div>
            <p className="briefing-situation">{scenario.situation}</p>
          </div>

          {/* SIMULATION CONTAINER BY INTERACTION TYPE */}
          <div className="simulation-viewport" aria-label="Interactive Cybersecurity Simulation Environment">
            {/* 1. EMAIL INBOX INTERFACE (PH01, PH04, IM03) */}
            {(scenario.interaction === "email" || scenario.interaction === "attachment") && (
              <div className="sim-email-client">
                <div className="email-client-header">
                  <div className="email-controls">
                    <span className="window-dot red" />
                    <span className="window-dot yellow" />
                    <span className="window-dot green" />
                    <span className="email-client-title">Campus Webmail Client · Student Inbox</span>
                  </div>
                  <button
                    type="button"
                    className="email-headers-toggle"
                    onClick={() => setHeadersExpanded(!headersExpanded)}
                    aria-expanded={headersExpanded}
                  >
                    <Info size={14} aria-hidden="true" />
                    <span>{headersExpanded ? "Hide Headers" : "Inspect RFC Headers"}</span>
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
                    <span className="meta-val">student-id@campus.example</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Subject:</span>
                    <strong className="meta-subject">{scenario.title}</strong>
                  </div>

                  {/* Expandable RFC Header Details */}
                  {headersExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="email-raw-headers"
                    >
                      <pre>
                        {`Return-Path: <bounce@${scenario.senderAddress.split("@")[1] || "unknown.example"}>
Authentication-Results: spf=softfail (sender IP not in authorized SPF record)
DKIM-Signature: v=1; d=${scenario.senderAddress.split("@")[1] || "external.example"}; s=mail;
X-Originating-IP: [198.51.100.42] (External Non-Campus Gateway)
Message-ID: <${scenario.id.toLowerCase()}-audit@gateway-relay.example>`}
                      </pre>
                    </motion.div>
                  )}
                </div>

                {/* Email Body */}
                <div className="email-body-content">
                  <p className="email-text">{scenario.message}</p>

                  {/* Attachment Card if applicable */}
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
                        aria-label="Inspect attachment properties safely"
                      >
                        <Search size={14} aria-hidden="true" />
                        <span>Inspect Properties</span>
                      </button>
                    </div>
                  )}

                  {/* Simulated Embedded Link if applicable */}
                  {scenario.mediaDetails?.destinationUrl && (
                    <div className="email-embedded-link-wrapper">
                      <span className="link-action-label">Action required:</span>
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
                  <span className="phone-speaker" />
                  <span className="phone-cam" />
                </div>
                <div className="phone-status-bar">
                  <span>9:41 AM</span>
                  <div className="phone-status-icons">
                    <span>4G · Mobitel</span>
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
                  <div className="sms-timestamp">Today · SMS Message</div>
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
                </div>
              </div>
            )}

            {/* 3. QR CODE SCANNER SIMULATOR (PH03) */}
            {scenario.interaction === "qr" && (
              <div className="sim-qr-investigation">
                <div className="qr-poster-preview">
                  <div className="poster-header">
                    <span className="poster-pin" />
                    <strong>Campus Cafeteria Noticeboard</strong>
                  </div>
                  <div className="poster-content">
                    <div className="poster-badge">TECH SYMPOSIUM 2026</div>
                    <h3>Free Student Vouchers &amp; Passes</h3>
                    <p>Scan with smartphone to register instantly!</p>

                    <div className="qr-code-interactive-target">
                      <div className="qr-box">
                        <QrCode size={110} aria-hidden="true" />
                      </div>
                      <button
                        type="button"
                        className="button secondary small"
                        onClick={() => setQrScanned(true)}
                        aria-label="Scan QR Code with Safe Decoder"
                      >
                        <Search size={14} aria-hidden="true" />
                        <span>{qrScanned ? "Re-scan QR Code" : "Scan with Safe Decoder"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {qrScanned && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="qr-decoded-panel"
                  >
                    <div className="decoded-header">
                      <CheckCircle2 size={16} className="text-emerald" aria-hidden="true" />
                      <strong>Decoded QR Target Analysis</strong>
                    </div>
                    <div className="decoded-detail">
                      <span className="decoded-label">Decoded Destination URL:</span>
                      <code>{scenario.mediaDetails?.destinationUrl}</code>
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
                  </motion.div>
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
                            <AlertCircle size={13} aria-hidden="true" /> Not Secure (HTTP)
                          </span>
                          <span className="address-url">http://pay-secure.campus-billing.example/checkout</span>
                        </>
                      ) : (
                        <>
                          <span className="ssl-badge generic">
                            <Lock size={13} aria-hidden="true" /> Valid SSL
                          </span>
                          <span className="address-url">https://portal-campus.account-auth.example/exam-login</span>
                        </>
                      )
                    ) : (
                      <>
                        <span className="ssl-badge official">
                          <ShieldCheck size={13} aria-hidden="true" /> Verified Campus Org
                        </span>
                        <span className="address-url">https://portal.campus.example/exams/schedule</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="browser-viewport-content">
                  {activeBrowserTab === "replica" ? (
                    <div className="replica-portal-form">
                      <div className="form-watermark">Simulated Exam Portal Login</div>
                      <h3>{scenario.title}</h3>
                      <p>{scenario.message}</p>
                      <div className="simulated-input-fields">
                        <div className="sim-input">
                          <label>University Student ID</label>
                          <input type="text" placeholder="e.g. SE/2023/048" disabled readOnly />
                        </div>
                        <div className="sim-input">
                          <label>Portal Password</label>
                          <input type="password" value="••••••••••••" disabled readOnly />
                        </div>
                        {scenario.interaction !== "payment_gateway" && (
                          <div className="sim-input warning-field">
                            <label>National Identity Card (NIC) Number *Extra field</label>
                            <input type="text" placeholder="200201234567" disabled readOnly />
                          </div>
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
                      <p>Authentic bookmarked portal displays official notifications with standard student credentials only.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. LIVE BRANCHING CHAT (PT01, PT02, PT04, IM02) */}
            {(scenario.interaction === "chat" || scenario.interaction === "tech_support" || scenario.interaction === "compromised_chat") && (
              <div className="sim-live-chat">
                <div className="chat-window-top">
                  <div className="chat-contact-info">
                    <span className="contact-status-dot online" />
                    <div>
                      <strong>{scenario.senderName}</strong>
                      <small>{scenario.senderAddress}</small>
                    </div>
                  </div>
                  <span className="chat-network-tag">Campus Live Protocol</span>
                </div>

                <div className="chat-message-log">
                  <div className="chat-bubble received">
                    <p>{scenario.message}</p>
                    <span className="bubble-meta">Just now · System Urgent</span>
                  </div>

                  {activeChatBranch && (
                    <div className="chat-bubble sent">
                      <p>{activeChatBranch}</p>
                      <span className="bubble-meta">Sent by you</span>
                    </div>
                  )}
                </div>

                {/* Pre-selectable chat inquiry branches */}
                <div className="chat-branch-options">
                  <span className="branch-label">Selectable investigation questions:</span>
                  <div className="branch-buttons">
                    <button
                      type="button"
                      className="branch-chip"
                      onClick={() => setActiveChatBranch("Can you verify your staff ID and ticket number from the IT directory?")}
                    >
                      &ldquo;Can you verify your staff ID and ticket reference?&rdquo;
                    </button>
                    <button
                      type="button"
                      className="branch-chip"
                      onClick={() => setActiveChatBranch("Our campus policy says IT staff never ask students for passwords or codes.")}
                    >
                      &ldquo;Campus policy states IT never requests passwords or codes.&rdquo;
                    </button>
                    <button
                      type="button"
                      className="branch-chip"
                      onClick={() => setActiveChatBranch("I will check with the faculty IT center in person before doing this.")}
                    >
                      &ldquo;I will visit the faculty IT center in person.&rdquo;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. NOTIFICATION BANNER & ADMINISTRATIVE CENSUS (PT02, PT03, PT05) */}
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
                </div>
              </div>
            )}

            {/* 7. SOCIAL PROFILE COMPARISON (IM01, IM04) */}
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

            {/* 8. CAMPUS STAFF DIRECTORY LOOKUP (IM03, IM05) */}
            {(scenario.interaction === "staff_directory" || scenario.interaction === "vendor_verify") && (
              <div className="sim-staff-directory">
                <div className="directory-header">
                  <UserRoundSearch size={20} className="text-primary" aria-hidden="true" />
                  <strong>In-Simulation Campus Staff &amp; Partner Directory</strong>
                </div>
                <div className="directory-search-bar">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search staff name or department (e.g. Fernando, Proctor, IT)..."
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
                      <span>Type a staff member&apos;s name above to check if their claimed identity and role exist in the official directory.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 9. E-COMMERCE & ACCOMMODATION LISTINGS (SC01, SC02, SC05) */}
            {(scenario.interaction === "ecommerce" || scenario.interaction === "accommodation" || scenario.interaction === "internship_fee") && (
              <div className="sim-ecommerce-view">
                <div className="shop-header">
                  <span className="shop-badge">SPECIAL STUDENT CLEARANCE</span>
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
              </div>
            )}

            {/* 10. OAUTH AUTHORIZATION PROMPT (SC04) */}
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

            {/* 11. DEEPFAKE VIDEO PLAYER (DF01) */}
            {scenario.interaction === "deepfake_video" && (
              <div className="sim-video-player">
                <div className="video-viewport">
                  <div className="video-overlay-banner">FACULTY SENATE BROADCAST (SIMULATED)</div>
                  <div className="video-center-controls">
                    <button
                      type="button"
                      className="play-btn-circle"
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      aria-label={videoPlaying ? "Pause simulated video" : "Play simulated video"}
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

            {/* 12. AI VOICE MEMO & AUDIO (DF02, DF05) */}
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

            {/* 13. SYNTHETIC VIDEO CALL (DF04) */}
            {scenario.interaction === "video_call" && (
              <div className="sim-video-call">
                <div className="call-header">
                  <Video size={18} className="text-emerald" aria-hidden="true" />
                  <span>Fellowship Video Interview · Live Stream</span>
                </div>
                <div className="call-streams-container">
                  <div className="remote-interviewer-stream">
                    <div className="stream-badge">Recruiter: Dr. Robert Vance (AI Avatar)</div>
                    <div className="stream-avatar-placeholder">
                      <User size={60} aria-hidden="true" />
                    </div>
                    <p className="stream-subtitles">&ldquo;Please hold your National Identity Card up to the camera and read your number aloud.&rdquo;</p>
                  </div>
                  <div className="local-self-stream">
                    <span>Your Camera (Preview)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 14. SYNTHETIC NOTICE (DF03) */}
            {scenario.interaction === "synthetic_notice" && (
              <div className="sim-formal-circular">
                <div className="circular-crest-row">
                  <GraduationCap size={32} aria-hidden="true" />
                  <div>
                    <strong>UNIVERSITY SENATE ADMINISTRATIVE SECRETARIAT</strong>
                    <small>Official Circular Gazette · Sri Lanka</small>
                  </div>
                </div>
                <div className="circular-content-box">
                  <span className="circular-ref">REF: SEN/CIR/2026/08</span>
                  <h4>{scenario.title}</h4>
                  <p>{scenario.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Inspector Tabs */}
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

        {/* Right Column: Meaningful Decision Point & Submission */}
        <aside className="challenge-decision-col">
          <div className="decision-panel-card">
            <div className="decision-header">
              <span className="decision-badge">REQUIRED RESEARCH DECISION</span>
              <h3>Choose Your Action</h3>
              <p className="decision-prompt">
                Based on your investigation, what action would you take in this situation?
              </p>
            </div>

            {/* Action Choices */}
            <div className="decision-options-group" role="radiogroup" aria-label="Available participant decisions">
              {scenario.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={hasDecided}
                    className={`decision-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedChoiceId(choice.id)}
                  >
                    <span className="decision-radio-circle" aria-hidden="true">
                      {isSelected && <span className="decision-radio-dot" />}
                    </span>
                    <span className="decision-label-text">{choice.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            {!hasDecided ? (
              <div className="decision-submit-actions">
                <button
                  type="button"
                  className="button primary large full-width"
                  disabled={!selectedChoiceId || isSubmitting}
                  onClick={handleConfirmDecision}
                >
                  <span>{isSubmitting ? "Recording Decision…" : "Confirm & Submit Decision"}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <p className="decision-note">
                  Your first decision is permanently recorded for research analysis. Take your time to review the evidence.
                </p>
              </div>
            ) : (
              <div className="decision-confirmed-state">
                <div className="neutral-confirmation-banner">
                  <CheckCircle2 size={20} className="text-emerald" aria-hidden="true" />
                  <div>
                    <strong>Decision Recorded Securely</strong>
                    <p>Your response has been saved to your anonymous research session.</p>
                  </div>
                </div>

                {/* Educational debrief if active */}
                {educationalMode && feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="educational-debrief-box"
                  >
                    <div className="debrief-header">
                      <Award size={18} className="text-amber" aria-hidden="true" />
                      <strong>Educational Scenario Analysis</strong>
                    </div>
                    <p className="debrief-explanation">{feedback.explanation}</p>
                    <div className="debrief-consequence">
                      <span className="consequence-label">Privacy Impact:</span>
                      <p>{feedback.consequence}</p>
                    </div>
                  </motion.div>
                )}

                <div className="next-scenario-actions">
                  <button
                    type="button"
                    className="button primary large full-width"
                    onClick={onReturnToHub}
                  >
                    <span>Return to Mission Control</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Attachment Inspection Modal */}
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
