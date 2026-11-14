export const SPECIALIST_PROFILES = {
  insurance: {
    fields: [
      "Insurer and insured",
      "Coverage and limits",
      "Exclusions",
      "Waiting periods",
      "Deductibles",
      "Claim procedure",
    ],
    questions: [
      "Which exclusions and waiting periods are stated?",
      "What deductible applies to each coverage?",
    ],
  },
  bank: {
    fields: [
      "Account holder",
      "Statement period",
      "Opening balance",
      "Dated transactions",
      "Fees",
      "Closing balance",
    ],
    questions: [
      "Which fees and recurring transactions are stated?",
      "Which transactions need a category review?",
    ],
  },
  research: {
    fields: [
      "Research question",
      "Methodology",
      "Sample",
      "Findings",
      "Limitations",
      "Citations",
    ],
    questions: [
      "What are the methodological limitations?",
      "Which conclusions are supported by the reported findings?",
    ],
  },
  education: {
    fields: [
      "Learning objectives",
      "Definitions",
      "Worked examples",
      "Key concepts",
      "Prerequisites",
    ],
    questions: [
      "Which concepts should I learn first?",
      "What examples explain the main concept?",
    ],
  },
  government: {
    fields: [
      "Form title and version",
      "Applicant",
      "Required fields",
      "Supporting documents",
      "Dates",
      "Signature requirements",
    ],
    questions: [
      "Which required fields are not completed?",
      "Which supporting documents are requested?",
    ],
  },
  proposal: {
    fields: [
      "Parties",
      "Costs",
      "Assumptions",
      "Deliverables",
      "Milestones",
      "Acceptance criteria",
    ],
    questions: [
      "What must be delivered for acceptance?",
      "Which assumptions affect the quoted cost?",
    ],
  },
  tender: {
    fields: [
      "Eligibility",
      "Mandatory requirements",
      "Submission deadline",
      "Evaluation criteria",
      "Required evidence",
      "Commercial conditions",
    ],
    questions: [
      "Which requirements are mandatory?",
      "What evidence is required with the submission?",
    ],
  },
  compliance: {
    fields: [
      "Policy owner",
      "Scope",
      "Provided requirements",
      "Matching policy statements",
      "Exceptions",
      "Review date",
    ],
    questions: [
      "Which supplied requirements have no matching policy statement?",
      "Which exceptions are explicitly allowed?",
    ],
  },
  medical: {
    fields: [
      "Document type",
      "Recorded date",
      "Stated terminology",
      "Printed reference ranges",
      "Clinician instructions",
      "Follow-up stated",
    ],
    questions: [
      "Explain the terminology without diagnosing me.",
      "What follow-up does the document explicitly request?",
    ],
  },
  property: {
    fields: [
      "Property description",
      "Parties",
      "Stated identifiers",
      "Consideration",
      "Restrictions",
      "Dates",
    ],
    questions: [
      "Which restrictions and parties are stated?",
      "Which property identifiers need independent verification?",
    ],
  },
  purchase_order: {
    fields: [
      "Buyer",
      "Supplier",
      "Order reference",
      "Line items and quantities",
      "Unit prices",
      "Tax",
      "Total",
      "Delivery terms",
    ],
    questions: [
      "Which quantities and prices were ordered?",
      "Which delivery and payment terms apply?",
    ],
  },
} as const;

export const ADVANCED_TASKS = {
  obligations: {
    label: "Responsibilities & obligations",
    prompt:
      "Extract each obligation as actor, required action, trigger/deadline and exception. Quote the clause. Do not transform optional language into mandatory language.",
  },
  contradictions: {
    label: "Contradictions & conflicts",
    prompt:
      "Identify potentially conflicting statements within and across documents. Return paired findings labeled Conflict N — statement A/B, each with its own source. Explain whether periods, scope or units may resolve the apparent conflict; mark review. Do not declare a conflict without both statements.",
  },
  ambiguity: {
    label: "Ambiguous language",
    prompt:
      "Identify undefined terms, unclear owners, dates or scope. Explain the uncertainty, not an invented interpretation. Label each as review and propose a clarifying question.",
  },
  decisions: {
    label: "Decisions & assumptions",
    prompt:
      "Separate explicit decisions from stated assumptions. Quote each. Do not treat an assumption as an established fact.",
  },
  timeline: {
    label: "Chronological timeline",
    prompt:
      "List explicitly dated events in chronological order where dates are unambiguous. Preserve original dates and uncertainty; do not guess a year or resolve ambiguous numeric dates. Include owner/action when stated.",
  },
  anomalies: {
    label: "Numerical review",
    prompt:
      "Flag potentially unusual numbers only against an explicit comparison in the supplied documents, with units and periods. Return evidence from both comparisons; do not invent industry benchmarks or claim arithmetic verification.",
  },
  followups: {
    label: "Suggested follow-up questions",
    prompt:
      "Generate specific useful questions anchored in source passages, explaining the unresolved issue. Use analysis status; do not present generated questions as source text.",
  },
  risks: {
    label: "Evidence-based risk review",
    prompt:
      "Identify potential operational risks. Label High/Medium/Low for human review and explain the document-specific impact and uncertainty. Quote each trigger. Never claim legal compliance, authenticity, diagnosis or investment suitability.",
  },
  translate: {
    label: "Translate selected passages",
    prompt:
      "Translate the selected passages into the language named in the user question. Preserve numbers, units and named entities. Each translation is analysis with the original-language quote. If the full selection cannot fit, set complete=false rather than omit passages silently.",
  },
  specialist: {
    label: "Specialist field review",
    prompt:
      "Produce a field-by-field review using the chosen document profile. Each supported field must cite evidence, missing fields go in missing. For contracts cover renewal, penalties, confidentiality and jurisdiction. For resume versus job description separate supported skills from gaps, never fabricate credentials. For medical documents explain terminology only, preserve reference ranges and advise clinician interpretation; no diagnosis or treatment changes. For financial documents distinguish printed figures from computed values. For policies and tenders map only requirements supplied by the user, never certify compliance.",
  },
  flashcards: {
    label: "Study flashcards",
    prompt:
      "Create question/answer flashcards based solely on source concepts. Label each finding with the question, value with its answer, analysis status and supporting quote. Do not add external facts.",
  },
  quiz: {
    label: "Study quiz with answers",
    prompt:
      "Generate short questions with correct answers supported by the source. Put the question in label and answer/explanation in value; use analysis and cite evidence. Do not invent unsupported distractor claims.",
  },
  semantic_compare: {
    label: "Meaning & obligation changes",
    prompt:
      "Compare all supplied versions in their given order. Identify changes in meaning, responsibilities, amounts, scope and risk even when wording differs or languages differ. Each change needs paired Before/After findings with their respective sources. State impact and uncertainty as review. Do not imply exhaustive legal review.",
  },
  reconcile: {
    label: "Invoice / purchase-order reconciliation",
    prompt:
      "Match supplied invoice and purchase order references, line descriptions, quantities, prices, currencies and terms. Emit paired findings for mismatches, each citing its source. Missing purchase order or ambiguous matching belongs in missing. Never claim an arithmetic check was performed by code.",
  },
} as const;
