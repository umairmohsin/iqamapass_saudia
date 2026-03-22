# IqamaPass — Project PRD
**Web App MVP** | Residency & Travel Compliance for Pakistani Expats in Saudi Arabia
**Version:** 1.0 | **Status:** Ready for AI Agent Build |

---

## What Are We Building?

IqamaPass is a web app for Pakistani nationals living in Saudi Arabia on an Iqama (residency permit). It tracks their residency documents, calculates how many days they can safely spend abroad, and sends email alerts before anything expires — in English and Urdu.

**The one-line pitch:** Open the app, know in 10 seconds if you are safe or at risk. No Arabic required. No government portal. No mental math.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase (Postgres + Supabase Auth) |
| Styling | Tailwind CSS |
| Email Alerts | Resend |
| Background Jobs | Supabase Edge Functions (scheduled) |
| Hosting | Vercel |
| Error Tracking | Sentry |
| Analytics | PostHog |

**Key decisions:**
- Use Supabase Auth for all signup, login, and password reset — do not build custom auth
- Use Row Level Security (RLS) in Supabase so users can only access their own data
- All API logic lives in Next.js Route Handlers (`/app/api/`)
- The daily alert job runs as a Supabase Edge Function on a cron schedule

---

## Who Is This For?

Pakistani nationals living in Saudi Arabia on a work or family Iqama. They speak Urdu, use WhatsApp daily, and are primarily on Android phones. They track their Iqama expiry in their head or in WhatsApp messages and frequently miss deadlines.

**The core pain points:**
- Iqama expiry sneaks up with no warning system
- Exit re-entry visas expire and users don't realise until they try to travel
- Saudi law limits time spent abroad to a rolling 180-day window — most expats don't know this rule exists
- Families have 4–6 documents across different expiry dates with no single place to track them
- A single late Iqama renewal costs SAR 500+ in fines

---

## Features — What to Build

### Must Ship (MVP is not done without these)

**1. User Authentication**
Email and password signup and login via Supabase Auth. Password reset via email. No social login.

**2. Iqama Expiry Tracker**
User manually enters their Iqama expiry date. App shows a countdown and a colour-coded status badge — green if more than 90 days remain, amber for 31–90 days, red for 1–30 days, and a dark red "Expired" state if the date has passed.

**3. Passport Expiry Tracker**
Same as the Iqama tracker but for the user's Pakistani passport. Additionally, if the passport expires within 6 months of the Iqama expiry date, show a special warning flag: "Your passport may block Iqama renewal — renew passport first." This is a Pakistan-specific rule that KSA enforces.

**4. Exit Re-entry Visa Tracker**
User enters their exit re-entry visa expiry date and whether it is single or multiple entry. Same colour-coded countdown as the other trackers.

**5. Abroad Day Counter**
User logs trips — a departure date (left Saudi) and a return date (arrived back). The app calculates how many days in the last 180 days the user has spent outside Saudi Arabia and shows how many "safe days" remain. If safe days drop below 30, show an amber warning. If at zero, show a red alert.

**6. Dashboard**
The main screen. Shows all documents as status cards sorted by urgency — most urgent at the top. Shows the abroad counter as a summary card. Any document in red or expired triggers a banner at the top of the page.

**7. Family Profiles**
Free users track only themselves. Premium users can add up to 5 family members (spouse, children, dependents). Each family member has their own document set. The dashboard shows all family documents in one consolidated view.

**8. Email Alerts**
Automated alert emails sent at 90, 60, 30, and 7 days before any document expires. Each email includes the document name, expiry date, days remaining, and a link to the Absher website for renewal. Alerts must be deduplicated — if the same alert for the same document was already sent within the last 7 days, do not send it again.

**9. Language Toggle (English / Urdu)**
Every page has a toggle to switch between English and Urdu. When Urdu is active, use the Noto Nastaliq Urdu Google Font. Store the user's language preference in their profile.

**10. Settings Page**
Users can update their name, city, language preference, and individual alert thresholds. All users can delete their account, which permanently removes all their data.

---

### Nice to Have (Build only after Must Ship is complete)

**Absher Deep Links** — Shortcut buttons on document pages that open the Absher government portal directly. These are plain links, not API integrations.

**WhatsApp Share Button** — Opens WhatsApp with a pre-written reminder message. Premium users only.

**PWA Support** — Add a web app manifest so Android users can add the app to their home screen.

---

### Not Building

- Native iOS or Android apps — web first, native after 200 active users
- Absher or Muqeem API integration — Saudi government APIs are closed to private developers
- Document scanning or photo uploads
- PRO agent marketplace — separate product
- Visa-on-arrival country checker — separate product
- Social login
- SMS alerts — email is sufficient for MVP
- Arabic , English and Urdu for MVP
---

## Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Landing page. Hero headline, short benefit list, one CTA: "Get Started Free" |
| `/signup` | Email + password + language selector |
| `/login` | Email + password login |
| `/reset-password` | Enter email to receive password reset link |
| `/onboarding` | Two steps after signup. Step 1: name, city, Iqama type. Step 2: Iqama expiry + optional passport expiry |
| `/dashboard` | Main screen. All document cards + abroad counter + action banners |
| `/documents/new` | Form to add any new document |
| `/documents/[id]` | Document detail. Expiry, status, alert settings, edit and delete |
| `/documents/[id]/edit` | Edit document dates and settings |
| `/trips` | Travel log. Past trips list. Add trip form. Abroad counter summary |
| `/family` | Family members list. Add button shows paywall for free users |
| `/settings` | Preferences, alerts, subscription, delete account |

---

## Data — What to Store

> **Never store Iqama numbers, passport numbers, or any government ID number. Store expiry dates only. This is a trust and privacy decision.**

**Users table**
Email, name, city, language preference (en or ur), Iqama type (work or family), premium status (boolean), premium expiry date, customer ID.

**Profiles table**
One row per person being tracked. The account holder has relation "self". Each added family member has relation "spouse", "child", or "dependent". Every profile belongs to a user.

**Documents table**
One row per tracked document. Belongs to a profile. Stores: document type (iqama / passport / reentry_visa / other), optional user label, expiry date, optional issue date, optional entries total and entries used (for re-entry visas only), optional notes, and four boolean flags for which alert thresholds are active (90 / 60 / 30 / 7 days).

**Trips table**
One row per trip. Belongs to a profile. Stores: departure date (left Saudi), return date (back in Saudi — nullable if user is currently abroad), optional destination, optional notes.

**Alert logs table**
One row per alert sent. Stores: document ID, user ID, threshold type (90_day / 60_day / 30_day / 7_day), channel (email), timestamp sent, status (sent / failed). Used only for deduplication.

---

## Business Logic Rules

**Document status calculation:**
- More than 90 days to expiry → Green (Safe)
- 31 to 90 days → Amber (Warning)
- 1 to 30 days → Red (Urgent)
- 0 days or past → Dark red (Expired)
- No date entered → Grey (No data)

**Abroad day counter:**
- Always calculated on the rolling 180 days ending today
- The day a user departs Saudi counts as an abroad day
- The day a user returns to Saudi does not count as an abroad day
- If a trip has no return date, the user is currently abroad — count today as abroad
- Safe days remaining = 180 minus days abroad in the window
- Amber warning when safe days remaining hits 30 or below
- Red alert when safe days hits zero

**Passport renewal blocker flag:**
- If the passport expiry date falls within 6 months before the Iqama expiry date, show the warning on both the passport card and the Iqama card

**Alert deduplication:**
- Before sending any alert, check the alert logs table
- If the same document + same threshold already has a successful send within the last 7 days, skip it

## Email Alerts

Sent via Resend. Daily job runs at 08:00 Saudi time (UTC+3) via Supabase Edge Function.

Each email must include: user name, document type and label, expiry date (DD/MM/YYYY format), days remaining, link to Absher for renewal, link back to the document in the app. Send in the user's preferred language.

---

## Non-Functional Requirements

**Performance** — Dashboard loads in under 2 seconds. Fetch all dashboard data in a single query, not multiple round trips.

**Security** — HTTPS everywhere. RLS on all Supabase tables. Never expose the service role key to the client. Alert emails must not contain any government ID numbers.

**Privacy** — Deleting an account permanently removes all the user's data from all tables immediately.

**Mobile** — Designed mobile-first at 375px width. This is the primary device for the target audience.

**Internationalisation** — All display text in translation files, no hardcoded strings in components. Two languages: English (en) and Urdu (ur). Dates display as DD/MM/YYYY. Urdu text uses right-to-left direction.


## Build Order

Build in this exact order. Each phase must be working before moving to the next.

**Phase 1 — Auth & Foundation**
Set up Next.js with Supabase. Create all database tables with RLS policies. Build signup, login, and logout. A user can create an account and land on an empty dashboard.

**Phase 2 — Document Tracking**
Build the Add Document form and dashboard with colour-coded status cards. Build document detail and edit pages. A user can add their Iqama date and see a correct countdown.

**Phase 3 — Abroad Counter**
Build the trip log (add, view, delete). Implement the 180-day rolling window calculation. Show the abroad counter card on the dashboard. Test with multiple trip scenarios before moving on — this logic must be correct.

**Phase 4 — Alerts**
Set up Resend. Build the Supabase Edge Function scheduled at 08:00 KSA daily. Implement alert deduplication. Confirm alert emails fire at all four thresholds in staging.

**Phase 5 — Family & Language**
Build family profiles behind the premium check. Add the language toggle and Urdu translations. Polish mobile layout. Add loading states, empty states, and error handling.

---

## Definition of Done

The MVP is complete when:
- A new user can sign up, add their Iqama and passport dates, and see correct countdowns within 3 minutes
- Alert emails fire correctly at all four thresholds in production
- The abroad day counter is correct for a user with multiple logged trips
- The Urdu toggle works correctly on an Android mobile browser
- No critical errors in Sentry after 48 hours of real user testing

---

*IqamaPass — project.md — v1.0 — Next.js + Supabase MVP — March 2026*