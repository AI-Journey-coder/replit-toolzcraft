# Cloud Run staging preparation

Project: toolzcraft-062026. Region: asia-southeast1.
Use separate staging service names and a separate staging database. Do not change toolzcraft.com DNS or the existing toolzcraft service.

## Next access check
In Google Cloud Console, select toolzcraft-062026 and activate Cloud Shell. Run:

```sh
gcloud config set project toolzcraft-062026
gcloud auth list --filter=status:ACTIVE --format='value(account)'
gcloud run services list --region=asia-southeast1 --format='table(metadata.name,status.url)'
```

No credentials should be pasted into chat. These read operations identify the signed-in account and existing service names.

## Pending choices and verification
- Staging PostgreSQL hosting and budget need confirmation before provisioning paid resources.
- Public Firebase build settings are in firebase.web.json, aligned to the working local configuration. Add the eventual staging website hostname in Firebase authorized domains.
- Use test Razorpay keys and a staging webhook. Runtime secrets must use Secret Manager, not Docker build arguments or repository files.
- The API image is Dockerfile.api. The website image is Dockerfile. API_UPSTREAM must connect the website to its staging API. Choose and verify Cloud Run networking and identity before deployment.
- The public publication gate deliberately blocks AI-enabled builds pending live-service review. A staging-specific build path must preserve publication restrictions and enforce noindex before testing AI online.
- Keep staging API at one instance until distributed throttling is implemented and verified. This is a temporary staging constraint, not a production scaling design.

No cloud resources have been created by preparing this file.
