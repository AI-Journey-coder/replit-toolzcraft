# AI Document Intelligence requirement ledger — 30 October 2026

Source: DOCUMENT-INTELLIGENCE-SOURCE.md. “Implemented” describes code, not production deployment or universal correctness. Specialized analysis uses grounded field profiles and review findings; it is not certification or an exhaustive professional assessment. Test evidence is recorded separately in DOCUMENT-INTELLIGENCE-STATUS.md.

Only cloud-drive imports, enterprise SSO and trusted issuer/registry integrations were explicitly deferred. Other partial/pending entries remain active. All new cloud-backed functionality still requires migrations, secrets, worker scheduling and authenticated staging acceptance.

| Section | Requirement | Current state | Implementation or gap |
| --- | --- | --- | --- |
| A | Upload PDF, DOCX, TXT | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Upload JPG, PNG and scanned documents | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Drag-and-drop upload | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Multiple-file upload | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | File validation and configurable size limits | Implemented; deployment/acceptance gate remains | File signatures and configurable 1–20 MB / 1–20 page limits, bounded ZIP parsing and independent API ceilings. |
| A | Automatic document type detection | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Document preview with zoom and rotation | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | PDF page thumbnails and navigation | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Page selection and reordering | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Document rename and deletion | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Password-protected PDF unlock with user-supplied password | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | File conversion and normalization | Implemented; deployment/acceptance gate remains | Reviewed source text converts to normalized Word/PDF; report export supports TXT/CSV/JSON/PDF/Word/Excel. Original visual layout is not promised. |
| A | ZIP batch upload | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Saved document workspace | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Version history and document grouping | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx, document-reader.ts, DocumentWorkspaceShelf.tsx |
| A | Google Drive and OneDrive import | Deferred by user | Next phase: external integrations explicitly deferred. |
| B | Extract text from searchable PDFs | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | OCR for scanned PDFs and images | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Detect language | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Identify document title, dates and author metadata | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Detect paragraphs, headings and page boundaries | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Extract tables | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Detect names, organizations and monetary values | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Show extracted text beside original document | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Highlight low-confidence OCR text | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Recognize checkboxes and forms | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Extract handwritten text with accuracy warnings | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Detect signatures without validating authenticity | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Preserve complex table relationships | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Multilingual OCR and translation | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Identify charts, diagrams and figures | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| B | Extract information from complex layouts | Implemented; deployment/acceptance gate remains | document-reader.ts, document-metadata.ts, DocumentVisualReview.tsx, visual.ts |
| C | Executive summary | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Detailed summary | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Key facts extraction | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Important dates and deadlines | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Financial amount extraction | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Document-specific questions and answers | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Page-level citations in AI answers | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Explain complex language in simple English | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Identify missing required information using a defined checklist | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Extract action items | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Identify responsibilities and obligations | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Detect contradictions within documents | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Analyze ambiguous language | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Extract decisions and assumptions | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Generate chronological timelines | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Flag unusual numerical values | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Create document-specific follow-up questions | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Generate risk assessments with supporting evidence | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| C | Compare claims against trusted external sources | Implemented; deployment/acceptance gate remains | Approved exact-host HTTPS reference import with consent, pinned public DNS, response limits and source URL/date/hash; imported references participate in cited comparison. Issuer trust remains deferred. |
| C | Multi-document reasoning with traceable evidence | Implemented; deployment/acceptance gate remains | index.ts / specializations.ts prompts; intelligence-analysis.ts evidence validation |
| D | Compare two document versions | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Text-level changes | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Added and removed clauses | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Changed names, dates and amounts | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Side-by-side document comparison | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Export comparison report | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Semantic comparison when wording differs | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Identify changes in obligations | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Risk ranking for significant changes | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Compare multiple versions | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Compare tables and numerical values | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Compare translated documents | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| D | Track changes across document history | Implemented; deployment/acceptance gate remains | comparison.ts, semantic_compare / reconcile actions, saved-version comparison |
| E | Insurance policies | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Bank statements | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Academic research | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Educational material | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Government forms | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Business proposals | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Tender/RFP documents | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Compliance policies | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Medical documents | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| E | Property documents | Implemented; deployment/acceptance gate remains | specializations.ts; DocumentFinancialChecks.tsx; invoice extraction; education actions |
| F | Detect missing fields | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Check missing dates and signatures | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Check number and currency consistency | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Detect duplicate uploaded documents | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Arithmetic validation of invoice totals | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Custom document completeness checklist | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Compare invoice and purchase order | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Detect conflicting information between files | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Identify possible duplicate invoices | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Flag questionable clauses for review | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Validate extracted data against user-defined rules | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Verify digital signatures cryptographically | Implemented; deployment/acceptance gate remains | rules.ts, financial-checks.ts, document-signatures.ts, visual.ts |
| F | Validate QR code contents against trusted issuers | Deferred by user | Next phase: external integrations explicitly deferred. |
| F | Verify identifiers against authorized external registries | Deferred by user | Next phase: external integrations explicitly deferred. |
| G | Chat with a single document | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Ask questions in natural language | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Show exact source page and text | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Suggested questions | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Follow-up conversational questions | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | State when answers cannot be found | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Chat across multiple documents | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Search across personal document collections | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Compare answers between documents | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Save questions and responses | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Custom AI analysis templates | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| G | Shared team knowledge workspaces | Implemented; deployment/acceptance gate remains | DocumentIntelligence.tsx conversation/templates; document-workspaces.ts search and memberships |
| H | Copy extracted text | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Download plain-text extraction | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Download document summary | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Export structured data as CSV or JSON | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Download PDF comparison report | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Export tables to Excel | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Export editable Word reports | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Create audit-ready reports with evidence references | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Export timelines and action-item lists | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | Custom report templates | Implemented; deployment/acceptance gate remains | Saved title/introduction/closing notes plus classic, compact and large-print PDF/Word layouts; evidence and limitations remain mandatory. |
| H | Scheduled reports | Implemented; deployment/acceptance gate remains | document-package.ts, document-report.ts, document-calendar.ts; document-workflows.ts |
| H | API-based structured document extraction | Implemented; deployment/acceptance gate remains | Authenticated consented binary PDF/DOCX/TXT/PNG/JPEG endpoint scans before native extraction; reviewed-text and image-preview analysis endpoints return structured evidence. |
| I | Recognize and suggest a document analysis workflow | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Apply predefined extraction templates | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Batch-process document collections | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Classify files into folders | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Extract deadline reminders | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Generate task lists from agreements | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Connect structured exports to other systems | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Process incoming documents via API | Implemented; deployment/acceptance gate remains | Binary extraction API plus reviewed text, queued processing and optional signed metadata webhooks; bounded parser and real scanner fixture tests passed. |
| I | Document approval workflow | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Webhooks and event notifications | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Workflow builder with conditional rules | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| I | Human-review queues for sensitive findings | Implemented; deployment/acceptance gate remains | DocumentBatch.tsx, DocumentAutomationPanel.tsx; document-automation.ts |
| J | Use basic tools without login | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Google and email authentication | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Anonymous temporary sessions | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Usage limits and rate limiting | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Free and paid access controls | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | User dashboard | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Document history | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Subscription billing | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | AI credit balance and usage history | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Teams, roles and shared workspaces | Implemented; deployment/acceptance gate remains | existing authentication/billing/profile; workspace memberships and jobs |
| J | Enterprise SSO | Deferred by user | Next phase: external integrations explicitly deferred. |
| L | Dashboard | Implemented; deployment/acceptance gate remains | Admin upload counts/bytes/duration/outcomes, workspaces, queue states and retention indicators; aggregates exclude filenames and document contents. |
| L | AI usage | Implemented; deployment/acceptance gate remains | All direct/vision/queued provider calls aggregate tokens/outcomes; missing usage remains unknown. Runtime model allowlist and manually configured price estimates. |
| L | Document processing | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Subscription management | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | AdSense | Implemented; deployment/acceptance gate remains | Admin guide-only placement and slot configuration, sensitive-route exclusions; actual ad serving stays off pending policy/consent readiness. |
| L | SEO | Implemented; deployment/acceptance gate remains | Admin published/draft guides, descriptions, noindex and optimistic concurrency; server-rendered escaped content, canonical URLs and dynamic sitemap. |
| L | Security | Implemented; deployment/acceptance gate remains | Authorization, read/mutation audit, consented loopback malware scan with freshness check, encryption, expiry and bounded processing. |
| L | Feature management | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Support | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Analytics | Implemented; deployment/acceptance gate remains | Popular tools, signup activation, mature-cohort repeat use and live-payment conversion plus upload/provider aggregates. Does not claim unique visitor tracking. |
| L | Plan | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Free anonymous | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Free registered | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Pro | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Business | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | API | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Layer | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Frontend | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Hosting | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Authentication | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Document parsing | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | OCR | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | AI | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | File storage | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Database | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Background processing | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Comparison engine | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Report generation | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Billing | Implemented; deployment/acceptance gate remains | Admin.tsx, DocumentOperations.tsx, SupportRequests.tsx and admin routes |
| L | Analytics | Implemented; deployment/acceptance gate remains | Popular tools, signup activation, mature-cohort repeat use and live-payment conversion plus upload/provider aggregates. Does not claim unique visitor tracking. |

