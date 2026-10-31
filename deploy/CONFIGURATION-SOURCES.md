# Configuration recovered from the existing app

Inspected AI-Journey-coder/ToolzCraft main at commit 951c582e10e4c51555808a45b965accddbb3ed6d on 12 September 2026. Only compatible public configuration was imported. The current repository's code and Git remote were preserved.

- `firebase-applet-config.json`: project toolzcraft-062026, web app 1:181369384290:web:6a53c705772b02d6d2103b, public API key and matching default auth domain. Saved the relevant public settings in deploy/firebase.web.json and the local frontend build environment. These are public web configuration, not Firebase Admin credentials.
- `public/ads.txt` and `src/components/AdSenseAd.tsx` agree on publisher ca-pub-7038600512011867. Copied the existing lowercase ads.txt authorization and set verification metadata. No ad-serving scripts were imported or enabled. The repository entry does not prove current AdSense approval; check it against the operator's account before public release.
- Google and Phone providers were reported enabled by the operator. Enabled the local phone-login UI build flag. Provider availability, SMS billing/region policy, authorized domains and successful authentication are still live checks, not established by the JSON configuration.
- Cloud Run project/service/region come from the operator: toolzcraft-062026 / toolzcraft / asia-southeast1. The inspected tree has no Cloud Run deployment manifest or container build configuration that verifies the running service's secrets, service identity or environment.

## Configuration that cannot be copied directly

The old app uses named Firestore database `ai-studio-aaa9d641-373f-40d1-9dad-f1cb25c1d47c` and local JSON/CSV fallbacks. This app's account API uses PostgreSQL and requires DATABASE_URL plus migrations. Copying the Firestore database ID into DATABASE_URL would not work. No PostgreSQL connection or Cloud SQL instance was found in the inspected configuration files.

The old .env.example contains placeholders for GEMINI_API_KEY and APP_URL; these are not usable runtime credentials. Cloud Run's runtime service account and its Firebase Auth permissions are not established by source code. Use the configured Cloud Run identity with Application Default Credentials rather than copying a private key into frontend settings.

The old server's admin middleware trusts a supplied email in the body/query/header rather than verifying an ID token. Its feedback listing also lacks an authentication middleware. These routes were not imported. If that older server is currently public, its access controls require remediation before exposing private records or administrator operations. No requests to those live endpoints were made during this inspection.

## Next required input

Determine whether PostgreSQL/Cloud SQL already exists for this app. The local static preview can show configured Google/phone sign-in controls, but account synchronization will not complete until the API and its database are running. Do not describe the frontend-only preview as verified authentication.

When building a Cloud Run image, pass the public Firebase values as the Dockerfile's VITE_FIREBASE_* build arguments along with VITE_ENABLE_PHONE_AUTH=true and the public operator/site values. deploy/firebase.web.json is a configuration inventory, not an automatically loaded Docker secret or build argument file. The existing browser-only Compose example does not provision the account backend.
