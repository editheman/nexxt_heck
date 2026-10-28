> **Status (2026-10-29):** the newsletter UI was removed at the owner's request. This document is kept as the requirements reference if the feature returns.

# Newsletter (digest săptămânal) — demo status and production requirements

## Current status: demo only
- **No email service and no backend are configured.** Nothing is sent and nothing leaves the browser.
- The UI says so wherever the form appears ("Mod demo") and after subscribing ("Abonare înregistrată (mod demo)… nu a fost trimis niciun e-mail").
- Data lives in four separate localStorage keys (see `src/lib/useNewsletter.ts`):
  `pcac:reading:v1` (distinct article slugs), `pcac:prompt:v1` (impressions/dismissals/snooze/decline),
  `pcac:subscriber:v1` (id + email, only with consent), `pcac:consent:v1` (append-only consent log, no email).
- Logic and rules: `src/lib/newsletter.ts`, spec: `docs/superpowers/specs/2026-10-28-newsletter-design.md`.

## What production needs
1. **Backend endpoint** (e.g. a Next.js Route Handler) that receives `{ email, consent: { granted, at, textVersion, source } }` and validates it server-side with the same rules (`validateEmail`, consent must be `true`). Rate-limit it and add bot protection.
2. **Email service provider** with an EU-hosted or GDPR-compliant setup and a signed data processing agreement (DPA). Store the API key only server-side (never `NEXT_PUBLIC_*`).
3. **Double opt-in**: send a confirmation email and activate the subscription only after the link is clicked; record the confirmation timestamp in the consent log.
4. **Subscriber and consent storage** on the server, in separate tables: `subscribers(id, email, status, created_at)` and `consent_events(subscriber_id, purpose, granted, at, text_version, source, ip_hash?)`. General app users who never opt in must not appear in `subscribers`.
5. **Unsubscribe**: a per-subscriber signed token link in every email (`/dezabonare?token=…`) that works without login, plus `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers (RFC 8058). Unsubscribing deletes or suppresses the email and appends a `granted: false` consent event. Replace `UnsubscribePanel`'s local action with a call to this endpoint.
6. **Privacy notice** (`/confidentialitate`): add the controller's identity and contact details, processors (the email provider), retention periods and international transfers. Have it reviewed — GDPR and the Romanian electronic-communications rules (Legea nr. 506/2004) apply to marketing email; confirm details with legal counsel.
7. **Consent text changes**: bump `CONSENT_TEXT_VERSION` in `src/content/consent.ts` whenever the wording changes; keep old versions archived so each consent record can be matched to the exact text.
8. **Actual digest content** must follow CLAUDE.md: sourced from official publications, no invented figures, and clearly separated from personalized advice.

Until these exist, keep the UI's demo labels. Do not change the success copy to claim that an email was sent.
