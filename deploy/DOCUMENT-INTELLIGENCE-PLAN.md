# AI Document Intelligence — replacement implementation plan

Planning date: 27 October 2026. Updated: 28 October 2026. Status: initial replacement implemented locally and under release verification; not deployed. The full blueprint is not complete. See `DOCUMENT-INTELLIGENCE-STATUS.md` for verified scope and outstanding requirements.

## 1. Source of truth and scope

Primary product reference: https://chatgpt.com/s/t_6ae0bc1327c4819193aed96e956188e8

The shared conversation could not be fetched by the retrieval tool on the planning date. `DOCUMENT-INTELLIGENCE-SOURCE.md` is a verbatim copy of the full response supplied by the user, not a rewritten or reduced specification. Its sections A–L, workflow, five product requirements and phase assignments govern the scope. The copy is the working reference until the link can be verified. Do not claim the link was independently verified. Resolve any later differences explicitly rather than silently replacing requirements.

User direction: remove Document Summarizer completely and implement AI Document Intelligence. This is a new document workspace, not a rename of the sentence-selection tool. Summary is one analysis action within the workspace, not the whole product. The full catalog remains the roadmap; P1/P2/P3 are sequencing, not deleted requirements or a claim that all capabilities ship together.

This plan proposes engineering decisions where the source offers recommendations. These decisions must not be represented as verbatim source requirements.

## 2. Product and retirement contract

- New product name: AI Document Intelligence.
- Proposed canonical page: `/tools/ai-document-intelligence`.
- Remove Document Summarizer from cards, tool counts/labels, search, favourites presentation, headings, guide content, discovery HTML, metadata, sitemap and navigation.
- Remove the Free Summary / Quick Summary / Full Document selector, sentence-ranking result presentation and the old `SummaryModes` component. Do not present disconnected invoice lines as a completed analysis.
- Old `/tools/ai-summarizer` links receive a permanent redirect to the new workspace. This is compatibility only: no old tool remains available. Transfer an existing favourite to the new identifier without duplicating it.
- Retire `/api/ai/summary` after the staged cutover and outstanding request/retry window. During compatibility, retain the old handler only for previously issued requests; do not route new workspace jobs through the old summary product. Return a clear retired-endpoint response after the window, without charging.
- Retain historical credit ledger and retry receipts according to their retention rules. Never drop financial records to remove a product name.
- Existing invoice/table/Q&A/comparison tools are not automatically deleted. Share processing components and offer workspace links; preserve their distinct public entry points unless the user changes that scope.
- Do not remove the working production page before the replacement is deployable. Stage and test the complete replacement, then change navigation and retire the old flow in the release.

## 3. User journey and screens

### Upload workspace
Accept PDF, DOCX, TXT, JPG and PNG; drag-and-drop and multiple uploads. Show file validation, extraction progress, duplicate detection, cancel/remove, rename and the actual size/page limits. Validate actual format, not just filename. No silent truncation or ignored extra files.

### Source review
Original preview next to extracted text; PDF thumbnails, zoom, rotation and page navigation. Select/reorder pages for analysis while preserving original page identifiers in citations. Allow correction of OCR text and manual document-type override. Original evidence and user-edited text remain distinguishable. DOCX uses section/paragraph anchors unless reliable pagination is available; never invent PDF-style page numbers.

### Choose an action
Actions: executive summary, detailed summary, key facts, dates/deadlines, amounts, Ask AI, simplify language, completeness checks, action items, comparison and structured extraction. Relevant actions are suggested by document type; the user can override. Show processing scope, AI consent and server-calculated cost before submitting. Free local operations and paid AI processing are clearly separated.

### Results and evidence
Use document-specific views: invoice fields/line items/tax breakdown, report findings/actions, agreement terms/deadlines. Every significant finding opens its original excerpt and location. Statuses distinguish supported, missing, ambiguous, conflicting and user-corrected information. Show deterministic validation separately from AI interpretation. Do not display invented confidence percentages.

### Compare and Ask AI
Comparison shows originals side by side with additions/removals/changes and source locations. Start with deterministic text comparison; semantic significance is a separately labelled AI interpretation. Q&A supports follow-up context and suggested questions, cites evidence, and states when an answer is unavailable. Clear conversation context when documents change.

