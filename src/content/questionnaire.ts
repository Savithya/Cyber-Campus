import type { Question, Section } from "@/lib/types";
export const INSTRUMENT_VERSION = "1.0.0";
export const CONSENT_VERSION = "1.0.0";
export const sections: Section[] = [
  {
    id: "A",
    title: "Participant Profile",
    introduction:
      "This section collects basic demographic information about you. Your answers will help describe the profile of respondents without revealing your identity.",
    role: "Profile",
    questions: ["Q1", "Q2", "Q3", "Q4", "Q5"],
  },
  {
    id: "B",
    title: "Phishing",
    introduction:
      "This section asks about your awareness of, exposure to, and reactions to phishing attempts (fake emails or messages designed to trick you into revealing personal information).",
    role: "IV1",
    questions: ["Q6", "Q7", "Q8", "Q9"],
  },
  {
    id: "C",
    title: "Pretexting",
    introduction:
      "This section asks about situations where someone may create a false story, identity, or reason to persuade you to share personal information (often called “pretexting”).",
    role: "IV2",
    questions: ["Q10", "Q11", "Q12"],
  },
  {
    id: "D",
    title: "Impersonation",
    introduction:
      "This section asks about your experiences with people or accounts pretending to be someone else, such as fake university staff, bank representatives, customer-service agents, or fake social media profiles.",
    role: "IV3",
    questions: ["Q13", "Q14", "Q15"],
  },
  {
    id: "E",
    title: "Online Scams & Malicious Link Threats",
    introduction:
      "This section asks about your exposure to suspicious links, online scams, and deceptive advertisements, and how you usually respond to unfamiliar links.",
    role: "IV4",
    questions: ["Q16", "Q17", "Q18"],
  },
  {
    id: "F",
    title: "User Privacy",
    introduction:
      "This section asks about your concerns regarding personal information, account security, and how social engineering threats may affect your privacy and online behaviour.",
    role: "DV",
    questions: ["Q19", "Q20", "Q21", "Q22", "Q23", "Q24", "Q25"],
  },
];
export const questions: Question[] = [
  {
    id: "Q1",
    number: 1,
    section: "A",
    role: "Profile",
    text: "What is your age group?",
    type: "dropdown",
    scale: null,
    variable: "Age Group",
    dimension: null,
    options: [
      {
        code: 1,
        label: "18–20 years",
      },
      {
        code: 2,
        label: "21–23 years",
      },
      {
        code: 3,
        label: "24–26 years",
      },
      {
        code: 4,
        label: "27 years or above",
      },
    ],
  },
  {
    id: "Q2",
    number: 2,
    section: "A",
    role: "Profile",
    text: "What is your gender?",
    type: "choice",
    scale: null,
    variable: "Gender",
    dimension: null,
    options: [
      {
        code: 1,
        label: "Male",
      },
      {
        code: 2,
        label: "Female",
      },
      {
        code: 3,
        label: "Prefer not to say",
      },
      {
        code: 4,
        label: "Other",
      },
    ],
  },
  {
    id: "Q3",
    number: 3,
    section: "A",
    role: "Profile",
    text: "What is your current year of study?",
    type: "dropdown",
    scale: null,
    variable: "Year of Study",
    dimension: null,
    options: [
      {
        code: 1,
        label: "Year 1",
      },
      {
        code: 2,
        label: "Year 2",
      },
      {
        code: 3,
        label: "Year 3",
      },
      {
        code: 4,
        label: "Year 4 or above",
      },
    ],
  },
  {
    id: "Q4",
    number: 4,
    section: "A",
    role: "Profile",
    text: "What is your main field of study?",
    type: "choice",
    scale: null,
    variable: "Field of Study",
    dimension: null,
    options: [
      {
        code: 1,
        label: "Computing / Information Technology",
      },
      {
        code: 2,
        label: "Engineering",
      },
      {
        code: 3,
        label: "Business / Management",
      },
      {
        code: 4,
        label: "Arts / Humanities / Social Sciences",
      },
      {
        code: 5,
        label: "Science",
      },
      {
        code: 6,
        label: "Other",
      },
    ],
  },
  {
    id: "Q5",
    number: 5,
    section: "A",
    role: "Profile",
    text: "What type of university do you attend?",
    type: "choice",
    scale: null,
    variable: "University Type",
    dimension: null,
    options: [
      {
        code: 1,
        label: "State university in Sri Lanka",
      },
      {
        code: 2,
        label: "Private university in Sri Lanka",
      },
      {
        code: 3,
        label: "Foreign university branch campus in Sri Lanka",
      },
      {
        code: 4,
        label: "Other higher education institute in Sri Lanka",
      },
    ],
  },
  {
    id: "Q6",
    number: 6,
    section: "B",
    role: "IV1",
    text: "How familiar are you with the term “phishing” (fake emails or messages that try to trick you into revealing personal information)?",
    type: "scale",
    scale: "FAMILIARITY",
    variable: "Phishing",
    dimension: "Phishing Awareness",
    options: [
      {
        code: 1,
        label: "Not at all familiar",
      },
      {
        code: 2,
        label: "Slightly familiar",
      },
      {
        code: 3,
        label: "Moderately familiar",
      },
      {
        code: 4,
        label: "Very familiar",
      },
      {
        code: 5,
        label: "Extremely familiar",
      },
    ],
  },
  {
    id: "Q7",
    number: 7,
    section: "B",
    role: "IV1",
    text: "In the past 12 months, how often have you received emails or messages that you suspected might be phishing attempts?",
    type: "choice",
    scale: "FREQUENCY",
    variable: "Phishing",
    dimension: "Phishing Exposure",
    options: [
      {
        code: 1,
        label: "Never",
      },
      {
        code: 2,
        label: "Once or twice",
      },
      {
        code: 3,
        label: "A few times",
      },
      {
        code: 4,
        label: "Often",
      },
      {
        code: 5,
        label: "Very often",
      },
    ],
  },
  {
    id: "Q8",
    number: 8,
    section: "B",
    role: "IV1",
    text: "When you receive a suspicious email or message that looks like a phishing attempt, how likely are you to avoid clicking any links or downloading any attachments?",
    type: "scale",
    scale: "LIKELIHOOD",
    variable: "Phishing",
    dimension: "Phishing Response Behaviour",
    options: [
      {
        code: 1,
        label: "Very unlikely",
      },
      {
        code: 2,
        label: "Unlikely",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Likely",
      },
      {
        code: 5,
        label: "Very likely",
      },
    ],
  },
  {
    id: "Q9",
    number: 9,
    section: "B",
    role: "IV1",
    text: "To what extent do you agree with this statement: “I am worried that phishing messages could lead to my personal information being misused.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "Phishing",
    dimension: "Perceived Phishing Risk to Privacy",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q10",
    number: 10,
    section: "C",
    role: "IV2",
    text: "How familiar are you with situations where someone creates a false story, identity, or reason to persuade you to share personal information (often called “pretexting”)?",
    type: "scale",
    scale: "FAMILIARITY",
    variable: "Pretexting",
    dimension: "Pretexting Awareness",
    options: [
      {
        code: 1,
        label: "Not at all familiar",
      },
      {
        code: 2,
        label: "Slightly familiar",
      },
      {
        code: 3,
        label: "Moderately familiar",
      },
      {
        code: 4,
        label: "Very familiar",
      },
      {
        code: 5,
        label: "Extremely familiar",
      },
    ],
  },
  {
    id: "Q11",
    number: 11,
    section: "C",
    role: "IV2",
    text: "In the past 12 months, have you encountered someone (online or by phone) who used a convincing story or false reason to try to get your personal information?",
    type: "choice",
    scale: "EXPERIENCE",
    variable: "Pretexting",
    dimension: "Pretexting Exposure",
    options: [
      {
        code: 1,
        label: "Yes, definitely",
      },
      {
        code: 2,
        label: "Yes, possibly",
      },
      {
        code: 3,
        label: "No",
      },
      {
        code: 4,
        label: "Not sure",
      },
    ],
  },
  {
    id: "Q12",
    number: 12,
    section: "C",
    role: "IV2",
    text: "To what extent do you agree with this statement: “If someone gives a convincing reason, I might share personal information even if I am not completely sure about their identity.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "Pretexting",
    dimension: "Susceptibility to Pretexting",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q13",
    number: 13,
    section: "D",
    role: "IV3",
    text: "How familiar are you with cases where someone pretends to be a trusted person, organisation, or official (for example, fake university staff, bank representatives, or customer-service accounts)?",
    type: "scale",
    scale: "FAMILIARITY",
    variable: "Impersonation",
    dimension: "Impersonation Awareness",
    options: [
      {
        code: 1,
        label: "Not at all familiar",
      },
      {
        code: 2,
        label: "Slightly familiar",
      },
      {
        code: 3,
        label: "Moderately familiar",
      },
      {
        code: 4,
        label: "Very familiar",
      },
      {
        code: 5,
        label: "Extremely familiar",
      },
    ],
  },
  {
    id: "Q14",
    number: 14,
    section: "D",
    role: "IV3",
    text: "In the past 12 months, have you encountered any fake social media profiles, accounts, or messages that pretended to be someone you know or a legitimate organisation?",
    type: "choice",
    scale: "EXPERIENCE",
    variable: "Impersonation",
    dimension: "Impersonation Exposure",
    options: [
      {
        code: 1,
        label: "Yes, definitely",
      },
      {
        code: 2,
        label: "Yes, possibly",
      },
      {
        code: 3,
        label: "No",
      },
      {
        code: 4,
        label: "Not sure",
      },
    ],
  },
  {
    id: "Q15",
    number: 15,
    section: "D",
    role: "IV3",
    text: "To what extent do you agree with this statement: “I sometimes find it difficult to tell if an online account or message is from a real person or an impersonator.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "Impersonation",
    dimension: "Difficulty Recognising Impersonation",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q16",
    number: 16,
    section: "E",
    role: "IV4",
    text: "In the past 12 months, how often have you seen suspicious links, offers, or advertisements online that you thought might be scams or malicious?",
    type: "choice",
    scale: "FREQUENCY",
    variable: "Online Scams & Malicious Link Threats",
    dimension: "Exposure to Online Scams and Malicious Links",
    options: [
      {
        code: 1,
        label: "Never",
      },
      {
        code: 2,
        label: "Once or twice",
      },
      {
        code: 3,
        label: "A few times",
      },
      {
        code: 4,
        label: "Often",
      },
      {
        code: 5,
        label: "Very often",
      },
    ],
  },
  {
    id: "Q17",
    number: 17,
    section: "E",
    role: "IV4",
    text: "When you receive an unfamiliar link (by email, message, or social media), how likely are you to check where the link leads before clicking it?",
    type: "scale",
    scale: "LIKELIHOOD",
    variable: "Online Scams & Malicious Link Threats",
    dimension: "Link Verification Behaviour",
    options: [
      {
        code: 1,
        label: "Very unlikely",
      },
      {
        code: 2,
        label: "Unlikely",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Likely",
      },
      {
        code: 5,
        label: "Very likely",
      },
    ],
  },
  {
    id: "Q18",
    number: 18,
    section: "E",
    role: "IV4",
    text: "To what extent do you agree with this statement: “I am concerned that clicking on a malicious link or online scam could expose my personal information.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "Online Scams & Malicious Link Threats",
    dimension: "Perceived Risk of Online Scams and Malicious Links to Privacy",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q19",
    number: 19,
    section: "F",
    role: "DV",
    text: "To what extent do you agree with this statement: “I am worried that my personal information (such as name, email, phone number, or photos) could be exposed through online scams or deceptive messages.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "User Privacy",
    dimension: "Concern About Personal Information Exposure",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q20",
    number: 20,
    section: "F",
    role: "DV",
    text: "To what extent do you agree with this statement: “I am concerned that someone could access my online accounts (such as email, social media, or university accounts) without my permission.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "User Privacy",
    dimension: "Concern About Unauthorised Account Access",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q21",
    number: 21,
    section: "F",
    role: "DV",
    text: "To what extent do you agree with this statement: “I worry that my personal information could be misused (for example, for fraud, identity theft, or unwanted contact) if I fall for a deceptive online message.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "User Privacy",
    dimension: "Concern About Misuse of Personal Information",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q22",
    number: 22,
    section: "F",
    role: "DV",
    text: "To what extent do you agree with this statement: “I feel that my privacy is at risk when I interact with unknown people or organisations online.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "User Privacy",
    dimension: "General Online Privacy Risk Perception",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q23",
    number: 23,
    section: "F",
    role: "DV",
    text: "To what extent do you agree with this statement: “I have avoided sharing certain personal information online because I was worried about scams or deceptive messages.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "User Privacy",
    dimension: "Privacy Protection Behaviour (Information Sharing)",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q24",
    number: 24,
    section: "F",
    role: "DV",
    text: "To what extent do you agree with this statement: “I regularly check and adjust my privacy settings on social media and other online accounts to protect my personal information.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "User Privacy",
    dimension: "Privacy Protection Behaviour (Settings Management)",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
  {
    id: "Q25",
    number: 25,
    section: "F",
    role: "DV",
    text: "To what extent do you agree with this statement: “Overall, I feel that social engineering threats (such as phishing, pretexting, impersonation, and online scams) have reduced my sense of privacy online.”",
    type: "scale",
    scale: "AGREEMENT",
    variable: "User Privacy",
    dimension: "Overall Perceived Impact of Social Engineering on Privacy",
    options: [
      {
        code: 1,
        label: "Strongly Disagree",
      },
      {
        code: 2,
        label: "Disagree",
      },
      {
        code: 3,
        label: "Neutral",
      },
      {
        code: 4,
        label: "Agree",
      },
      {
        code: 5,
        label: "Strongly Agree",
      },
    ],
  },
];
