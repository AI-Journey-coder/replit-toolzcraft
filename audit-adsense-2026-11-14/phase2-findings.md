# Phase 2 — tool guidance and workflow verification
Baseline: 14 November 2026 public inventory; Phase 1 release 9799319. Scope: local production-mode website build; no rollout.

## Page decisions
See phase2-page-review.csv for all 274 baseline URLs, including the 235 flagged for category guidance without an example. There are 273 current tool pages. The second DNS URL is a permanent alias covered by the redirect test. Classifications describe the editorial state entering Phase 2: 223 incomplete, 19 misleading, 14 requiring functional testing, 18 accurate (including the retained alias). A classification of accurate describes the reviewed guidance or alias, not general certification of a tool. The CSV lists the component, revised instruction, checks, residual risk and acceptance criterion.

Removed category-level fallback instructions. Each advertised tool has its own operating instruction in both HTML and the interactive page. Examples and limitations are conditional. Preserved existing specific guidance and added contextual links between organizer, searchable PDF, PDF text extraction, CSV cleaning/conversion and invoice tools. Corrected catalogue overclaims for barcode formats, hash identification, ARIA coverage and number-to-words. No invented FAQ sections.

## Output evidence
| Workflow | Verified outcome |
|---|---|
| PDF organizer | Generated three distinct-width pages, moved page 3 first, rotated it, unchecked page 2 and reopened the exported bytes. Widths and rotations matched pages 3 and 1 in order. |
| Searchable PDF | The 21-page input produced the documented rejection. A single-page PDF containing only a raster image was processed by OCR. The exported PDF yielded ORCHARD INVOICE in Document Intelligence's reviewed text. |
| CSV Cleaner → CSV to JSON | Downloaded the cleaned data and followed the contextual link to the converter. The duplicate was removed, the date normalized, the embedded comma preserved and the identifier remained the string 001. Existing tests also cover malformed or duplicate headings and quoted line breaks. |
| Local invoice review | Desktop and mobile browser checks confirmed a reconciled sample with separate CGST/SGST, source selection, PDF export and zero calls to the document-analysis API. The financial evidence check verified 720.34 + 64.83 + 64.83 = 850 and invalidated stale evidence after editing. |
| Base conversion | Entering decimal 35 yields uppercase Z in base 36. Zero remains zero. Invalid xyz produces the empty-result indicator. |

Test sources: tests/document-workflow-quality.spec.ts, tests/document-intelligence.spec.ts, tests/content-quality.spec.ts and tests/adsense-phase1.spec.ts. Deterministic Node suites: scripts/check-document-intelligence.test.cjs, scripts/check-document-financial.test.cjs and scripts/check-content-conversion.test.cjs. All-tool desktop/mobile rendering audit: scripts/audit-tool-routes.mjs.

## Residual risks
The all-tool check exercises route loading, guidance rendering, browser errors and mobile overflow. It does not validate every calculator formula, transformation, paid model output or browser/device combination. The English OCR fixture establishes a clean-scan path; other languages, noisy images and handwriting remain variable. Provider availability and real account billing were outside this local editorial change. Some existing utilities have important accuracy limits: the JS minifier uses text substitutions, the arbitrary-base parser can accept a valid prefix before a bad digit and hash identification yields candidates. The guide now calls these out. No functionality changes were made to those utilities.

## Final local verification
- Production-mode frontend build and frontend TypeScript check passed.
- Full Playwright suite: 43 passed. Includes API-tool boundary checks, release regressions and the five Phase 2 catalogue/workflow tests.
- Selected Node regression suites: 49 passed (23 document/conversion tests and 26 additional workflow, usability, image and calculation tests).
- Final all-tool route audit: 273 pages, zero reported issues on desktop/mobile initial rendering. The catalogue test also verified distinct nonempty prerendered operating instructions for every advertised tool.
- Last measured main entry during Phase 2: approximately 2.76 MB uncompressed versus 2.73 MB in Phase 1. Build still reports large chunks. Field performance was not measured.
