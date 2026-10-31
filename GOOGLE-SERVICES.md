# Google services: what the operator must provide

Browser PDF/image/video/SQL tools do not require a Google API key. OCR uses Tesseract in the browser, not Google Cloud Vision. Public currency, country and inflation data services are not Google APIs. Leave all optional Google features unconfigured for a browser-only launch.

## Google sign-in through Firebase

Provide the **public web-app configuration** from Firebase Project settings: API key, project ID and app ID. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_APP_ID before building. The app currently uses PROJECT_ID.firebaseapp.com as authDomain. Public Firebase configuration identifies a project; it does not grant administrator access.

In Firebase Authentication enable Google, set the support email, and authorize the exact production hostname (and any staging hostname). Configure localhost explicitly if required for local Google sign-in. Review the associated OAuth branding/consent screen and API-key restrictions against the actual app. See [Google sign-in setup](https://firebase.google.com/docs/auth/web/google-signin).

The backend needs the same FIREBASE_PROJECT_ID and an identity with the required Firebase Authentication permissions. Prefer the host's workload identity/Application Default Credentials; otherwise mount a service-account file privately and set GOOGLE_APPLICATION_CREDENTIALS, or inject FIREBASE_SERVICE_ACCOUNT_JSON through the secret manager. **Do not paste the private JSON here, put it in Git, expose it in a VITE_ variable or send it to the browser.** The Admin SDK verifies ID tokens including revocation; the application additionally checks disabled accounts and roles in PostgreSQL.

## Optional phone sign-in

Leave VITE_ENABLE_PHONE_AUTH=false unless phone login is needed. Enable Firebase's phone provider, configure SMS destination regions, billing and quotas, authorize the real HTTPS hostname and test reCAPTCHA plus delivery with Firebase test numbers before real SMS. Firebase phone sign-in does not support localhost as its hosted domain. Phone numbers are sent to Google for authentication/abuse prevention; the login UI includes this notice. See [phone setup](https://firebase.google.com/docs/auth/web/phone-auth) and [billing/limits troubleshooting](https://firebase.google.com/docs/auth/faq-and-troubleshooting).

## Optional Gemini tools

Provide a current server-side Gemini credential through the host secret manager, a permitted model ID and a spending limit. Set GEMINI_API_KEY, AI_PROVIDER=gemini, AI_MODEL and ENABLE_AI=true on the API only. VITE_ENABLE_AI=true controls the frontend, but publication remains blocked until provider/privacy/live-endpoint review is complete. Firebase login and a working account API are prerequisites. Submitted AI text leaves the device; verify provider data terms and update disclosures for the chosen account/service. See [Google's current API-key instructions](https://ai.google.dev/gemini-api/docs/api-key). Do not rely on a floating model alias without testing the model you plan to launch.

## AdSense

There is no AdSense API integration and no API key is required. Supply your real publisher ID only if using verification metadata: VITE_ADSENSE_PUBLISHER_ID=ca-pub- followed by your 16 digits. This does not enable ads. Add only the ads.txt authorization supplied by your account. Ad serving requires a separate consent/placement implementation and the live site's review; see COMPLIANCE.md. Google makes the approval decision after deployment.

## Information to send versus secrets to configure

You can send the final domain, operator/contact details, hosting choice, desired Google features, public Firebase web configuration, selected Gemini model and AdSense publisher ID. Configure database passwords, Gemini credentials and Firebase service-account secrets directly in your hosting secret manager. Then perform the staging sign-in/API checks together; do not share private keys in chat.
