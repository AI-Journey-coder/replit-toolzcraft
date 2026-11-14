# Publication and compliance review

Updated 11 September 2026. This is an operator handoff for the implemented build, not a legal opinion, compliance certificate or Google approval. The app is still a local preview.

## Public documentation included

- `/about`: purpose, processing and result checks.
- `/contact`: configurable operator identity, private contact channel and public issue-reporting limits.
- `/privacy`: local processing, preferences, external services, optional accounts/usage, retention and requests.
- `/terms`: acceptable use, input rights and service limits.
- `/cookies`: preference storage, authentication persistence and advertising status.
- `/disclaimer`: calculator, payroll, document, SQL and AI limits.
- `/accessibility`: access features, known barriers and reporting; no unverified WCAG claim.
- `/editorial-policy`: sources, corrections, independence and rights concerns.
- `/data-requests`: local deletion, account requests and complaint routes.
- `/compliance`: policy directory and transparency statement.

The build renders policy text and tool guidance into initial HTML, including category links. This is crawlable fallback content; interactive tools still need JavaScript. Personal settings, logo selection, admin, login and disabled AI pages carry noindex. Disabled AI tools are omitted from the public directory and sitemap. External Google font requests have been removed.

## Supply before publication

Set real values in `artifacts/toolkit/.env.local` (or the production build environment):

```dotenv
VITE_SITE_URL=https://your-real-domain
VITE_OPERATOR_NAME=Your legal operator name
VITE_CONTACT_EMAIL=your-monitored-private-email
VITE_OPERATOR_JURISDICTION=Your applicable jurisdiction
VITE_OPERATOR_ADDRESS=Your public business address if applicable
VITE_DEFAULT_LOGO=original
```

Operator name, domain and private email are not known to this project yet. Do not publish invented details or the local-preview contact fallback. Have the operator review which legal bases, regional rights, international-transfer arrangements and retention periods actually apply. Document actual retention and deletion procedures before enabling accounts or usage tracking; current database records have no automatic expiry. Address and governing-law requirements depend on the operator and applicable law.

Run `node scripts/check-publication.cjs` after rebuilding. It fails for missing essentials and calls out enabled online features needing review. Passing this check only checks stated project conditions; it cannot certify legal compliance, authenticity of an email, crawler behaviour or AdSense approval.

## Actual processing inventory

| Feature | Destination / storage | What leaves the browser |
| --- | --- | --- |
| Preferences | localStorage `toolzcraft.preferences.v1` | Nothing; browser-profile favourites, currency and logo until reset |
| PDF / images / CSV / ZIP / video | Browser memory and downloaded files | No file upload by these tools |
| SQL translation | Local Pyodide and SQLGlot | No submitted SQL sent to a remote converter |
| OCR | Browser Tesseract; language/core resources may come from package defaults/CDNs | Resource requests expose connection metadata; source documents are processed locally |
| Exchange rates | `open.er-api.com` | Selected base currency and connection metadata |
| Historical inflation | `api.worldbank.org` | Country, years, connection metadata; not amount |
| CTC country suggestion | `api.country.is` | IP/connection metadata; salary not sent; manual override available |
| Optional Firebase | Google Firebase | Authentication/profile information; operator database sync |
| Optional AI | Application server and configured provider | Submitted text/options; disabled by default |
| Optional usage | Application API/database | Tool/time and optional account association; disabled by default |

Third-party destinations have their own policies. Hosting/CDN and provider logs must be assessed for the actual deployment. Browser preferences are shared within a browser profile, not isolated by sign-in, and do not sync across devices. Reset is available in My tools.

## Google AdSense deployment steps

1. Review all visible tools on the deployed HTTPS site, including mobile layout, keyboard use, downloads and error states. Expand original examples where category guidance is insufficient. No code change guarantees Google's content-quality decision.
2. Confirm real operator/contact information and accurate privacy text. Verify all public links, generated tool/category/policy HTML and sitemap. Serve generated files before the SPA fallback, and return real HTTP 404 status for unknown URLs in your production host. Vite preview is not production hosting.
3. Use the verification method provided by your own AdSense account. Optionally set `VITE_ADSENSE_PUBLISHER_ID=ca-pub-...` to the real ID and rebuild; the build adds account-verification metadata only. It does not load ad scripts.
4. If Google provides an ads.txt line, publish that exact authorized line at the domain root and verify it publicly. This code does not invent an ID or reseller authorization.
5. Before enabling ads, implement and test the required consent management platform for applicable regions. Google requires a certified CMP integrated with the IAB TCF for relevant EEA, UK and Switzerland traffic. Document actual vendors, identifiers, purposes and opt-out/withdrawal routes. A local preference checkbox is not a CMP.
6. Update the current no-ad privacy/storage text when ads actually run: disclose Google/other vendors' cookie use and applicable personalization choices. Avoid ad placements near tool actions, copy/download buttons, navigation and input controls. Exclude personal, admin, sign-in, error and unavailable-content pages from ads.
7. Do not click your own ads, ask users to click, buy invalid traffic or make promises of Google endorsement. Submit the live site through your own account and address Google's actual review findings.

Official sources checked for this work:
- [AdSense program policies](https://support.google.com/adsense/answer/48182?hl=en)
- [Google publisher policies](https://support.google.com/adsense/answer/10502938?hl=en)
- [Required privacy content](https://support.google.com/adsense/answer/1348695?hl=en)
- [Consent management](https://support.google.com/adsense/answer/7670013?hl=en)
- [Connect a site for review](https://support.google.com/adsense/answer/7584263?hl=en)
- [ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en)

## Payroll scope and validation

The country is suggested from network location and can be overridden. It is not tax residence. India has editable planning defaults; other countries use an explicitly unconfigured worksheet, not invented statutory rates. Currency relabelling is not FX conversion; the India preset stays in INR. Taxes are manual annual amounts, not automatically calculated tax slabs. Fixed tax amounts stay fixed during reverse solving and must be rechecked for the resulting pay.

India includes basic/DA, HRA, bonus, PF/pension, gratuity provision, optional ESI, employer insurance, EDLI/admin/LWF fields, income tax, professional tax and other deductions. All applicability must be reviewed. State minimum wages, bonus entitlement, tax regime, EDLI/admin allocation and LWF are not automatically inferred. A user-reviewed checkbox records no legal certification. The simplified wage base uses gross cash plus employer PF for its 50% floor; override it for your verified statutory base and exclusions. Gratuity is an accounting estimate, not an entitlement decision. Rates and lock controls do not override law.

Sources linked inside the calculator: EPFO contribution table, ESIC coverage/rates, March 2026 Labour Ministry wage FAQ and the Income Tax Department estimator. Verify the relevant payroll year's rules before use.

## Known remaining release checks

Build and automated math checks are not browser end-to-end tests. Test real OCR, compression, payroll forms, downloads, country detection failure, preferences reload, mobile navigation and screen-reader use. Validate the published host's security headers, HTTPS, API authentication, Firebase authorized domains, backups, rate limits, data retention and admin provisioning if online services are enabled. Review third-party licence notices before distribution. Large initial JavaScript and existing TOML dependency build warnings remain performance/compatibility review items.
