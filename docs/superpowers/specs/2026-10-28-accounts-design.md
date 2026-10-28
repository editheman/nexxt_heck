# Accounts (sign-up / login / logout) — Design

Date: 2026-10-28 · Requested by the owner: profiling becomes creating a password-protected profile; the avatar in the header opens „Intră în cont / Creează cont” when logged out and „Portalul meu / Deconectare” when logged in.

## Constraint and decision
There is no backend. **[call]** Accounts are **local demo accounts**: stored in this browser's localStorage, labelled as such in the UI. This is not real authentication (anyone with access to the browser profile can read or delete local data); production needs server-side accounts (see below).

## Security within the demo
- Passwords are never stored. Each account keeps `{ salt (16 random bytes), hash, iterations }` from **PBKDF2-HMAC-SHA-256, 600 000 iterations** (OWASP 2023 guidance) via Web Crypto; verification recomputes and compares in constant time.
- Login error is generic („Nume de utilizator sau parolă greșită”) so it does not reveal which usernames exist.
- Username: 3–24 characters `a–z A–Z 0–9 . _ -`, unique case-insensitively. Password: 8–128 characters, at least one letter and one digit. Confirmation must match.
- Login identifier is a username, not the email, so the email stays optional and tied only to the digest consent.

## Data separation
- `pcac:accounts:v1` — list of accounts (id, username, salt, hash, iterations, createdAt). `pcac:session:v1` — `{ accountId }`.
- Each account's `DemoState` lives under `pcac:acct:<id>:v1`; newsletter data (subscriber, consent log, prompt, reading) under `pcac:acct:<id>:<name>:v1`. Logged out = guest keys (`pcac:v1`, `pcac:subscriber:v1`, …).
- On sign-up the current guest state is **moved** into the new account, so progress made before creating the account is kept and the guest slot is left empty.
- Logout clears the session only; the account's data stays for the next login.

## Flow
- `/profil` when logged out = **Creează cont**: step 1 username + password + confirm (show/hide), optional email + separate consent, optional age range; creating the account happens on „Continuă”, then step 2 (money) → Reality Check → simulator → portal. Link „Ai deja cont? Intră în cont”.
- `/profil` when logged in = edit profile (username shown, no password fields).
- `/intra` = **Intră în cont**: username + password → portal if profiling is complete, otherwise the next unfinished step. Link „Nu ai cont? Creează unul”.
- Header avatar = account menu (button, `aria-expanded`, Esc/outside click closes). Logged out: Intră în cont, Creează cont. Logged in: „Conectat ca …”, Portalul meu, Deconectare (→ home).
- `/portal` when logged out → prompt to log in or create an account.

## Production requirements (not built)
Server-side accounts with a vetted auth library or identity provider; password hashing server-side (Argon2id/bcrypt/scrypt); HttpOnly, Secure, SameSite session cookies; rate limiting and lockout; password reset by email; account deletion and data export (GDPR); privacy notice update.

## Tests
Unit: username/password validation, hash + verify (right/wrong), duplicate usernames (case-insensitive), account/session parsing never throws. E2E: sign-up → onboarding → portal; avatar menu items per state; logout hides nav and portal data; wrong password error; login returns to the same data; a second account sees none of the first account's data; guest progress moves into a new account.
