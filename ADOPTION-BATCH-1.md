# First tool adoption batch — 12 September 2026

## Follow-up: contact duplicate review

Added /tools/contact-duplicate-merger. Finds connected groups sharing normalized email/phone identifiers, with separate email/phone modes. No matches use names alone, no country code is inferred, and nothing is selected automatically. Each approved group has an explicit primary name/company; distinct original phone/email values are collected. Unselected contacts remain separate. Output is a new simplified VCF or spreadsheet-safe CSV; other vCard fields are not preserved, as disclosed.

TypeScript and production build passed; 255 visible tool pages generated. Automated tests cover transitive matching, separate modes, non-matching names, primary validation, source immutability and preserving unselected records. Browser test used three synthetic contacts: merge was initially disabled, one selected pair produced two output records, the chosen primary fields and both phone values appeared, and resetting disabled the merge action again. A regression case was added to the CI browser suite; the full CI suite was not run here.

Implemented in the current working application; neither GitHub repository was pushed or replaced. The combined interface at port 3005 remains a separate prototype.

- /tools/contacts-converter: local UTF-8 VCF/CSV inspection and conversion, multiple phone/email fields, export-loss warnings and spreadsheet-safe CSV default. Simplified fields only; not a full contact backup or deduplication tool. Legacy encoded vCards are rejected.
- /tools/whatsapp-link-generator: formatted international number validation, encoded messages, real QR PNG and explicit outbound WhatsApp link. No message is sent by generation. Number ownership/registration is not verified.
- /tools/solid-background-remover: selected-colour transparency with tolerance, cancellation and image limits. Pixel matching affects foreground colours too; this is not AI segmentation.
- /tools/image-compressor and /tools/batch-image-processor: optional target KB per image. Bounded quality search and resizing return an output within the byte limit or an error. Format-specific losses remain disclosed.
- Existing PDF merge/page-organizer implementations were retained rather than importing a duplicate or simulated path.

Validation: frontend TypeScript and production build passed; 254 visible tool pages generated. Contact tests passed for Unicode/multiline VCF and CSV round trips, multiple phone/email fields, formula protection and malformed inputs. WhatsApp encoding/validation passed. These tests are included in the release workflow.

Browser checks: synthetic CSV produced the expected contact row; a synthetic phone/message produced a correctly encoded link and displayed QR; a synthetic white-background/red-square PNG completed background processing; a 1 KB image target produced a reported 0.8 KB WebP from a 1.2 KB PNG. Downloaded image artifacts were not independently reopened, and the QR was not independently scanned. No live WhatsApp action was taken. Full format/device/performance testing remains broader release work.

Known scope: vCard fields beyond names/phone/email/company are not preserved, phone labels are simplified, and contacts export/import is not certified across all address-book applications. Test small imports and retain originals. The merged visual design, deeper deduplication and reference-only document/schema visualizations remain separate work.

## Combined homepage integration (2026-09-12)
- Integrated the approved preview's search-first hero, six essentials and category directory into the working React homepage, using all 255 visible tools across 21 categories.
- Added multi-word search, combined category filtering, empty-result recovery and accessible expandable category groups. Existing sidebar, preferences, tool routes and theme remain integrated.
- Validation: frontend TypeScript check and production build/discovery passed; adopted contact/WhatsApp checks passed. Browser checks covered search, empty results, reset, all 21 groups and a 390px mobile viewport with no horizontal overflow.
- Added a homepage regression case to tests/release.spec.ts. Full CI suite has not been run here.

## Search, categories and themes — 13 September 2026
Shared local intent search now covers homepage, header, sidebar/mobile directory and My tools. Exact matches rank above synonyms, and synonyms in titles rank above descriptions. Regression checks cover every catalogue title and shrink/compact/photo/payroll/pretty JSON queries. This is a curated vocabulary, not an AI service or exhaustive natural-language understanding.

Video compression moved into Images & Media (9 tools); ZIP creation moved into Data & Files (31 tools). There are 255 tools in 19 categories, none with only one tool. Old category entry points remain available with canonical metadata pointing to the consolidated category.

My tools offers Jade Studio and Indigo Paper; both support persisted light/dark mode. Palette choice uses a separate browser-local storage key so older open builds cannot overwrite it.
Browser validation: shrink results verified in homepage, header, sidebar and My tools; both palette selections and light/dark styles inspected; 390px layout had no horizontal overflow. Fixed old-tab preference overwrites by storing the palette separately. Frontend typecheck, production build/discovery and adopted-tool/search regression checks passed. Added a CI browser regression for intent search and theme persistence; full CI not run locally.

