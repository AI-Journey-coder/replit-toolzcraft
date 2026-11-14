# AdSense verification

The operator confirmed publisher ca-pub-7038600512011867 on 26 October 2026.

Production Docker builds default to this public publisher ID. The discovery build inserts google-adsense-account metadata into generated HTML. public/ads.txt authorizes pub-7038600512011867. Staging explicitly passes an empty publisher argument and remains noindex.

This configures ownership verification, not ad serving or approval. No adsbygoogle script is enabled. Google documents the meta-tag verification option at https://support.google.com/adsense/answer/7584263 .

After an approved production deployment, check the public homepage source for the meta tag and /ads.txt for the matching publisher. In AdSense, open Sites, select toolzcraft.com, choose the meta-tag verification option and verify. Request review only after the production readiness checks are complete. Do not submit the staging hostname.

Ad serving requires a separate implementation and review of consent, privacy disclosures, ad placement and Content Security Policy.
