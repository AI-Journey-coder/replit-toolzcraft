# ToolzCraft homepage performance verification

Compared the locally served production release at c7bb25d with the working tree. No cloud deployment. The November 14 public PSI baseline was mobile 82 / desktop 66. Its network, browser and machine differ from this local experiment.

## Cold homepage results

Medians of three fresh Chromium launches per build and form factor, alternating before and after. Lighthouse 12.8.2, Chromium build 1181, mobile default and desktop preset, simulated throttling, same loopback origin, no signed-in account. JS bytes are Lighthouse network transfer sizes including response overhead. All times are milliseconds.

| Device | Build | Score | FCP | LCP | TBT | CLS | Speed Index | First-party JS bytes | All JS bytes | Long tasks |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| mobile | before | 37 | 15669 | 15669 | 341 | 0.204 | 15669 | 2762488 | 2762488 | 7 |
| mobile | after | 85 | 2320 | 3546 | 190 | 0.000 | 2320 | 241123 | 241123 | 7 |
| desktop | before | 71 | 2620 | 2620 | 10 | 0.009 | 2620 | 2762488 | 2762488 | 2 |
| desktop | after | 100 | 502 | 649 | 7 | 0.001 | 602 | 241123 | 241123 | 1 |

Individual scores: mobile before scores 38, 35, 37; mobile after scores 85, 84, 85; desktop before scores 70, 71, 71; desktop after scores 100, 100, 100. External HTTPS resources were blocked identically in both lab arms to isolate first-party startup. This omits external authentication network costs. The local server had no publication API upstream. Lighthouse issued navigation-timeout warnings; use the paired measurements directionally. Local lab scores do not predict field scores.

## Changes and evidence

- **artifacts/toolkit/src/App.tsx** defers the formerly eager tool implementation imports until the matching tool renders under its existing Suspense boundary. Tools in the same source module share a chunk. The initial entry shrank from 2,761,016 to 801,956 uncompressed bytes. PDF, OCR and document workflows retain their existing dynamic boundaries.
- **artifacts/toolkit/src/pages/Home.tsx** avoids mounting the tool links in collapsed homepage categories. Search and expand-all still expose the full catalogue.
- **artifacts/toolkit/src/components/HomeHero.tsx** and **scripts/build-discovery.cjs** share the hero between the prerender and React. The original plain directory was replaced on startup by a different heading, search field and page layout. The new static shell reserves header and sidebar space; Layout.tsx gives the mobile controls a stable second row and index.html preloads the primary Latin font and retains category links. Tool prerenders and canonical generation stay on the existing path.
- **scripts/build-discovery.cjs** generates gzip sidecars for hashed JS and CSS. **deploy/server.mjs** serves them when accepted, varies the cache on encoding and preserves identity byte ranges. The entry gzip payload is 239,628 bytes. Compression happens at build time. **scripts/check-server.test.mjs** covers compressed and identity responses.
- Startup uses React createRoot, so prerendered DOM is replaced rather than hydrated. React, Firebase initialization, registry, navigation and global UI still execute on entry. CSS remains render blocking. No changes to authentication or billing were made.

## Regression checks

Production build and workspace TypeScript passed. The Node test discovery run passed 92 and skipped three PostgreSQL-dependent cases; a follow-up with a fresh loopback PostgreSQL instance passed all 26 cases across the three relevant files with zero skips. Static server regression suite passed after compression was added. Playwright passed 43 tests including offline OCR, PDF organization, CSV conversions, and free invoice checks. All 273 tool URLs rendered their guidance with HTTP 200 and no recorded page errors or mobile overflow.

## Remaining risks

The header and content below the hero still differ between static and interactive markup. Lighthouse score and Speed Index remain sensitive to fonts, stylesheet delivery and third-party requests. Repeat public PageSpeed measurements after an explicitly authorized rollout. Changes were tested on the local production build only.
