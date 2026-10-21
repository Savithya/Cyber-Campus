"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Info,
  Search,
  FileText,
  ExternalLink,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Inbox,
  Send,
  Paperclip,
  Shield,
  Eye,
} from "lucide-react";
import type { Scenario, ScenarioChoice, Attempt } from "@/lib/types";

// =========================================================================
// SENDER & EMAIL SCENARIO METADATA MAPPING
// Formats all 20 challenges into realistic university communications
// =========================================================================

export interface EmailMetadata {
  senderInitials: string;
  senderName: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  timestamp: string;
  department: string;
  scenarioIntro: string;
  bodyParagraphs: string[];
  linkCta?: {
    buttonText: string;
    destinationUrl: string;
    hostDomain: string;
    legitDomain?: string;
  };
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
  rfcHeaders: {
    returnPath: string;
    spfResult: string;
    dkimDomain: string;
    originatingIp: string;
    messageId: string;
  };
}

export function getScenarioEmailData(scenario: Scenario): EmailMetadata {
  const domain = scenario.senderAddress.includes("@")
    ? scenario.senderAddress.split("@")[1]
    : "campus.example";

  // Default RFC headers
  const rfcHeaders = {
    returnPath: `<bounce@${domain}>`,
    spfResult: "spf=softfail (envelope sender mismatch)",
    dkimDomain: domain,
    originatingIp: "198.51.100.42 (External Non-Campus Relay)",
    messageId: `<${scenario.id.toLowerCase()}-notice@${domain}>`,
  };

  switch (scenario.id) {
    // -----------------------------------------------------------------------
    // IV1: PHISHING INVESTIGATION (PH01 - PH05)
    // -----------------------------------------------------------------------
    case "PH01":
      return {
        senderInitials: "IT",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "URGENT: Undergraduate Account Deactivation Warning",
        timestamp: "Today, 10:14 AM",
        department: "University IT Account Services",
        scenarioIntro:
          "You have received an urgent email regarding your university student account and LMS access. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Our automated security auditing system has flagged your university account for non-compliance with the quarterly security policy.",
          "Your student single sign-on (SSO), examination timetable admissions, and LMS enrollment are scheduled for suspension within two hours unless credentials are re-validated immediately.",
          "Please verify your credentials using the secure campus verification portal link below to maintain uninterrupted access.",
        ],
        linkCta: {
          buttonText: "Verify Student Account Credentials",
          destinationUrl: "https://serendib.campus.example.verify-login.example/security-gate",
          hostDomain: "verify-login.example",
          legitDomain: "serendib.campus.example",
        },
        rfcHeaders: {
          returnPath: "<bounce@campus-serendib-verify.example>",
          spfResult: "spf=neutral (sender IP not authorized for campus.example)",
          dkimDomain: "campus-serendib-verify.example",
          originatingIp: "203.0.113.195 (External Host)",
          messageId: "<ph01-audit@gateway-relay.example>",
        },
      };

    case "PH02":
      return {
        senderInitials: "GO",
        senderName: "Higher Education Grant Office (SL)",
        senderEmail: "notifications@grant-office-sl-disbursement.example",
        recipient: "student@serendib.campus.example",
        subject: "Disbursement Approval: Emergency Student Scholarship Grant",
        timestamp: "Today, 09:32 AM",
        department: "National Student Financial Assistance Division",
        scenarioIntro:
          "You have received an official notification regarding an approved university student scholarship grant. Read the communication carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "We are pleased to inform you that your university profile has been approved for the National Undergraduate Higher Education Support Grant of LKR 85,000.",
          "Funds are ready for direct bank disbursement. To receive your funds, you must verify your identity and banking credentials within 24 hours.",
          "Click the secure grant disbursement claim link below to complete your payment enrollment.",
        ],
        linkCta: {
          buttonText: "Claim LKR 85,000 Grant Disbursement",
          destinationUrl: "https://grant-claim-portal.example/disbursement?sid=94770001234",
          hostDomain: "grant-claim-portal.example",
          legitDomain: "mohe.gov.example",
        },
        rfcHeaders: {
          returnPath: "<outbound@grant-office-sl-disbursement.example>",
          spfResult: "spf=softfail (unauthenticated external SMS/email gateway)",
          dkimDomain: "grant-claim-portal.example",
          originatingIp: "192.0.2.88 (Commercial Gateway)",
          messageId: "<ph02-grant-sl@disbursement-relay.example>",
        },
      };

    case "PH03":
      return {
        senderInitials: "TS",
        senderName: "Campus Tech Society & Cafeteria Services",
        senderEmail: "events@campus-tech-society.example",
        recipient: "student@serendib.campus.example",
        subject: "Tech Symposium 2026: Complimentary Student Voucher Passes",
        timestamp: "Today, 11:05 AM",
        department: "Student Activities & Society Coordination",
        scenarioIntro:
          "You have received an announcement regarding free passes and cafeteria vouchers for the annual campus symposium. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "The Campus Tech Society is releasing complimentary cafeteria vouchers and all-access passes for Tech Symposium 2026.",
          "Allocations are limited to the first 100 registered students. Please register your student profile using the event ticketing gateway link below.",
          "Ensure you complete the registration form before the allocation closes at 12:00 noon today.",
        ],
        linkCta: {
          buttonText: "Access Pass & Voucher Registration Portal",
          destinationUrl: "https://event-ticket-claim.example/student-voucher?ref=campus",
          hostDomain: "event-ticket-claim.example",
          legitDomain: "soc.campus.example",
        },
        rfcHeaders: {
          returnPath: "<notice@event-ticket-claim.example>",
          spfResult: "spf=none (no SPF record configured for sender domain)",
          dkimDomain: "event-ticket-claim.example",
          originatingIp: "198.51.100.77",
          messageId: "<ph03-symposium@events-external.example>",
        },
      };

    case "PH04":
      return {
        senderInitials: "GT",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Direct Internship Offer Letter & Employment Contract Agreement",
        timestamp: "Today, 08:45 AM",
        department: "Global Talent Recruiters — Regional Career Placement",
        scenarioIntro:
          "You have received an email from an internship recruiter containing an employment contract attachment. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Following an evaluation of high-achieving computing and engineering students, we are pleased to offer you a remote research internship position.",
          "The monthly stipend is LKR 120,000 with flexible hours. Your customized employment contract and onboarding agreement are attached to this message.",
          "Please download, review, and execute the attached agreement document to secure your placement.",
        ],
        attachment: {
          name: "Internship_Offer_Contract_2026.docx.exe",
          size: "2.4 MB",
          type: "Document Package (PE32 Executable)",
        },
        rfcHeaders: {
          returnPath: "<careers@career-network-internships.example>",
          spfResult: "spf=pass (external third-party domain)",
          dkimDomain: "career-network-internships.example",
          originatingIp: "198.51.100.12",
          messageId: "<ph04-contract@recruiters-cloud.example>",
        },
      };

    case "PH05":
      return {
        senderInitials: "EP",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Mandatory Semester Examination Portal Synchronization",
        timestamp: "Today, 09:18 AM",
        department: "University Examination Division & Student Records",
        scenarioIntro:
          "You have received an email regarding your semester examination schedule and student portal verification. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "The Central Examination Division has updated the seating arrangements and hall admission passes for the upcoming semester finals.",
          "Due to an internal database synchronization update, all registered candidates must log in through the examination verification link below to confirm their exam hall entry pass.",
          "Failure to confirm before 5:00 PM today will result in temporary suspension of exam hall eligibility.",
        ],
        linkCta: {
          buttonText: "Log In to Examination Verification Gateway",
          destinationUrl: "https://portal-campus.account-auth.example/exam-login",
          hostDomain: "portal-campus.account-auth.example",
          legitDomain: "portal.campus.example",
        },
        rfcHeaders: {
          returnPath: "<sync-notice@campus-exam-portal.example>",
          spfResult: "spf=softfail (IP not in authorized university records)",
          dkimDomain: "campus-exam-portal.example",
          originatingIp: "203.0.113.88",
          messageId: "<ph05-exams@exam-portal-sync.example>",
        },
      };

    // -----------------------------------------------------------------------
    // IV2: PRETEXTING DETECTION (PT01 - PT05)
    // -----------------------------------------------------------------------
    case "PT01":
      return {
        senderInitials: "HC",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Urgent IT Maintenance: Account Sync Errors & Credential Verification",
        timestamp: "Today, 02:15 PM",
        department: "Central Campus IT Support Helpdesk",
        scenarioIntro:
          "You have received a message from someone claiming to be a campus IT technician regarding server maintenance. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "I am contacting you from the central server team. We are currently performing database re-indexing and maintenance on all undergraduate accounts.",
          "Your current user session is generating continuous database synchronization errors. In order to manually restore your account permissions before the 6:00 PM cutoff today, I need you to reply with your active university password.",
          "If this is not resolved prior to the server maintenance cutoff, your access to LMS and university email may be temporarily interrupted.",
        ],
        rfcHeaders: {
          returnPath: "<chaminda@campus-it-helpdesk.example>",
          spfResult: "spf=softfail (unauthorized external server domain)",
          dkimDomain: "campus-it-helpdesk.example",
          originatingIp: "198.51.100.42",
          messageId: "<pt01-helpdesk@support-cloud.example>",
        },
      };

    case "PT02":
      return {
        senderInitials: "AP",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Library Fine Emergency: Overdue Reserve Book Hold Notice",
        timestamp: "Today, 10:24 AM",
        department: "University Library Circulation Services",
        scenarioIntro:
          "You have received an urgent notification from someone claiming to be a university librarian regarding an overdue book fine. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Our circulation records indicate that you have an unreturned reserve book titled 'Advanced Software Architecture'.",
          "An outstanding penalty of LKR 4,200 has accumulated on your library file. This fine must be settled immediately to prevent an administrative block on your semester registration and borrowing privileges.",
          "Please settle this balance directly using credit card details or bank transfer instructions provided to avoid escalation.",
        ],
        rfcHeaders: {
          returnPath: "<fines@campus-library-circulation.example>",
          spfResult: "spf=softfail (external relay IP)",
          dkimDomain: "campus-library-circulation.example",
          originatingIp: "198.51.100.64",
          messageId: "<pt02-library-fines@circulation-gateway.example>",
        },
      };

    case "PT03":
      return {
        senderInitials: "RC",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Official Academic Census: Student Registration Profile Verification",
        timestamp: "Today, 01:10 PM",
        department: "Office of the Registrar — Academic Census Desk",
        scenarioIntro:
          "You have received an official inquiry asking to verify your university student registration records. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Under the national higher education census framework, the Registrar's Office is conducting mandatory identity audits for all enrolled undergraduates.",
          "To validate your ongoing enrollment and eligibility for examination admission, you must reply with your National Identity Card (NIC) number, full home address, and mother's maiden name.",
          "Failure to confirm your biographical details by the end of this academic week may lead to a provisional hold on your semester academic transcript.",
        ],
        rfcHeaders: {
          returnPath: "<census@university-records-gov.example>",
          spfResult: "spf=softfail (external government-spoofed domain)",
          dkimDomain: "university-records-gov.example",
          originatingIp: "203.0.113.41",
          messageId: "<pt03-registrar@census-records.example>",
        },
      };

    case "PT04":
      return {
        senderInitials: "SN",
        senderName: scenario.senderName,
        senderEmail: "noc-admin@campus-network-support.example",
        recipient: "student@serendib.campus.example",
        subject: "Network Maintenance: High-Speed Campus Wi-Fi Verification Code",
        timestamp: "Today, 03:45 PM",
        department: "Campus Network Operations Center (NOC)",
        scenarioIntro:
          "You have received a network maintenance request asking for verification codes to maintain campus Wi-Fi access. Read the communication carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "The Network Operations Center is rolling out critical firmware upgrades to all university hostel and faculty Wi-Fi access points.",
          "A two-factor authentication security code has been transmitted to your registered mobile number via SMS. To prevent termination of your device connection to the campus network, please reply with the code received.",
          "Our technicians will manually bind your MAC address to the upgraded network upon receipt of your verification code.",
        ],
        rfcHeaders: {
          returnPath: "<sunimal@campus-network-support.example>",
          spfResult: "spf=neutral (non-institutional relay)",
          dkimDomain: "campus-network-support.example",
          originatingIp: "192.0.2.144",
          messageId: "<pt04-noc-wifi@network-support.example>",
        },
      };

    case "PT05":
      return {
        senderInitials: "NS",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Emergency Student Assistance: Clinical Exam Materials Request",
        timestamp: "Today, 11:50 AM",
        department: "Faculty of Medicine — Student Peer Network",
        scenarioIntro:
          "You have received an urgent message from someone claiming to be a fellow student in an emergency situation. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student / Peer,",
          "I am writing to you in distress. I am currently outside the faculty hospital preparing for our clinical final exam, but my laptop was damaged on the bus this morning.",
          "All my clinical case notes and university portal logins are locked on the damaged device. My exam commences in 45 minutes and I am in urgent need of login credentials or financial help to obtain replacement materials.",
          "Please assist me with your student login or a small transfer of LKR 3,500 so I do not fail my clinical assessment today.",
        ],
        rfcHeaders: {
          returnPath: "<nadeeka@campus-peers.example>",
          spfResult: "spf=none",
          dkimDomain: "campus-peers.example",
          originatingIp: "198.51.100.99",
          messageId: "<pt05-emergency@peer-relay.example>",
        },
      };

    // -----------------------------------------------------------------------
    // IV3: IMPERSONATION INVESTIGATION (IM01 - IM05)
    // -----------------------------------------------------------------------
    case "IM01":
      return {
        senderInitials: "KW",
        senderName: scenario.senderName,
        senderEmail: "prof.wickramasinghe@faculty-computing-sl.example",
        recipient: "student@serendib.campus.example",
        subject: "Coursework Clarification & Private Research Tutoring",
        timestamp: "Today, 04:20 PM",
        department: "Department of Computing & Cyber Systems",
        scenarioIntro:
          "You have received a communication from an account presenting themselves as a senior university professor. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "I reviewed your preliminary coursework submission and noticed several conceptual flaws that could significantly impact your final grade.",
          "I am offering private tutoring sessions outside official faculty hours to assist select students. To register for these private review sessions, please transfer the tutoring consultation fee of LKR 8,000 to my personal mobile account.",
          "Kindly keep this arrangement confidential between us to avoid scheduling conflicts with department administration.",
        ],
        rfcHeaders: {
          returnPath: "<prof_wickramasinghe@faculty-computing-sl.example>",
          spfResult: "spf=softfail (free external webmail gateway, not campus.ac.lk)",
          dkimDomain: "faculty-computing-sl.example",
          originatingIp: "203.0.113.110",
          messageId: "<im01-prof-tutoring@external-mail.example>",
        },
      };

    case "IM02":
      return {
        senderInitials: "DP",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Urgent Help Needed with Group Project Verification",
        timestamp: "Today, 02:40 PM",
        department: "Department of Software Engineering · Class of 2026",
        scenarioIntro:
          "You have received an urgent request from someone claiming to be your university classmate. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Classmate,",
          "Are you at your computer right now? My phone was stolen at the bus stop and I am completely locked out of my campus single sign-on and GitHub repository.",
          "Our final project report is due in two hours and the coordinator said no extensions will be granted. Could you please send me your campus portal password or forward me the 2FA SMS code that was just sent to your phone?",
          "I only need it for 10 minutes to submit our group files before the submission portal closes.",
        ],
        rfcHeaders: {
          returnPath: "<dilshan.perera@chat.campus.example>",
          spfResult: "spf=neutral (webmail proxy)",
          dkimDomain: "chat.campus.example",
          originatingIp: "198.51.100.180",
          messageId: "<im02-classmate@chat-relay.example>",
        },
      };

    case "IM03":
      return {
        senderInitials: "AF",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Office of the Proctor: Formal Student Disciplinary Inquiry",
        timestamp: "Today, 09:50 AM",
        department: "Office of the Senior Academic Proctor",
        scenarioIntro:
          "You have received an official inquiry from someone claiming to be a senior university proctor. Read the communication carefully and decide what you would do next.",
        bodyParagraphs: [
          "CONFIDENTIAL AND PRIVILEGED:",
          "Dear Student,",
          "The Proctor's Office has received a formal allegation of academic misconduct and examination breach associated with your student identification number.",
          "Before formal charges are lodged with the Disciplinary Board, you must submit a signed declaration along with your student portal credentials and contact details to verify your defense.",
          "Failure to cooperate within 24 hours will result in immediate interim suspension from all academic facilities.",
        ],
        rfcHeaders: {
          returnPath: "<proctor-office@serendib-academic.example>",
          spfResult: "spf=softfail (unverified domain: serendib-academic.example)",
          dkimDomain: "serendib-academic.example",
          originatingIp: "203.0.113.15",
          messageId: "<im03-proctor@disciplinary-cases.example>",
        },
      };

    case "IM04":
      return {
        senderInitials: "RC",
        senderName: scenario.senderName,
        senderEmail: "rotaract@campus-societies-sl.example",
        recipient: "student@serendib.campus.example",
        subject: "Invitation to Join Executive Board & Annual Membership Confirmation",
        timestamp: "Today, 05:15 PM",
        department: "Campus Rotaract Chapter — Executive Committee",
        scenarioIntro:
          "You have received an invitation from an account representing a campus student society. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Congratulations! Based on your active participation in campus events, the Executive Committee of the Rotaract Society has nominated you for a Junior Executive Director role.",
          "To formalize your executive appointment and receive your leadership certificate, you must pay the annual membership fee of LKR 4,500 via the personal bank transfer details provided below.",
          "Positions are assigned on a first-come, first-served basis upon receipt of the deposit slip.",
        ],
        rfcHeaders: {
          returnPath: "<rotaract@campus-societies-sl.example>",
          spfResult: "spf=none",
          dkimDomain: "campus-societies-sl.example",
          originatingIp: "192.0.2.222",
          messageId: "<im04-rotaract@society-announcements.example>",
        },
      };

    case "IM05":
      return {
        senderInitials: "SL",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Official Student Telecom Partnership: 50GB Free Educational Data",
        timestamp: "Today, 10:40 AM",
        department: "National Higher Education Telecommunications Initiative",
        scenarioIntro:
          "You have received a promotional communication offering free student mobile data packages. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Undergraduate,",
          "Under the national tertiary education agreement, all university students are eligible to receive 50GB of free high-speed mobile data per month for online lectures and LMS access.",
          "To activate your free data package on your current SIM card, please confirm your National Identity Card (NIC) number, date of birth, and mother's maiden name by replying to this message.",
          "Activation requests without complete identity verification cannot be processed by the telecom network.",
        ],
        rfcHeaders: {
          returnPath: "<offers@edupack-partner-lanka.example>",
          spfResult: "spf=softfail (commercial marketing domain)",
          dkimDomain: "edupack-partner-lanka.example",
          originatingIp: "198.51.100.201",
          messageId: "<im05-edudata@telecom-partner.example>",
        },
      };

    // -----------------------------------------------------------------------
    // IV4: SCAM & MALICIOUS LINK INVESTIGATION (SC01 - SC05)
    // -----------------------------------------------------------------------
    case "SC01":
      return {
        senderInitials: "ME",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Campus Mega Electronics Clearance: 80% Discount on Laptops & Tablets",
        timestamp: "Today, 12:30 PM",
        department: "Campus Electronics Clearance Outlet",
        scenarioIntro:
          "You have received an email advertising heavily discounted tech accessories on a university clearance store. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "The Annual Student Tech Clearance is now live! Over 200 high-performance laptops and graphics tablets are being cleared at 80% below retail prices.",
          "Brand new Apple MacBook Air laptops are available for only LKR 75,000 for university ID holders. Stocks are strictly limited to the first 25 orders received today.",
          "Click the clearance checkout store link below to place your order with direct debit or card payment immediately.",
        ],
        linkCta: {
          buttonText: "Open Mega Clearance Store & Order Online",
          destinationUrl: "https://sl-campus-clearance-outlet.example/checkout?deal=laptop80",
          hostDomain: "sl-campus-clearance-outlet.example",
          legitDomain: "store.campus.example",
        },
        rfcHeaders: {
          returnPath: "<store@sl-campus-clearance-outlet.example>",
          spfResult: "spf=none (newly registered domain: 2 days old)",
          dkimDomain: "sl-campus-clearance-outlet.example",
          originatingIp: "203.0.113.19",
          messageId: "<sc01-clearance@flash-deals.example>",
        },
      };

    case "SC02":
      return {
        senderInitials: "PO",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Luxury Student Studio Apartment: Direct Lease Booking",
        timestamp: "Today, 03:00 PM",
        department: "Private Student Boarding Network",
        scenarioIntro:
          "You have received an email response regarding private student accommodation and boarding near campus. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Thank you for inquiring about boarding accommodation near the university. I have a fully furnished, luxury single studio apartment located only 200 meters from the campus gate.",
          "The rent is LKR 22,000 per month with all utilities included. I am currently overseas on business, so physical viewings are not possible until next month.",
          "Due to intense student demand, I require an advance security deposit of two months' rent (LKR 44,000) transferred today via Western Union or direct wire to hold the keys for you.",
        ],
        rfcHeaders: {
          returnPath: "<landlord@campus-boarding-rentals.example>",
          spfResult: "spf=softfail",
          dkimDomain: "campus-boarding-rentals.example",
          originatingIp: "192.0.2.118",
          messageId: "<sc02-rentals@property-overseas.example>",
        },
      };

    case "SC03":
      return {
        senderInitials: "PG",
        senderName: scenario.senderName,
        senderEmail: "billing@campus-exam-fees-sl.example",
        recipient: "student@serendib.campus.example",
        subject: "Bursar's Office: Examination Fee Settlement Invoice",
        timestamp: "Today, 11:15 AM",
        department: "University Bursar & Payment Processing",
        scenarioIntro:
          "You have received an invoice notification with a payment link for university administrative fees. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Your semester examination registration fee invoice of LKR 6,500 is overdue. Unsettled balances will lead to immediate cancellation of your admission token.",
          "To clear your examination hold immediately, complete the payment transaction using the online payment gateway processor link provided below.",
          "Please have your 16-digit debit card number and ATM security PIN ready to authorize the transaction.",
        ],
        linkCta: {
          buttonText: "Proceed to Online Payment Gateway (HTTP)",
          destinationUrl: "http://pay-secure.campus-billing.example/checkout?inv=8831",
          hostDomain: "pay-secure.campus-billing.example",
          legitDomain: "bursar.campus.example",
        },
        rfcHeaders: {
          returnPath: "<billing@campus-exam-fees-sl.example>",
          spfResult: "spf=softfail (unencrypted destination endpoint)",
          dkimDomain: "campus-billing.example",
          originatingIp: "198.51.100.83",
          messageId: "<sc03-billing@payment-processor.example>",
        },
      };

    case "SC04":
      return {
        senderInitials: "HC",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "National Inter-University Hackathon 2026: Team Registration",
        timestamp: "Today, 01:45 PM",
        department: "National Hackathon Organizing Committee",
        scenarioIntro:
          "You have received an invitation to register for a national university hackathon. Read the email carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Undergraduates,",
          "Registrations are now open for the National Inter-University Hackathon 2026, sponsored by top international tech firms with cash prizes of LKR 1,500,000.",
          "All participating teams must register their members through the online registration portal link below. Each participant must provide their university Single Sign-On credentials to verify student eligibility.",
          "Registrations close strictly at midnight tonight. Click below to register your team.",
        ],
        linkCta: {
          buttonText: "Register Hackathon Team & Verify Student SSO",
          destinationUrl: "https://hackathon-srilanka-2026.example/register-team",
          hostDomain: "hackathon-srilanka-2026.example",
          legitDomain: "soc.campus.example",
        },
        rfcHeaders: {
          returnPath: "<register@hackathon-srilanka-2026.example>",
          spfResult: "spf=neutral",
          dkimDomain: "hackathon-srilanka-2026.example",
          originatingIp: "203.0.113.67",
          messageId: "<sc04-hackathon@events-sl.example>",
        },
      };

    case "SC05":
      return {
        senderInitials: "AG",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Paid Undergraduate Research Fellowship: Guaranteed Placement",
        timestamp: "Today, 10:05 AM",
        department: "Apex Global Research Lanka — Human Resources",
        scenarioIntro:
          "You have received an email offering a guaranteed paid research internship. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "We have selected your university profile for an exclusive 6-month undergraduate research fellowship with Apex Global Research Lanka.",
          "This position includes a monthly research grant of LKR 95,000 and direct mentorship from industry experts. Placement is guaranteed without interviews.",
          "To finalize your appointment and receive your welcome kit, an administrative background screening fee of LKR 5,000 must be deposited to our finance account within 48 hours.",
        ],
        rfcHeaders: {
          returnPath: "<hr@apex-careers-lanka.example>",
          spfResult: "spf=softfail",
          dkimDomain: "apex-careers-lanka.example",
          originatingIp: "198.51.100.91",
          messageId: "<sc05-internship@apex-hr.example>",
        },
      };

    default:
      // Graceful fallback for any scenario
      return {
        senderInitials: scenario.senderName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: scenario.title,
        timestamp: "Today, 10:00 AM",
        department: "University Campus Services",
        scenarioIntro:
          scenario.situation ||
          "You have received a communication regarding your university account. Read the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          scenario.message,
          "Please review the communication and proceed accordingly.",
        ],
        linkCta: scenario.mediaDetails?.destinationUrl
          ? {
              buttonText: "Open Associated Web Gateway",
              destinationUrl: scenario.mediaDetails.destinationUrl,
              hostDomain: scenario.mediaDetails.hostDomain || "external.example",
              legitDomain: scenario.mediaDetails.legitDomain,
            }
          : undefined,
        rfcHeaders,
      };
  }
}

