"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Lock,
  Clock,
  UserCheck,
  GraduationCap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  AlertTriangle,
  Globe,
  KeyRound,
  Database,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  Layers,
  Target,
  Award,
  ListChecks,
  Check,
  HelpCircle,
  Compass,
} from "lucide-react";
import { ResearchCyberIllustration } from "./research-cyber-illustration";
import type { StudyConfig } from "@/lib/config.server";

interface ResearchParticipationPageProps {
  config: StudyConfig;
  error?: string;
}

export function ResearchParticipationPage({
  config,
  error,
}: ResearchParticipationPageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Section list for the sticky navigation dock: exactly the 4 requested sections
  const navSections = [
    { id: "overview", label: "Research Overview", icon: BookOpen },
    { id: "focus-areas", label: "Research Focus Areas", icon: Compass },
    { id: "ethics", label: "Privacy & Research Ethics", icon: Lock },
    { id: "faq", label: "Frequently Asked Questions", icon: HelpCircle },
  ];

  // Scroll spy to highlight active section in the sticky nav
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of navSections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
      setActiveSection(id);
    }
  };

  // Motion variants
  const fadeIn = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" as const },
  };

  return (
    <div className="research-page">
      {/* =========================================================================
          STICKY QUICK JUMP CAPSULE NAV DOCK (Centered, Aligned, User Friendly)
          ========================================================================= */}
      <nav
        className="research-nav-strip"
        aria-label="Research sections navigation"
      >
        <div className="research-nav-container">
          <div className="research-nav-pill-dock">
            <span className="nav-dock-title">
              <Layers size={14} aria-hidden="true" />
              <span>SECTIONS</span>
            </span>
            <div className="nav-dock-divider" aria-hidden="true" />
            <div className="nav-dock-links">
              {navSections.map((sec) => {
                const IconComponent = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => scrollToSection(e, sec.id)}
                    className={`nav-dock-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <IconComponent size={13} aria-hidden="true" />
                    <span>{sec.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Database or configuration error notice if any */}
      {error && (
        <div className="container" style={{ marginTop: "24px" }}>
          <div className="error-box" role="alert">
            <AlertTriangle size={20} aria-hidden="true" />
            <div>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. HERO SECTION (Clear Alignments, High Visual Impact & Animated Image)
          ========================================================================= */}
      <section
        className="research-hero-section"
        aria-label="About the Study Hero"
      >
        <div className="research-container">
          <div className="research-hero-grid">
            {/* Left Column: Heading, Supporting Description, Buttons, Reassurance */}
            <motion.div
              className="research-hero-copy"
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={fadeIn.transition}
            >
              {/* Eyebrow badge */}
              <div className="research-hero-eyebrow">
                <span className="pulse-indicator" aria-hidden="true" />
                <span>ACADEMIC COMPUTING RESEARCH · SRI LANKA</span>
              </div>

              {/* Research Title Badge */}
              <div className="research-title-chip">
                <GraduationCap
                  size={16}
                  className="text-primary flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {config.title ||
                    "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka."}
                </span>
              </div>

              {/* Main Hero Heading */}
              <h1 className="research-hero-title">
                Your Voice Matters in{" "}
                <span className="gradient-text">Digital Privacy</span>
              </h1>

              {/* Hero Description */}
              <p className="research-hero-desc">
                Help us understand how social engineering threats affect user
                privacy among university students in Sri Lanka. Your voluntary
                participation provides foundational empirical evidence to
                strengthen campus cyber resilience and student data sovereignty.
              </p>

              {/* Call to Action Buttons */}
              <div className="research-hero-actions">
                <Link
                  href="/consent"
                  className="button primary large research-cta-btn"
                  aria-label="Participate in Survey via consent screen"
                >
                  <span>Participate in Survey</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>

                <a
                  href="#overview"
                  onClick={(e) => scrollToSection(e, "overview")}
                  className="button secondary large research-explore-btn"
                  aria-label="Explore research background and details"
                >
                  <span>Explore Research</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </a>
              </div>

              {/* Reassurance Badges */}
              <div className="research-trust-strip">
                <div className="trust-item">
                  <Clock
                    size={15}
                    className="text-cyan-400"
                    aria-hidden="true"
                  />
                  <span>5–7 Minutes Duration</span>
                </div>
                <div className="trust-item">
                  <ShieldCheck
                    size={15}
                    className="text-cyan-400"
                    aria-hidden="true"
                  />
                  <span>100% Voluntary & Anonymous</span>
                </div>
                <div className="trust-item">
                  <GraduationCap
                    size={15}
                    className="text-cyan-400"
                    aria-hidden="true"
                  />
                  <span>Sri Lankan Undergraduates</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: High-Tech Animated Cybersecurity Artwork Visual */}
            <div className="research-hero-visual-col">
              <ResearchCyberIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          1. RESEARCH OVERVIEW (Symmetric 2x2 Glass Grid)
          ========================================================================= */}
      <section
        id="overview"
        className="research-section"
        aria-labelledby="overview-heading"
      >
        <div className="research-container">
          <div className="section-header-centered">
            <span className="research-mini-label">FOUNDATIONAL STUDY</span>
            <h2 id="overview-heading" className="section-title">
              Research Overview
            </h2>
            <p className="section-subtitle">
              An empirical computing study examining how deceptive social
              engineering manipulation impacts privacy and data autonomy for
              undergraduates in Sri Lanka.
            </p>
          </div>

          <div className="overview-grid">
            {/* Background Card */}
            <motion.article
              className="research-glass-card overview-card"
              initial={fadeIn.initial}
              whileInView={fadeIn.animate}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-top-row">
                <div className="card-icon-box lavender-box">
                  <BookOpen size={24} aria-hidden="true" />
                </div>
                <span className="card-tag">CONTEXT &amp; BACKGROUND</span>
              </div>
              <h3 className="card-headline">Research Background</h3>
              <p className="card-text">
                Higher education institutions in Sri Lanka have rapidly shifted
                toward digital learning management systems, instant messaging
                groups, and cloud resources. While this fosters collaboration,
                it also exposes undergraduates to sophisticated social
                engineering schemes—such as phishing emails, spoofed campus
                announcements, and manipulative messages designed to compromise
                credentials.
              </p>
            </motion.article>

            {/* Aim Card */}
            <motion.article
              className="research-glass-card overview-card"
              initial={fadeIn.initial}
              whileInView={fadeIn.animate}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35 }}
            >
              <div className="card-top-row">
                <div className="card-icon-box cyan-box">
                  <Target size={24} aria-hidden="true" />
                </div>
                <span className="card-tag">PRIMARY GOAL</span>
              </div>
              <h3 className="card-headline">Research Aim</h3>
              <p className="card-text">
                The primary aim of this study is to empirically evaluate how
                social engineering threats impact user privacy among university
                students in Sri Lanka, establishing foundational evidence on
                threat awareness, vulnerability patterns, and practical
                protective habits across state and private campuses.
              </p>
            </motion.article>

            {/* Objectives Card */}
            <motion.article
              className="research-glass-card overview-card"
              initial={fadeIn.initial}
              whileInView={fadeIn.animate}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
            >
              <div className="card-top-row">
                <div className="card-icon-box teal-box">
                  <ListChecks size={24} aria-hidden="true" />
                </div>
                <span className="card-tag">CORE MILESTONES</span>
              </div>
              <h3 className="card-headline">Research Objectives</h3>
              <ul className="overview-bullet-list">
                <li>
                  <Check
                    size={15}
                    className="bullet-check"
                    aria-hidden="true"
                  />
                  <span>
                    Assess students’ ability to identify social engineering
                    attacks.
                  </span>
                </li>
                <li>
                  <Check
                    size={15}
                    className="bullet-check"
                    aria-hidden="true"
                  />
                  <span>
                    Measure the frequency and types of deceptive threats
                    encountered.
                  </span>
                </li>
                <li>
                  <Check
                    size={15}
                    className="bullet-check"
                    aria-hidden="true"
                  />
                  <span>
                    Examine everyday online habits, password reuse, and Wi-Fi
                    usage.
                  </span>
                </li>
                <li>
                  <Check
                    size={15}
                    className="bullet-check"
                    aria-hidden="true"
                  />
                  <span>
                    Evaluate current privacy protection practices such as 2FA
                    adoption.
                  </span>
                </li>
              </ul>
            </motion.article>

            {/* Importance Card */}
            <motion.article
              className="research-glass-card overview-card"
              initial={fadeIn.initial}
              whileInView={fadeIn.animate}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45 }}
            >
              <div className="card-top-row">
                <div className="card-icon-box peach-box">
                  <Award size={24} aria-hidden="true" />
                </div>
                <span className="card-tag">NATIONAL IMPACT</span>
              </div>
              <h3 className="card-headline">Importance of the Study</h3>
              <p className="card-text">
                Undergraduate students represent tomorrow&apos;s digital
                workforce. Findings from this research provide critical
                empirical data for university administrations, student affairs
                divisions, and policymakers to develop culturally contextualized
                cybersecurity awareness modules and student-centric privacy
                safeguards across Sri Lanka.
              </p>
            </motion.article>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. RESEARCH FOCUS AREAS (IV1–IV4 Symmetric 4-Card Grid)
          ========================================================================= */}
      <section
        id="focus-areas"
        className="research-section"
        aria-labelledby="focus-heading"
      >
        <div className="research-container">
          <div className="section-header-centered">
            <span className="research-mini-label">ANALYTICAL DIMENSIONS</span>
            <h2 id="focus-heading" className="section-title">
              Research Focus Areas
            </h2>
            <p className="section-subtitle">
              Our theoretical framework investigates four core independent
              dimensions that shape student vulnerability and resilience in
              digital environments.
            </p>
          </div>

          <div className="focus-grid">
            {/* Card 1: Awareness */}
            <article className="focus-card">
              <div className="focus-card-header">
                <span className="focus-number">01</span>
                <div className="focus-icon-wrap cyan-glow">
                  <Eye size={22} aria-hidden="true" />
                </div>
              </div>
              <h3 className="focus-title">Awareness of Threats</h3>
              <p className="focus-desc">
                Measures students&apos; conceptual familiarity and practical
                ability to recognize deceptive cyber tactics—such as phishing
                emails, fake bursary notices, pretexting calls, and
                impersonation attempts before engaging.
              </p>
              <div className="focus-tags">
                <span className="tag-pill">Phishing Recognition</span>
                <span className="tag-pill">Impersonation</span>
                <span className="tag-pill">Deception Indicators</span>
              </div>
            </article>

            {/* Card 2: Experience */}
            <article className="focus-card">
              <div className="focus-card-header">
                <span className="focus-number">02</span>
                <div className="focus-icon-wrap peach-glow">
                  <AlertTriangle size={22} aria-hidden="true" />
                </div>
              </div>
              <h3 className="focus-title">Experience with Threats</h3>
              <p className="focus-desc">
                Examines real-world threat exposures encountered during
                university life, including suspicious SMS messages, unauthorized
                account logins, malicious links shared in student groups, and
                fraudulent scholarship schemes.
              </p>
              <div className="focus-tags">
                <span className="tag-pill">Threat Encounters</span>
                <span className="tag-pill">Account Breaches</span>
                <span className="tag-pill">Malicious Links</span>
              </div>
            </article>

            {/* Card 3: Online Behaviours */}
            <article className="focus-card">
              <div className="focus-card-header">
                <span className="focus-number">03</span>
                <div className="focus-icon-wrap purple-glow">
                  <Globe size={22} aria-hidden="true" />
                </div>
              </div>
              <h3 className="focus-title">Online Behaviours</h3>
              <p className="focus-desc">
                Evaluates daily digital habits that influence privacy
                posture—such as connecting to public or unencrypted campus
                Wi-Fi, sharing credentials, device locking routines, and public
                oversharing on social networks.
              </p>
              <div className="focus-tags">
                <span className="tag-pill">Campus Wi-Fi Habits</span>
                <span className="tag-pill">Credential Hygiene</span>
                <span className="tag-pill">Social Sharing</span>
              </div>
            </article>

            {/* Card 4: Privacy Protection Practices */}
            <article className="focus-card">
              <div className="focus-card-header">
                <span className="focus-number">04</span>
                <div className="focus-icon-wrap teal-glow">
                  <KeyRound size={22} aria-hidden="true" />
                </div>
              </div>
              <h3 className="focus-title">Privacy Protection Practices</h3>
              <p className="focus-desc">
                Quantifies proactive cybersecurity defense measures implemented
                by students, such as enabling Two-Factor Authentication (2FA),
                reviewing application privacy permissions, verifying sender
                addresses, and reporting scams.
              </p>
              <div className="focus-tags">
                <span className="tag-pill">Two-Factor Auth</span>
                <span className="tag-pill">Permission Audits</span>
                <span className="tag-pill">Link Verification</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. PRIVACY AND RESEARCH ETHICS
          ========================================================================= */}
      <section
        id="ethics"
        className="research-section"
        aria-labelledby="ethics-heading"
      >
        <div className="research-container">
          <div className="section-header-centered">
            <span className="research-mini-label">ACADEMIC INTEGRITY</span>
            <h2 id="ethics-heading" className="section-title">
              Privacy and Research Ethics
            </h2>
            <p className="section-subtitle">
              Ethical integrity is foundational to our computing research.
              Review our strict privacy guarantees and data handling policies
              below.
            </p>
          </div>

          {/* 5 Core Ethics Guarantees Grid */}
          <div className="ethics-guarantees-grid">
            {/* Guarantee 1 */}
            <div className="ethics-card">
              <div className="ethics-icon-box lavender-box">
                <UserCheck size={22} aria-hidden="true" />
              </div>
              <h3 className="ethics-card-title">Voluntary Participation</h3>
              <p className="ethics-card-desc">
                Participation is entirely voluntary. You can exit, take a break,
                or discard an unsubmitted draft at any moment without penalty or
                affecting your academic standing.
              </p>
            </div>

            {/* Guarantee 2 */}
            <div className="ethics-card">
              <div className="ethics-icon-box cyan-box">
                <KeyRound size={22} aria-hidden="true" />
              </div>
              <h3 className="ethics-card-title">Anonymous Data Collection</h3>
              <p className="ethics-card-desc">
                Sessions use randomly generated cryptographic tokens. Responses
                are stored under an anonymous participant code without linkage
                to your device identity or IP logs in exports.
              </p>
            </div>

            {/* Guarantee 3 */}
            <div className="ethics-card">
              <div className="ethics-icon-box peach-box">
                <Lock size={22} aria-hidden="true" />
              </div>
              <h3 className="ethics-card-title">Zero PII Collected</h3>
              <p className="ethics-card-desc">
                We never collect student names, registration numbers, national
                identity card (NIC) numbers, phone numbers, email addresses,
                passwords, or payment credentials.
              </p>
            </div>

            {/* Guarantee 4 */}
            <div className="ethics-card">
              <div className="ethics-icon-box teal-box">
                <Database size={22} aria-hidden="true" />
              </div>
              <h3 className="ethics-card-title">Academic Research Purpose</h3>
              <p className="ethics-card-desc">
                All collected information is used solely for university
                computing scholarship, baseline security analysis, and academic
                publication. No commercial entity has access to your data.
              </p>
            </div>

            {/* Guarantee 5 */}
            <div className="ethics-card">
              <div className="ethics-icon-box lavender-box">
                <CheckCircle2 size={22} aria-hidden="true" />
              </div>
              <h3 className="ethics-card-title">Freedom to Skip Questions</h3>
              <p className="ethics-card-desc">
                You are completely free to skip any question or select
                &quot;Prefer not to say&quot;. There are no right or wrong
                answers—only your authentic personal experience.
              </p>
            </div>
          </div>

          {/* Technical Data Governance & Policy Box */}
          <div className="data-governance-box">
            <div className="governance-grid">
              <div className="governance-col">
                <h4 className="governance-heading">
                  <Database size={16} aria-hidden="true" /> Data Retention
                  Policy
                </h4>
                <p className="governance-text">{config.retention}</p>
                <p className="governance-subtext">
                  Temporary drafts expire after {config.draftDays} days and are
                  cleared upon submission or browser discard.
                </p>
              </div>

              <div className="governance-col">
                <h4 className="governance-heading">
                  <RotateCcw size={16} aria-hidden="true" /> Participant
                  Withdrawal Rights
                </h4>
                <p className="governance-text">
                  Upon submitting, you receive a private deletion token. You may
                  withdraw your response within {config.withdrawalDays} days
                  from consent.
                </p>
                <Link href="/withdraw" className="button secondary small-btn">
                  Withdraw a response <RotateCcw size={14} aria-hidden="true" />
                </Link>
              </div>

              <div className="governance-col">
                <h4 className="governance-heading">
                  <FileText size={16} aria-hidden="true" /> Researcher Contact
                </h4>
                <p className="governance-text">{config.contact}</p>
                <p className="governance-subtext">
                  Questions about research ethics or your participation can be
                  directed to the study coordinator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FREQUENTLY ASKED QUESTIONS (FAQ)
          ========================================================================= */}
      <section
        id="faq"
        className="research-section"
        aria-labelledby="faq-heading"
      >
        <div className="research-container">
          <div className="section-header-centered">
            <span className="research-mini-label">STUDENT QUESTIONS</span>
            <h2 id="faq-heading" className="section-title">
              Frequently Asked Questions
            </h2>
            <p className="section-subtitle">
              Common questions Sri Lankan undergraduates ask about taking part.
            </p>
          </div>

          <div className="faq-accordion-list">
            {[
              {
                q: "Will my lecturers or university know what I answered?",
                a: "No. Absolutely not. The survey is 100% anonymous. We do not ask for your name, student ID, or university email address. Responses cannot be traced back to any individual student.",
              },
              {
                q: "How long does the questionnaire actually take?",
                a: "Most students complete the 25 questions in approximately 5 to 7 minutes. Questions are clear multiple-choice items with no complicated typing required.",
              },
              {
                q: "What if I haven't experienced any cyber attacks?",
                a: "Your answers are equally valuable! Understanding how many students have never encountered a threat helps us establish an accurate baseline of student cyber experiences across Sri Lanka.",
              },
              {
                q: "Can I leave and finish later?",
                a: "Yes. Your progress is saved as an anonymous temporary draft in your local browser storage. As long as you return on the same device within the draft period, your answers will be restored.",
              },
              {
                q: "What happens after I complete the survey?",
                a: "After submitting your responses, you will receive an anonymous participant code and withdrawal token. You then have the option to explore optional gamified campus cybersecurity missions or exit directly.",
              },
            ].map((item, idx) => (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={activeFaq === idx}
                >
                  <span>{item.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp size={18} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={18} aria-hidden="true" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="faq-answer-pane">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          RESEARCH PURPOSE CALLOUT (Matches Hero Page Bottom Layout)
          ========================================================================= */}
      <section className="spot-purpose-section" aria-label="Research Purpose">
        <div className="spot-purpose-container">
          <div className="spot-purpose-card">
            {/* Left Icon Badge */}
            <div className="spot-purpose-icon-box">
              <GraduationCap size={24} aria-hidden="true" />
            </div>

            {/* Center Text Block */}
            <div className="spot-purpose-text">
              <span className="spot-purpose-kicker">
                ACADEMIC RESEARCH PARTICIPATION
              </span>
              <h3 className="spot-purpose-title">
                Your perspective supports student research in Sri Lanka.
              </h3>
              <p className="spot-purpose-desc">
                Help us evaluate the impact of social engineering threats on
                user privacy. Participation is 100% voluntary, strictly
                confidential, and takes around 5–7 minutes.
              </p>
            </div>

            {/* Right Action Links */}
            <div className="spot-purpose-action flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <Link
                href="/consent"
                prefetch={true}
                className="button primary small inline-flex items-center gap-1.5"
                aria-label="Start Research Survey by proceeding to consent screen"
              >
                <span>Participate in Survey</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/withdraw"
                prefetch={true}
                className="spot-purpose-link"
                aria-label="Withdraw a previously submitted response"
              >
                <span>Withdrawal</span>
                <RotateCcw size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