### Export and deletion
Copy/TXT extraction, summary download, CSV/JSON structured extraction and PDF comparison report in P1. Exports carry evidence references and unresolved warnings. Neutralize spreadsheet formulas. Offer explicit clear/delete; explain what is local, what was sent, what remains in retry/job records and when it expires.

## 4. Full blueprint traceability

| Source section | P1 delivery | P2 retained scope | P3 retained scope |
| --- | --- | --- | --- |
| A. Upload/management | PDF/DOCX/TXT/images, drag/drop, multi-file, validation, type detection, preview, thumbnails, page selection/reordering, rename/delete | Password unlock, normalization/conversion, ZIP batches, saved workspaces, versions/grouping | Drive/OneDrive import |
| B. OCR/understanding | PDF text, scanned PDF/image OCR, language detection, title/dates/author, paragraph/heading/page structure, tables, entities/amounts, source/text side by side | OCR uncertainty highlighting, forms/checkboxes, handwriting, signature presence, complex tables, multilingual OCR/translation | Charts/diagrams/figures and complex layouts |
| C. Analysis | Executive/detailed summary, facts, deadlines, amounts, cited Q&A, simplification, defined completeness checks, actions | Obligations, contradictions, ambiguity, decisions/assumptions, timelines, unusual numbers, follow-ups, evidenced risk assessment | External-source verification and multi-document reasoning |
| D. Comparison | Two versions, deterministic text changes, clauses, names/dates/amounts, side-by-side review, exported report | Semantic comparison, obligation changes, significance ranking, multiple versions, numeric/table comparison | Cross-language comparison and document history |
| E. Specialization | Establish adapters for the unphased source categories: contracts/agreements, invoices/POs, resumes/job descriptions, financial reports and technical documentation; each has its own field schema and evidence-based presentation | Insurance, bank statements, research, educational materials, government forms, proposals | Tenders/RFPs, compliance mapping, medical and property documents |
| F. Validation | Required fields, dates and signature-presence checks where technically supported, currency/number consistency, duplicate uploads, invoice arithmetic | Custom checklists, invoice/PO matching, cross-file conflicts, possible duplicate invoices, clause review, user-defined rules | Cryptographic signatures, issuer-backed QR verification, authorized registries |
| G. Chat | Single-document natural-language Q&A, exact source evidence, suggested/follow-up questions, abstention | Multi-document chat/search, answer comparison, saved conversations, templates | Shared team knowledge |
| H. Export | Copy/TXT, summary, CSV/JSON, PDF comparison reports | XLSX/DOCX, evidence-rich reports, timelines/actions, templates | Scheduled reports and API extraction |
| I. Automation | Foundation only; no false claim that automation is P1 | Workflow suggestions/templates, batches, folders, reminders, agreement tasks | Integrations, inbound API, approvals, webhooks, builder, human-review queues |
| J. Accounts | Basic anonymous tools, temporary sessions, Google/email authentication, rate/usage limits, free/paid controls | Dashboard/history, billing, credit usage | Teams/roles/SSO |
| K. Privacy/security | Mandatory controls and lifecycle verification before release; see section 7 | Continue controls as storage/batches expand | Enterprise-specific controls as integrations expand |
| L. Admin | Define status for every source module; initial operational visibility and existing account controls | Extend AI cost, processing, plans, ad page controls, SEO, security, feature flags, support and analytics as corresponding features ship | Enterprise operational needs |

Section E's first five categories have no explicit phase in the pasted source. The proposed sequencing above is an engineering interpretation, not a source phase assignment. Build invoice handling first as the regression anchor, then cover the remaining adapters before claiming that specialization scope complete. Likewise, section L has no explicit phases; track each listed admin capability rather than treating existing admin controls as full compliance.

## 5. Engineering foundation

Retain the deployed React/TypeScript frontend, Firebase Authentication, Neon PostgreSQL and Cloud Run. Next.js/Firestore in the blueprint are recommendations, not reasons to add a second database or undertake an unrelated migration. Reuse the existing provider adapter and billing ledger, not the sentence extractor.