// =========================================================================
// SECTION A: MISSION HEADER COMPONENT
// =========================================================================

interface CyberMissionHeaderProps {
  missionName: string;
  ivCode: string;
  challengeIndex: number;
  totalInMission: number;
  overallCompleted: number;
  totalOverall: number;
  challengeTitle: string;
  onReturnToHub: () => void;
  onSelectIndex?: (index: number) => void;
  completedIds?: string[];
  missionIds?: readonly string[];
}

export function CyberMissionHeader({
  missionName,
  ivCode,
  challengeIndex,
  totalInMission,
  overallCompleted,
  totalOverall,
  challengeTitle,
  onReturnToHub,
  onSelectIndex,
  completedIds = [],
  missionIds = [],
}: CyberMissionHeaderProps) {
  const currentNum = challengeIndex + 1;
  const progressPercent = Math.round((currentNum / totalInMission) * 100);

  // Modern cybersecurity icon based on IV
  const getIcon = () => {
    switch (ivCode) {
      case "IV1":
        return <Mail size={22} className="text-primary" aria-hidden="true" />;
      case "IV2":
        return <MessagesSquare size={22} className="text-teal" aria-hidden="true" />;
      case "IV3":
        return <UserRoundSearch size={22} className="text-amber" aria-hidden="true" />;
      case "IV4":
        return <Link2 size={22} className="text-primary" aria-hidden="true" />;
      default:
        return <ShieldCheck size={22} className="text-primary" aria-hidden="true" />;
    }
  };

  return (
    <header className="cyber-mission-header-card" aria-label="Cyber Mission Header">
      {/* Top Bar: Return link + IV identifier + Telemetry */}
      <div className="mission-header-top-row">
        <button
          type="button"
          onClick={onReturnToHub}
          className="mission-return-link"
          aria-label="Return to Mission Control Hub"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Mission Control</span>
        </button>

        <div className="mission-header-badges">
          <span className="mission-iv-badge font-mono">
            {missionName.toUpperCase()} ({ivCode})
          </span>
          <span className="mission-overall-badge font-mono">
            Overall: {overallCompleted} / {totalOverall}
          </span>
        </div>
      </div>

      {/* Main Challenge Title Row */}
      <div className="mission-title-row">
        <div className="mission-icon-tile">{getIcon()}</div>
        <div className="mission-title-content">
          <div className="challenge-step-label font-mono">
            CHALLENGE 0{currentNum} OF 0{totalInMission}
          </div>
          <h1 className="challenge-main-title">{challengeTitle}</h1>
        </div>
      </div>

      {/* Progress Bar & Jump Pills */}
      <div className="mission-progress-container">
        <div className="mission-progress-bar-wrap">
          <div className="progress-labels">
            <span className="text-xs text-muted font-semibold">
              Mission Progress: Challenge {currentNum} of {totalInMission}
            </span>
            <span className="text-xs font-mono text-primary font-bold">
              {progressPercent}%
            </span>
          </div>
          <div
            className="mission-progress-track"
            role="progressbar"
            aria-valuenow={currentNum}
            aria-valuemin={1}
            aria-valuemax={totalInMission}
            aria-label={`Mission progress ${progressPercent}%`}
          >
            <div
              className="mission-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Challenge Selector Pills */}
        <div className="challenge-jump-pills" role="tablist" aria-label="Challenge selector">
          {Array.from({ length: totalInMission }, (_, idx) => {
            const isCurrent = idx === challengeIndex;
            const targetId = missionIds[idx];
            const isDone = targetId ? completedIds.includes(targetId) : false;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                className={`challenge-jump-pill ${isCurrent ? "active" : ""} ${
                  isDone ? "done" : ""
                }`}
                onClick={() => onSelectIndex?.(idx)}
                title={`Jump to Challenge 0${idx + 1}`}
              >
                <span>0{idx + 1}</span>
                {isDone && (
                  <Check
                    size={11}
                    strokeWidth={3}
                    className="ml-1 text-emerald"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// =========================================================================
// SECTION B: SHORT SCENARIO INTRODUCTION COMPONENT
// =========================================================================

interface ScenarioIntroductionProps {
  introText: string;
}

export function ScenarioIntroduction({ introText }: ScenarioIntroductionProps) {
  return (
    <section
      className="scenario-intro-card"
      role="region"
      aria-label="Scenario Introduction"
    >
      <div className="scenario-intro-badge">
        <Info size={14} className="text-primary" aria-hidden="true" />
        <span>Scenario Introduction</span>
      </div>
      <p className="scenario-intro-text">&ldquo;{introText}&rdquo;</p>
    </section>
  );
}

// =========================================================================
// SECTION C: REALISTIC UNIVERSITY EMAIL SIMULATOR COMPONENT
// =========================================================================

interface UniversityEmailSimulatorProps {
  emailData: EmailMetadata;
}

export function UniversityEmailSimulator({ emailData }: UniversityEmailSimulatorProps) {
  const [headersExpanded, setHeadersExpanded] = useState<boolean>(false);
  const [linkHovered, setLinkHovered] = useState<boolean>(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState<boolean>(false);

  return (
    <section
      className="university-email-simulator-card"
      role="region"
      aria-label="Realistic University Email Simulator"
    >
      {/* 1. Webmail Client Top Chrome Bar */}
      <div className="email-sim-top-bar">
        <div className="email-sim-window-dots" aria-hidden="true">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="email-sim-client-name">
            Campus Webmail · Secure Student Inbox
          </span>
        </div>

        <div className="email-sim-meta-actions">
          <span className="email-sim-folder-tag">
            <Inbox size={12} aria-hidden="true" />
            <span>Inbox</span>
          </span>
          <span className="email-sim-timestamp font-mono">
            <Clock size={12} aria-hidden="true" />
            <span>{emailData.timestamp}</span>
          </span>
        </div>
      </div>

      {/* 2. Sender Details Bar */}
      <div className="email-sim-sender-header">
        <div className="email-sender-profile-row">
          {/* Sender Avatar */}
          <div className="email-sender-avatar" aria-hidden="true">
            <span>{emailData.senderInitials}</span>
          </div>

          {/* Sender & Recipient Information */}
          <div className="email-sender-info">
            <div className="sender-primary-line">
              <strong className="sender-display-name">{emailData.senderName}</strong>
              <code className="sender-address-code">&lt;{emailData.senderEmail}&gt;</code>
            </div>
            <div className="sender-recipient-line">
              <span className="recipient-label">To:</span>
              <span className="recipient-address font-mono">{emailData.recipient}</span>
              <span className="dept-tag">{emailData.department}</span>
            </div>
          </div>

          {/* RFC Header Inspection Toggle */}
          <button
            type="button"
            className="email-inspect-headers-btn"
            onClick={() => setHeadersExpanded(!headersExpanded)}
            aria-expanded={headersExpanded}
            aria-label="Inspect Email RFC Security Headers"
          >
            <Info size={13} aria-hidden="true" />
            <span>{headersExpanded ? "Hide RFC Headers" : "Inspect Headers"}</span>
            <ChevronDown
              size={13}
              className={`chevron-icon transition-transform ${
                headersExpanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Expandable RFC Header Drawer */}
        {headersExpanded && (
          <div className="email-rfc-headers-drawer" role="region" aria-label="RFC Security Headers">
            <div className="rfc-header-title">
              <Shield size={13} className="text-primary" aria-hidden="true" />
              <span>Envelope &amp; Authentication Results</span>
            </div>
            <pre className="rfc-code-block font-mono">
{`Return-Path: ${emailData.rfcHeaders.returnPath}
Authentication-Results: ${emailData.rfcHeaders.spfResult}
DKIM-Signature: v=1; a=rsa-sha256; d=${emailData.rfcHeaders.dkimDomain}; s=mail
X-Originating-IP: [${emailData.rfcHeaders.originatingIp}]
Message-ID: ${emailData.rfcHeaders.messageId}
X-Mailer: Campus Webmail Gateway v4.8 (SSL/TLS Active)`}
            </pre>
          </div>
        )}
      </div>

      {/* 3. Subject Line */}
      <div className="email-sim-subject-bar">
        <span className="subject-prefix">Subject:</span>
        <h2 className="subject-text">{emailData.subject}</h2>
      </div>

      {/* 4. Realistic Email Body */}
      <div className="email-sim-body">
        {emailData.bodyParagraphs.map((paragraph, pIdx) => (
          <p key={pIdx} className="email-body-p">
            {paragraph}
          </p>
        ))}

        {/* Interactive Attachment Card if applicable */}
        {emailData.attachment && (
          <div className="email-sim-attachment-box">
            <div className="attachment-icon-tile">
              <FileText size={24} className="text-amber" aria-hidden="true" />
            </div>
            <div className="attachment-details">
              <strong className="attachment-filename">{emailData.attachment.name}</strong>
              <span className="attachment-size text-muted">
                {emailData.attachment.size} · {emailData.attachment.type}
              </span>
            </div>
            <button
              type="button"
              className="button secondary small"
              onClick={() => setAttachmentModalOpen(true)}
              aria-label="Inspect attachment properties safely"
            >
              <Search size={14} aria-hidden="true" />
              <span>Inspect File Properties</span>
            </button>
          </div>
        )}

        {/* Interactive Safe Link if applicable */}
        {emailData.linkCta && (
          <div className="email-sim-link-box">
            <span className="link-intro-label">Action required in email:</span>
            <div className="link-button-wrapper">
              <button
                type="button"
                className="simulated-safe-link-btn"
                onMouseEnter={() => setLinkHovered(true)}
                onMouseLeave={() => setLinkHovered(false)}
                onClick={() => setLinkHovered(!linkHovered)}
                aria-label="Inspect destination link safely"
              >
                <ExternalLink size={15} aria-hidden="true" />
                <span>{emailData.linkCta.buttonText}</span>
              </button>
            </div>

            {/* Safe Destination URL Inspection Tooltip */}
            {linkHovered && (
              <div className="safe-link-inspection-tooltip" role="tooltip">
                <div className="tooltip-head">
                  <ShieldCheck size={13} className="text-primary" aria-hidden="true" />
                  <strong>Simulated Link Destination (Safe Inspection)</strong>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-key">Full Destination URL:</span>
                  <code className="tooltip-url font-mono">
                    {emailData.linkCta.destinationUrl}
                  </code>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-key">Actual Root Host Domain:</span>
                  <strong className="tooltip-host text-primary">
                    {emailData.linkCta.hostDomain}
                  </strong>
                </div>
                {emailData.linkCta.legitDomain && (
                  <div className="tooltip-row">
                    <span className="tooltip-key">Official Campus Domain:</span>
                    <strong className="tooltip-legit text-emerald">
                      {emailData.linkCta.legitDomain}
                    </strong>
                  </div>
                )}
                <small className="tooltip-disclaimer text-muted">
                  Note: All links remain safely contained inside the Cyber Campus research simulation platform.
                </small>
              </div>
            )}
          </div>
        )}

        {/* Professional Email Sign-Off */}
        <div className="email-sim-signoff">
          <p className="signoff-line">Regards,</p>
          <p className="signoff-name">
            <strong>{emailData.senderName}</strong>
          </p>
          <p className="signoff-dept text-muted">{emailData.department}</p>
          <p className="signoff-disclaimer text-xs text-muted mt-2 border-t pt-2">
            This simulated message is delivered for the Cyber Campus academic research study.
          </p>
        </div>
      </div>

      {/* Attachment Inspection Modal */}
      {attachmentModalOpen && emailData.attachment && (
        <div
          className="modal-backdrop"
          onClick={() => setAttachmentModalOpen(false)}
          role="presentation"
        >
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Attachment Property Inspector"
          >
            <div className="modal-header">
              <span className="modal-title">
                <Search size={18} aria-hidden="true" />
                <span>Safe File Property Inspector</span>
              </span>
              <button
                type="button"
                className="close-btn"
                onClick={() => setAttachmentModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-meta-grid">
                <div>
                  <span className="text-muted text-xs block">Reported File Name:</span>
                  <strong>{emailData.attachment.name}</strong>
                </div>
                <div>
                  <span className="text-muted text-xs block">File Size:</span>
                  <strong>{emailData.attachment.size}</strong>
                </div>
                <div>
                  <span className="text-muted text-xs block">True Detected File Format:</span>
                  <code className="text-primary font-mono">{emailData.attachment.type}</code>
                </div>
                <div>
                  <span className="text-muted text-xs block">Security Sandbox Status:</span>
                  <strong className="text-emerald">Safely Quarantined in Research Sandbox</strong>
                </div>
              </div>
              <div className="modal-dialog-footer mt-4 text-right">
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => setAttachmentModalOpen(false)}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// =========================================================================
// SECTION D: CHOOSE YOUR NEXT ACTION — INTERACTIVE SELECTION CARDS
// =========================================================================

interface ActionSelectionGroupProps {
  choices: ScenarioChoice[];
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
  disabled?: boolean;
}

export function ActionSelectionGroup({
  choices,
  selectedChoiceId,
  onSelectChoice,
  disabled = false,
}: ActionSelectionGroupProps) {
  return (
    <section
      className="action-selection-section"
      role="region"
      aria-label="Choose Your Next Action"
    >
      <div className="action-selection-heading">
        <h2 className="action-selection-title">What would you do next?</h2>
        <p className="action-selection-sub">
          Choose the action you would most likely take in this situation.
        </p>
      </div>

      {/* Accessible Interactive Selection Cards (A, B, C, D) */}
      <div
        className="interactive-action-cards-grid"
        role="radiogroup"
        aria-label="Action response options"
      >
        {choices.map((choice, cIndex) => {
          const letter = String.fromCharCode(65 + cIndex);
          const isSelected = selectedChoiceId === choice.id;

          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              className={`interactive-action-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectChoice(choice.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectChoice(choice.id);
                }
              }}
            >
              {/* Option Letter Badge (A, B, C, D) */}
              <div className="action-letter-badge" aria-hidden="true">
                {letter}
              </div>

              {/* Action Description */}
              <div className="action-text-content">
                <span className="action-label-text">{choice.label}</span>
                {choice.reply && (
                  <small className="action-reply-preview text-muted">
                    &ldquo;{choice.reply}&rdquo;
                  </small>
                )}
              </div>

              {/* Radio Indicator */}
              <div className="action-radio-indicator" aria-hidden="true">
                <div className={`radio-outer ${isSelected ? "active" : ""}`}>
                  {isSelected && <div className="radio-inner" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// =========================================================================
// PRIMARY NAVIGATION: NEXT CHALLENGE BUTTON
// (Confirm My Answer button is completely removed!)
// =========================================================================

interface NextChallengeButtonProps {
  isLastChallenge: boolean;
  hasSelectedAnswer: boolean;
  isSubmitting: boolean;
  error: string;
  onAdvance: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
}

export function NextChallengeButton({
  isLastChallenge,
  hasSelectedAnswer,
  isSubmitting,
  error,
  onAdvance,
  onPrevious,
  canGoPrevious = false,
}: NextChallengeButtonProps) {
  return (
    <div className="next-challenge-controls-panel">
      {/* Friendly Error Banner with Retry */}
      {error && (
        <div className="challenge-error-alert" role="alert">
          <div className="error-alert-text">
            <AlertCircle size={18} className="text-red" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="button secondary small retry-btn"
            onClick={onAdvance}
            disabled={isSubmitting}
          >
            <RefreshCw
              size={13}
              className={isSubmitting ? "animate-spin" : ""}
              aria-hidden="true"
            />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Primary Actions Row */}
      <div className="challenge-nav-row">
        {/* Optional Previous Button */}
        {canGoPrevious && onPrevious ? (
          <button
            type="button"
            className="button secondary medium prev-challenge-btn"
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Previous Challenge</span>
          </button>
        ) : (
          <div />
        )}

        {/* Primary Action Button: Next Challenge / Complete Mission */}
        <button
          type="button"
          className={`button primary large primary-next-btn ${
            !hasSelectedAnswer ? "btn-disabled" : ""
          }`}
          disabled={!hasSelectedAnswer || isSubmitting}
          onClick={onAdvance}
          aria-label={
            isLastChallenge
              ? "Complete Cyber Mission and Proceed"
              : "Save Selection and Proceed to Next Challenge"
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              <span>Saving Response…</span>
            </>
          ) : isLastChallenge ? (
            <>
              <span>Complete Mission</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          ) : (
            <>
              <span>Next Challenge</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
