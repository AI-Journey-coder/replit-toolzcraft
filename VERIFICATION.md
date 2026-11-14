# Local verification — 5 September 2026

## Latest release hardening verification — 11 September 2026

- Full workspace TypeScript checks and the frontend production build passed after dependency updates. Generated output contains 251 visible tool pages and 21 categories.
- All three new Node test suites passed: explicit admin enrolment/origin/config rules; HTTP authentication/account/admin boundary tests; production static HTTP routing, safe paths, response headers and byte ranges. Authentication tests mock the Firebase/DB adapters, so they do not prove live Firebase integration.
- Calculator/CSV/PDF primitive tests, all 144 basic SQL source/target selections, and actual short FFmpeg MP4 encoding passed.
- Final dependency audit found no critical, high or moderate advisories; one low advisory remains in the deck development dependency tree. This is a point-in-time audit, not a security certification.
- Browser checks on the built app at port 3003 confirmed 63/75-inch output, favourite/currency/logo persistence, the milk comparison (2.83 versus 2.44 units), and PDF upload with two rendered pages followed by the application's download success state. The downloaded artifact was not independently reopened.
- HTTP checks passed for policy/tool/settings pages and all 21 generated JS/MJS/WASM assets.
- Mobile browser check at 390 × 844 passed: open directory, search Length, navigate to the converter; document width stayed within the viewport. The temporary test tab was closed and viewport reset afterward.
- Seven Playwright CI tests were discovered successfully after correcting overlapping report/test-output directories. The entire Playwright suite and GitHub workflow have not run; browser actions above were performed through the local browser tool.
- API bundle compilation is blocked locally by esbuild's Windows sandbox filesystem access error (ancestor-directory access denied). API TypeScript passes, but API build success must be demonstrated in CI or an unrestricted local environment before enabling online features.
- Docker daemon is unavailable locally. Container startup, PostgreSQL migration/restore, real Firebase login/revocation, SMS, Gemini and live HTTPS/Google review remain unverified.
- Publication check correctly fails: real domain, operator name and contact email are missing, so no production sitemap is generated. THIRD-PARTY-REVIEW.md records outstanding distribution/source requirements, especially the GPL FFmpeg core. Large initial JS and existing TOML dependency warnings remain.

See DEPLOYMENT.md and GOOGLE-SERVICES.md for the release procedure and inputs. Nothing was deployed or pushed during these checks. Older entries below describe earlier checkpoints, not additional current guarantees.

- Installed workspace dependencies with pnpm 10.34.5 and Node.js 22.18.0 on Windows.
- Full workspace TypeScript check passed.
- Frontend production build passed using Vite's native config loader.
- Browser checks on the compiled app passed: homepage, direct privacy/about/contact/terms URLs, optional-login unavailable state, converter output for 255 and 16, contextual guides and disabled-AI message.
- Privacy page visually checked at a 390 × 844 viewport; text wraps within the viewport.
- `git diff --check` passed.

Build warnings remain in existing dependencies: a large main JavaScript bundle (about 3.2 MB before gzip), a TOML dependency's stream externalization/eval warning, and source-map/chunking warnings. These did not stop the build. This is not an exhaustive test of all 242 tools; prioritize individual tool correctness and code splitting before publication.

Real Firebase sign-in, SMS delivery, PostgreSQL, AI-provider calls, advertising consent, production crawler behavior and AdSense review were not tested. They require configuration or deployment. No AdSense publisher ID, contact address, production domain or private credential was invented.

The Windows sandbox blocked esbuild's filesystem-based config bundling and development dependency scanning. Native config loading allowed the production build; the local launcher uses build + preview, which was verified in the browser. A normal development environment can also use `pnpm dev:local`.

## September 11, 2026 — new tool batch

See NEW-TOOLS.md for the complete inventory and local acceptance checks. Frontend typecheck and production build passed. Automated checks passed for calculator/CSV cases, PDF primitives, all 144 basic SQL selections and short MP4 encoding. HTTP checks on port 3002 passed for 13 tool routes, 21 JS/WASM assets and SQL runtime assets. Tool URLs return their own initial HTML title. Browser end-to-end OCR, downloads, cancellation and live CPI remain manual review items.

## September 11 — sidebar, preferences, policies, length and CTC

- Frontend TypeScript check and final production build passed.
- Combined length cases: 63/75 inches, rounding into the next foot, negative lengths and non-finite rejection passed.
- Payroll tests: employer/gross/CTC reconciliation, forward/reverse solve, capped/full PF, ESI employee exemption and infeasible inputs passed. These validate the model, not legal applicability.
- Prior calculator/CSV/PDF primitive/SQL matrix checks also passed.
- HTTP checks passed for nine policy/tool/settings routes, noindex on personal pages, visible length guidance, and all 21 emitted JS/WASM assets.
- Publication check correctly fails while operator name, contact email and public domain are unset; sitemap awaits the public domain.
- No browser DOM, interaction, mobile or visual QA was performed in this turn. Country detection availability, preference reload and real payroll inputs require browser review.