Document model:
- Document/session ID, content hash, format, title, language, classification and override, original order, extraction version, local/server storage mode and expiry.
- Pages/sections with stable original anchors; blocks with original text, optional bounding boxes and parser/OCR provenance.
- User corrections stored separately from original source; analysis references an immutable reviewed-input version.
- Findings with typed value, field/category, source document/block IDs, quote, original page/paragraph anchor, support status and validation issues.
- Jobs with owner/session binding, action, document version, state, idempotency key, quote/cost, reservation, provider usage, cancellation/expiry and result version.
- Validation records with rule/version, input fields, expected/observed values, tolerance and pass/fail/not-checkable state.

Proposed API contracts (finalize schemas before implementation):
- `POST /api/document-intelligence/quote`: validate action/scope and return a cost quote tied to content versions and expiry; no charge.
- `POST /api/document-intelligence/jobs`: explicit reviewed-source consent, quote and idempotency key; reserve credits atomically.
- `GET /api/document-intelligence/jobs/:id`: owner-bound status/result/evidence and recoverable error state.
- `POST /api/document-intelligence/jobs/:id/cancel`: defined cancellation semantics; stop work where possible and settle reservations exactly once.
- `DELETE /api/document-intelligence/sessions/:id`: remove retained sources/results, preserving only necessary accounting/security records with documented purpose.
- Optional scoped upload initiation/finalization only when server parsing requires it. No public bucket URLs or secrets in client responses.

Keep local parsing where practical. Add private temporary Cloud Storage and background jobs only for operations that need server-side parsing or exceed the synchronous deadline. Their implementation must include expiry, malware scanning, authorization and deletion before accepting server uploads. Do not claim those controls exist because files currently stay in a browser.

## 6. Evidence, arithmetic and cost correctness

- Validate model output against action-specific schemas. Source IDs must exist in the submitted document version; quotes must match the cited source. Unsupported findings are flagged/rejected, never shown as verified.
- A matched quote proves provenance, not that the model's interpretation is correct. Keep interpretive conclusions distinguishable from extracted facts.
- Use decimal/minor-unit arithmetic with explicit currency precision and rounding rules. Do not confuse printed tax-inclusive subtotal with pre-tax base, add tax twice, assume absent values are zero or guess ambiguous number formats.
- Signature presence is not authenticity. Absence from extracted text does not prove an image signature is missing. Return not-checkable where the parser cannot establish presence.
- Classifier uncertainty prompts user confirmation. Unsupported categories use a general evidence-backed analysis, not an invented specialist report.
- No model-created confidence percentages. Use measured OCR confidence only with its scope/limitations; extraction support statuses are not statistical confidence.
- Freeze the reviewed input and quote before a request. Duplicate clicks, network retries, concurrent jobs and provider retries must not double-charge. Refund/release reservations on unsuccessful processing according to explicit tested settlement rules.
- Anonymous local operations remain available. Anonymous provider-powered AI requires a separately bounded abuse/cost design; the blueprint's anonymous-flow requirement must not imply unmetered paid inference. Track this explicitly rather than silently requiring sign-in everywhere.
- Subscription prices and credit allowances do not change as a side effect of replacing the tool. Define cost units and migration behavior before enabling new paid actions.

## 7. Mandatory security/privacy controls

TLS, private temporary storage if used, ownership checks on every object/job/result, file signature validation, sandboxed parsing, decompression/page/pixel limits, malware scanning for server uploads, non-executable rendering, prompt-injection containment and rate/concurrency limits.

No ads, analytics or third-party tracking inside private document/result/chat workspaces. Public educational pages can remain separate. Do not claim AdSense approval from these controls.

For retained anonymous uploads, implement the source's initial 60-minute target with enforceable expiry and a deletion worker; test access denial at expiry separately from physical cleanup. Local-only sessions require a clear close/clear lifecycle, not a fictitious server-retention claim. Explicit deletion includes derived previews/OCR/results; exceptions for essential accounting records must be disclosed accurately. Provider-side retention/training statements must match verified account terms.

