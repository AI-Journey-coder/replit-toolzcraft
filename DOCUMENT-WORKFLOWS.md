# Document workflows

Four tools: ai-invoice-extractor, ai-table-extractor, ai-scan-assistant, ai-document-compare.
Local extraction accepts images, TXT and PDFs up to 20 MB / 5 pages. Image and scanned PDF OCR uses Tesseract; native PDFs use their text layer. Review extracted text before submission. Language resources may download.

The user explicitly approves sending reviewed text to the configured AI provider. One successful request consumes one shared trial/paid credit. Combined input including language is limited to 6,000 characters. Maximum structured output is 30 rows / 12 columns. Oversized input is rejected, not truncated. Malformed or incomplete provider results release the reserved credit. A provider complete flag cannot guarantee semantic accuracy; all results require source review.

Results are editable and downloadable as text or Excel-compatible CSV (not native XLSX). Formula-like CSV cells are escaped. Compare results are an AI-assisted review, not an exhaustive diff or legal opinion. No new model or price has been silently selected.

Validation: TypeScript frontend/API checks; production builds; policy and route tests; four synthetic real-provider calls; browser image OCR; desktop/phone layout checks. Authenticated real-account checkout/credit end-to-end and broad multilingual handwriting/layout evaluations remain outside these checks.

Run: npm run test:document-workflows. Optional live provider smoke test: node --env-file=artifacts/api-server/.env scripts/smoke-document-workflows.cjs (billable synthetic requests).

## Task-specific results
Invoice results now use a dedicated invoice object and fixed purchased-item columns, with separate CSV exports and conservative arithmetic checks (plain dot decimals only). Table results preserve original headers and allow row/column editing. Scan results show source and output side by side. Comparison results use typed Added/Removed/Changed cards, source excerpts and filters; zero changes is a valid result. All four schemas are independently validated. Synthetic live-provider checks and desktop/mobile result interaction checks passed after the schema change.
