"use client";

import React, { useState, useEffect } from "react";
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
  Compass,
  MessageSquare,
  Layers,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Mic,
  Volume2,
  Smartphone,
  CheckCheck,
  Radio,
  Activity,
  Signal,
  Wifi,
} from "lucide-react";
import { missions } from "@/content/missions";
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
  communicationType?: "message" | "call" | "email";
  channelTitle?: string;
  phoneNumber?: string;
  callerId?: string;
  callStatus?: string;
  callAudioTranscript?: string[];
  messagePlatform?: "sms" | "chat" | "whatsapp" | "direct_message";
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
    // IV1: PHISHING INVESTIGATION (PH01 - PH05) — MSG TYPE & CALL TYPE
    // -----------------------------------------------------------------------
    case "PH01":
      return {
        communicationType: "email",
        channelTitle: "Challenge inbox",
        senderInitials: (scenario.senderName || "L")[0].toUpperCase(),
        senderName: scenario.senderName || "Lakview Student Services",
        senderEmail: scenario.senderAddress || "support@lakview-account.example",
        recipient: "student@lakview.campus.example",
        subject: scenario.title || "Action required: keep your student account active",
        timestamp: "02 Oct 2026, 09:10 · Fictional timestamp",
        department: "Lakview Student Services",
        scenarioIntro:
          "Examine each email carefully and decide what you would do.",
        bodyParagraphs: [
          "Dear Student,",
          "Our student records system is being updated. To avoid an interruption to your learning portal, please confirm your account within the next two hours.",
          "Use the secure verification button below to complete this short process. You will be asked to confirm your account details.",
          "Thank you,",
          "Lakview Student Services",
        ],
        linkCta: {
          buttonText: "Verify student account",
          destinationUrl: "https://lakview-account.example/verify-student",
          hostDomain: "lakview-account.example",
          legitDomain: "lakview.edu.example",
        },
        rfcHeaders: {
          returnPath: "<bounce@lakview-account.example>",
          spfResult: "spf=softfail (envelope sender domain does not match university records)",
          dkimDomain: "lakview-account.example",
          originatingIp: "198.51.100.42 (External Relay)",
          messageId: "<ph01-notice@lakview-account.example>",
        },
      };

    case "PH02":
      return {
        communicationType: "message",
        messagePlatform: "sms",
        channelTitle: "SMS Notification · GrantOffice-SL",
        phoneNumber: "+94 77 000 1234",
        senderInitials: "GO",
        senderName: "Higher Education Grant Office (SL)",
        senderEmail: "notifications@grant-office-sl-disbursement.example",
        recipient: "student@serendib.campus.example",
        subject: "Disbursement Approval: Emergency Student Scholarship Grant",
        timestamp: "Today, 09:32 AM",
        department: "National Student Financial Assistance Division",
        scenarioIntro:
          "You receive an SMS notification claiming you have been approved for a national university welfare grant of LKR 85,000. Review the message and claim link carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Ministry Welfare Grant: Your higher education bursary of LKR 85,000 is approved.",
          "To disburse funds to your bank account, submit your National Identity Card (NIC) number and bank debit card number at the claim link below.",
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
          spfResult: "spf=softfail (unauthenticated external SMS gateway)",
          dkimDomain: "grant-claim-portal.example",
          originatingIp: "192.0.2.88 (Commercial SMS Gateway)",
          messageId: "<ph02-grant-sl@disbursement-relay.example>",
        },
      };

    case "PH03":
      return {
        communicationType: "message",
        messagePlatform: "chat",
        channelTitle: "Campus Tech Society Mobile Announcement",
        phoneNumber: "Campus-Tech-Fest (+94 78 221 9901)",
        senderInitials: "TS",
        senderName: "Campus Tech Society & Cafeteria Services",
        senderEmail: "events@campus-tech-society.example",
        recipient: "student@serendib.campus.example",
        subject: "Tech Symposium 2026: Complimentary Student Voucher Passes",
        timestamp: "Today, 11:05 AM",
        department: "Student Activities & Society Coordination",
        scenarioIntro:
          "You receive an announcement message forwarded in your student activities group chat offering free symposium vouchers with a registration link. Review the message carefully and decide what you would do next.",
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
        communicationType: "call",
        channelTitle: "Incoming Phone Call & Transferred File · Global Talent Recruiters",
        phoneNumber: "+94 71 987 6543 (Direct Recruiter Line)",
        callerId: "GLOBAL-TALENT-HR",
        callStatus: "Connected · 01:12",
        senderInitials: "GT",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Direct Internship Offer Letter & Employment Contract Agreement",
        timestamp: "Today, 08:45 AM",
        department: "Global Talent Recruiters — Regional Career Placement",
        scenarioIntro:
          "You receive a phone call from an internship recruiter offering a high-paying remote placement and transferring a contract file to your device. Review the call and attached document carefully and decide what you would do next.",
        callAudioTranscript: [
          "[Caller — Talent Acquisition Specialist]: 'Good day, we evaluated top undergraduates from your university and selected you for a remote paid software internship at LKR 120,000 per month.'",
          "'I have just transferred your customized employment contract file Internship_Offer_Contract_2026.docx.exe to your device. You must open and execute it today to reserve your placement.'",
        ],
        bodyParagraphs: [
          "Dear Student,",
          "Phone call from Global Talent Recruiters (+94 71 987 6543): 'Following an evaluation of computing students, we are offering you a remote internship (LKR 120,000/mo).'",
          "Your customized employment contract has been transferred to your device as an onboarding package.",
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
          originatingIp: "198.51.100.12 (Direct Recruiter Inbound)",
          messageId: "<ph04-contract@recruiters-cloud.example>",
        },
      };

    case "PH05":
      return {
        communicationType: "message",
        messagePlatform: "chat",
        channelTitle: "Urgent Chat Alert · Examination Division",
        phoneNumber: "Exam-Portal-Sync (+94 72 901 3456)",
        senderInitials: "EP",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Mandatory Semester Examination Portal Synchronization",
        timestamp: "Today, 09:18 AM",
        department: "University Examination Division & Student Records",
        scenarioIntro:
          "You receive an urgent message in your course batch chat claiming exam hall allocations have been updated with a verification link. Review the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "URGENT: Central Examination Division updated seating arrangements and hall admission passes for semester finals.",
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
    // IV4: SCAM & MALICIOUS LINK INVESTIGATION (SC01 - SC05) — ALL MSG TYPE
    // -----------------------------------------------------------------------
    case "SC01":
      return {
        communicationType: "message",
        messagePlatform: "chat",
        channelTitle: "Sponsored Product Message · Telegram/WhatsApp Deals",
        phoneNumber: "Campus Clearance Deals (+94 71 884 9210)",
        senderInitials: "ME",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Campus Mega Electronics Clearance: 80% Discount on Laptops & Tablets",
        timestamp: "Today, 12:30 PM",
        department: "Campus Electronics Clearance Outlet",
        scenarioIntro:
          "You receive a sponsored instant message promoting an undergraduate clearance sale for Apple laptops. Review the message and link carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "FLASH CLEARANCE SALE: Only 3 units remaining in Colombo warehouse! Brand new Apple MacBook Air laptops are available for only LKR 75,000 (80% off retail) for university ID holders.",
          "Countdown timer: 08:34 remaining. Tap the clearance checkout link below to place your order with card payment immediately.",
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
        communicationType: "message",
        messagePlatform: "direct_message",
        channelTitle: "Direct Message · Campus Boarding Chat",
        phoneNumber: "+44 7911 123456 (Overseas Landlord)",
        senderInitials: "PO",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Luxury Student Studio Apartment: Direct Lease Booking",
        timestamp: "Today, 03:00 PM",
        department: "Private Student Boarding Network",
        scenarioIntro:
          "You receive a direct message regarding an off-campus luxury studio lease from an overseas landlord. Review the message and payment demand carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "Thank you for inquiring about boarding accommodation near campus. I have a fully furnished, luxury single studio apartment located only 200 meters from the campus gate for LKR 22,000/month with all utilities included.",
          "I am currently overseas on humanitarian work, so physical viewings are not possible until next month. Due to intense student demand, transfer an advance security deposit of two months' rent (LKR 44,000) and your NIC scan immediately via wire to hold the keys for you.",
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
        communicationType: "message",
        messagePlatform: "sms",
        channelTitle: "SMS Alert · PaySec University Gateway",
        phoneNumber: "PAYSEC-SL (+94 77 555 0192)",
        senderInitials: "PG",
        senderName: scenario.senderName,
        senderEmail: "billing@campus-exam-fees-sl.example",
        recipient: "student@serendib.campus.example",
        subject: "Bursar's Office: Examination Fee Settlement Invoice",
        timestamp: "Today, 11:15 AM",
        department: "University Bursar & Payment Processing",
        scenarioIntro:
          "You receive an urgent SMS alert regarding library fee settlement with an online payment link. Review the notification carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Student,",
          "PAYMENT PROCESSING: Your semester examination registration fee invoice of LKR 6,500 is overdue. Unsettled balances will lead to immediate cancellation of your admission token.",
          "To clear your examination hold immediately, complete the payment transaction using the online payment gateway processor link provided below. Have your 16-digit debit card number and ATM security PIN ready to authorize.",
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
        communicationType: "message",
        messagePlatform: "chat",
        channelTitle: "Batch Group Chat · Inter-University Hackathon",
        phoneNumber: "Hackathon-2026 Admin (+94 76 332 8190)",
        senderInitials: "HC",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "National Inter-University Hackathon 2026: Team Registration",
        timestamp: "Today, 01:45 PM",
        department: "National Hackathon Organizing Committee",
        scenarioIntro:
          "You receive an announcement message in your student batch chat with an event registration link. Review the message and permissions carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Undergraduates,",
          "Registrations are now open for the National Inter-University Hackathon 2026, sponsored by top international tech firms with cash prizes of LKR 1,500,000.",
          "All participating teams must register their members through the online registration portal link below. Each participant must connect their university Google Account to verify student SSO eligibility before midnight tonight.",
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
        communicationType: "message",
        messagePlatform: "direct_message",
        channelTitle: "Direct Message · Career Recruiter (LinkedIn/Telegram)",
        phoneNumber: "Apex Careers Lanka (+94 70 441 5520)",
        senderInitials: "AG",
        senderName: scenario.senderName,
        senderEmail: scenario.senderAddress,
        recipient: "student@serendib.campus.example",
        subject: "Paid Undergraduate Research Fellowship: Guaranteed Placement",
        timestamp: "Today, 10:05 AM",
        department: "Apex Global Research Lanka — Human Resources",
        scenarioIntro:
          "You receive a direct message offering a high-stipend remote internship with an upfront fee request. Review the message carefully and decide what you would do next.",
        bodyParagraphs: [
          "Dear Candidate,",
          "CAREER OPPORTUNITY: We have selected your university profile for an exclusive 6-month undergraduate research fellowship with Apex Global Research Lanka (LKR 95,000/mo).",
          "Placement is guaranteed without interviews. To finalize your appointment and receive your workstation security credentials, an administrative background screening fee of LKR 5,000 must be deposited within 48 hours.",
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
      {/* Top Bar: Cyber Campus Brand + Return link + IV identifier + Session Telemetry */}
      <div className="mission-header-top-row">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToHub}
            className="mission-return-link"
            aria-label="Pause and return to Mission Control Hub"
            title="Pause and return to Mission Control"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Mission Hub</span>
          </button>

          <div className="workspace-brand-pill hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 border border-primary/20 text-primary">
            <ShieldCheck size={13} aria-hidden="true" />
            <span>CYBER CAMPUS LAB</span>
          </div>
        </div>

        <div className="mission-header-badges">
          <div className="mission-iv-badge">
            <span className="badge-pulse-dot" aria-hidden="true" />
            <span>{missionName} ({ivCode})</span>
          </div>
          <div className="mission-overall-badge">
            <ShieldCheck size={13} className="text-emerald" aria-hidden="true" />
            <span>{overallCompleted}/{totalOverall} Completed ({Math.round((overallCompleted / totalOverall) * 100)}%)</span>
          </div>
          <div className="workspace-save-pill hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono text-muted bg-surface-subtle border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald inline-block" />
            <span>Auto-Saved</span>
          </div>
        </div>
      </div>

      {/* Main Challenge Title Row */}
      <div className="mission-title-row">
        <div className="mission-icon-tile">{getIcon()}</div>
        <div className="mission-title-content">
          <div className="challenge-step-label">
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
// SECTION A.2: ALL 4 CYBER MISSIONS NAVIGATOR & PROGRESS TRACKER
// Displays the 4 research IV modules with completion counts and live state
// =========================================================================

export interface CyberMissionsPanelProps {
  currentMissionId: string;
  completedScenarioIds: string[];
  totalOverall?: number;
  overallCompleted?: number;
  onSelectMission?: (missionId: string, scenarioIndex?: number) => void;
  className?: string;
}

export function CyberMissionsPanel({
  currentMissionId,
  completedScenarioIds = [],
  totalOverall = 20,
  overallCompleted = 0,
  onSelectMission,
  className = "",
}: CyberMissionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsExpanded(window.innerWidth > 1024);
    }
  }, []);

  const activeMissionList = missions.filter((m) => !m.proposed);

  return (
    <div
      className={`cyber-missions-panel-card ${className}`}
      role="region"
      aria-label="All 4 Cyber Missions"
    >
      {/* Header with Title and Overall Progress */}
      <div className="missions-panel-header">
        <div className="missions-panel-title-wrap">
          <div className="missions-panel-icon-tile">
            <Layers size={15} className="text-primary" aria-hidden="true" />
          </div>
          <div>
            <div className="missions-panel-eyebrow">RESEARCH MODULES</div>
            <h3 className="missions-panel-title">4 Cyber Missions</h3>
          </div>
        </div>

        <div className="missions-panel-meta">
          <span className="missions-panel-progress-pill font-mono" title="Total Scenarios Completed">
            {overallCompleted} / {totalOverall}
          </span>
          <button
            type="button"
            className="missions-panel-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse 4 Cyber Missions tracker" : "Expand 4 Cyber Missions tracker"}
            title={isExpanded ? "Collapse tracker" : "Expand tracker"}
          >
            <ChevronDown
              size={15}
              className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Expanded List of 4 Cyber Missions */}
      {isExpanded ? (
        <div className="cyber-missions-nav-list" role="list" aria-label="Cyber Missions List">
          {activeMissionList.map((m, index) => {
            const isCurrent = m.id === currentMissionId;
            const completedCount = m.ids.filter((id) => completedScenarioIds.includes(id)).length;
            const totalCount = m.ids.length;
            const isDone = completedCount >= totalCount;
            const percent = Math.round((completedCount / totalCount) * 100);

            const content = (
              <>
                <div className="mission-item-header">
                  <div className="mission-item-left">
                    <span className={`mission-iv-tag iv-tag-${m.iv.toLowerCase()}`}>
                      {m.iv}
                    </span>
                    <span className="mission-item-name">
                      {index + 1}. {m.name}
                    </span>
                  </div>

                  <div className="mission-item-right">
                    {isCurrent ? (
                      <span className="mission-status-pill active">
                        <span className="pulse-dot-subtle" aria-hidden="true" />
                        <span>Active</span>
                      </span>
                    ) : isDone ? (
                      <span className="mission-status-pill done">
                        <Check size={11} strokeWidth={3} aria-hidden="true" />
                        <span>Done</span>
                      </span>
                    ) : (
                      <span className="mission-status-pill count">
                        {completedCount}/{totalCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mission-item-progress-track">
                  <div
                    className={`mission-item-progress-fill iv-fill-${m.iv.toLowerCase()} ${isCurrent ? "active-glow" : ""}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </>
            );

            if (onSelectMission) {
              return (
                <button
                  key={m.id}
                  type="button"
                  role="listitem"
                  onClick={() => onSelectMission(m.id, 0)}
                  className={`cyber-mission-nav-item interactive ${isCurrent ? "active-mission" : ""} ${
                    isDone ? "done-mission" : ""
                  }`}
                  aria-current={isCurrent ? "true" : undefined}
                  title={`Switch to ${m.name} (${m.iv})`}
                >
                  {content}
                </button>
              );
            }

            return (
              <div
                key={m.id}
                role="listitem"
                className={`cyber-mission-nav-item ${isCurrent ? "active-mission" : ""} ${
                  isDone ? "done-mission" : ""
                }`}
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        /* Collapsed Compact Pills */
        <div className="cyber-missions-compact-row" role="list" aria-label="Cyber Missions Compact">
          {activeMissionList.map((m) => {
            const isCurrent = m.id === currentMissionId;
            const completedCount = m.ids.filter((id) => completedScenarioIds.includes(id)).length;
            const isDone = completedCount >= m.ids.length;

            return (
              <button
                key={m.id}
                type="button"
                role="listitem"
                onClick={() => onSelectMission?.(m.id, 0)}
                disabled={!onSelectMission}
                className={`compact-mission-pill ${isCurrent ? "active" : ""} ${isDone ? "done" : ""}`}
                title={`${m.name} (${completedCount}/${m.ids.length})`}
              >
                <span className="font-bold">{m.iv}</span>
                {isDone ? (
                  <Check size={11} strokeWidth={3} className="text-emerald" />
                ) : (
                  <span className="text-[11px] opacity-80">{completedCount}/5</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
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
      <div className="scenario-intro-header">
        <div className="scenario-intro-badge">
          <Compass size={14} className="text-primary" aria-hidden="true" />
          <span>SCENARIO BRIEFING</span>
        </div>
        <span className="scenario-intro-hint">Inspect the communication below before deciding</span>
      </div>
      <p className="scenario-intro-text">{introText}</p>
    </section>
  );
}

// =========================================================================
// SECTION C: REALISTIC UNIVERSITY EMAIL SIMULATOR COMPONENT
// =========================================================================

// =========================================================================
// SECTION C: REALISTIC COMMUNICATION SIMULATORS (MSG, CALL & EMAIL)
// =========================================================================

interface UniversityEmailSimulatorProps {
  emailData: EmailMetadata;
}

// -------------------------------------------------------------------------
// 1. SMARTPHONE VOICE CALL & VISHING SIMULATOR (CALL TYPE)
// -------------------------------------------------------------------------
export function SmartphoneCallSimulator({ emailData }: { emailData: EmailMetadata }) {
  const [headersExpanded, setHeadersExpanded] = useState<boolean>(false);
  const [linkHovered, setLinkHovered] = useState<boolean>(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState<boolean>(false);

  return (
    <section
      className="smartphone-call-simulator-card"
      role="region"
      aria-label="Interactive Phone Call & Voice Phishing (Vishing) Simulator"
    >
      {/* Mobile Status Bar */}
      <div className="call-sim-top-bar">
        <div className="call-carrier-info">
          <Signal size={12} className="text-emerald" aria-hidden="true" />
          <span className="carrier-name">DIALOG 5G</span>
          <Wifi size={12} className="text-cyan" aria-hidden="true" />
        </div>

        {/* Live Call Telemetry Badge */}
        <div className="call-status-pill">
          <span className="call-pulse-green" aria-hidden="true" />
          <span className="font-mono">{emailData.callStatus || "Call Connected · 00:48"}</span>
        </div>

        <div className="call-sim-time font-mono">
          <Clock size={12} aria-hidden="true" />
          <span>{emailData.timestamp}</span>
        </div>
      </div>

      {/* Caller Identity Section */}
      <div className="call-caller-profile-section">
        <div className="call-avatar-wrapper">
          <div className="call-avatar-circle" aria-hidden="true">
            <PhoneIncoming size={32} className="text-cyan" />
          </div>
          <div className="call-avatar-pulse-ring" aria-hidden="true" />
        </div>

        <div className="call-caller-meta">
          <span className="call-type-badge">
            <Radio size={12} className="text-amber" aria-hidden="true" />
            <span>{emailData.channelTitle || "INCOMING VOICE CALL (VISHING)"}</span>
          </span>
          <h2 className="call-display-name">{emailData.senderName}</h2>
          <div className="call-phone-number font-mono">
            {emailData.phoneNumber || "+94 11 234 5678"}
          </div>
          <span className="call-dept-tag text-muted">{emailData.department}</span>
        </div>

        {/* Expandable Telecom & Caller ID Header Inspector */}
        <button
          type="button"
          className="call-inspect-telecom-btn"
          onClick={() => setHeadersExpanded(!headersExpanded)}
          aria-expanded={headersExpanded}
          aria-label="Inspect Telecom Routing & Caller ID Spoofing Headers"
        >
          <Info size={13} aria-hidden="true" />
          <span>{headersExpanded ? "Hide Caller ID Telemetry" : "Inspect Caller ID Telemetry"}</span>
          <ChevronDown
            size={13}
            className={`chevron-icon transition-transform ${headersExpanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Expandable Telecom Inspection Drawer */}
      {headersExpanded && (
        <div className="call-telecom-headers-drawer" role="region" aria-label="Telecom & VoIP Route Inspection">
          <div className="rfc-header-title">
            <ShieldAlert size={13} className="text-amber" aria-hidden="true" />
            <span>VoIP Gateway &amp; Caller ID Spoofing Telemetry</span>
          </div>
          <pre className="rfc-code-block font-mono">
{`Inbound-Caller-ID: ${emailData.phoneNumber || "+94 11 234 5678"} (Purported Campus Line)
Originating-SIP-Trunk: sip:relay@${emailData.rfcHeaders.dkimDomain}
VoIP-Gateway-IP: [${emailData.rfcHeaders.originatingIp}]
CLI-Spoofing-Risk: HIGH · Caller ID unauthenticated by originating carrier
SIP-Authentication: ${emailData.rfcHeaders.spfResult}
Call-Session-ID: ${emailData.rfcHeaders.messageId}`}
          </pre>
        </div>
      )}

      {/* Live Audio Waveform Animation */}
      <div className="call-audio-visualizer-container" aria-label="Audio Stream Waveform">
        <div className="audio-live-tag">
          <Volume2 size={13} className="text-cyan animate-pulse" aria-hidden="true" />
          <span>LIVE AUDIO WAVEFORM</span>
        </div>
        <div className="waveform-bars-row" aria-hidden="true">
          {[40, 75, 55, 90, 60, 30, 85, 100, 65, 45, 95, 70, 80, 50, 88, 62, 40, 75, 90, 55].map((h, i) => (
            <span
              key={i}
              className="waveform-bar"
              style={{
                height: `${h}%`,
                animationDelay: `${(i * 0.12).toFixed(2)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Spoken Dialogue Transcript Box */}
      <div className="call-transcript-card">
        <div className="transcript-head">
          <Mic size={14} className="text-emerald" aria-hidden="true" />
          <strong>Caller Audio Transcript:</strong>
        </div>
        <div className="transcript-body">
          {(emailData.callAudioTranscript || emailData.bodyParagraphs).map((paragraph, pIdx) => (
            <p key={pIdx} className="call-transcript-p">
              &ldquo;{paragraph.replace(/^Dear (Student|Candidate|Undergraduate)[,\.]?\s*/i, "")}&rdquo;
            </p>
          ))}
        </div>

        {/* Action Link Demand if caller directed user to a website */}
        {emailData.linkCta && (
          <div className="call-action-link-box">
            <span className="link-intro-label">Link mentioned by caller during phone call:</span>
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

            {linkHovered && (
              <div className="safe-link-inspection-tooltip" role="tooltip">
                <div className="tooltip-head">
                  <ShieldCheck size={13} className="text-primary" aria-hidden="true" />
                  <strong>Simulated Link Destination (Safe Inspection)</strong>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-key">Full Destination URL:</span>
                  <code className="tooltip-url font-mono">{emailData.linkCta.destinationUrl}</code>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-key">Actual Root Host Domain:</span>
                  <strong className="tooltip-host text-primary">{emailData.linkCta.hostDomain}</strong>
                </div>
                {emailData.linkCta.legitDomain && (
                  <div className="tooltip-row">
                    <span className="tooltip-key">Official Campus Domain:</span>
                    <strong className="tooltip-legit text-emerald">{emailData.linkCta.legitDomain}</strong>
                  </div>
                )}
                <small className="tooltip-disclaimer text-muted">
                  Note: All links remain safely contained inside the Cyber Campus research simulation platform.
                </small>
              </div>
            )}
          </div>
        )}

        {/* File transferred during call if applicable (e.g. PH04) */}
        {emailData.attachment && (
          <div className="call-action-attachment-box">
            <div className="attachment-icon-tile">
              <FileText size={24} className="text-amber" aria-hidden="true" />
            </div>
            <div className="attachment-details">
              <span className="attachment-label">File transferred during call:</span>
              <strong className="attachment-filename">{emailData.attachment.name}</strong>
              <span className="attachment-size text-muted">
                {emailData.attachment.size} · {emailData.attachment.type}
              </span>
            </div>
            <button
              type="button"
              className="button secondary small"
              onClick={() => setAttachmentModalOpen(true)}
              aria-label="Inspect file properties safely"
            >
              <Search size={14} aria-hidden="true" />
              <span>Inspect File Properties</span>
            </button>
          </div>
        )}
      </div>

      {/* In-Call Controls Bar (Aesthetic) */}
      <div className="call-controls-bar" aria-hidden="true">
        <div className="call-action-circle muted" title="Mute Microphone">
          <Mic size={18} />
          <span>Mute</span>
        </div>
        <div className="call-action-circle muted" title="Keypad">
          <Activity size={18} />
          <span>Keypad</span>
        </div>
        <div className="call-action-circle active" title="Speaker Active">
          <Volume2 size={18} />
          <span>Speaker</span>
        </div>
        <div className="call-action-circle decline" title="End Call">
          <PhoneOff size={18} />
          <span>End Call</span>
        </div>
      </div>

      {/* Attachment Inspection Modal */}
      {attachmentModalOpen && emailData.attachment && (
        <div className="modal-backdrop" onClick={() => setAttachmentModalOpen(false)} role="presentation">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <div className="modal-title-group">
                <AlertTriangle size={18} className="text-amber" aria-hidden="true" />
                <h3 className="modal-title">File Security Inspection</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setAttachmentModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="modal-body font-mono text-sm">
              <div className="grid gap-2">
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

// -------------------------------------------------------------------------
// 2. MOBILE MESSAGE / SMS / CHAT SIMULATOR (MSG TYPE)
// -------------------------------------------------------------------------
export function MobileMessageSimulator({ emailData }: { emailData: EmailMetadata }) {
  const [headersExpanded, setHeadersExpanded] = useState<boolean>(false);
  const [linkHovered, setLinkHovered] = useState<boolean>(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState<boolean>(false);

  return (
    <section
      className="mobile-message-simulator-card"
      role="region"
      aria-label="Interactive Mobile Messaging & SMS Simulation"
    >
      {/* Mobile Messenger Top Header Bar */}
      <div className="msg-sim-top-bar">
        <div className="msg-nav-left">
          <span className="msg-back-arrow" aria-hidden="true">
            <ArrowLeft size={16} />
          </span>
          <div className="msg-contact-avatar" aria-hidden="true">
            <span>{emailData.senderInitials}</span>
          </div>
          <div className="msg-contact-info">
            <div className="msg-contact-name-row">
              <h2 className="msg-contact-name">{emailData.senderName}</h2>
              <span className="msg-verified-pill">
                <Smartphone size={10} aria-hidden="true" />
                <span>{emailData.messagePlatform?.toUpperCase() || "SMS"}</span>
              </span>
            </div>
            <span className="msg-contact-number font-mono">
              {emailData.phoneNumber || emailData.senderEmail}
            </span>
          </div>
        </div>

        <div className="msg-nav-right">
          <button
            type="button"
            className="msg-inspect-route-btn"
            onClick={() => setHeadersExpanded(!headersExpanded)}
            aria-expanded={headersExpanded}
            aria-label="Inspect SMS Gateway & Sender Routing"
          >
            <Info size={13} aria-hidden="true" />
            <span>{headersExpanded ? "Hide Route Info" : "Inspect Route"}</span>
            <ChevronDown
              size={13}
              className={`chevron-icon transition-transform ${headersExpanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Expandable SMS / Telecom Route Drawer */}
      {headersExpanded && (
        <div className="msg-route-headers-drawer" role="region" aria-label="SMS Routing & Gateway Telemetry">
          <div className="rfc-header-title">
            <Shield size={13} className="text-primary" aria-hidden="true" />
            <span>SMS Gateway &amp; Originating Route Telemetry</span>
          </div>
          <pre className="rfc-code-block font-mono">
{`Sender-Number: ${emailData.phoneNumber || emailData.senderEmail}
SMS-Gateway-Trunk: ${emailData.rfcHeaders.returnPath}
Authentication-Status: ${emailData.rfcHeaders.spfResult}
Destination-Protocol: SMPP/HTTP Gateway v2.4
Originating-IP: [${emailData.rfcHeaders.originatingIp}]
Carrier-Message-ID: ${emailData.rfcHeaders.messageId}`}
          </pre>
        </div>
      )}

      {/* Chat / SMS Conversation Thread Area */}
      <div className="msg-conversation-stage">
        {/* Date Timestamp Divider */}
        <div className="msg-date-divider" aria-hidden="true">
          <span>{emailData.timestamp} · Cellular Messaging Channel</span>
        </div>

        {/* Incoming Message Bubble */}
        <div className="msg-incoming-bubble-wrapper">
          <div className="msg-bubble incoming">
            <div className="msg-sender-header-tag">
              <span className="sender-tag-text">{emailData.department}</span>
            </div>

            <div className="msg-body-content">
              {emailData.bodyParagraphs.map((paragraph, pIdx) => (
                <p key={pIdx} className="msg-body-p">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Interactive Link Preview Card inside the message bubble */}
            {emailData.linkCta && (
              <div className="msg-link-preview-box">
                <div className="msg-link-card-inner">
                  <div className="msg-link-badge">
                    <ExternalLink size={14} className="text-primary" aria-hidden="true" />
                    <span>Attached Link Destination</span>
                  </div>
                  <div className="msg-link-url font-mono">{emailData.linkCta.destinationUrl}</div>

                  <button
                    type="button"
                    className="simulated-safe-link-btn msg-link-btn"
                    onMouseEnter={() => setLinkHovered(true)}
                    onMouseLeave={() => setLinkHovered(false)}
                    onClick={() => setLinkHovered(!linkHovered)}
                    aria-label="Inspect destination link safely"
                  >
                    <Search size={14} aria-hidden="true" />
                    <span>{emailData.linkCta.buttonText}</span>
                  </button>
                </div>

                {linkHovered && (
                  <div className="safe-link-inspection-tooltip msg-tooltip" role="tooltip">
                    <div className="tooltip-head">
                      <ShieldCheck size={13} className="text-primary" aria-hidden="true" />
                      <strong>Simulated Link Destination (Safe Inspection)</strong>
                    </div>
                    <div className="tooltip-row">
                      <span className="tooltip-key">Full Destination URL:</span>
                      <code className="tooltip-url font-mono">{emailData.linkCta.destinationUrl}</code>
                    </div>
                    <div className="tooltip-row">
                      <span className="tooltip-key">Actual Root Host Domain:</span>
                      <strong className="tooltip-host text-primary">{emailData.linkCta.hostDomain}</strong>
                    </div>
                    {emailData.linkCta.legitDomain && (
                      <div className="tooltip-row">
                        <span className="tooltip-key">Official Campus Domain:</span>
                        <strong className="tooltip-legit text-emerald">{emailData.linkCta.legitDomain}</strong>
                      </div>
                    )}
                    <small className="tooltip-disclaimer text-muted">
                      Note: All links remain safely contained inside the Cyber Campus research simulation platform.
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* Attachment Card if applicable */}
            {emailData.attachment && (
              <div className="msg-attachment-box">
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
                  <span>Inspect File</span>
                </button>
              </div>
            )}

            {/* Message Delivery Checkmarks */}
            <div className="msg-meta-footer" aria-hidden="true">
              <span className="msg-time-pill">{emailData.timestamp.split(",")[1] || emailData.timestamp}</span>
              <CheckCheck size={14} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Message Input Draft Placeholder */}
      <div className="msg-input-draft-bar" aria-hidden="true">
        <div className="msg-input-action-icon">
          <Paperclip size={18} className="text-muted" />
        </div>
        <div className="msg-input-fake-field">
          <span className="placeholder-text">Select investigation response on right console...</span>
        </div>
        <div className="msg-send-action-btn">
          <Send size={15} />
        </div>
      </div>

      {/* Attachment Inspection Modal */}
      {attachmentModalOpen && emailData.attachment && (
        <div className="modal-backdrop" onClick={() => setAttachmentModalOpen(false)} role="presentation">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <div className="modal-title-group">
                <AlertTriangle size={18} className="text-amber" aria-hidden="true" />
                <h3 className="modal-title">File Security Inspection</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setAttachmentModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="modal-body font-mono text-sm">
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

// -------------------------------------------------------------------------
// 3. CLASSIC WEBMAIL SIMULATOR (EMAIL TYPE)
// -------------------------------------------------------------------------
export function WebmailSimulator({ emailData }: { emailData: EmailMetadata }) {
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
          <div className="email-sim-title-group">
            <Lock size={12} className="text-emerald" aria-hidden="true" />
            <span className="email-sim-client-name">
              Campus Webmail · Secure Student Inbox
            </span>
          </div>
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
        <span className="subject-prefix-tag">SUBJECT</span>
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

// -------------------------------------------------------------------------
// 4. UNIFIED COMMUNICATION SIMULATOR SWITCHER
// -------------------------------------------------------------------------
export function UniversityEmailSimulator({ emailData }: UniversityEmailSimulatorProps) {
  if (emailData.communicationType === "call") {
    return <SmartphoneCallSimulator emailData={emailData} />;
  }
  if (emailData.communicationType === "message") {
    return <MobileMessageSimulator emailData={emailData} />;
  }
  return <WebmailSimulator emailData={emailData} />;
}

export const CyberCommunicationSimulator = UniversityEmailSimulator;

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
      className="action-selection-section space-y-3"
      role="region"
      aria-label="Your Call Decision"
    >
      <div className="action-selection-heading space-y-1">
        <div className="action-selection-eyebrow text-[11px] font-bold tracking-widest text-slate-500 uppercase">
          YOUR CALL
        </div>
        <h2 className="action-selection-title text-2xl font-bold text-slate-900 dark:text-slate-100">
          What would you do?
        </h2>
        <p className="action-selection-sub text-sm text-slate-500">
          Choose the action closest to what you would actually do.
        </p>
      </div>

      {/* Accessible Interactive Selection Cards (A, B, C, D) */}
      <div
        className="interactive-action-cards-grid space-y-2.5 pt-1"
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
              className={`interactive-action-card w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                isSelected
                  ? "selected border-[#21434a] ring-2 ring-[#21434a]/15 bg-[#21434a]/5"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
              onClick={() => onSelectChoice(choice.id)}
            >
              {/* Option Letter Badge (A, B, C, D) */}
              <div
                className={`action-letter-badge w-7 h-7 rounded-md border font-semibold text-xs flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-[#21434a] text-white border-[#21434a]"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
                aria-hidden="true"
              >
                {letter}
              </div>

              {/* Action Description */}
              <div className="action-text-content flex-1">
                <span className="action-label-text text-sm font-medium text-slate-800 dark:text-slate-200">
                  {choice.label}
                </span>
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
    <div className="next-challenge-controls-panel space-y-2 pt-2">
      {/* Friendly Error Banner with Retry */}
      {error && (
        <div className="challenge-error-alert p-2.5 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center justify-between" role="alert">
          <div className="error-alert-text flex items-center gap-1.5">
            <AlertCircle size={15} className="text-red shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="text-red font-medium underline"
            onClick={onAdvance}
            disabled={isSubmitting}
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Action Button: Lock decision & continue */}
      <button
        type="button"
        className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
          !hasSelectedAnswer || isSubmitting
            ? "bg-[#97abad] cursor-not-allowed opacity-80"
            : "bg-[#708a8e] hover:bg-[#21434a] cursor-pointer"
        }`}
        disabled={!hasSelectedAnswer || isSubmitting}
        onClick={onAdvance}
        aria-label="Lock decision and continue"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            <span>Locking decision…</span>
          </>
        ) : (
          <>
            <span>Lock decision &amp; continue</span>
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="text-[11px] text-center text-slate-400 mt-2 leading-normal">
        Your actual choice is recorded. Explanations appear after final submission.
      </p>
    </div>
  );
}
