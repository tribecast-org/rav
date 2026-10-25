# SPEC — tribeMail.app v1 (Rav fork)

Owner seat: Warden-tribeMail.app
Status: v1 — chartered, lanes launched
Repo: https://github.com/tribecast-org/rav (fork of naust-mail/rav, itself a fork of c0h1b4/oxi — all MIT)
Local clone (Air): /Users/admin/Development/tribemail
Worktrees: /Users/admin/Development/tribemail-web (feat/tribemail-web) · /Users/admin/Development/tribemail-ios (feat/tribemail-ios)
Human mirror: /Users/admin/docs/SPEC-tribemail-app-v1.md

## 1. What it is

tribeMail.app is tribeCast™'s member-facing email client: a branded webmail + iOS app that reads and sends
real mail for people with mailboxes on tribeCast.email (first user: carol@tribeCast.email), and later any
IMAP/SMTP provider a member brings.

Metaphor: Fastmail is the post office (holds the mail, delivers it, keeps the reputation). tribeMail.app is
the front desk (what the member sees and touches). Claude is the secretary (reads, drafts, sends on the
member's say-so, by voice or text).

## 2. Architecture (ruled defaults)

| Layer | Choice | Why |
|---|---|---|
| Mailbox / delivery | Fastmail, tribeCast™-owned account, domain tribeCast.email | Mature delivery + spam handling; official MCP server with send access |
| Web client | Rav fork (Next.js 16 / React 19 frontend + Rust Axum backend, per-user SQLite, Tantivy search) | MIT; superset of oxi (Sieve, PGP, passkey/TOTP, identities, rspamd) |
| Hosting | Railway (house infra, "tribecast-org's Projects"), single Docker image, port 3001, volume /data | Matches house rule: no production infra on local machines |
| iOS app | Tauri v2 iOS shell around the tribeMail web frontend, talking to the hosted Rust backend | House standard for apps (tribeCast app is Tauri v2) |
| AI layer | Member's own Claude + Fastmail connector (https://api.fastmail.com/mcp), send access, voice on phone | No custom AI plumbing needed for v1 |
| System mail (magic links, notices) | Stays on Resend (unchanged) | Aug 28 email policy |

Config the backend needs: IMAP_HOST=imap.fastmail.com, SMTP_HOST=smtp.fastmail.com.
Fastmail requires an app password for third-party IMAP/SMTP login — onboarding must say so plainly.

## 3. v1 scope

Web (lane: TRIBEMAIL-WEB):
- Rebrand to tribeMail.app: name, logo slot, tribeCast™ palette (orange/amber canon), ™ on every product name in UI copy.
- Fastmail defaults baked in (hosts above); login screen explains the app-password step in one line with a link to Fastmail's app-password page.
- Railway-ready: Dockerfile builds clean, railway.json (or equivalent) with port + volume.
- Large-type / high-contrast "Easy mode" toggle (first user is in her 80s) — AND-NOT-OR: both the standard and easy layouts, member toggle.
- Preview URL + screenshots of inbox, read, compose, settings for Grif's bless (no sight-unseen bless).

iOS (lane: TRIBEMAIL-IOS):
- Tauri v2 project wrapping the web frontend; points at the hosted backend URL (configurable).
- Builds for the iOS simulator on the MBP (Xcode lives on the MBP, not the Air; Syncthing keeps paths identical).
- App icon/name tribeMail; Easy mode carried through.
- Deliverable: branch pushed + exact MBP build commands + simulator screenshots once built.

Out of v1 (parked, harvestable): multi-account, JMAP transport, member self-serve mailbox signup on
tribeCast.email, tribePassport/tribeAuth login, Owlsy in-app, Android.

## 4. Safety + identity law

- Commits/PRs attribute to tribecast-org only — never a personal name or email.
- No secrets in the repo. Test credentials live in local env files that are gitignored.
- Don't touch tribecast.com DNS, the Fastmail role-address routing, Cloudflare Email Routing, or Resend.
- tribeCast.email DNS (MX/SPF/DKIM/DMARC) is set by Fastmail onboarding, not by lanes.
- Lanes open draft PRs against tribecast-org/rav main; Warden gates; merge only on Grif's word.

## 5. Gates

| Gate | Pass condition |
|---|---|
| G1 web build | `docker build` succeeds from the web branch |
| G2 web pixels | Preview URL [LIVE] + screenshots reviewed by Grif |
| G3 iOS build | Simulator build on MBP succeeds; screenshots |
| G4 Carol pilot | carol@tribeCast.email logs in, reads, sends one test mail to family |
| G5 secret scan | Clean on every PR |

## 6. Open rulings for Grif

1. Hosted URL: tribemail.app root vs app.tribecast.com/mail (URL rule says apps live on app.tribecast.com/<tool>).
2. Repo home: stay as standalone tribecast-org/rav (renamed tribemail) vs fold into the monorepo later (DEPLOY-SYNC-01 direction).
3. Two-way Claude threads replying from Fastmail (amends Aug 28 "all outbound stays Resend").
