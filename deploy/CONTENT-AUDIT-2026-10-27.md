# Content and usability audit — 27 October 2026

## Completed changes
- Added three homepage workflows: preparing a smaller PDF, importing CSV records, and checking OCR output. The same content is included in the rendered homepage and crawlable HTML.
- Expanded specific instructions and limitations for text, JSON, CSV, YAML, Base64, domain conversion and CSS tools. There are now 38 tool-specific worked examples. Most other tools still use category guidance; example count alone is not a measure of tool value or AdSense eligibility.
- Fixed CSV conversion: quoted commas, multiline values, escaped quotes and leading zeroes survive parsing. Duplicate/empty headings and uneven rows are rejected. JSON export escapes column names and serializes nested values rather than producing [object Object]. Null and missing fields become empty cells as documented.
- Fixed Punycode decoding, which had incorrectly used Base64. It now uses the Punycode library.
- Fixed mobile overflow in Lorem Ipsum, Markdown README Guide, Placeholder Image Generator, Time Format Converter and CSS Triangle.
- Added regression tests and a repeatable full-route browser audit. Excluded the private old environment backup from Git and container context without inspecting its contents.

## Verification evidence
- All 274 tool routes loaded and hydrated without page JavaScript errors; all had guidance. The repeated audit found no document-width overflow at 390 pixels. Desktop visits used 1280 pixels. This checks initial rendering, not every tool's outputs or every control state.
- Release suite: 68 tests passed, 0 failed, 0 skipped, using only the local PostgreSQL test database.
- Browser suite: 22 passed, including CSV and domain conversion, five mobile regression cases, homepage workflow links and existing upload/download tests.
- Frontend type check and production-mode frontend build passed.
- Dependency audit reported no known vulnerabilities at the time of checking.
- Generated HTML: 314 pages and 3,964 local link occurrences checked; no missing targets.
- The earlier live-site sample verified public policies, ads.txt, sitemap, login/admin noindex and a real 404 for an unknown URL. No ad-serving script appeared in the sampled HTML.

## Boundaries and outstanding work
This is a completed rendering/content remediation pass, not a claim that all 274 tools have been exhaustively verified or that Google's findings are resolved. Google's review determines eligibility. The July rejection predates the current public deployment.

The operator explicitly deferred AI-summary usefulness fixes. AI has not been hidden or repaired in this pass. Functional tests do not assess the quality of AI-generated answers. Other tools without specific examples still benefit from editorial work based on actual use and user feedback.

This update requires a new website image and deployment before changes are public. No API redeployment or database migration is required. Recheck the public pages after deployment before deciding whether to request AdSense review. Do not claim that all issues are fixed merely because automated tests passed.

Ad serving, consent integration and visitor analytics remain unconfigured. Do not put ads on login, admin, profile, loading/error or navigation-only screens. The existing verification meta tag and ads.txt are not ad-serving code.

## Reproduce
- Run the locked pnpm build and typecheck scripts.
- Run test:release with BILLING_TEST_DATABASE_URL pointing only to a disposable local PostgreSQL database.
- Run playwright test; on Windows set PLAYWRIGHT_CHANNEL=msedge if bundled Chromium is unavailable.
- Run node scripts/audit-tool-routes.mjs after building; it serves the local build on 3089 and closes its own server/browser after checking.

## Policy references reviewed
- https://support.google.com/publisherpolicies/answer/11112688
- https://support.google.com/adsense/answer/10015918