## Image compression no-growth fix — 13 September 2026
Compared against the reference repo ToolArea.tsx compressImageClientSide: it uses canvas.toBlob, WebP at 80%, with a 1920px width cap. The current app uses the same browser encoder/default quality but caps the longest edge instead. The deployed URL could not be retrieved by the web tool; no live output equivalence is claimed.

Image Compressor now starts at selected quality, tries 5-point quality steps down to 50% (or the user's lower selected quality) only when target=0 output would grow, and returns the byte-identical original when no smaller output is found. PNG skips ineffective quality iteration. Retained results disclose that original format, dimensions and metadata remain; their extension follows the retained MIME. Positive targets still use the existing target-fitting encoder. Batch Image Processor remains an explicit conversion workflow and may produce larger files.

Six isolated regression tests passed for no-growth, quality fallback, first-encode success, PNG, positive targets and cancellation/invalid input. TypeScript and build passed. Added a real-browser download identity regression to tests/release.spec.ts; full CI/browser upload test has not been run here.

## Break-even calculators and PDF masking — 17 September 2026
Existing break-even tools: Basic, Startup, SaaS, Ecommerce and Crypto. Added Buy vs Rent, EV vs Fuel, Advertising ROAS/CPA, Freelancer/Service and Loan Refinance. These address practical comparison tasks; no search-volume or traffic ranking is claimed. Inputs and assumptions are editable and each calculator states exclusions. EV comparison includes upfront prices, distance, efficiency, electricity/fuel prices, maintenance, payback and horizon costs. Buy/rent compares net sale equity with investing avoided upfront and monthly costs.

PDF Editor & Redaction keeps selected pages and adds removable rectangular masks before export. Export rebuilds kept pages as masked PNG images in a fresh PDF, rather than retaining original text beneath overlay shapes. This deliberately loses selectable text, links, forms and signatures. Source files stay local and unchanged. Limits: 20 MB and 40 pages; review all exported pages before sharing.

Validation: five formula/mask-geometry tests passed; frontend typecheck and production build/discovery passed (263 tools). Browser confirmed EV defaults and recalculation when distance changes. Synthetic two-page PDF loaded; deselecting page 2 and masking page 1 completed export without console errors. The browser download event was not exposed successfully, so downloaded-file extraction/pixel verification remains unconfirmed.

## Units, preferences and test data — 22 September 2026
EV comparison now accepts daily mileage with kilometre/mile selection and litre/US-gallon/Imperial-gallon fuel units. Canonical units stay annual kilometres, km/litre, currency/litre and kWh/100km so switching display units preserves the same scenario. Daily distance uses 365 days. Existing currency preferences are preserved; new profiles default to USD. My tools includes explicit date formats, applied to footer, exchange-rate update dates and subscription expiry.

Added accessible plus/minus controls to ownership and shared business break-even calculators, and CTC amount input. CTC slider changes the package/target while retaining component rules; fixed values remain fixed, percentages scale. Added a shared full-form term guide and clearer SaaS/ad explanations. New local tools: SQL Data Generator (one simple CREATE TABLE, four output dialects, 1–1,000 rows; rejects unsupported constraints), repeatable sample customer JSON/CSV, and boundary-value examples.

Validation: frontend TypeScript/build/discovery passed (266 tools). Ten focused calculation/generator/mask tests and catalogue/search checks passed. Generated 1,000 SQL rows executed successfully in an isolated in-memory SQLite database. HTTP routes return 200. Final browser visual verification was blocked by ERR_BLOCKED_BY_CLIENT; no screenshot-based verification is claimed for this batch. Existing colour palette unchanged.

## Interactive EV charging comparison — 23 September 2026
Added a per-page currency selector and usable battery capacity/full-charge range inputs. Full-charge grid energy includes configurable charging losses (battery/(1-loss)); per-distance electricity cost uses real-world full-charge range. Daily-distance and inverse target-month modes share tested math. Target mode solves distance from purchase premium, per-distance savings and annual maintenance difference, and refuses misleading targets when extra driving cannot save money. Chart compares purchase plus running costs over selected horizons. All colours use existing theme variables.

Glossary and guidance sections now collapse across tools; related ownership and business break-even assumptions collapse, and business break-even results use compact cards. Eight targeted charging/usability tests passed; frontend TypeScript passed.
