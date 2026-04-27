# Intent MVP — QA Report
**Date:** 2026-04-27
**Tested against:** master-plan-intent.md sections 4-10 (MVP spec)
**Environment:** localhost:3000, demo mode (Arjun Mehta session), SQLite

---

## CRITICAL BUGS (App crashes / features completely broken)

### BUG-01: Profile detail page crashes
- **Screen:** `/profile/[id]`
- **Error:** `TypeError: Cannot read properties of undefined (reading 'template')` in `ProfileDetailPage`
- **Cause:** The component accesses `badge.tenantBadge.template` but the API response has a different nested structure. The `.some()` call on badges array doesn't guard against missing nested properties.
- **Impact:** Cannot view any user's profile from the discovery feed. Clicking a card leads to error page.
- **Severity:** P0 — blocks core user flow

### BUG-02: Chat detail page crashes
- **Screen:** `/chats/[conversationId]`
- **Error:** Component expects `data.messages` to be an array, but the API returns `data.messages: { items: [...], page, pageSize, total, totalPages }`
- **Cause:** API response wraps messages in a paginated envelope; component doesn't unwrap `.items`
- **Impact:** Cannot view any conversation. Clicking a chat leads to error page.
- **Severity:** P0 — blocks core user flow

### BUG-03: Nudge composer shows "No matching signals found"
- **Screen:** `/nudge/[userId]`
- **Error:** Signal pills don't render. Shows "No matching signals found."
- **Cause:** The component maps `openSignals` from the `/api/users/[id]` response, but the API returns signals nested as `openSignals[].tenantSignal.template` while the component may be looking for a different structure, or the `isOpen` filter isn't matching.
- **Impact:** Cannot send a nudge — the core product action is broken.
- **Severity:** P0 — blocks core product mechanic

---

## HIGH BUGS (Feature doesn't work as specified)

### BUG-04: Discovery filter pills don't filter server-side
- **Screen:** `/home` (discovery feed)
- **Issue:** Clicking "Bangalore" pill still shows all 5 members instead of just the 1 Bangalore member.
- **Cause:** The `apiFilters` mapping in `home/page.tsx` maps pill value `"bangalore"` to `{ city: "Bangalore" }`, but the filter pills now come from the DB with dynamic values. The mapping between pill `value` (lowercase) and API param `city` (exact case) has a mismatch. The API's city filter does exact string match (SQLite, no case-insensitive), so `"bangalore"` doesn't match DB value `"Bangalore"`.
- **Fix needed:** Either make the API city filter case-insensitive, or pass the exact DB city value as the pill value.
- **Severity:** P1

### BUG-05: `/saved` route returns 404
- **Screen:** Bottom tab bar "Saved" link goes to `/saved`
- **Issue:** No page exists at `/saved`. The saved users feature lives under the Inbox "Saved" tab.
- **Fix needed:** Either create a `/saved` page that redirects to `/inbox?tab=saved`, or change the bottom tab bar link.
- **Severity:** P1

### BUG-06: Admin dashboard shows all zeroes in demo mode
- **Screen:** `/admin`
- **Issue:** All metric cards show 0. Pending verifications shows "No pending verifications."
- **Cause:** The demo user (Arjun Mehta) has role "USER", not an admin role. The `/api/admin/dashboard` returns 403 FORBIDDEN. The component falls back to 0 for all metrics.
- **Fix needed:** In demo mode, either inject an admin session for admin routes, or show a "Demo: admin view requires login" message instead of misleading zeroes.
- **Severity:** P1

### BUG-07: Nudge composer shows wrong cooldown text
- **Screen:** `/nudge/[userId]`
- **Issue:** Shows "If Ananya doesn't accept, you'll need to wait 30 days before nudging again."
- **Spec says:** 90 days cooldown after decline, 30 days after ignore. The text conflates the two.
- **Fix needed:** Show "90 days after a decline, 30 days if they don't respond"
- **Severity:** P2

### BUG-08: Nudge composer missing company name
- **Screen:** `/nudge/[userId]`
- **Issue:** Shows "Investor at" without the company name (should say "Investor at Lightspeed Venture Partners")
- **Cause:** The API returns experience data but the component doesn't correctly extract `company.name` or `freeTextCompanyName`.
- **Severity:** P2

---

## MEDIUM BUGS (Spec deviations / missing data)

### BUG-09: Survey match group sizes don't match spec
- **Data issue:** Seed data creates survey with `matchGroupSizeMin: 3, matchGroupSizeMax: 4`
- **Spec says:** Groups of 4-6 users. Default min: 4, max: 6.
- **Fix needed:** Update seed to use min: 4, max: 6