## Mandatory security requirements (K)

| Requirement | State / evidence |
| --- | --- |
| TLS and encrypted temporary storage | Cloud Run TLS; AES-256-GCM saved workspaces/jobs/support. Deployment key and database encryption configuration must be verified. Existing retry receipts follow existing database storage protections. |
| File validation and malware scanning | Types, signatures and bounded parsing implemented. Optional consented original-file scanning via a loopback ClamAV daemon is implemented and protocol-tested; disabled until real scanner deployment, signature-update monitoring and acceptance. Binary extraction and native format tests are implemented; real ClamAV clean/EICAR acceptance passed locally. Cloud acceptance remains required. |
| Prevent file execution | Local parsers render data; PDF scripts/macros are not executed by this application. No uploaded executables or arbitrary conversion commands. Not a guarantee that third-party parsers have no vulnerabilities. |
| User isolation / no public document URLs | Owner/member checks, encrypted storage, no public file links; real PostgreSQL isolation regression tests. |
| Anonymous 60-minute expiry | In-memory workspace timer plus focus/resume checks; browser suspension prevents promises of immediate physical erasure while suspended. |
| Immediate deletion | Local clear, owner workspace delete, finished-job text delete, support request delete. Running jobs require cancellation first. |
| Model training and provider agreements | No training feature; provider/account data-use terms still require production verification. Do not assert guarantees based only on code. |
| Prompt injection protection | Documents treated as untrusted; exact source validation; unsupported output rejected. This is a mitigation, not proof of immunity. |
| Redaction | Literal and identifier masking for exported/copied reports; originals remain intact until cleared. |
| Security/access logs | Existing admin audit, workspace mutation events and bounded version-read events; production log/retention verification remains. Never log document text, secrets or binary contents. |
| No ads/third-party tracking in workspaces | Existing sensitive-route eligibility controls; recheck production delivery and CSP after rollout. |
| Retention accuracy | Read access enforces expiry. Physical cleanup requires the documented maintenance job; not deployed yet. |

## Specialized narrative requirements (E)

Contracts: grounded parties, dates, payment/renewal/termination/penalty/confidentiality/jurisdiction/obligation profiles and missing-field review. Invoices/POs: typed local invoice checks, duplicate references, cited reconciliation action and explicit exact-decimal calculations. Resumes/JDs: grounded matching profile; no invented credentials. Financial reports: profile plus explicit source-linked arithmetic and growth calculations; automated full statement reconciliation remains limited. Technical manuals: specifications/dependencies/limits profile and cited version comparison. These interfaces need representative authenticated acceptance fixtures beyond prompt/schema tests before production claims.
