# New tools — local review

Implemented September 2026. The directory now contains 254 tools across 22 categories. No deployment or GitHub push was performed.

## Added tools

| Group | Tool routes | What to check |
| --- | --- | --- |
| PDF | `/tools/pdf-page-organizer` | Reorder, rotate, duplicate, exclude pages, download. Limit 150 source pages. |
| PDF | `/tools/searchable-pdf` | OCR a scan into a searchable PDF; cancel processing. Limit 20 pages; language downloads need internet. |
| PDF | `/tools/pdf-form-filler` | Fill AcroForm text, checkbox, radio and choice fields; optionally flatten. XFA and signing unsupported. |
| Compression | `/tools/pdf-compressor` | Lossless repack or lossy scan compression; compare sizes. Image mode removes interactive content and selectable text. |
| Images | `/tools/batch-image-processor`, `/tools/image-compressor` | Resize, convert, rename and compress JPEG/PNG/WebP; individual downloads or ZIP. Up to 100 images. |
| Data | `/tools/csv-cleaner` | Trim, remove blank/duplicate rows, fill missing values, normalize explicitly selected date columns. Quoted multiline values preserved. |
| Compression | `/tools/video-compressor` | Local MP4/H.264 encoding, quality and resolution controls, optional audio removal, cancel. Up to 150 MB; the engine download is about 32 MB uncompressed. |
| Compression | `/tools/file-compressor` | ZIP arbitrary files, up to 100 MB total. Already compressed media may not shrink. |
| Calculators | `/tools/money-value-calculator` | Past/future assumed inflation scenarios, or historical World Bank annual CPI for ten countries. No foreign exchange conversion or future prediction. |
| Calculators | `/tools/savings-goal-calculator`, `/tools/real-salary-raise` | Monthly savings target and inflation-adjusted pay changes. |
| SQL (upgraded) | `/tools/sql-dialect-converter` | Oracle, SQL Server, MySQL, PostgreSQL, SQLite, Snowflake, BigQuery, DuckDB, Redshift, Spark, Trino and experimental DB2 SELECT subset. |

SQL runs locally using bundled SQLGlot/Pyodide, with cancellable workers. All 132 cross-dialect choices are selectable, plus 12 same-dialect choices. This is query translation, not a complete schema/procedure/database migration service. DB2 supports a restricted basic SELECT subset; unsupported constructs are rejected. Always validate output against the target database and schema. The tests cover a common SELECT across the matrix, not every language feature.

Files are processed in the browser. Historical CPI requests send country and years to World Bank, not your entered amount. Compression reports actual before/after sizes and cannot guarantee a target size.

## Start or restart

Open PowerShell in this checkout. Stop an older server with Ctrl+C in its own terminal, then run:

```powershell
.\Start-Local.ps1
```

Keep that terminal open and visit http://localhost:3000. To use a separate port:

```powershell
.\Start-Local.ps1 -Port 3002
```

After rebuilding, refresh the browser with Ctrl+Shift+R so it uses the new asset filenames. The launcher rebuilds before serving and fails clearly if its port is occupied. No Firebase or database setup is required for these tools.

## Discovery and verification

New tools are featured on the home page and have registry categories, descriptions and usage guidance. Builds generate 254 tool-specific HTML entry points with titles and descriptions. Set `VITE_SITE_URL=https://your-real-domain.example` in `artifacts/toolkit/.env.local`, then rebuild to generate canonical URLs and a production sitemap. These pages provide initial headings/descriptions; the interactive app still requires JavaScript. Hosting must serve existing generated files before SPA fallback. Rankings and traffic are not guaranteed.

Passed: frontend TypeScript check, production build, calculator and CSV cases, PDF form/page-copy primitives, basic SQL across 144 selections, DB2 unsupported-DDL rejection, and an actual short MP4 encoding with the bundled engine. HTTP checks confirmed all 13 added/upgraded routes and 21 built JS/WASM assets load, including the PDF chunk and local SQL assets.

```powershell
node scripts/check-new-tools.cjs
node scripts/check-media.cjs
```

Not yet verified end to end in a browser: real-document OCR export, browser cancellation/download interactions, historical CPI requests and device-specific video memory limits. Review those with representative files before publication. Existing build warnings include a large initial app bundle and TOML dependency warnings; the new heavy engines are loaded on demand.

## September 11 follow-up: navigation, preferences and payroll

- Persistent category sidebar on desktop; expandable directory on mobile.
- `/my-tools`: browser-local favourites and currency preference, with reset.
- `/logo-gallery`: six selectable SVG marks and downloads; use VITE_DEFAULT_LOGO for the published default.
- Length converter: combined feet/inches input and output; 63 inches correctly gives 5 ft 3 in.
- Money comparison: editable item quantities, two verified-price inputs, and a sourced BLS milk example.
- `/tools/ctc-calculator`: automatic country suggestion/manual override, India planning preset or global configurable worksheet, component locks, percentages, forward/reverse CTC and CSV export. Taxes and jurisdiction-specific applicability need manual review.
- Public policy hub at `/compliance`; operator handoff in COMPLIANCE.md.
- Builds now include tool guides, category listings and policy content in initial HTML. Unavailable AI tools are omitted from listings.