### BUG-10: Surveys list page shows minimal info
- **Screen:** `/surveys`
- **Issue:** Only shows survey title. Missing: question count, close date, estimated time, "Take survey" CTA button.
- **Previously:** The hardcoded version showed "7 questions · 60 seconds · Closes in 3 days" with a prominent amber CTA.
- **Severity:** P2

### BUG-11: Admin "Recent activity" section is still hardcoded
- **Screen:** `/admin` dashboard
- **Issue:** Shows fake activity items ("Riya Mehrotra completed her profile", etc.) — these are not from the database.
- **Severity:** P2

### BUG-12: Discovery card missing "previous companies" display
- **Screen:** `/home` (discovery cards)
- **Spec says:** Card should show company badges with career path (current → previous)
- **Currently:** Only shows current company. The API only returns `isCurrent: true` experiences.
- **Fix needed:** API should include the most recent non-current experience too, or the card should show only current (acceptable MVP simplification).
- **Severity:** P3 — minor visual regression from the hardcoded version

### BUG-13: Onboarding steps 2-4 not fully wired
- **Screen:** `/onboarding/step2`, `/step3`, `/step4`
- **Issue:** Steps 2-4 still use localStorage for persistence (which was intentional for intermediate state). But step2 (work history), step3 (intent statement), step4 (signals) data needs to eventually reach the API on completion.
- **Status:** The `/onboarding/complete` page was wired to call the profile API, but the intermediate steps may have stale localStorage references after the signup flow was changed to sessionStorage.
- **Severity:** P2

### BUG-14: No "Saved" tab content in inbox
- **Screen:** `/inbox` → Saved tab
- **Issue:** The "Saved" tab in inbox shows empty/placeholder content. The saved users API exists (`/api/saved-users`) but the inbox page doesn't wire the Saved tab to it.
- **Severity:** P2

---

## LOW / COSMETIC ISSUES

### BUG-15: Discovery card avatars use different gradient colors than before
- The original hardcoded cards had specific amber/green/purple gradients per member. Now gradients are auto-generated from name hashes, resulting in more red/pink tones.
- Not a bug per se — just a visual change. Acceptable.

### BUG-16: Bottom tab "Saved" should link somewhere useful
- The bottom nav has 5 tabs: Home, Inbox, Surveys, Saved, Profile
- "Saved" goes to `/saved` which 404s (see BUG-05)
- Consider changing to link to `/inbox` with saved tab param, or removing it

### BUG-17: My Profile "Connections" count hardcoded
- `/my-profile` shows "4 Connections" — but this number appears to be computed from some field. Need to verify if this is actually the count of conversations or a hardcoded value in the component.

### BUG-18: Events page shows survey data, not actual events
- `/events` shows "Career Fork" from the surveys API, labeled as "MATCHED MEETUP"
- This is technically correct (surveys can generate meetups) but there are no actual standalone events in the DB. Need event seed data.

---

## SPEC COMPLIANCE CHECKLIST (MVP Section 10)

| Requirement | Status | Notes |
|---|---|---|
| Tier 1 verification (CSV + OTP) | Partial | Signup + OTP screens exist, but no CSV admin upload flow wired |
| Tier 2 verification (LinkedIn) | Partial | Verification queue UI exists, API exists, but no real verification data seeded |
| Profile with all card fields | Pass | Name, years, company, domain, niches, city, intent, asks/offers |
| Browse and filters | Fail | Filters don't work correctly (BUG-04) |
| Nudge with Asks/Offers | Fail | Signal selection broken (BUG-03) |
| Accept/decline/ignore | Pass | API works, inbox wired, nudge detail has buttons |
| 1:1 chat | Fail | Chat detail crashes (BUG-02) |
| Survey-to-meetup cycle | Pass | Survey list + detail + submit all work |
| Admin panel | Partial | Screens exist but zeroes in demo mode (BUG-06) |
| Three admin roles | Pass | Schema and middleware enforce Owner/Operator/Moderator |
| Gamification level display | Pass | Contributions page shows level, points, progress |
| PWA install prompt | Pass | Manifest + service worker registered |
| DPDPA consent log | Pass | Consent API works, consent page wired |
| Audit log | Pass | logAudit fires on all write paths |
| Soft-delete pattern | Pass | deletedAt field, notDeleted() helper used everywhere |

---

## PRIORITY FIX ORDER

1. **BUG-01** — Profile detail crash (P0)
2. **BUG-02** — Chat detail crash (P0)
3. **BUG-03** — Nudge composer signals (P0)
4. **BUG-04** — Discovery filter case mismatch (P1)
5. **BUG-05** — /saved 404 (P1)
6. **BUG-06** — Admin demo mode (P1)
7. **BUG-07** — Nudge cooldown text (P2)
8. **BUG-08** — Nudge company name (P2)
9. **BUG-09** — Survey group sizes (P2)
10. **BUG-10** — Surveys list minimal info (P2)
