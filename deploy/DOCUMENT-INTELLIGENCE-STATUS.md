# Document Intelligence implementation checkpoint — 28 October 2026

This is an initial replacement workspace, not completion of the full A–L blueprint. The exact supplied blueprint remains in DOCUMENT-INTELLIGENCE-SOURCE.md; the shared conversation has not been independently retrieved.

## Implemented

- Removed the summarizer UI, three-mode selector and sentence-ranking implementation. Old browser URLs redirect permanently to `/tools/ai-document-intelligence`; favourites migrate. Historical billing receipts remain. The old API accepts only existing receipt retries and rejects new requests without charging.
- Local PDF/DOCX/UTF-8 TXT/JPG/PNG extraction, English OCR for images and PDF pages with no selectable text, duplicate-file detection, extraction cancellation, editable source, document rename/removal, page selection/reordering, PDF/image preview with zoom/rotation. DOCX citations use paragraph sections, not invented page numbers.
- Manual classification override, executive overview, detailed findings, facts, dates, amounts, actions, simplification, cited questions, comparison and checklist actions. Quotes and extracted values are validated against reviewed source text before any successful credit settlement.
- Local invoice fields with ambiguity/missing states, separate GST components, strict minor-unit arithmetic and no inferred payment status. Local comparison identifies normalized added/removed lines and explicitly does not assess order, repeated-line counts or meaning.
- Server-calculated 1–4 credit cost at one credit per 6,000 selected characters including the question; explicit consent; atomic existing ledger; idempotent retries; owner-bound result clearing; malformed output rolls back. Original files stay local. Selected reviewed text is sent to the AI provider only after confirmation.
- TXT/CSV/JSON/PDF result exports and copy. PDF uses rendered pages to preserve Unicode; use TXT/JSON for selectable machine-readable text. Exports include evidence and warnings.

## Explicit limits and incomplete blueprint requirements

- Maximum five files, 20 MB each, 20 pages per PDF, 200,000 extracted characters per file and 24,000 selected characters per AI request. No silent truncation; large-document background processing is not implemented.
- PDF thumbnails, automatic language/author metadata, layout-preserving table extraction in this workspace, structured specialist adapters for every blueprint document category, suggested questions and conversational follow-up context remain outstanding. Current Q&A is a separate source-grounded question per request; the UI asks users to include necessary context.
- English OCR only. Mixed pages with selectable text do not currently OCR additional embedded image regions. Source review remains necessary. No signature authenticity, legal-compliance or external issuer verification is claimed.
- No persistent original-file storage or server upload; therefore no server malware-scanning claim. Local parsing is bounded but not a guarantee against all malformed files.
- Result text is retained for retry recovery. Existing code clears expired text on the user's next request; `node scripts/database.cjs prune-summaries` clears older text globally. A scheduled deployment cleanup job is still required for an enforceable time-based deletion guarantee. Manual clear removes result text while preserving accounting metadata. Closing the tab clears local state but does not delete server receipts.
- No new job polling/cancellation API or admin job dashboard. Requests are synchronous and use existing credit operations. Browser cancellation is supported during local extraction, not after paid analysis is submitted.
- Full P2/P3 scope remains in the plan. It is not implemented or silently excluded.

## Verification and release gate

- TypeScript checks and API/web builds pass locally.
- 73 release tests passed, including real disposable PostgreSQL charging, rollback, concurrency and retry tests. Ten existing document workflow tests passed.
- Final full browser suite: 29 passed. Focused workspace suite: six passed, including real image OCR, source clearing, PDF/DOCX input, mobile layout, exports and corrupt input preservation.
- Ten synthetic live Gemini actions passed after prompt corrections. This is evidence for those samples, not a universal quality guarantee. Invalid outputs continue to fail closed without successful credit settlement.
- Authenticated staging verification through Firebase, Cloud Run proxy/API and the credit ledger is still required. These changes are not on staging or production until both images are built and deployed.

The incomplete P1 items above must be delivered or explicitly agreed as deferred before calling the complete blueprint MVP finished. This checkpoint must not be advertised as full production readiness or an AdSense approval guarantee.
