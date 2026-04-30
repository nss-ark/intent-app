# Intent App — UI/UX Revamp Plan

**Created:** 2026-04-30  
**Status:** Complete  
**Last Updated:** 2026-04-30

---

## Overview

Comprehensive UI/UX fixes across the Intent application covering onboarding flow, navigation, matching/aligned page, activities/spaces page, event cards, and profile functionality.

---

## Phase 10: Profile Functionality Fixes ✅

### Quick Wins
- [x] Share profile button — Web Share API / clipboard fallback
- [x] "View your card as others see it" — links to `/profile/{userId}`
- [x] Send nudge button on profile detail — navigates to `/aligned/nudge/{userId}`
- [x] Removed non-functional bookmark/save buttons
- [x] Fixed "Connections" stat → "Interests" (shows niche count)
- [x] Removed mock "Profile views" row
- [x] Renamed "Endorsements" → "Badges"

### Photo Upload
- [x] Change photo button — triggers file picker
- [x] Camera icon overlay — triggers file picker
- [x] File-to-base64 conversion (max 2 MB, jpeg/png/webp)
- [x] Preview in edit page, saved via PATCH `/api/users/me/profile` (photoUrl field)

### Experience CRUD
- [x] New API: `POST /api/users/me/experience` (add with company, title, isCurrent)
- [x] New API: `DELETE /api/users/me/experience` (remove by ID with ownership check)
- [x] Add experience form in edit profile (inline, company + title side-by-side)
- [x] Remove experience button (X) on each experience row
- [x] Current role toggle when adding experience

### Niche/Interest Management
- [x] New API: `PUT /api/users/me/niches` (replace user niches, max 5)
- [x] Remove interest pill (X) in edit profile — calls API
- [x] Add interest button — opens selector with available niches from discovery filters
- [x] Selector shows only unselected niches, max 5 total

---

## Execution Order & Phases

### Phase 1: Navigation Renaming + Route Changes ✅
**Files:** `src/components/bottom-tab-bar.tsx`, `src/components/app-header.tsx`, `src/app/(app)/matching/`, `src/app/(app)/activities/`
- [ ] Rename "Matching" → "Aligned" in bottom tab bar and header
- [ ] Rename "Activities" → "Spaces" in bottom tab bar and header
- [ ] Move `/matching` route → `/aligned`
- [ ] Move `/activities` route → `/spaces`
- [ ] Update all internal links/references to old routes
- [ ] Update page titles in the actual pages
- [ ] Review & sanity check

### Phase 2: Remove History Tab from Aligned Page ✅
**Files:** `src/app/(app)/aligned/page.tsx` (formerly matching)
- [ ] Remove "History" tab and tab switcher UI
- [ ] Show active matches directly (no tabs)
- [ ] Update empty state copy: "No alignments yet"
- [ ] Remove history-related state/filtering logic
- [ ] Review & sanity check

### Phase 3: T&C into Signup Page ✅
**Files:** `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/signup/consent/page.tsx`
- [ ] Add consent checkboxes to signup page (ToS + Privacy = required, Profile visibility = optional)
- [ ] Update signup API call to include consent data
- [ ] Update post-OTP routing to skip consent page → go directly to onboarding step 1
- [ ] Remove or deprecate `/signup/consent` page
- [ ] Review & sanity check

### Phase 4: Backend — Custom Options Persistence ✅
**Files:** New API routes, DB schema
- [ ] Create `custom_options` table/schema (type: interest/specialization/domain, label, value, created_by, usage_count)
- [ ] `GET /api/custom-options?type=interest|specialization|domain` endpoint
- [ ] `POST /api/custom-options` endpoint (create new custom option)
- [ ] Update signup API to accept consent fields
- [ ] Review & sanity check