Audit logs must exclude document text, keys and raw sensitive fields. Redaction before sharing/export must preserve the distinction between private source and redacted output. Test cross-user access, untrusted links/HTML, CSV injection and parser resource exhaustion.

## 8. Acceptance suite before implementation is declared complete

Create tests and fixtures alongside each component, not after building the whole workspace. Use synthetic/redacted fixtures in Git; the user's supplied invoice contains personal information and must not be committed verbatim.

Invoice regression based on the supplied layout:
- Recognize invoice despite tabs, broken rows and repeated amount-due text.
- Extract vendor/customer/service/dates with evidence; flag ambiguous invoice reference rather than silently join fragments as a verified identifier.
- Preserve pre-tax 720.34, SGST 64.83, CGST 64.83 and total/due 850.00. Check the sum using decimal arithmetic.
- Preserve inclusive-tax wording and subscription period. Do not interpret subtotal 850.00 as the pre-tax base.
- Do not infer paid, unpaid or overdue status from the due-date field alone.
- Evidence links open the correct original page. Missing fields show missing, not guessed values.
- Free/local mode must not return random address fragments as a useful invoice summary.

Corpus and quality evaluation:
- Searchable/scanned/mixed PDFs, TXT, DOCX, multi-file uploads, rotated/low-quality images, encrypted/corrupt/mislabelled files and very large inputs.
- Multiple real-layout invoice variants and currencies, tax-inclusive/exclusive prices, discounts, rounding, credits/refunds, ambiguous separators, missing/contradictory totals.
- Reports/articles, agreements, resumes/JDs, financial reports and technical documents, with expected findings and absent-answer cases.
- Long sources with critical facts at the end, repeated headers, reordered selected pages, multilingual text and source-embedded hostile instructions.
- Comparison invariants: identical documents yield no changes; additions/deletions/amount/date changes identify the correct source on both sides.
- Separate extraction accuracy, arithmetic accuracy, citation support and interpretation quality. Predefine release thresholds and unacceptable-error classes; do not invent a single confidence score or rely on keyword checks alone.

Operational tests:
- Timeout, malformed/incomplete provider output, unsupported citations, disconnect/reload, retry, double-click, concurrent requests, cancellation, expired quote/session, insufficient credits and blocked account.
- Real database transaction/idempotency tests using disposable local/test schemas; no production balance mutation.
- Mobile/desktop keyboard and screen-reader flows, progress/cancel behavior, input preservation, empty states, source preview, downloads and safe rendering.
- Authorized staging end-to-end run through Firebase, web proxy, private API, quota ledger and deletion lifecycle. Synthetic direct-provider checks alone do not satisfy this gate.

## 9. Implementation order and completion gates

1. Baseline/specification: preserve source, A–L traceability, acceptance corpus, API schemas, security lifecycle, anonymous limits and cost contract.
2. Document foundation: validated multi-format upload, document model, source preview, extraction/OCR, stable anchors, selection/reordering and manual correction.
3. Evidence/validation engine: schema validation, provenance checks, decimal rules, missing/ambiguous/conflicting states, invoice regression first.
4. Analysis workspace: classification/override, all P1 analysis actions, document-specific result adapters, cited Q&A and deterministic comparison, required exports.
5. Platform integration: anonymous/authenticated access, credits/idempotency, retention/deletion, admin visibility, private-workspace tracking restrictions, accessibility and operational tests.
6. P1 scope audit: mark every P1 requirement complete, explicitly deferred with user agreement, or blocked with evidence. Do not label a narrower invoice prototype the complete blueprint MVP.
7. Staging replacement: deploy API and web together, verify signed-in/anonymous flows and the user's invoice scenario. Then retire old UI/routes/guides, verify redirects/favourites/sitemap and production build.
8. Production promotion: use tested image digests, preserve rollback and accounting records, verify health/auth/jobs/credits/deletion and public routes after release.
9. P2/P3: deliver the retained capabilities in the traceability table with their own acceptance/security gates. External registries, professional-domain interpretation, storage and new paid infrastructure require concrete designs and verified costs before activation.

No existing production capability is removed by this planning document. The deployment gate is part of the replacement plan, not a claim that implementation or removal has happened already.
