import "server-only";
import type { Scenario, AnswerKey, Evidence, ScenarioChoice, InteractionType } from "@/lib/types";
import { missions, SCENARIO_VERSION } from "./missions";

export interface ScenarioDefinitionRaw {
  id: string;
  title: string;
  situation: string;
  senderName: string;
  senderAddress: string;
  message: string;
  interaction: InteractionType;
  evidence: Evidence[];
  choices: ScenarioChoice[];
  mediaDetails?: Scenario["mediaDetails"];
  correctAction: string;
  explanation: string;
  consequence: string;
  sensitiveDataAtStake: string;
  disclosedCategory: string;
  proceedRiskScore: number;
}

const scenarioDefinitions: ScenarioDefinitionRaw[] = [
  // =========================================================================
  // IV1: PHISHING INVESTIGATION (PH01 - PH05)
  // =========================================================================
  {
    id: "PH01",
    title: "Action required: keep your student account active",
    situation: "You receive an email claiming to be from Lakview Student Services stating your student records system is being updated and your account must be confirmed within two hours to avoid an interruption to your learning portal.",
    senderName: "Lakview Student Services",
    senderAddress: "support@lakview-account.test",
    message: "Our student records system is being updated. To avoid an interruption to your learning portal, please confirm your account within the next two hours. Use the secure verification button below to complete this short process.",
    interaction: "email",
    evidence: [
      {
        label: "Sender Address Domain",
        detail: "The sender display name is 'Lakview Student Services', but the actual address is support@lakview-account.test. Legitimate campus services write only from verified institutional domains.",
        kind: "sender",
      },
      {
        label: "Preview Link Destination",
        detail: "The verification button links to https://lakview-account.example/verify-student. The actual domain is lakview-account.example, not an authentic university portal.",
        kind: "link",
        url: "https://lakview-account.example/verify-student",
        displayText: "Verify student account",
      },
      {
        label: "Artificial Urgency Deadline",
        detail: "The email imposes a strict 2-hour deadline to avoid portal interruption, creating false panic to discourage verification.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "proceed",
        label: "Open the link immediately",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Account Credentials",
      },
      {
        id: "verify",
        label: "Check the sender and link first",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "reply",
        label: "Reply to the email",
        privacyRiskScore: 2,
        unsafe: true,
        disclosedInfoCategory: "Email Communication",
      },
      {
        id: "ignore",
        label: "Ignore all emails",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
    ],
    mediaDetails: {
      destinationUrl: "https://lakview-account.example/verify-student",
      hostDomain: "lakview-account.example",
      legitDomain: "lakview.edu.example",
      warningIndicators: ["Domain mismatch (.test vs official university domain)", "2-hour deadline urgency", "Credential harvesting link"],
    },
    correctAction: "verify",
    explanation: "The sender address uses an unverified external domain (lakview-account.test) rather than official campus infrastructure, and applies artificial urgency to steal account credentials.",
    consequence: "Clicking unverified links and disclosing university login details grants malicious actors access to private academic records and portals.",
    sensitiveDataAtStake: "Student Single Sign-On credentials and personal academic account access.",
    disclosedCategory: "Account Credentials",
    proceedRiskScore: 4,
  },

  {
    id: "PH02",
    title: "Scholarship SMS Trap",
    situation: "An unexpected SMS notification arrives on your mobile phone claiming you have been approved for a national university welfare grant of LKR 85,000.",
    senderName: "GrantOffice-SL",
    senderAddress: "+94 77 000 1234",
    message: "Ministry Welfare Grant: Your higher education bursary of LKR 85,000 is approved. To disburse funds to your bank account, submit your National Identity Card (NIC) number and bank debit card number at short.campus-welfare.example/edu-grant-26.",
    interaction: "sms",
    evidence: [
      {
        label: "Shortened URL Preview",
        detail: "The message uses a shortened link (short.campus-welfare.example/edu-grant-26) which masks the true external destination. You have not submitted any recent bursary application.",
        kind: "link",
        url: "https://short.campus-welfare.example/edu-grant-26",
        displayText: "Claim Welfare Grant LKR 85,000",
      },
      {
        label: "Sensitive Financial Request",
        detail: "Legitimate student welfare payments require your bank account branch and account number for direct bank transfer, NEVER your 16-digit debit card number or card security details.",
        kind: "information",
      },
      {
        label: "Independent Grant Schedule",
        detail: "The University Financial Aid Board website publishes all approved recipient lists on its official portal noticeboard with no SMS verification step.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Verify scholarship details independently on the official campus financial aid portal",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the SMS scam number to campus telecom welfare advisory",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the SMS without clicking the shortened link",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by following the link and submitting your NIC and debit card details",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Financial & National Identity",
      },
    ],
    mediaDetails: {
      destinationUrl: "https://short.campus-welfare.example/edu-grant-26",
      warningIndicators: ["Shortened untrusted link", "Debit card request", "Unsolicited cash grant"],
    },
    correctAction: "verify",
    explanation: "Unsolicited scholarship notices with shortened links requesting debit card numbers are fraudulent lures designed to steal banking funds and identity documents.",
    consequence: "Sharing payment card numbers and NIC scans leads directly to unauthorized financial withdrawals and identity theft.",
    sensitiveDataAtStake: "Debit card number, CVV, and National Identity Card number.",
    disclosedCategory: "Financial & National Identity",
    proceedRiskScore: 4,
  },

  {
    id: "PH03",
    title: "QR Code Security Challenge",
    situation: "A printed flyer posted on the university cafeteria bulletin board advertises 'National Student Tech Festival — Free Passes & Pizza Vouchers'. It contains a prominent QR code for quick mobile registration.",
    senderName: "Campus Tech Society (Purported)",
    senderAddress: "cafeteria-board-poster",
    message: "SCAN TO CLAIM: Scan QR code with your smartphone camera to register for National Student Tech Fest 2026. The first 100 students receive a free LKR 2,000 food voucher! Login with your university student email and password to auto-fill registration.",
    interaction: "qr",
    evidence: [
      {
        label: "Simulated QR Destination Breakdown",
        detail: "Decoding the QR code reveals: https://campus-techfest.event-ticket-claim.example/login. The root domain is event-ticket-claim.example. Legitimate university societies host events on campus.example.",
        kind: "link",
        url: "https://campus-techfest.event-ticket-claim.example/login",
        displayText: "Event Registration Gateway",
      },
      {
        label: "Excessive Permission Demand",
        detail: "The event page demands university student email and portal password merely to generate an event ticket.",
        kind: "information",
      },
      {
        label: "Student Union Registry",
        detail: "The Student Affairs Union verified society list shows that the actual Tech Society holds events in November, and their official contact email is tech@soc.campus.example.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Verify event registration independently via the Student Affairs society directory",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the unauthorized poster and fraudulent QR link to campus security",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the poster without scanning the code or entering data",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by scanning the QR code and entering your university portal login",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Account Credentials",
      },
    ],
    mediaDetails: {
      destinationUrl: "https://campus-techfest.event-ticket-claim.example/login",
      hostDomain: "event-ticket-claim.example",
      legitDomain: "soc.campus.example",
      warningIndicators: ["Physical quishing poster", "Credential request for tickets", "Lookalike domain"],
    },
    correctAction: "verify",
    explanation: "Physical posters with QR codes are increasingly used in quishing attacks. Always inspect the destination domain and never provide portal passwords on third-party event forms.",
    consequence: "Entering university credentials on unverified QR destinations compromises student accounts and personal data.",
    sensitiveDataAtStake: "Student Single Sign-On credentials and personal contact information.",
    disclosedCategory: "Account Credentials",
    proceedRiskScore: 4,
  },

  {
    id: "PH04",
    title: "Dangerous Email Attachment",
    situation: "You receive an email from an international talent scouting agency offering an internship with an IT firm in Colombo. The email includes a compressed file titled 'Offer_Letter_and_Terms.pdf.exe'.",
    senderName: "Global Talent Recruiters",
    senderAddress: "offers@career-network-internships.example",
    message: "Dear Candidate, Your profile was selected from the undergraduate database for a paid remote software internship (LKR 75,000/mo). Review your confidential offer letter and internship terms in the attached document.",
    interaction: "attachment",
    evidence: [
      {
        label: "Attachment Extension Properties",
        detail: "The attachment is named 'Offer_Letter_and_Terms.pdf.exe'. The true file extension is .exe (an executable program), disguised with a PDF icon and a double extension.",
        kind: "information",
      },
      {
        label: "Recruiter Origin Verification",
        detail: "The sender address is career-network-internships.example. The university Career Guidance Unit has no record of this recruitment partner.",
        kind: "sender",
      },
      {
        label: "System Security Warning",
        detail: "Operating systems execute .exe files directly, allowing arbitrary malicious code execution, credential scrapers, or spyware to install without authorization.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "report",
        label: "Withhold details, do not open the file, and report the message to campus IT security",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "verify",
        label: "Verify the recruiter with the campus Career Guidance Unit before touching attachments",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore and delete the message without opening the executable",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by downloading and opening the executable file to view the offer letter",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Full Device Access & Credentials",
      },
    ],
    mediaDetails: {
      attachmentName: "Offer_Letter_and_Terms.pdf.exe",
      attachmentSize: "2.4 MB",
      attachmentType: "application/x-msdownload",
      warningIndicators: ["Double file extension (.pdf.exe)", "Unsolicited executive attachment", "Unverified recruiter"],
    },
    correctAction: "report",
    explanation: "Attackers frequently append .pdf.exe to fool users into executing malware that steals stored browser passwords and session tokens.",
    consequence: "Executing malicious software compromises local files, web session cookies, and stored university credentials.",
    sensitiveDataAtStake: "All stored browser passwords, session tokens, and local personal files.",
    disclosedCategory: "Full Device Access & Credentials",
    proceedRiskScore: 4,
  },

  {
    id: "PH05",
    title: "Fake Student Login Portal",
    situation: "While studying in the university computer lab, you receive a link via chat: 'Urgent exam hall seating allocation updated — check your designated room'. Two browser views appear.",
    senderName: "Examination Portal Sync",
    senderAddress: "exams@campus-exam-portal.example",
    message: "View your final examination room assignment immediately. Check the address bar carefully before entering your student credentials.",
    interaction: "dual_browser",
    evidence: [
      {
        label: "Browser View A (Legitimate Portal)",
        detail: "URL: https://portal.campus.example/exams/schedule. TLS certificate issued to 'Serendib University Higher Education'. Requires only normal student login.",
        kind: "certificate",
        url: "https://portal.campus.example/exams/schedule",
        displayText: "Official Campus Portal",
      },
      {
        label: "Browser View B (Deceptive Replica)",
        detail: "URL: https://portal-campus.account-auth.example/exam-login. Free short-term certificate issued to unknown entity. Form requests: Student ID, Password, and Personal NIC number.",
        kind: "link",
        url: "https://portal-campus.account-auth.example/exam-login",
        displayText: "External Replica Portal",
      },
      {
        label: "Examination Office Notice",
        detail: "The Examination Office always posts exam seatings inside the existing bookmarked portal. No separate portal or NIC verification is ever required.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Sign in exclusively through the independently verified portal (portal.campus.example)",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the lookalike portal URL to university network administrators",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the link and close the deceptive browser window",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by entering student credentials and NIC on the replica site",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Account Credentials & NIC",
      },
    ],
    mediaDetails: {
      hostDomain: "account-auth.example",
      legitDomain: "campus.example",
      warningIndicators: ["Domain typosquatting", "Extra personal fields (NIC)", "Untrusted certificate entity"],
    },
    correctAction: "verify",
    explanation: "Comparing domain names and TLS certificate identities exposes deceptive replicas. Legitimate university services never redirect authentication to third-party domains.",
    consequence: "Logging into a cloned portal delivers student credentials directly to malicious actors.",
    sensitiveDataAtStake: "Student login password and National Identity Card number.",
    disclosedCategory: "Account Credentials & NIC",
    proceedRiskScore: 4,
  },

  // =========================================================================
  // IV2: PRETEXTING DETECTION (PT01 - PT05)
  // =========================================================================
  {
    id: "PT01",
    title: "Fake IT Support Chat",
    situation: "A live chat dialog opens inside your campus browser window from an individual identifying as 'Helpdesk Engineer Chaminda'. They claim your account is generating server errors.",
    senderName: "Helpdesk Engineer Chaminda",
    senderAddress: "support-live@campus-it-helpdesk.example",
    message: "Hello, I am from the central server team. We are performing database maintenance on undergraduate accounts. Your session is throwing sync errors. Please provide your current password so I can manually re-index your permissions before the 6:00 PM cutoff.",
    interaction: "chat",
    evidence: [
      {
        label: "Support Desk Protocol",
        detail: "University IT technicians have administrative backend tools to reset accounts and never require a user's plaintext password for server maintenance.",
        kind: "context",
      },
      {
        label: "Psychological Coercion",
        detail: "The agent applies artificial deadline pressure ('6:00 PM cutoff') to bypass rational verification and security policies.",
        kind: "information",
      },
      {
        label: "Official Verification Channel",
        detail: "The campus directory lists IT Support Helpdesk as ext. 4100 or helpdesk@campus.example, located at the IT Center Building.",
        kind: "profile",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Refuse to share passwords; disconnect and contact official IT Helpdesk at the IT Center",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I will contact the verified IT helpdesk directly at the IT Center building. I never share passwords over chat.",
      },
      {
        id: "report",
        label: "Report the unauthorized password solicitation attempt to campus security",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I am reporting this chat session to IT Security immediately.",
      },
      {
        id: "ignore",
        label: "Close the chat window without responding to the agent",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I am closing this chat.",
      },
      {
        id: "proceed",
        label: "Proceed by providing your password to the agent to prevent account cutoff",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Account Password",
        reply: "Here is my password so you can complete the database re-indexing before the cutoff.",
      },
    ],
    mediaDetails: {
      warningIndicators: ["Password request via chat", "Artificial urgency", "False administrative pretext"],
    },
    correctAction: "verify",
    explanation: "Legitimate IT support personnel never ask for passwords. Pretexting relies on authority claims and urgent scenarios to manipulate respondents into disclosing credentials.",
    consequence: "Yielding a password grants the pretexting attacker full control of your student profile and academic correspondence.",
    sensitiveDataAtStake: "Student account password.",
    disclosedCategory: "Account Password",
    proceedRiskScore: 4,
  },

  {
    id: "PT02",
    title: "Library Fine Emergency",
    situation: "You receive an urgent notification message claiming to be from 'Assistant Librarian Perera' stating you have an unreturned reserve book and an escalating overdue penalty.",
    senderName: "Assistant Librarian Perera",
    senderAddress: "fines@campus-library-circulation.example",
    message: "NOTICE OF ACADEMIC HOLD: You have an overdue library book 'Advanced Software Architecture' with an accumulated penalty of LKR 4,200. Settle immediately via credit card or transfer to prevent suspension of your library borrowing privileges and semester registration.",
    interaction: "notification",
    evidence: [
      {
        label: "Personal Borrowing Record",
        detail: "You checked your official bookmarked library circulation account: no books are overdue and your account balance is LKR 0.00.",
        kind: "context",
      },
      {
        label: "Escalating Financial Demands",
        detail: "The message requests direct credit card numbers or unverified money transfers rather than official campus cashier receipts.",
        kind: "information",
      },
      {
        label: "Library Cashier Policy",
        detail: "University library fines are payable exclusively at the Main Library cashier counter or through the central Bursar student payment gateway.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Visit the Main Library circulation counter in person to verify your borrowing status",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I will visit the Main Library circulation desk in person with my student ID to check my records.",
      },
      {
        id: "report",
        label: "Report the fraudulent fee demand message to the Chief Librarian",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I am forwarding this message to the Chief Librarian's office.",
      },
      {
        id: "ignore",
        label: "Ignore the notice without sending any personal payment information",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I will disregard this unverified message.",
      },
      {
        id: "proceed",
        label: "Proceed by providing credit card details or bank transfer to settle the alleged fine",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Financial Payment Cards",
        reply: "Here are my card details to pay the LKR 4,200 fine and clear the hold.",
      },
    ],
    mediaDetails: {
      warningIndicators: ["Disputed loan record", "Alternative payment channel", "Academic hold threat"],
    },
    correctAction: "verify",
    explanation: "Pretexters fabricate urgent administrative penalties to trigger panic. Independent verification through physical campus counters or bookmarked portals exposes the false narrative.",
    consequence: "Disclosing payment card details or identity documents exposes participants to unauthorized financial debits.",
    sensitiveDataAtStake: "Credit/debit card numbers and student identification records.",
    disclosedCategory: "Financial Payment Cards",
    proceedRiskScore: 4,
  },

  {
    id: "PT03",
    title: "Student Registration Verification",
    situation: "A communication arrives purportedly from the 'University Registrar Office' stating that due to a Ministry census, all current undergraduates must submit confidential biographical records.",
    senderName: "Registrar Academic Census Desk",
    senderAddress: "census@university-records-gov.example",
    message: "MANDATORY STATUTORY CENSUS: Under Regulation 14-B of Higher Education, submit your full National Identity Card number, mother's maiden name, and home permanent address for student record re-enrollment.",
    interaction: "admin_portal",
    evidence: [
      {
        label: "Excessive Biographical Questions",
        detail: "Mother's maiden name and personal family background are classic account-recovery security question answers, not standard enrollment verification fields.",
        kind: "information",
      },
      {
        label: "External Sender Domain",
        detail: "The sender domain is university-records-gov.example instead of the legitimate university domain campus.example.",
        kind: "sender",
      },
      {
        label: "Official Academic Calendar",
        detail: "The university registrar website shows no ongoing mid-semester census or requirement to re-submit identity verification documents.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Verify census circulars through official Dean's Office channels and student portal",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the unauthorized data-gathering portal to university administration",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the notice without submitting sensitive biographical records",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by submitting your NIC, mother's maiden name, and permanent home address",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "NIC, Family Details & Security Questions",
      },
    ],
    mediaDetails: {
      legitDomain: "campus.example",
      hostDomain: "university-records-gov.example",
      warningIndicators: ["Security questions harvesting", "False regulatory pretext", "Non-university domain"],
    },
    correctAction: "verify",
    explanation: "Pretexting attacks often impersonate bureaucratic regulatory bodies to solicit identity attributes that can be used to reset passwords and bypass security verification.",
    consequence: "Disclosing mother's maiden name, NIC, and birth details allows attackers to pass automated account recovery challenges.",
    sensitiveDataAtStake: "National Identity Card, mother's maiden name (security question answer), and permanent address.",
    disclosedCategory: "NIC, Family Details & Security Questions",
    proceedRiskScore: 4,
  },

  {
    id: "PT04",
    title: "Network Maintenance Request",
    situation: "A message appears in an instant messaging group from a person claiming to be a 'Campus Network NOC Engineer'. They state that dormitory Wi-Fi 6 routers are being upgraded.",
    senderName: "Campus NOC Engineer Sunimal",
    senderAddress: "+94 71 888 4321",
    message: "Hostel Wi-Fi Upgrade Notice: We are configuring the new access points in Block B. A 6-digit verification code was just sent to your phone via SMS. Please forward the code to me here immediately to ensure your laptop remains authorized on campus Wi-Fi.",
    interaction: "tech_support",
    evidence: [
      {
        label: "Incoming SMS Inspection",
        detail: "The SMS received on your phone reads: 'Your University SSO Two-Factor Auth code is 492-810. Do not share this code with anyone, including university staff.'",
        kind: "information",
      },
      {
        label: "Authentication Bypass Tactic",
        detail: "The attacker has likely entered your username on the campus portal and is attempting to trick you into supplying the 2FA token needed to complete unauthorized access.",
        kind: "context",
      },
      {
        label: "Network Access Policy",
        detail: "Campus Wi-Fi authentication uses standard 802.1X certificates or student usernames; engineers never need two-factor authentication codes to reconfigure routers.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "report",
        label: "Withhold the code, change your password, and report attempted account takeover to IT Security",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I will never share two-factor authentication codes. I am reporting this incident to IT Security immediately.",
      },
      {
        id: "verify",
        label: "Verify Wi-Fi maintenance announcements with the campus IT Operations center",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I will verify any Wi-Fi maintenance directly with the IT center.",
      },
      {
        id: "ignore",
        label: "Ignore the chat message without forwarding any verification code",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I will not share any verification code.",
      },
      {
        id: "proceed",
        label: "Proceed by forwarding the 6-digit SMS verification code to the technician",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "2FA / Multi-Factor Code",
        reply: "The verification code received on my phone is 492-810.",
      },
    ],
    mediaDetails: {
      warningIndicators: ["2FA interception", "Router upgrade pretext", "Urgent technical threat"],
    },
    correctAction: "report",
    explanation: "Two-factor authentication codes are confidential verification tokens. Pretexters use network maintenance stories to intercept 2FA codes for live session takeovers.",
    consequence: "Forwarding the 2FA code allows an attacker to complete single sign-on authentication and hijack the student account.",
    sensitiveDataAtStake: "Two-factor authentication (2FA) verification code.",
    disclosedCategory: "2FA / Multi-Factor Code",
    proceedRiskScore: 4,
  },

  {
    id: "PT05",
    title: "Emergency Student Assistance",
    situation: "A student on campus messaging reaches out with an anxious plea claiming to be 'Nadeeka from Faculty of Medicine'. She claims a serious accident occurred and needs personal details regarding a fellow classmate.",
    senderName: "Nadeeka (Purported Medicine Student)",
    senderAddress: "nadeeka.med-student@campus-peers.example",
    message: "PLEASE HELP: My friend's brother was involved in a collision near campus and we need to reach batchmate Malith Jayawardena right away! His phone is off. Can you please give me Malith's personal mobile number, his home address, and his current lecture room location?",
    interaction: "emergency_story",
    evidence: [
      {
        label: "Emotional Urgency Pressure",
        detail: "The requester creates an acute emotional crisis scenario to bypass standard privacy boundaries and solicit third-party personal information.",
        kind: "information",
      },
      {
        label: "Third-Party Privacy Protection",
        detail: "Sharing another student's home address, personal phone number, and physical whereabouts compromises their safety and violates institutional privacy regulations.",
        kind: "context",
      },
      {
        label: "Established Emergency Protocol",
        detail: "Genuine emergencies are managed through the University Health Center, Campus Security Marshals (ext. 1111), and the Dean of Student Affairs.",
        kind: "profile",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Withhold private details; offer to contact Campus Security or University Health Center directly",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I cannot share personal details. I will contact Campus Security and the Health Center immediately to assist with any verified emergency.",
      },
      {
        id: "report",
        label: "Report the suspicious inquiry to student marshals to check for stalking risks",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I am reporting this request to the campus student marshals.",
      },
      {
        id: "ignore",
        label: "Ignore the message without providing any student contact records",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
        reply: "I cannot assist with private contact requests.",
      },
      {
        id: "proceed",
        label: "Proceed by sharing Malith's personal phone number, home address, and lecture room",
        privacyRiskScore: 3,
        unsafe: true,
        disclosedInfoCategory: "Peer Personal & Location Data",
        reply: "Here is Malith's personal phone number, home address, and timetable room.",
      },
    ],
    mediaDetails: {
      warningIndicators: ["Third-party data solicitation", "High-stress medical emergency pretext", "Unverified caller"],
    },
    correctAction: "verify",
    explanation: "Pretexting often exploits empathy. Sharing peer contact and location details endangers others and circumvents verified emergency response procedures.",
    consequence: "Disclosing peer personal records exposes students to stalking, harassment, or unauthorized physical tracking.",
    sensitiveDataAtStake: "Peer's personal phone number, residential address, and real-time physical timetable location.",
    disclosedCategory: "Peer Personal & Location Data",
    proceedRiskScore: 3,
  },

  // =========================================================================
  // IV3: IMPERSONATION INVESTIGATION (IM01 - IM05)
  // =========================================================================
  {
    id: "IM01",
    title: "Fake Lecturer Profile",
    situation: "A new social media account claiming to belong to your senior lecturer 'Prof. K. L. Wickramasinghe' sends you a direct message regarding your semester research proposal.",
    senderName: "Prof. K. L. Wickramasinghe",
    senderAddress: "@prof_wickramasinghe_official_",
    message: "Dear student, I am reviewing your research project draft. Our faculty server is slow, so please send your full confidential dataset, student registration number, and source code directly to my personal address: prof.wickrama@gmail.example.",
    interaction: "profile_compare",
    evidence: [
      {
        label: "Profile Comparison Inspection",
        detail: "Authentic Profile: @prof_wickramasinghe (1,400 followers, linked to department bio, account active since 2018). Replica Account: @prof_wickramasinghe_official_ (19 followers, created 4 days ago, generic stock banner).",
        kind: "profile",
      },
      {
        label: "Official Academic Communication Route",
        detail: "Faculty bylaws mandate that all coursework, research data, and student evaluations must be submitted through official university email (@campus.example) or the campus LMS.",
        kind: "context",
      },
      {
        label: "Intellectual Property Risk",
        detail: "Sending unreleased research datasets and code to external personal email accounts forfeits institutional privacy controls and intellectual property safeguards.",
        kind: "information",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Compare account indicators, identify impersonation, and confirm with professor via official university email",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the impersonated social media profile to the department head and platform admins",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the message without sending research files or personal information",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by emailing your confidential dataset and student registration to the Gmail address",
        privacyRiskScore: 3,
        unsafe: true,
        disclosedInfoCategory: "Academic Research Data",
      },
    ],
    mediaDetails: {
      profileComparison: {
        real: { handle: "@prof_wickramasinghe", followers: "1,420", created: "September 2018", bio: "Head of Dept, Cyber & Computing, Serendib Campus" },
        fake: { handle: "@prof_wickramasinghe_official_", followers: "19", created: "4 days ago", bio: "Official Lecturer Profile | Academic inquiries" },
      },
      warningIndicators: ["Account age mismatch", "Follower discrepancy", "Personal email detour"],
    },
    correctAction: "verify",
    explanation: "Impersonators create lookalike social accounts to intercept student research and intellectual property. Always verify faculty identity through institutional communication channels.",
    consequence: "Sending unpublished research and student data to personal email addresses exposes academic work to theft and misuse.",
    sensitiveDataAtStake: "Academic research dataset, student registration details, and project source code.",
    disclosedCategory: "Academic Research Data",
    proceedRiskScore: 3,
  },

  {
    id: "IM02",
    title: "Compromised Classmate Account",
    situation: "You receive a message from your close classmate Dilshan's verified chat account. The writing style seems abruptly unusual and hurried.",
    senderName: "Dilshan (Classmate Account)",
    senderAddress: "dilshan.perera@chat.campus.example",
    message: "Hey! Urgent favor please — my phone was factory reset and I'm locked out of LMS right before tonight's assignment submission deadline! Can you lend me your student username and password for 20 minutes so I can submit my PDF?",
    interaction: "compromised_chat",
    evidence: [
      {
        label: "Communication Pattern Inconsistency",
        detail: "Chat history shows Dilshan normally messages in a casual mixture of English and Sinhala with audio notes. This message is curt, generic, and uncharacteristically demanding.",
        kind: "context",
      },
      {
        label: "Institutional Credential Sharing Policy",
        detail: "University Information Security Regulations strictly prohibit sharing single sign-on credentials with anyone, including fellow students. Violations risk disciplinary action.",
        kind: "information",
      },
      {
        label: "Direct Verification Option",
        detail: "You can place a voice call to Dilshan's known personal phone number to confirm whether his account has been compromised.",
        kind: "profile",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Withhold credentials; immediately place a phone call to Dilshan on his regular mobile number",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the compromised account alert to the campus IT Helpdesk",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Decline the request without sharing credentials or codes",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by sharing your student username and password to help with the deadline",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Account Credentials",
      },
    ],
    mediaDetails: {
      warningIndicators: ["Account compromise takeover", "Emergency coursework pretext", "Direct credential sharing demand"],
    },
    correctAction: "verify",
    explanation: "Compromised peer accounts are common entry vectors. Independent out-of-band communication (such as a voice call) verifies whether an account has been hijacked.",
    consequence: "Sharing account access with a hijacked account gives attackers direct control over your academic submissions and records.",
    sensitiveDataAtStake: "Student Single Sign-On credentials and account session.",
    disclosedCategory: "Account Credentials",
    proceedRiskScore: 4,
  },

  {
    id: "IM03",
    title: "Fake University Official",
    situation: "An email arrives with the subject 'Disciplinary Inquiry — Student Conduct Notice'. The sender claims to be 'Dr. Anura Fernando, Senior Academic Proctor'.",
    senderName: "Dr. Anura Fernando, Senior Academic Proctor",
    senderAddress: "proctor-office@serendib-academic.example",
    message: "CONFIDENTIAL DISCIPLINARY CHARGE: A formal allegation of examination misconduct has been lodged against your student index. To inspect the charge sheet, reply immediately with your full National Identity Card number, student registration number, and residential address.",
    interaction: "staff_directory",
    evidence: [
      {
        label: "Interactive Campus Staff Directory Lookup",
        detail: "Searching 'Anura Fernando' in the official university directory shows: Dr. Anura Fernando is Head of Department of Botany (afernando@botany.campus.example). The Senior Proctor is Prof. Gamini Bandara (proctor@campus.example).",
        kind: "profile",
      },
      {
        label: "External Spoofed Domain",
        detail: "The email address is serendib-academic.example. Legitimate university offices communicate only through @campus.example.",
        kind: "sender",
      },
      {
        label: "Proctorial Inquiry Protocol",
        detail: "Official proctorial notices are delivered formally via the Dean's office and logged in the student's authenticated portal dashboard.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Use campus staff directory to uncover fake proctor identity and verify with Dean's Office",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the impersonation attempt to the legitimate Senior Proctor's Office",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the email without replying or providing personal details",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by replying with your NIC, student registration number, and home address",
        privacyRiskScore: 3,
        unsafe: true,
        disclosedInfoCategory: "Personal Identity & Home Address",
      },
    ],
    mediaDetails: {
      hostDomain: "serendib-academic.example",
      legitDomain: "campus.example",
      warningIndicators: ["Mismatched staff title", "False disciplinary charge", "Lookalike domain"],
    },
    correctAction: "verify",
    explanation: "Attackers impersonate senior university officials to exploit deference to authority. Cross-referencing claims against an authoritative institutional directory uncovers impersonation.",
    consequence: "Disclosing NIC details and addresses in response to fake accusations facilitates targeted identity theft and extortion.",
    sensitiveDataAtStake: "National Identity Card number and residential home address.",
    disclosedCategory: "Personal Identity & Home Address",
    proceedRiskScore: 3,
  },

  {
    id: "IM04",
    title: "Fake Student Society Account",
    situation: "A popular Instagram account claiming to represent the 'University Rotaract & Humanitarian Club' announces a campus blood drive and community gala.",
    senderName: "Rotaract Society Campus Chapter",
    senderAddress: "@rotaract_campus_official",
    message: "JOIN THE GALA: Annual Charity Leadership Summit 2026. Free entry for first 150 members! Register via the bio form. Required: Full name, WhatsApp, NIC number, and photo upload of your student identity card.",
    interaction: "society_profile",
    evidence: [
      {
        label: "External Form Link Verification",
        detail: "The link in the profile directs to an unverified third-party form (forms-cloud-service.example/reg) rather than the university student union portal (soc.campus.example).",
        kind: "link",
        url: "https://forms-cloud-service.example/reg",
        displayText: "External Registration Form",
      },
      {
        label: "Disproportionate Document Demand",
        detail: "Requesting a high-resolution photo upload of government student identity cards for an open campus gala is an excessive privacy disclosure.",
        kind: "information",
      },
      {
        label: "Official Society Registration Registry",
        detail: "The Student Affairs Union directory lists the authentic Rotaract club website as rotaract.soc.campus.example, with no NIC upload requirement.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Verify society registration via official Student Affairs registry; use verified portal only",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the deceptive club profile to the Student Affairs Union for investigation",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the invitation without submitting identity card scans",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by submitting the external form with your NIC, phone, and student ID photo upload",
        privacyRiskScore: 3,
        unsafe: true,
        disclosedInfoCategory: "NIC & Student ID Card Photo",
      },
    ],
    mediaDetails: {
      destinationUrl: "https://forms-cloud-service.example/reg",
      warningIndicators: ["Unverified social profile", "ID card scan harvesting", "Third-party form host"],
    },
    correctAction: "verify",
    explanation: "Fraudulent student club pages harvest student ID photos and phone numbers for SIM-swap attacks and document forgery. Authentic societies operate through verified university unions.",
    consequence: "Uploading student ID card scans provides bad actors with official identification assets for document fraud.",
    sensitiveDataAtStake: "Student ID card scan, NIC number, and personal phone number.",
    disclosedCategory: "NIC & Student ID Card Photo",
    proceedRiskScore: 3,
  },

  {
    id: "IM05",
    title: "Fake Trusted Organization Message",
    situation: "A message arrives via SMS and email claiming to be from a recognized telecommunications partner providing free educational mobile data for undergraduates.",
    senderName: "SL Telecom Ed-Data Program",
    senderAddress: "offers@edupack-partner-lanka.example",
    message: "National Higher Education Initiative: 100GB Free High-Speed Study Data has been assigned to your student SIM. Activate your bundle by signing into your university portal via our telecom partner portal: edupack-partner-lanka.example/login.",
    interaction: "vendor_verify",
    evidence: [
      {
        label: "Partner Registry Verification",
        detail: "Checking the university approved vendor registry reveals that authentic telecom data packages are activated directly on the telecom operator's USSD codes, never by submitting university passwords on third-party websites.",
        kind: "context",
      },
      {
        label: "Single Sign-On Security Principle",
        detail: "University Single Sign-On credentials should never be typed into third-party commercial domains (edupack-partner-lanka.example).",
        kind: "information",
      },
      {
        label: "Sender Domain Analysis",
        detail: "The domain edupack-partner-lanka.example is privately registered and unaffiliated with both the university and the official telecom provider.",
        kind: "sender",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Verify partner packages on official campus announcements; never enter credentials on vendor sites",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the deceptive telecom message to campus network operations",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the message and decline to enter credentials on third-party sites",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by entering your university student login on the telecom partner portal",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Account Credentials",
      },
    ],
    mediaDetails: {
      destinationUrl: "https://edupack-partner-lanka.example/login",
      hostDomain: "edupack-partner-lanka.example",
      warningIndicators: ["Third-party portal login", "Too-good-to-be-true data offer", "Non-campus domain"],
    },
    correctAction: "verify",
    explanation: "Scammers impersonate trusted corporate partners to obtain student logins. University passwords must never be entered on non-university websites.",
    consequence: "Entering university credentials on an unverified vendor site compromises account access and personal study data.",
    sensitiveDataAtStake: "Student account credentials and mobile subscriber identity.",
    disclosedCategory: "Account Credentials",
    proceedRiskScore: 4,
  },

  // =========================================================================
  // IV4: ONLINE SCAMS & MALICIOUS LINK THREATS (SC01 - SC05)
  // =========================================================================
  {
    id: "SC01",
    title: "Fake Online Shopping Store",
    situation: "A sponsored social advertisement displays: 'Undergraduate Laptop Liquidation — Apple MacBook Air M2 for LKR 68,000 (85% off)'. The site looks polished with authentic branding.",
    senderName: "Campus Mega Electronics Store",
    senderAddress: "store@sl-campus-clearance-outlet.example",
    message: "FLASH CLEARANCE SALE: Only 3 units remaining in Colombo warehouse! Regular price LKR 365,000, now LKR 68,000 for verified university students. Countdown timer: 08:34 remaining. Pay via card to lock order.",
    interaction: "ecommerce",
    evidence: [
      {
        label: "Unrealistic Pricing Anomaly",
        detail: "An 85% discount on current-generation hardware represents an extreme anomaly designed to induce emotional purchasing urgency.",
        kind: "information",
      },
      {
        label: "Fake Urgency & Fabricated Reviews",
        detail: "The countdown timer resets whenever the page reloads. The testimonials feature stock photos with dates from yesterday.",
        kind: "context",
      },
      {
        label: "Checkout Payment Interface",
        detail: "The checkout form directly requests your 16-digit Card Number, CVV, and ATM PIN on an unverified payment gateway.",
        kind: "link",
        url: "https://sl-campus-clearance-outlet.example/checkout",
        displayText: "Checkout Gateway",
      },
    ],
    choices: [
      {
        id: "report",
        label: "Recognize high-pressure pricing fraud; exit the storefront and report the sponsored ad",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "verify",
        label: "Verify merchant legitimacy with the Consumer Affairs Authority registry before buying",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Close the browser tab without providing financial details",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed to checkout by entering your debit card number, CVV, and ATM PIN",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Credit Card & ATM PIN",
      },
    ],
    mediaDetails: {
      priceOriginal: "LKR 365,000",
      priceDiscounted: "LKR 68,000",
      hostDomain: "sl-campus-clearance-outlet.example",
      warningIndicators: ["85% unrealistic discount", "ATM PIN demanded", "Resetting countdown timer"],
    },
    correctAction: "report",
    explanation: "Fake online storefronts lure students with impossible price cuts to steal banking credentials and identity details. Legitimate checkouts never ask for ATM PINs.",
    consequence: "Sharing card numbers and PINs allows immediate unauthorized withdrawals and financial compromise.",
    sensitiveDataAtStake: "Debit/credit card credentials, ATM PIN, and physical residential address.",
    disclosedCategory: "Credit Card & ATM PIN",
    proceedRiskScore: 4,
  },

  {
    id: "SC02",
    title: "Student Accommodation Scam",
    situation: "A post on a student boarding board offers a modern furnished single-occupancy studio 200m from campus for only LKR 12,000/month (typical rate is LKR 40,000+).",
    senderName: "Overseas Property Owner",
    senderAddress: "landlord@campus-boarding-rentals.example",
    message: "LUXURY APARTMENT FOR STUDENT: AC, Wi-Fi, fully furnished. I am currently out of the country on humanitarian work. Many students want this room. Transfer a 2-month reservation deposit (LKR 24,000) and your NIC scan immediately to secure the lease before viewing.",
    interaction: "accommodation",
    evidence: [
      {
        label: "Refusal of Physical Inspection",
        detail: "The landlord refuses any in-person viewing before receiving an upfront, non-refundable deposit.",
        kind: "context",
      },
      {
        label: "Image Reverse-Inspection",
        detail: "The apartment photos are indexed on international hospitality websites as a luxury hotel suite in Colombo 03, not a student boarding room.",
        kind: "information",
      },
      {
        label: "Official Accommodation Board Advisory",
        detail: "The University Student Welfare Division cautions students never to transfer rental deposits prior to physical inspections and signed agreements.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Insist on in-person physical inspection; verify accommodation through University Student Accommodation Board",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the fraudulent accommodation listing to the Student Welfare Division",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the listing without transferring deposits or sharing identity records",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by wiring the LKR 24,000 deposit and emailing your NIC copy to reserve the room",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Financial Transfer & NIC Copy",
      },
    ],
    mediaDetails: {
      priceDiscounted: "LKR 12,000/mo (Norm: LKR 40,000)",
      warningIndicators: ["No physical viewing allowed", "Upfront wire transfer demand", "Stolen hotel photos"],
    },
    correctAction: "verify",
    explanation: "Rental scams pressure students to wire funds and send identity documents for non-existent properties. Always insist on physical viewings before providing deposits or identity records.",
    consequence: "Wiring deposits results in unrecoverable financial loss and arms fraudsters with identity card copies.",
    sensitiveDataAtStake: "Financial deposit and National Identity Card scan.",
    disclosedCategory: "Financial Transfer & NIC Copy",
    proceedRiskScore: 4,
  },

  {
    id: "SC03",
    title: "Fake Online Payment Page",
    situation: "While paying a university library reprint charge, you are redirected to a payment screen displaying 'PaySec University Gateway'.",
    senderName: "Payment Gateway Processor",
    senderAddress: "http://pay-secure.campus-billing.example/checkout",
    message: "PAYMENT PROCESSING: Enter your debit card information to complete university bursar clearance. Your browser may display an encryption warning due to institutional certificate renewal.",
    interaction: "payment_gateway",
    evidence: [
      {
        label: "Unencrypted Connection (HTTP)",
        detail: "The connection protocol is plain HTTP (not HTTPS). The browser displays a prominent red 'Not Secure' alert. Transmitted card numbers will travel in plaintext.",
        kind: "certificate",
      },
      {
        label: "Mismatched Merchant Information",
        detail: "The merchant profile states 'Global Digital Ventures LLC' rather than 'Serendib University Bursar Department'.",
        kind: "information",
      },
      {
        label: "Bursar Payment Advisory",
        detail: "The official University Bursar portal strictly utilizes authorized commercial banking gateways with valid extended validation TLS encryption.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Halt transaction; verify payment link through official campus Bursar portal with HTTPS",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the unencrypted, fraudulent payment gateway to university finance IT",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Close the payment window without submitting card or banking numbers",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by entering debit card number and CVV despite the 'Not Secure' warning",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Debit Card & CVV",
      },
    ],
    mediaDetails: {
      destinationUrl: "http://pay-secure.campus-billing.example/checkout",
      hostDomain: "campus-billing.example",
      warningIndicators: ["Unencrypted plain HTTP", "Browser Not Secure warning", "Mismatched merchant entity"],
    },
    correctAction: "verify",
    explanation: "Entering payment credentials on unencrypted or unverified gateways exposes card numbers to packet sniffing, intermediary interception, and fraudulent merchant operators.",
    consequence: "Submitting debit card details over unencrypted channels leads to immediate card cloning and financial fraud.",
    sensitiveDataAtStake: "Debit/credit card number, CVV code, and expiration date.",
    disclosedCategory: "Debit Card & CVV",
    proceedRiskScore: 4,
  },

  {
    id: "SC04",
    title: "Malicious Event Registration Link",
    situation: "A flyer shared in a batch chat announces an inter-university hackathon with major corporate sponsors. Clicking the registration link opens an OAuth authorization dialogue.",
    senderName: "National Hackathon Organizing Committee",
    senderAddress: "register@hackathon-srilanka-2026.example",
    message: "HACKATHON REGISTRATION: Connect your university Google Account to complete team registration and unlock competition cloud compute credits.",
    interaction: "event_link",
    evidence: [
      {
        label: "Excessive Permission Scopes",
        detail: "The OAuth authorization screen asks for: 'Read, compose, and send emails from your Gmail account', and 'See, edit, create, and delete all your Google Drive files'.",
        kind: "information",
      },
      {
        label: "Disproportionate Access Request",
        detail: "Event registration requires only basic profile info (name and email). Granting Drive and Email permissions allows complete unauthorized access to personal documents.",
        kind: "context",
      },
      {
        label: "Official Organizing Body Check",
        detail: "The university IEEE Student Branch confirms they are not affiliated with this event and advise students against granting third-party OAuth access.",
        kind: "profile",
      },
    ],
    choices: [
      {
        id: "report",
        label: "Deny OAuth permissions immediately and report the consent-phishing app to IT security",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "verify",
        label: "Verify event organizing bodies through verified faculty societies before authorizing apps",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Cancel the OAuth prompt and close the registration window",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by granting full Gmail and Google Drive permissions to complete registration",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "All Cloud Drive Files & Emails",
      },
    ],
    mediaDetails: {
      destinationUrl: "https://auth.hackathon-srilanka-2026.example/oauth",
      warningIndicators: ["Excessive Google Drive permissions", "Full mailbox access demand", "Unverified third-party app"],
    },
    correctAction: "report",
    explanation: "Illicit OAuth consent phishing tricks students into granting malicious applications broad permissions to read private cloud files, assignments, and emails.",
    consequence: "Granting full OAuth permissions enables persistent external access to cloud files, private correspondence, and academic work.",
    sensitiveDataAtStake: "Full access to Google Drive storage, academic files, and private student emails.",
    disclosedCategory: "All Cloud Drive Files & Emails",
    proceedRiskScore: 4,
  },

  {
    id: "SC05",
    title: "Fake Internship Opportunity",
    situation: "A careers portal listing advertises a remote research analyst internship paying LKR 125,000/month for undergraduates with no prior experience required.",
    senderName: "Apex Global Research Lanka",
    senderAddress: "hr@apex-careers-lanka.example",
    message: "CAREER OPPORTUNITY: Remote Research Intern. Flexible 15 hours/week. High stipend. To issue your employment contract and workstation security credentials, submit your National Identity Card, full transcript, and remit an LKR 3,500 background check processing fee.",
    interaction: "internship_fee",
    evidence: [
      {
        label: "Upfront Application Fee Demand",
        detail: "Legitimate corporate recruiters and university internship partners never demand upfront fees from student applicants for interviews or background screenings.",
        kind: "information",
      },
      {
        label: "Excessive Documentation Demand",
        detail: "The application requests high-resolution identity documents and official transcripts prior to any interview or formal job offer.",
        kind: "context",
      },
      {
        label: "Campus Career Guidance Advisory",
        detail: "The university Career Guidance Unit maintains a list of verified employers; Apex Global Research is not a registered corporate entity.",
        kind: "profile",
      },
    ],
    choices: [
      {
        id: "report",
        label: "Reject the offer; report the fraudulent fee-charging recruiter to the Career Guidance Unit",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "verify",
        label: "Verify employer registration on the Department of Registrar of Companies portal",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the job posting and decline to send documents or payments",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by remitting the LKR 3,500 fee and uploading your NIC and complete transcript",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "NIC, Academic Transcript & Money",
      },
    ],
    mediaDetails: {
      priceDiscounted: "Fee: LKR 3,500",
      hostDomain: "apex-careers-lanka.example",
      warningIndicators: ["Upfront processing fee", "Identity document harvesting", "Unrealistic stipend for entry-level"],
    },
    correctAction: "report",
    explanation: "Job recruitment scams extract upfront processing fees and identity documents from students seeking internships. Legitimate employers bear all recruitment expenses.",
    consequence: "Paying fees leads to financial loss, while submitting transcripts and NIC scans facilitates identity theft.",
    sensitiveDataAtStake: "National Identity Card scan, academic transcript, and financial payment.",
    disclosedCategory: "NIC, Academic Transcript & Money",
    proceedRiskScore: 4,
  },

  // =========================================================================
  // PROPOSED IV5: AI-GENERATED DEEPFAKE DECEPTION (DF01 - DF05)
  // =========================================================================
  {
    id: "DF01",
    title: "Fake Lecturer Video Announcement",
    situation: "A video clip circulated in a faculty Telegram group displays what appears to be a video announcement from Faculty Dean 'Prof. Senanayake'. The speaker's face and voice match the Dean's appearance.",
    senderName: "Office of the Dean (Synthetic Video)",
    senderAddress: "broadcast@faculty-senate-stream.example",
    message: "Urgent announcement to all science faculty undergraduates: Due to an overnight server breach, semester examination results will be permanently lost unless each student logs in at faculty-results-reset.example within 3 hours to confirm their identity.",
    interaction: "deepfake_video",
    evidence: [
      {
        label: "Synthetic Video Playback Analysis",
        detail: "Close examination of the video shows unnatural lip synchronization, irregular blinking patterns, and subtle facial boundary distortion around the chin and collar.",
        kind: "media",
      },
      {
        label: "Independent Official Channel Verification",
        detail: "The Dean's official office secretary and faculty noticeboard report no emergency announcement. Official faculty circulars are published exclusively on campus.example/news.",
        kind: "context",
      },
      {
        label: "Contextual Deception Strategy",
        detail: "The video leverages the visual authority of the Dean alongside urgent panic regarding exam marks to pressure students into bypassing verification.",
        kind: "information",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Perform independent contextual verification through the Dean's official office and portal",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the synthetic deepfake video to university communications and IT security",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the video link without submitting any login credentials",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by visiting faculty-results-reset.example and submitting student login credentials",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Student Credentials",
      },
    ],
    mediaDetails: {
      videoPoster: "/media/video_dean_announcement.png",
      audioDuration: "0:42",
      transcript: "Due to an overnight server breach, examination results will be lost unless you verify your identity at faculty-results-reset.example.",
      destinationUrl: "https://faculty-results-reset.example",
      warningIndicators: ["Synthetic facial boundary warping", "Artificial urgency", "Independent channel unconfirmed"],
    },
    correctAction: "verify",
    explanation: "AI video deepfakes can convincingly simulate authority figures. Detection cannot rely solely on visual glitches; verification must be conducted through independent, established institutional channels.",
    consequence: "Visiting the link in the synthetic video exposes university single sign-on credentials to attackers.",
    sensitiveDataAtStake: "University login credentials and examination profile.",
    disclosedCategory: "Student Credentials",
    proceedRiskScore: 4,
  },

  {
    id: "DF02",
    title: "AI Voice Impersonation",
    situation: "A voice note arrives on WhatsApp from what sounds exactly like your project group partner 'Kasun'. The audio reproduces his vocal timbre, accent, and natural speech cadence.",
    senderName: "Kasun (AI Cloned Audio Memo)",
    senderAddress: "+94 76 999 5555",
    message: "Machan, my laptop crashed right before our group submission deadline and my phone won't receive SMS! A two-factor login code was just sent to your phone from the campus portal. Send me that 6-digit code quickly so I can upload our project file from the lab computer!",
    interaction: "voice_memo",
    evidence: [
      {
        label: "Simulated Voice Note Audio Inspection",
        detail: "The audio note exhibits realistic vocal timbre, but lacks normal conversational acoustics (background room resonance is flat, pauses are unnaturally uniform).",
        kind: "media",
      },
      {
        label: "Two-Factor Code Solicitation",
        detail: "The request asks for a two-factor authentication code sent to your phone. 2FA codes are personalized and should never be shared with anyone.",
        kind: "information",
      },
      {
        label: "Direct Out-of-Band Call Test",
        detail: "You can place a standard cellular voice call to Kasun's known regular number to ask if he actually sent this voice memo.",
        kind: "profile",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Withhold the code; call Kasun directly on his verified phone number to confirm authentic identity",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the voice cloning attack to campus IT Security and alert group members",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Decline to share any verification codes over audio chat",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by sharing the 6-digit two-factor verification code via chat",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "2FA / MFA Code",
      },
    ],
    mediaDetails: {
      audioDuration: "0:19",
      transcript: "Machan, my laptop crashed. Send me the 6-digit code quickly so I can upload our project file!",
      warningIndicators: ["AI cloned vocal timbre", "2FA code solicitation", "Out-of-band call required"],
    },
    correctAction: "verify",
    explanation: "Generative voice cloning can replicate human speech using short audio clips. Never rely solely on voice familiarity for security decisions; verify out-of-band via phone call.",
    consequence: "Sharing the 2FA code allows the voice-cloning attacker to hijack your student account.",
    sensitiveDataAtStake: "Two-factor authentication code and academic project files.",
    disclosedCategory: "2FA / MFA Code",
    proceedRiskScore: 4,
  },

  {
    id: "DF03",
    title: "Fake AI-Generated University Notice",
    situation: "A formal PDF notice circulates on social media bearing the university crest, typography, and what appears to be an automated official circular regarding biometric registration.",
    senderName: "Senate Administrative Secretariat",
    senderAddress: "notices@serendib-senate-bulletin.example",
    message: "CIRCULAR 2026/08: Mandatory Digital Biometric Student Pass. All undergraduates must submit high-resolution front/back photos of their National Identity Card and biometric fingerprint scans at biometric-student-portal.example before the end of the month.",
    interaction: "synthetic_notice",
    evidence: [
      {
        label: "AI Language Hallucination Clues",
        detail: "The notice uses sophisticated bureaucratic jargon but cites a non-existent university ordinance ('Ordinance Sec. 99-C of 2024') and hallucinates non-existent administrative committees.",
        kind: "information",
      },
      {
        label: "Irrevocable Biometric Risk",
        detail: "Unlike passwords, biometric data (fingerprints) cannot be changed once compromised. Universities do not collect student fingerprints via web forms.",
        kind: "context",
      },
      {
        label: "Registrar Bulletin Board Cross-Check",
        detail: "The official University Registrar portal lists Circular 2026/08 as a holiday schedule update, completely unrelated to biometric registration.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Verify the circular reference number against official Registrar publications; report the document",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the fake biometric circular to the University Senate Secretariat",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "Ignore the notice and decline to upload biometric or identity records",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by uploading your high-resolution NIC photos and biometric fingerprint scans",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Biometric & NIC Scans",
      },
    ],
    mediaDetails: {
      destinationUrl: "https://biometric-student-portal.example",
      warningIndicators: ["AI hallucinated ordinance", "Irrevocable biometric demand", "Circular reference mismatch"],
    },
    correctAction: "verify",
    explanation: "Generative AI produces polished synthetic administrative circulars that appear authentic. Always cross-check circular reference numbers against verified university repositories.",
    consequence: "Disclosing biometric data and identity cards creates permanent, irreversible identity compromise.",
    sensitiveDataAtStake: "Biometric fingerprint data and National Identity Card scans.",
    disclosedCategory: "Biometric & NIC Scans",
    proceedRiskScore: 4,
  },

  {
    id: "DF04",
    title: "AI Recruitment Video Call",
    situation: "During an online video interview for a prestigious remote research scholarship with a Singapore institute, an AI synthetic recruiter appears on your screen.",
    senderName: "Dr. Robert Vance (AI Recruiter Avatar)",
    senderAddress: "interview-call@apac-ai-fellowship.example",
    message: "Thank you for joining our video interview. For regulatory compliance and international student grant verification, please hold your National Identity Card and passport up to your webcam for 10 seconds and read your card number aloud.",
    interaction: "video_call",
    evidence: [
      {
        label: "Interactive Video Call Stream Analysis",
        detail: "The interviewer maintains continuous eye contact without natural micro-movements. Lighting on the face does not match the virtual background, and hand gestures glitch near the frame edge.",
        kind: "media",
      },
      {
        label: "Real-Time Identity Harvesting Tactic",
        detail: "Demanding live camera exposure of identity cards captures high-resolution biometric imagery and government security holograms in real time.",
        kind: "information",
      },
      {
        label: "Standard Interview Verification Policy",
        detail: "Legitimate institutions conduct identity verification through encrypted secure HR portals, never by requiring applicants to hold physical identity cards to webcams during calls.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "report",
        label: "Decline to display documents on video; terminate call and report to Career Guidance Unit",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "verify",
        label: "Verify the fellowship institution via verified international research directories",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "End the video call without displaying identity documents",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by holding your National Identity Card to the webcam and reading the number aloud",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "Live NIC Scan & Facial Video",
      },
    ],
    mediaDetails: {
      warningIndicators: ["Synthetic interviewer avatar", "Live webcam identity harvesting", "Real-time biometric capture"],
    },
    correctAction: "report",
    explanation: "Real-time synthetic video avatars can conduct live deceptive interviews to harvest biometric and identity documents. Sensitive credentials should never be shown on video calls.",
    consequence: "Holding identity cards to webcams allows bad actors to record video frames with high-resolution identity credentials and facial geometry.",
    sensitiveDataAtStake: "National Identity Card imagery, passport number, and live biometric facial video.",
    disclosedCategory: "Live NIC Scan & Facial Video",
    proceedRiskScore: 4,
  },

  {
    id: "DF05",
    title: "Synthetic Customer Support Agent",
    situation: "You receive an incoming call with a realistic synthetic voice agent claiming to represent the 'University Student SmartCard Banking System'.",
    senderName: "Student Banking Automated Security Agent",
    senderAddress: "+94 11 200 8899",
    message: "Security Alert: An unauthorized debit of LKR 54,000 was attempted on your university student account. To cancel this transaction and block fraudulent charges, confirm your 4-digit card PIN and mother's maiden name using your telephone keypad or spoken voice now.",
    interaction: "ai_support_bot",
    evidence: [
      {
        label: "Automated Interactive Voice Response (IVR) Analysis",
        detail: "The synthetic agent responds dynamically with conversational latency under 500ms, using natural inflection to simulate an urgent bank representative.",
        kind: "media",
      },
      {
        label: "Universal Banking Security Rule",
        detail: "Banks and campus smartcard issuers NEVER ask customers for their 4-digit ATM card PIN, whether via automated voice, SMS, or human agents.",
        kind: "information",
      },
      {
        label: "Back of Card Verification Number",
        detail: "Every authentic student debit card lists an official customer service hotline on the back of the physical plastic card.",
        kind: "context",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Hang up immediately; check account status by calling the number on the back of your card",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "report",
        label: "Report the synthetic voice vishing call to your bank's fraud detection division",
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "ignore",
        label: "End the call without speaking or pressing any keypad digits",
        privacyRiskScore: 1,
        unsafe: false,
        disclosedInfoCategory: "None",
      },
      {
        id: "proceed",
        label: "Proceed by entering your 4-digit card PIN and speaking mother's maiden name to cancel charge",
        privacyRiskScore: 4,
        unsafe: true,
        disclosedInfoCategory: "ATM PIN & Mother's Maiden Name",
      },
    ],
    mediaDetails: {
      audioDuration: "0:28",
      transcript: "Unauthorized debit of LKR 54,000 detected. Confirm your 4-digit PIN and mother's maiden name to block charges.",
      warningIndicators: ["Automated PIN demand", "Conversational AI agent", "Fabricated bank alert"],
    },
    correctAction: "verify",
    explanation: "Conversational voice AI bots automate vishing at scale. Legitimate financial institutions never ask for PINs under any circumstances. Always hang up and call the number on your card.",
    consequence: "Entering a PIN on a phone call enables total financial extraction from the associated bank account.",
    sensitiveDataAtStake: "ATM Card PIN, mother's maiden name, and bank account access.",
    disclosedCategory: "ATM PIN & Mother's Maiden Name",
    proceedRiskScore: 4,
  },
];

const missionForId = (id: string) => {
  if (id.startsWith("PH")) return missions[0];
  if (id.startsWith("PT")) return missions[1];
  if (id.startsWith("IM")) return missions[2];
  if (id.startsWith("SC")) return missions[3];
  return missions[4];
};

export const allScenarios: Scenario[] = scenarioDefinitions.map((def) => {
  const m = missionForId(def.id);
  return {
    id: def.id,
    title: def.title,
    situation: def.situation,
    senderName: def.senderName,
    senderAddress: def.senderAddress,
    message: def.message,
    evidence: def.evidence,
    mission: m.id,
    primaryIV: m.iv,
    secondaryTags: def.id.startsWith("PH")
      ? ["malicious-link", "phishing"]
      : def.id.startsWith("DF")
        ? ["deepfake", "ai-deception"]
        : [],
    version: SCENARIO_VERSION,
    interaction: def.interaction,
    choices: def.choices,
    mediaDetails: def.mediaDetails,
  };
});

// Exactly 20 active scenarios across the 4 independent research variables (IV1–IV4)
export const scenarios: Scenario[] = allScenarios.filter((s) => !s.id.startsWith("DF"));

// Retain all 25 for historical data compatibility
export const archivedScenarios: Scenario[] = allScenarios;

export const answerKeys: Record<string, AnswerKey> = Object.fromEntries(
  scenarioDefinitions.map((def) => [
    def.id,
    {
      action: def.correctAction,
      explanation: def.explanation,
      consequence: def.consequence,
      privacyRiskScore: 0,
      sensitiveDataAtStake: def.sensitiveDataAtStake,
    },
  ]),
);
