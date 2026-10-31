# API tool quality audit — 27 October 2026

## Changes

- Summary prompts now request a synthesis, distinct findings and explicitly supported actions/deadlines, adapted to document type. Missing facts must not be invented. Full mode reads all supplied sections.
- Free extraction uses sentence segmentation that preserves decimal amounts, reduces repetitive selections and weights decisions and deadlines. It remains an extractive convenience, not an AI interpretation.
- Summary UI adds a sample document and readable results with copy/download controls. The privacy banner distinguishes local Free Summary from provider requests.
- Key Points, Q&A and Translator now accept local PDF/TXT/image extraction directly. Oversized pasted input is preserved instead of silently truncated. Limits include questions/language. Sign-in, consent and credit cost are visible before submitting.
- Q&A requests source evidence and declines absent answers. Key Points groups distinct facts, decisions and actions with supporting quotes. Translation requests complete translation without invented additions.
- Document workflows disable submitting while either source is being extracted and prevent duplicate concurrent clicks. Admin allowance is labelled consistently.
- Currency lookup ignores stale responses after a base change, clears old results and validates returned rates. Requests time out after 15 seconds.
- SRI hashes use the correct `sha384-…` syntax instead of `sha384=…`; URL hashing rejects HTTP errors and times out.

## Validation

- 14 bounded live Gemini requests against `gemini-3.1-flash-lite`, using synthetic documents and production prompt functions. All fixture assertions passed. Includes all eight workflows, missing-answer Q&A, identical-document comparison, a longer document with a final cancellation instruction, and prompt injection embedded in source text.
- Reviewed generated quick/full summary, evidence answer, Hindi translation, invoice tax breakdown and comparison outputs. Invoice retained separate CGST/SGST and INR 850.00 total; comparison retained 30-to-15-day change and added training.
- ExchangeRate-API and World Bank India CPI endpoints returned HTTP 200 with valid expected data.
- 69 release checks passed using disposable schemas in the local PostgreSQL database. No production user balances or database records were changed by this audit.
- 10 document-workflow validation/route tests passed.
- 27 browser checks passed in Microsoft Edge, including phone-width input/upload controls, oversized input preservation, result downloads, PDF extraction and SRI correctness/error handling.
- Frontend and backend TypeScript checks and frontend production build passed.

The opt-in live harness is `node scripts/audit-ai-quality.cjs --live`. It reads the local API environment without logging keys, performs small paid provider calls, and writes synthetic outputs to ignored `test-results/ai-quality-live.json`. It never authenticates as a customer or changes credits.

## Practical limits and deployment

These checks establish specific behavior, not universal AI accuracy. The live fixtures are primarily English, with Hindi translation; they do not validate every language, scan quality or document layout. Browser tests verify unauthenticated safeguards; they do not replace a final signed-in staging walkthrough through Firebase and the deployed proxy.

Free mode still copies original sentences. AI summary modes remain bounded at 6,000 / 24,000 characters; uploads support PDF, TXT and images, not DOCX. Invoice/table extraction remains limited to 30 rows. Long translations may exceed the existing 2,048-token output limit and fail rather than return a partial result.

Payments were not exercised: production payments remain disabled. This is a tool-value/behavior audit, not AdSense approval or a complete production certification.

Both the API and web images must be rebuilt and deployed for these changes to reach toolzcraft.com. Updating only the website will not update the summary/Q&A prompts.