### Phase 5: Onboarding Step 1 — Programs, Year, Specialization ✅
**Files:** `src/app/(auth)/onboarding/step1/page.tsx`
- [ ] Replace programs dropdown with new 16 + Other list: PGP, PGPPro, PGPMAX, MFAB, YLP, FPM, EFPM, AMPBA, AMPHP, AMPIM, AMPPP, AMPOS, ISB Online, EEP, IVI, Other
- [ ] Year dropdown range: 1996 → current year + 4
- [ ] Dynamic year label based on program selection (Class of / Cohort / Batch of / Year / Year at ISB)
- [ ] Specialization "Other" → show text input (max 50 chars), persist to DB
- [ ] Review & sanity check

### Phase 6: Onboarding Step 2 — Career & Interests ✅
**Files:** `src/app/(auth)/onboarding/step2/page.tsx`, `src/components/niche-pills.tsx`
- [ ] Rename "Current role" → "Latest role"
- [ ] Company + Title side-by-side (one line) for Latest role
- [ ] Company + Title side-by-side for past experience entries
- [ ] Domain "Other" → text input (max 50 chars), persist to DB
- [ ] Rename "Niche interests" → "Interests"
- [ ] Increase limit from 3 → 5
- [ ] Add "+ Create" pill for custom interests
- [ ] Custom interests persist to DB for all users
- [ ] Review & sanity check

### Phase 7: Onboarding Step 3 — Enhanced Intent ✅
**Files:** `src/app/(auth)/onboarding/step3/page.tsx`
- [ ] Improve example prompts (ICP-style, segmented by user type)
- [ ] Add guiding prompts below textarea: "What is your intention from ISB?", "What are you determined to do?", "What impact do you hope to create?"
- [ ] Style guiding prompts as subtle inspirational cards/quote blocks
- [ ] Review & sanity check

### Phase 8: Onboarding Step 4 — Signals Redesign (Wow Factor) ✅
**Files:** `src/app/(auth)/onboarding/step4/page.tsx`, `src/components/signal-toggle.tsx`
- [ ] Replace toggle list with selectable square card grid (2-col mobile, 3-col desktop)
- [ ] Each card: icon + short label + subtle description
- [ ] Selection state: gradient fill (navy), icon animation, scale transform
- [ ] Section headers: "What are you looking for?" / "How can you help?" / "Let's connect"
- [ ] Color-coded section accents (warm/green/blue)
- [ ] Staggered fade-in animation on load
- [ ] Same signal options, new visual treatment
- [ ] Review & sanity check

### Phase 9: Spaces Event Cards Cleanup ✅
**Files:** `src/app/(app)/spaces/page.tsx` (formerly activities)
- [ ] Title more prominent (18px semibold)
- [ ] Meta row: date + location on one line
- [ ] Badges consolidated to top-right, smaller pills
- [ ] Creator + attendees on one line
- [ ] Niche pills: max 2 visible + "+N more"
- [ ] Increase card spacing (16px gap) and internal padding (20px)
- [ ] RSVP button consistent width, bottom-right
- [ ] Review & sanity check

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| T&C page | Fold into signup | Reduce friction, one less page |
| URL routes | Change actual paths | Avoid confusion between labels and routes |
| Role dropdown | No — infer from program | Avoid adding onboarding friction |
| Step 3 extra prompts | Within step 3 (Option B) | Keep 4 steps, no added friction |
| Interest limit | 5 (up from 3) | More expression without overwhelm |
| Custom options | Persist for all users | Community-driven options growth |

## Programs List (Abbreviations)

PGP, PGPPro, PGPMAX, MFAB, YLP, FPM, EFPM, AMPBA, AMPHP, AMPIM, AMPPP, AMPOS, ISB Online, EEP, IVI, Other

## Year Label Mapping

- PGP, PGPPro, PGPMAX, MFAB, YLP → "Class of"
- FPM, EFPM → "Cohort"
- AMPBA, AMPHP, AMPIM, AMPPP, AMPOS, IVI → "Batch of"
- EEP, ISB Online → "Year"
- Other → "Year at ISB"
