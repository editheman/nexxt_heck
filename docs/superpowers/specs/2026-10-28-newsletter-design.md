# Newsletter prompt & progressive email capture — Design

Date: 2026-10-28 · Requested by the owner with a full requirement list. Decisions marked **[call]** were made by Claude.

## What counts as an "article"
The app has no news feed (by design — CLAUDE.md forbids invented live data). The readable articles are the learning modules at `/invata/[slug]`, which the homepage presents as articles. **[call]** These are the articles that are counted. If a real news section is added later, it calls the same `trackArticleOpen(slug)` with its own catalog.

## Behaviour
1. **Tracking (privacy-conscious):** when an article page mounts, its slug is added to a local set of *distinct* opened articles. No timestamps, referrers, durations or network calls. Unknown slugs are ignored. Stored under `pcac:reading:v1`.
2. **Trigger:** the prompt may appear once **≥ 2 distinct articles** have been opened. It renders **inline after the article's takeaways** — never a modal, never covering content, and the "mark as read / quiz" actions stay above it.
3. **Frequency limits [call]:**
   - Close (✕, "Poate mai târziu") → snooze 14 days; second close → 30 days; a third close counts as declined.
   - "Nu, mulțumesc" → declined; never shown automatically again.
   - At most **3 impressions** in total; one impression = one article view where the prompt was rendered.
   - Never shown when subscribed.
   - Subscribing stays possible from the Progres page ("Datele tale"), so declining is not a dead end. Unsubscribing lives at `/dezabonare` and on the Progres page.
4. **Form:** email (`type=email`, visible label) and a **separate, unchecked** marketing-consent checkbox whose text is versioned (`CONSENT_TEXT_VERSION`). Submitting with an email but no consent stores **nothing** and shows an inline error on the checkbox. Privacy notice linked (`/confidentialitate`).
5. **No financial data:** the form asks for an email address only.
6. **Onboarding (added later):** step 1 of `/profil` offers the same optional email + separate unchecked consent; consent records use `source: "onboarding"`. An email without consent is rejected and nothing is stored.

## Data model (separate localStorage keys)
| Key | Contents | Never contains |
|---|---|---|
| `pcac:reading:v1` | `{ opened: string[] }` distinct article slugs | timestamps, URLs |
| `pcac:prompt:v1` | `{ impressions, dismissals, snoozedUntil, declined }` | email |
| `pcac:subscriber:v1` | `{ id, email, createdAt, delivery: "demo" }` — exists **only** with granted consent | consent text |
| `pcac:consent:v1` | append-only log `{ subscriberId, purpose, granted, at, textVersion, source }` | email |

Subscribers are therefore separate from general users: a visitor who never consents has no subscriber record and no email stored anywhere. Unsubscribing deletes the subscriber record (email) and appends a `granted: false` entry to the consent log. "Resetează demo-ul" clears all four keys.

## Demo vs production
No email service is configured, so delivery is `"demo"`: the UI labels the form "Mod demo", and the success state says the subscription was recorded **only in this browser** and that **no email is sent**. Production requirements are in `docs/newsletter.md`.

## Tests
Unit (`src/lib/newsletter.test.ts`): trigger count (1 → no, 2 distinct → yes, same twice → no), dismissal snooze and escalation, decline, impression cap, repeated visits after cooldown, email validation, consent required, consent record has timestamp + version and no email, unsubscribe removes email and logs withdrawal, corrupt storage → defaults. E2E: two articles → prompt after second; checkbox unchecked; submit without consent → error, nothing stored; dismiss → not shown on next article; subscribe → demo confirmation; unsubscribe.
