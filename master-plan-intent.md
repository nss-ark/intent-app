# Intent
## Master plan and architecture

**Status.** Living document. Iterate freely.
**Product name.** Intent.
**First tenant.** ISB (Indian School of Business).
**Position.** B2B SaaS sold to universities. India launch.
**Authoring posture.** Decisions are stated as decisions. Open recommendations are flagged as such. Unresolved questions live in section 14.

---

## Table of contents

1. Executive summary
2. Strategic frame
3. Brand identity
4. Architecture foundations
5. Roles
6. The user panel, feature by feature
7. The admin panel, feature by feature
8. The super-admin panel
9. Modularity boundaries
10. Phasing: MVP, V1, V2
11. Tech stack recommendation
12. Data model
13. Data protection and DPDPA posture
14. Cross-cutting infrastructure concerns
15. Open decisions
16. Things still on the flag list
17. Next steps menu

---

## 1. Executive summary

**Intent** is a community networking product for universities. It solves a specific problem: inside any given university, students, recent graduates, and alumni cannot easily find each other for mentorship, recruitment help, domain insight, case prep partnership, or ordinary peer connection. The existing alternatives are LinkedIn (too noisy and not institution-bounded), WhatsApp groups (broadcast, not directed, no structure), and the alumni office's email list (one-way, low signal). The result is that the network value implicit in attending an institution is captured haphazardly, mostly by the most extroverted people in the most central social positions.

Intent's solve is a card-based, signal-tagged, gamified networking layer, configured per institution and sold as B2B SaaS to universities. The core interaction is browsing cards of fellow members, sending a short typed nudge tagged with an Ask or Offer, and either getting a 1:1 conversation, a templated polite decline, or silence. Alongside that, Intent runs a recurring lightweight survey mechanic that clusters members into small groups of 4 to 6 and proposes offline meetups. This is the engagement loop we believe is distinctive.

The brand idea is that every member has an Intent, which is the 200-character statement of what they are working toward and what they are looking for. The product is named for it, the profile is built around it, and the entire user experience is Intent-centric.

The economic model is the university paying. Alumni do not pay. Students may pay later for things like extra nudges per week, but no student-side monetization at MVP. We start at ISB, India, dropped into the WhatsApp groups the founders are already in.

The architectural posture is hard tenant isolation from day one (schema-per-tenant in Postgres), mobile-first progressive web app, and modular boundaries between matching, nudging, events, surveys, badges, gamification, and notifications so that any module can be replaced or upgraded without touching the rest.

---

## 2. Strategic frame

### What we are betting on

The bet is that placement, mentorship, and informal career capital are bottlenecked not by absence of supply but by absence of structured access, and that the social cost of cold outreach in a known community is higher than people will admit. We are betting that if we lower that social cost, by giving people a sanctioned mechanism to ask, by tagging each ask with a clear purpose, and by removing the public-rejection dynamic that exists in dating-app metaphors, both sides of the network show up more often.

The second bet is on the survey-to-meetup loop as the engagement engine. Cards-and-nudges is the searchable utility; the survey loop is what makes the platform a habit and what produces shareable, screenshot-worthy moments inside the community.

### Who pays

| Buyer | Role | Confidence |
|---|---|---|
| University | Primary B2B buyer, pays SaaS license | High, this is the model |
| Students | May pay later for extra nudges or boosts | Open ended, not at MVP |
| Alumni | Do not pay | Confirmed, low willingness to pay |
| Companies | Recruitment access is unclear | Parked, may or may not commercialize |

### Geographic and institutional scope

Phase one is ISB only. India only. Business school as the institutional archetype. The data model and admin panel are dynamic enough that other institution types will fit later (law schools, medical schools, undergraduate programs) without rewrites, but no actual flex for those at MVP.

### Distribution at launch

The founders are already in most ISB WhatsApp groups. The launch motion is dropping the prototype into those groups directly. This is the lowest-friction distribution path for a university-bounded community product. It also gives us a small, captive, opinionated user base to learn from before scaling.

---

## 3. Brand identity

### Name

The product is called **Intent**. The name is also the central concept of the product: every member has an Intent, which is the 200-character statement on their card describing what they are working toward and what they are looking for.

The brand should be Intent-centric throughout: the marketing site asks "What's your Intent?" The onboarding flow centers on writing your Intent. The profile screen leads with your Intent. System-generated copy borrows from the vocabulary ("members with similar Intents," "find someone whose Intent aligns with yours").

### Tone of voice

Direct, warm, professional. Not corporate. Not bro-y. Not gamified-cheery. The reference points are Linear (precision and restraint), Substack (warmth without informality), and Cred (visual confidence). Avoid the language registers of dating apps, hustle-culture LinkedIn, and consumer social.

### Visual style

| Element | Specification |
|---|---|
| Background | Warm off-white, #FAFAF6 |
| Surface (cards) | Pure white, #FFFFFF, with soft shadow |
| Primary text | Near-black, #1A1A1A |
| Secondary text | Warm gray, #6B6B66 |
| Tertiary text / borders | Warm light gray, #E8E4DA |
| Accent (primary) | Deep amber, #B8762A |
| Accent (secondary) | Deep forest green, #2D4A3A, used sparingly for verification glyphs |
| Typography | Inter for body, Inter Display for headings |
| Spacing | 8pt grid |
| Iconography | Thin-line, 1.5px stroke, rounded corners |
| Photography | Photography-forward; cards lead with photos; warm, well-lit headshots; business casual, slightly smiling |
| Mobile baseline | 390pt width (iPhone 14 reference) |

The visual idea: feels professional but warm, uncluttered, photography-forward, generous whitespace, not gamified-looking despite the gamification mechanics underneath.

### The connection mechanic vocabulary

To keep "Intent" unambiguous, we separate the **product name and profile statement** (both called Intent) from the **connection tagging system** that powers nudges and matching. The connection tagging system is called **Asks and Offers**.

- An **Ask** is a directed signal that you are seeking something from another member: a mentor, a referral, advice on a career switch.
- An **Offer** is a directed signal that you are open to giving something: mentorship, referrals, advice in your domain.
- A **Mutual** is a symmetric signal where both sides can be in the same role: case prep partner, coffee chat, peer connect, co-founder search.

Every member sets their Open Asks and Open Offers on their profile. The card shows them as small icons. Every nudge is sent with a chosen Ask or Offer attached. The matching system understands ask-offer pairing: a user who has "looking for a mentor" as an open Ask receives nudges from people whose "open to mentoring" Offer is active.

In product copy, the language is always "Asks" and "Offers" (capitalized, plural). In the data layer, the unified concept is stored as `signals` with a type field of `ask`, `offer`, or `mutual`.

---

## 4. Architecture foundations

### 4.1 Tenancy

**Decision.** Each university is a hard-isolated tenant. No cross-university discovery, chat, or matching at v1. Architecture leaves room for opt-in cross-tenant federation later (a setting we expose, off by default), but the default state is total isolation.

**Implementation recommendation.** Schema-per-tenant in Postgres, plus a small shared control-plane schema for auth routing, billing, and super-admin operations. Schema-per-tenant has higher operational cost than row-level isolation (every migration runs N times, cross-tenant analytics requires looping over schemas, connection pooling needs a tenant-aware wrapper), but with a year-one tenant count in single digits this cost is invisible. In return, we get a clean answer to "where does our data live" and we cannot leak across tenants through a missed query filter, ever.

### 4.2 Identity

**Decision.** A person who attended multiple institutions holds separate accounts, one per tenant. There is no global user identity. The same email can register at multiple tenants without coupling the profiles. A "claim your profile across institutions" feature is parked for a future version.

This matches the product principle: belonging to a community is the entire point, and the value of being an ISB alumnus is different in kind from the value of being any other institution's alumnus.

### 4.3 Verification

Verification is the trust spine. The product survives or dies on whether a Founder badge, a company affiliation, or a years-of-experience claim can be trusted. Three tiers, each with a different cost-to-trust ratio.

**Tier 1: basic membership.** Email match against an admin-uploaded list of verified members, plus phone OTP at signup. This gates entry to the tenant. No claims about the user can be trusted yet, only that they are a real member.

**Tier 2: profile claims.** Company, current role, years of experience, domain. The user submits a LinkedIn URL during onboarding. At MVP, an admin opens this URL during verification review and ticks a box if it matches the claim. No automated LinkedIn API integration: their public API does not cover work history at the scale we need, and scraping is a legal grey zone we are not entering.

**Tier 3: special badges.** Founder, Domain Expert, Speaker, and similar. The user submits a structured declaration. For Founder: company legal name, registration number, country of incorporation, stage (idea, pre-revenue, revenue, funded, exited), funding raised, revenue band, founding year, public proof URLs. Admin reviews and approves. Approved badges show a small verification glyph on the card.

The discipline behind "minimal information visible on the card" is precisely so that what is shown can be verified. We do not display anything we have not checked. Everything else, the user can write up in the richer profile and tag with Asks and Offers, but the card's claims are gospel.

---

## 5. Roles

### Super-admin (your team)

Manages tenants, billing, global feature flags, abuse reports escalated by tenant admins, platform-wide analytics, and configuration of badge templates and signal templates (Asks, Offers, Mutuals) that universities can pull from. Lives outside any tenant.

### Tenant admin, three sub-roles

We do not ship a single-admin-role design. Day-one we differentiate three:

**Owner.** Holds billing, contract authority, and existential decisions about the tenant. Typically the alumni office head or the dean's chief of staff. At least one per tenant, two for redundancy is recommended.

**Operator.** Runs day-to-day work: member onboarding, badge management, event creation, survey publishing, analytics review. Most admin work happens here. Multiple Operators per tenant is normal.

**Moderator.** Handles the verification queue, abuse reports, and user suspensions. Narrow scope, sensitive responsibility. Usually one or two people, often distinct from Operators.

We do not build a custom permissions system at MVP. The three roles are predefined. We add custom permissions only when a buyer explicitly demands it.

### Alumni / user

Students, recent graduates, and alumni of the tenant institution. Single role from a permissions perspective, but the system tracks state (current student, recent grad within 2 years, alumni 2+ years out) for matching, badge eligibility, and notification defaults.

---

## 6. The user panel, feature by feature

### 6.1 Profile and the card

The card is the public, browsable view. Photo takes 40 to 45 percent of the surface area. Below the photo:

- Full name
- Years of experience (computed from earliest verified work entry, displayed as a number)
- Company badges (logos for prominent companies the admin has set up; user-entered current company shows as text only if not on the prominent list)
- Primary domain (one tag from the tenant's domain taxonomy)
- Niche interests (up to three tags from the tenant's niche taxonomy)
- Current city and country (added explicitly: needed for offline meetup matching, opt-out available)
- **Your Intent**: the 200-character statement of what this person is working toward and what they are looking for. This is the lead element of identity in the product and the namesake of the brand.
- Small icon indicators for Open Asks and Open Offers this user is currently accepting

Tapping the card opens the richer profile, which adds full work history, education path within the institution, all badges including Founder, the resource shelf, the full set of declared Open Asks and Open Offers, and a "Send nudge" action.

### 6.2 Badges

Two categories.

**Identity badges.** Awarded by status: Current Student, Recent Graduate, Alumni, plus optional year markers like "Class of 2018" if a tenant wants those.

**Achievement badges.** Awarded on verification or accumulation: Founder (with sub-states: Pre-revenue Founder, Revenue-stage Founder, Funded Founder, Exited Founder), Mentor of the Month, Top Contributor, Case Prep Champion, Conference Speaker, Domain Expert in X, and others. Admin can switch any badge on or off per tenant, can rename it, and can spawn new badges from templates.

The data model treats badges as polymorphic config, so adding a new badge type is admin work, not engineering work.

### 6.3 Discovery and browse

Card grid on desktop, vertical card scroll on mobile. Filters at the top: domain, niche, current company, years-of-experience range, identity badge, Asks or Offers currently open, current city.

There is no swipe-to-reject. A user either taps a card to open the profile, ignores the card and scrolls past, or saves it to a private "for later" shelf. Saving is private and the saved person is never notified. This is deliberate: we are not creating a system where alumni discover at coffee chats that 47 students "rejected" them.

### 6.4 Asks and Offers

Every nudge is tagged with an Ask or an Offer. Asks and Offers are the structuring primitive that ties matching, gamification, mentorship, and survey clustering together.

**The three types.**

- An **Ask** is a directed signal that you are seeking something from another member: a mentor, an interview referral, advice on a career switch, intel about working at a particular company.
- An **Offer** is a directed signal that you are open to giving something: mentorship, referrals, advice in your domain, time on your calendar.
- A **Mutual** is symmetric. Both sides can be in the same role: case prep partner, coffee chat, peer connect, co-founder search.

Each user, on their profile, sets their **Open Asks** and **Open Offers**, the things they are currently accepting nudges about. The card shows them as small icons. When sending a nudge, the sender picks one (or two, if both apply) and then writes the message.

The matching system understands ask-offer pairing. A user who has "looking for a mentor" as an Open Ask receives nudges from people whose "open to mentoring" Offer is active, not from peers who are also looking. The data layer expresses this through `paired_template_id` linking the ask-offer twins.

**Initial set:**

| Signal | Type |
|---|---|
| Looking for a mentor in this domain | Ask |
| Open to mentoring someone in my domain | Offer |
| Curious about working at your company | Ask |
| Open to discussing my company | Offer |
| Looking for a case prep partner | Mutual |
| Looking for an interview referral | Ask |
| Open to giving referrals | Offer |
| Want to chat about a career switch | Ask |
| Open to discussing career switches into my domain | Offer |
| Open to an informal coffee chat | Mutual |
| Looking for a co-founder | Mutual |

This list is per-tenant configurable. Admins can deactivate signals that do not fit their institution.

**Naming note.** In product copy and UI labels, the language is always "Asks" and "Offers" (capitalized, plural). In the data model, the unified concept is stored as `signals` with a type field of `ask`, `offer`, or `mutual`, since all three share lifecycle and admin-management surface area.

### 6.5 The nudge

A nudge is the only outbound action. Replaces the dating-app swipe entirely.

- Character limit: 400, with a soft warning past 200.
- Quota per sender: 5 per week at MVP. Quota is the future student-side monetization hook, since "extra nudges this week" is a clear thing to charge for once the product is loved.
- Receiver options: Accept (opens 1:1 chat), Decline politely (sends a templated, anonymous-feeling soft no), Ignore (auto-expires after 14 days).

**Cooling-off between the same pair of users.** Without this, a sender can re-nudge a receiver indefinitely, which is harassment with extra steps. Rules:

- 90-day cooldown after a decline
- 30-day cooldown after an ignore
- No cooldown after an accept

The schema enforces this at the application layer with a `nudge_relationships` table keyed on the ordered (sender, receiver) pair.

**Receiver capacity.** A high-status alumnus will get flooded. The 5-per-week sender limit does not solve this. At MVP, the user has two settings:

- `accepting_new_conversations` (boolean)
- `weekly_inbox_limit` (integer, default high)

When a receiver hits their limit, potential senders see "this person is at capacity this week" before spending a nudge slot. A queue-with-priority-signals model is parked for v2 once we observe actual inbox skew.

**Decline copy.** Templated, gentle, never reveals which person declined. Example: "Thanks for reaching out. They are not taking new conversations this week. You will be able to nudge them again in 90 days." This single piece of copy disproportionately shapes community feel.

### 6.6 Mentorship enablement

When a nudge tagged with a mentorship Ask or Offer is accepted, both users see an optional "Set up this as an ongoing mentorship" prompt. Accepting reveals a lightweight scaffold:

- Shared goal field (one sentence)
- Cadence (every 2 weeks, monthly, ad-hoc)
- "Schedule next session" button (calendar handoff via .ics file at MVP, calendar API integration later)
- Per-user private notes
- 30-second reflection prompt after each session
- After three sessions, both can mark engagement as ongoing, which contributes to mentor and mentee badges

None of this is mandatory. Two users can accept a nudge and just chat. The scaffold enables, it does not enforce.

### 6.7 The survey-to-meetup mechanism

This is the engagement engine and the most distinctive piece of the product. Mechanic:

1. Admin (or system) publishes a short survey: 5 to 10 questions, all single-select or multi-select, no free text.
2. Survey is themed: career fork, values, peer support, post-graduation planning, etc.
3. Users complete the survey in 60 seconds.
4. System clusters responses (Jaccard similarity with a diversity penalty at MVP, configurable per survey, AI re-ranking layer slottable later).
5. Output is small groups of 4 to 6 users who clustered together.
6. Platform proposes an offline meetup: "We found 5 people who answered similarly. Want us to organize a dinner?"
7. Users opt in. Admin (or system, later) confirms date and venue from the tenant's curated venues list.
8. Group meets. Post-event check-in feeds gamification.

**Match quotas to prevent burnout.** Without quotas, the same popular alumni get put into every survey-driven group and stop responding within weeks. A `user_match_quotas` table caps groups per user per period (default 2 per quarter), tunable per tenant.

**Why this works as the loop.** Surveys are cheap to run, low-friction to complete, and produce shareable real-world events. Each survey produces multiple groups. Each group produces a meetup. Each meetup produces relationship data we can use for further matching. Two-week cadence is achievable with one Operator.

### 6.8 Events

Two flavors at MVP, both offline:

- **Admin-organized events:** panels, workshops, reunions. Posted by admin, RSVP, capacity, location, post-event check-in.
- **System-generated meetups:** the output of the survey-to-meetup flow.

The data model treats both as the same `events` entity with a `source` field, so adding online events later is configuration, not new code.

Online events are deferred to v2 because the workflow questions (which platform, who hosts, recording rights, attendance proof) are unresolved.

### 6.9 Resource shelf

Per-user metadata-only shelf. Lists what a user has access to: case books, frameworks, interview decks, company-specific prep guides. Per item, two flags:

- `can_share_pointer` (I will tell you where to legally find this)
- `can_run_session` (I will run a session for you using this)

**The shelf does not host files.** No PDFs, no uploads. This is deliberate: hosting case books or copyrighted prep material is a legal exposure we will not take on, and it is unnecessary for the product's value proposition. The shelf signals capability and access; the actual material exchange happens off-platform.

For tenants that are not B-schools, resource categories are configurable: a law school could use moot court resources, a medical school could use clinical rotation prep. Structure is generic, content is per-tenant.

Sending a nudge with the case-prep-partner Mutual surfaces shelf overlap as part of the receiver's view.

### 6.10 Gamification

Designed around the principle that nothing should feel childish in a professional context, and that recognition must reflect actual community contribution.

**Contribution events that earn points:**

- Responding to a nudge within 48 hours
- Completing a mentorship session
- Attending a matched meetup
- Sharing a resource that someone uses
- Hosting an event
- Completing a survey
- Submitting verification evidence that gets approved

**Levels.** Per-tenant configurable in name (ISB might use Section A through D; another institution might use House names). Default labels: Newcomer, Contributor, Connector, Pillar.

**Unlocks per level.** Extra nudges per week, ability to host system-organized events, early access to high-demand panels, profile boost in discovery for one week.

**Recognition badges.** Mentor of the Month, Top Connector of the Quarter, Most Helpful Reviewer. Time-limited, displayed on the card during the period awarded, retained in history thereafter.

**What we are not doing.** No public balance score of "given vs received." This was in the first draft and removed on second look: a single scalar telling a user "you are taking more than you give" risks shaming users who legitimately should be receiving more than giving (current students, career switchers). Instead, the user's private dashboard shows raw counters (nudges sent, accepted, received, responded to; mentorships as mentor and as mentee; events attended and hosted; resources shared; surveys completed) and lets them interpret.

**Point values are tenant-configurable.** Different institutions weight contributions differently. The schema records the points actually awarded at the time of the event, so changing the rules later does not retroactively rewrite history.

### 6.11 Notifications

Email, push (web push for the PWA), and in-app inbox. Granular preferences with sane defaults.

A user can:

- Mute by Ask or Offer type
- Mute by event type
- Set quiet hours by timezone
- Switch to daily or weekly digest instead of immediate
- Disable email or push entirely (in-app inbox cannot be disabled, since it is the canonical record)

Critical-only push notifications by default: a nudge received, a meetup confirmed, a session reminder, a verification result.

---

## 7. The admin panel, feature by feature

### Branding
Logo upload, primary and secondary brand colors, welcome message for new users, institution tagline.

### Member onboarding
Three modes, configurable per tenant:
1. Admin uploads CSV of verified email addresses and identifiers. Users self-sign-up against this list.
2. Open registration with admin approval queue.
3. SSO integration with the institution's existing identity system (deferred to v1 unless ISB has SSO available for piloting).

### Domain and niche taxonomy
Admin maintains the controlled list of domains and niches users can pick from. Add, rename, deactivate. Default seed list ships at tenant creation.

### Prominent companies
Admin uploads the list of companies that get logo treatment on cards (McKinsey, BCG, Bain, Goldman, PE funds, etc., for an ISB-type tenant). Verified employees of those companies get the logo automatically. Companies not on the list show as text only.

### Badge management
Activate/deactivate badge templates from the global library. Customize labels and visuals per tenant. Create new badges from templates. Configure verification criteria per badge. Review the verification queue.

### Verification queue
All Tier 2 and Tier 3 verifications land here. Each item shows the user, the claim, the evidence submitted, the LinkedIn URL (admin opens manually), the public proof links if Founder badge. Approve, Request More Info, Reject. SLA is shown.

### Surveys and matching
Create surveys, define question types, set matching strategy (overlap or complementarity), schedule recurring surveys, view past survey results and resulting matches.

### Events
Create, set capacity, manage RSVPs, post-event check-in (QR code or admin-marked), attendance feeds gamification.

### Reporting
Active users, nudges sent and accepted, mentorship sessions completed, events run, survey participation, distribution of Asks and Offers across the community, badge counts, monthly retention. CSV export. This is the data that gets the contract renewed.

### Moderation
Reported nudges, abuse cases, blocked users. Suspend, unblock, escalate to super-admin.

### Configuration
Nudge weekly limits, Asks and Offers active in this tenant, gamification level labels and point values, PII handling preferences, data retention windows, default notification preferences for new users.

---

## 8. The super-admin panel

Brief on purpose. Surfaces:

- Tenant management (create, suspend, billing, contract terms)
- Global badge template library
- Global signal template library (Asks and Offers shared across tenants)
- Cross-tenant analytics for the product team (anonymized, aggregated, never per-user)
- Abuse escalations from tenant admins
- Feature flags per tenant for experiment rollouts
- Billing and invoicing (Stripe-hosted at MVP, local tables in v1)

---

## 9. Modularity boundaries

Each module has a clear API surface. Cross-module communication is event-driven where possible. Modules can be replaced without rewriting the rest of the application.

| Module | Responsibility | Replaceable scope |
|---|---|---|
| Identity & verification | Auth, profiles, claim verification, badge awarding | Auth provider, verification approach |
| Discovery | Card rendering, filters, search, save-for-later | Search backend, UI library |
| Nudge & chat | Communication layer between users | Could swap in third-party chat SDK |
| Signals (Asks and Offers) | Connection-tag taxonomy and ask/offer pairing | Add AI inference for signal suggestion |
| Matching | Survey clustering, meetup proposals | Naive overlap → AI re-ranking later |
| Events | Creation, RSVPs, attendance | Add online events without touching core |
| Resource shelf | Per-tenant configurable capability metadata | Categories per institution type |
| Gamification | Points, levels, unlocks, badges | Subscribes to events, computes state |
| Admin configuration | Per-tenant config storage | UI is replaceable, schema is stable |
| Notifications | Email, push, in-app dispatch | Channel providers swappable |
| Billing & tenancy | Control plane: tenants, plans, invoices | Stripe → other provider, schema stable |

---

## 10. Phasing

### MVP, what goes into the WhatsApp drop

- Identity: Tier 1 (CSV upload + phone OTP) and Tier 2 (admin-manual LinkedIn check)
- Profile and the card with all card fields
- Browse and filters
- Nudge with Asks and Offers tagging, with cooling-off and receiver capacity rules
- Accept/decline/ignore
- 1:1 chat
- One survey-to-meetup cycle running live, with one offline event scheduled
- Admin panel: branding, member onboarding via CSV, badge management, verification queue, basic reporting
- Three predefined admin sub-roles (Owner, Operator, Moderator)
- Gamification: contribution event logging and basic level display
- Mobile-friendly responsive web with PWA install prompt
- DPDPA-grade consent log, audit log, soft-delete pattern, evidence file storage with signed URLs

**Not in MVP:** Founder badge full automation, AI matching, online events, online resource shelf marketplace, paid student features, gamification unlocks beyond level display, push notifications, SSO, calendar integration beyond .ics handoff.

### V1, after first cohort feedback

- Tier 3 verification automation for Founder badge (structured declaration + admin review with proof URL checks)
- Push notifications via web push
- Recurring survey cadence (every 2 weeks default)
- Mentorship scaffolding fully deployed
- Expanded gamification with unlocks and recognition badges
- Deeper reporting for admin
- Refined Asks and Offers taxonomy based on observed usage
- Calendar API integration (Google Calendar, Outlook)
- Block list table populated and enforced

### V2

- AI re-ranking layer in matching (recommendation system, vector embeddings on profiles and mission statements)
- Online events
- Cross-tenant federation as opt-in for shared interests
- Student-side monetization (extra nudges, profile boosts, priority match-group placement)
- Second tenant onboarded
- SSO integration
- Mobile-native apps if PWA telemetry shows insufficient retention or notification reliability

---

## 11. Tech stack recommendation

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14+ App Router | Ubiquitous, mobile responsive, SSR for SEO and onboarding |
| Styling | Tailwind CSS + shadcn/ui | Component primitives, fast iteration, no design-system drift |
| State | React Query | Server state caching, stale-while-revalidate, mature |
| Mobile | Progressive Web App | Web push, install prompt, offline cache for discovery; defers native cost |
| Backend | Next.js API routes + Node.js service for matching | BFF for product, separate service for compute-heavy matching |
| Async work | BullMQ on Redis | Email, push, badge computation, survey clustering |
| Database | Postgres, schema-per-tenant | Isolation posture, defensible to buyers |
| ORM | Prisma with tenant-aware connection helper | Type safety, migrations, multi-schema support |
| Auth | NextAuth (or Clerk for speed) | Multi-tenant via subdomain (isb.platform.com) |
| Hosting | Vercel | Zero-config Next.js deploys |
| Database hosting | Neon or Supabase | Managed Postgres, schema isolation works cleanly |
| Cache | Upstash Redis | Serverless, cheap at MVP scale |
| Object storage | Cloudflare R2 or AWS S3 | Profile photos, verification evidence, signed URLs |
| Errors | Sentry | Per-tenant scoping |
| Analytics | PostHog | Product analytics, per-tenant scoping |

Total monthly infrastructure cost at MVP scale (one tenant, low hundreds of users): under fifty USD.

---

## 12. Data model

The model splits into a control plane (one schema, shared) and tenant schemas (one per university, identical structure, different data). The two never share tables. This is what gives us the isolation guarantee.

Conventions:

- All primary keys are UUIDs. Lets us merge or migrate without integer collisions, does not leak record counts.
- Every user-meaningful table has `created_at`, `updated_at`, `deleted_at` (soft delete).
- Audit-grade tables additionally have a `version` integer and write to an audit log on each change.
- Where I sketch a JSON column, the structure is open or evolving. Where I sketch typed columns, the field is queried structurally.

### 12.1 Control plane schema

#### `tenants`
The universities themselves.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| slug | varchar | Used as subdomain, e.g., `isb` |
| display_name | varchar | |
| status | enum | active, suspended, trial |
| created_at | timestamptz | |
| contract_start_date | date | |
| contract_end_date | date | |
| plan_tier | varchar | |
| settings | jsonb | Non-critical config |
| schema_name | varchar | Computed from slug, e.g., `tenant_isb` |

#### `tenant_users_directory`
The only cross-tenant table about users. Lets a person who registered at multiple tenants log in and pick which community to enter. Enforces email uniqueness per tenant.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | varchar | |
| hashed_password | varchar | Null if SSO |
| tenant_id | UUID | FK |
| tenant_user_id | UUID | The id of this person's `users` row inside that tenant's schema |
| created_at | timestamptz | |
| last_login_at | timestamptz | |

Unique constraint on (email, tenant_id). The actual profile lives in the tenant schema.

#### `super_admins`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | varchar | |
| role | enum | super_admin, support, finance, read_only |
| created_at | timestamptz | |

#### `badge_templates`
Global library of badge types tenants can activate.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| code | varchar | e.g., `founder`, `mentor_of_month` |
| display_name_default | varchar | |
| description_default | text | |
| category | enum | identity, achievement, special |
| verification_required | boolean | |
| criteria_schema | jsonb | What fields a user must submit if verification badge |
| visual_treatment | jsonb | Icon, color, etc. |
| default_active | boolean | Whether tenants get this on by default |

#### `signal_templates`
The global library of Asks, Offers, and Mutuals tenants can activate. (User-facing language is "Asks and Offers"; the data model unifies the three types in one table because they share lifecycle.)

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| code | varchar | e.g., `seek_mentor`, `offer_mentor`, `case_prep_partner` |
| display_name_default | varchar | |
| description_default | text | |
| icon | varchar | |
| signal_type | enum | ask, offer, mutual |
| paired_template_id | UUID | FK to the ask/offer twin, null for mutuals |
| default_active | boolean | |

#### `domain_templates` and `niche_templates`
Same pattern. Global seed lists tenants pull from at creation, customizable thereafter.

#### `tenant_features`
Per-tenant feature flags.

| Column | Type | Notes |
|---|---|---|
| tenant_id | UUID | FK |
| feature_code | varchar | |
| enabled | boolean | |
| config | jsonb | |

#### Billing tables
`billing_subscriptions`, `invoices`, `payment_methods`. Skipped at MVP, use Stripe-hosted dashboard linked to tenant_id. Local tables added in v1.

#### `audit_log_global`
Control-plane actions only.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| actor_super_admin_id | UUID | FK |
| action | varchar | |
| target_type | varchar | |
| target_id | UUID | |
| payload | jsonb | |
| occurred_at | timestamptz | |
| ip_address | inet | |

That is the entire control plane. Small on purpose. Everything else is per-tenant.

---

### 12.2 Tenant schema

Every tenant has an identical schema. When ISB is created we run a migration that creates `tenant_isb` and applies the tables below. Adding a second tenant runs the same script with a different schema name.

#### Module 1: Identity and verification

##### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | varchar | |
| full_name | varchar | |
| phone_number | varchar | |
| phone_verified | boolean | |
| phone_verified_at | timestamptz | |
| photo_url | varchar | Object storage |
| date_of_birth | date | Optional |
| institution_member_status | enum | current_student, recent_grad, alumni |
| graduation_year | integer | |
| program | varchar | e.g., MBA Class of 2018 PGP |
| created_at, updated_at, deleted_at | timestamptz | |
| last_active_at | timestamptz | |
| suspended_until | timestamptz | Nullable |
| suspension_reason | text | Nullable |

##### `user_profiles`
1:1 extension of users.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| mission_statement | varchar(200) | |
| domain_id | UUID | FK to `domains` |
| current_city | varchar | |
| current_country | varchar | |
| city_changed_at | timestamptz | |
| years_of_experience_cached | integer | Recomputed on work history change |
| profile_completeness_score | integer | 0-100 |
| is_visible_in_discovery | boolean | User can hide |
| accepting_new_conversations | boolean | |
| weekly_inbox_limit | integer | |
| updated_at | timestamptz | |

##### `user_niches`
Many-to-many.
- user_id (FK), niche_id (FK), position (1, 2, or 3)

##### `user_education`
Institution-internal education records.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| program_name | varchar | |
| batch_year | integer | |
| specialization | varchar | |
| verified | boolean | True if matched against admin-uploaded list |

##### `user_experience`
Work history.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| company_id | UUID | FK to `companies`, nullable |
| free_text_company_name | varchar | Used when company not on prominent list |
| title | varchar | |
| start_date | date | |
| end_date | date | Nullable for current |
| is_current | boolean | |
| source | enum | manual, admin_imported |
| verified | boolean | |
| verified_at | timestamptz | |
| verified_by_admin_id | UUID | FK |

##### `linkedin_links`
Stored URL plus admin verification status. No OAuth, no API sync.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| linkedin_url | varchar | |
| verified_by_admin_id | UUID | FK, nullable |
| verified_at | timestamptz | Nullable |
| verification_status | enum | unverified, verified, mismatch |

##### `verification_requests`
Every claim a user makes that needs admin review.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| request_type | varchar | e.g., `badge_founder`, `company_association` |
| payload | jsonb | Structured per type |
| status | enum | submitted, in_review, info_requested, approved, rejected |
| submitted_at | timestamptz | |
| reviewed_by_admin_id | UUID | FK, nullable |
| reviewed_at | timestamptz | Nullable |
| admin_notes | text | |
| version | integer | |

State changes write to the tenant audit log.

##### `verification_evidence_files`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| verification_request_id | UUID | FK |
| file_storage_key | varchar | Opaque, signed URL access only |
| file_type | varchar | MIME |
| uploaded_at | timestamptz | |
| deleted_at | timestamptz | |

##### `companies`
Prominent companies the admin has set up.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | varchar | |
| normalized_name | varchar | For matching |
| logo_url | varchar | |
| category | varchar | consulting, finance, tech, etc. |
| is_active | boolean | |

#### Module 2: Taxonomy per tenant

##### `domains`, `niches`
Per-tenant lists, seeded from control plane templates at tenant creation.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| code | varchar | |
| display_name | varchar | |
| description | text | |
| position | integer | Display order |
| is_active | boolean | |

##### `tenant_badges`
Tenant's instance of a badge template.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| template_id | UUID | FK to control plane `badge_templates` |
| display_name | varchar | Overridable |
| description | text | |
| visual_treatment | jsonb | Overridable |
| is_active | boolean | |
| criteria_override | jsonb | |

##### `tenant_signals`
Tenant's instance of a signal template (an Ask, Offer, or Mutual).

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| template_id | UUID | FK to `signal_templates` |
| display_name | varchar | Overridable |
| is_active | boolean | |

##### `user_badges`
Many-to-many between users and badges.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| tenant_badge_id | UUID | FK |
| awarded_at | timestamptz | |
| awarded_by_admin_id | UUID | Nullable for system-awarded |
| expires_at | timestamptz | Nullable, for time-limited badges |
| verification_request_id | UUID | Nullable, FK to the request that justified this badge |
| is_visible | boolean | User can hide |

##### `user_open_signals`
Per-user record of which Asks and Offers they currently accept nudges about.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | FK |
| tenant_signal_id | UUID | FK |
| is_open | boolean | |
| updated_at | timestamptz | |

#### Module 3: Connection layer

##### `saved_users`
Private save-for-later shelf. Never visible to the saved person.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK, the saver |
| saved_user_id | UUID | FK, the saved person |
| note | text | Private to saver |
| created_at | timestamptz | |

##### `nudges`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| sender_user_id | UUID | FK |
| receiver_user_id | UUID | FK |
| message | varchar(400) | |
| status | enum | sent, accepted, declined, ignored, expired |
| sent_at | timestamptz | |
| responded_at | timestamptz | |
| response_message | text | Templated decline copy if declined |
| expires_at | timestamptz | Default sent_at + 14 days |
| conversation_id | UUID | Nullable, populated when accepted |

##### `nudge_signals`
Many-to-many between nudges and signals (Asks/Offers/Mutuals).
- nudge_id, tenant_signal_id

##### `nudge_relationships`
Tracks history per ordered (sender, receiver) pair for cooldown enforcement.

| Column | Type | Notes |
|---|---|---|
| sender_user_id | UUID | FK |
| receiver_user_id | UUID | FK |
| last_nudged_at | timestamptz | |
| count_lifetime | integer | |
| last_outcome | enum | accepted, declined, ignored, expired |
| cooldown_until | timestamptz | Computed, denormalized for fast checks |

##### `nudge_quotas`
Tracks nudges-sent-per-week per user.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | FK |
| week_start_date | date | |
| nudges_sent_count | integer | |
| weekly_limit | integer | |

##### `conversations`
1:1 chats opened from accepted nudges.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_a_id | UUID | Alphabetically lower id |
| user_b_id | UUID | |
| created_at | timestamptz | |
| last_message_at | timestamptz | |
| is_archived_by_a | boolean | |
| is_archived_by_b | boolean | |
| originated_from_nudge_id | UUID | FK |

Unique constraint on (user_a_id, user_b_id).

##### `messages`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| conversation_id | UUID | FK |
| sender_user_id | UUID | FK |
| body | text | |
| sent_at | timestamptz | |
| read_at_by_recipient | timestamptz | |
| deleted_at | timestamptz | Soft, body redacted on read |

##### `mentorships`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| conversation_id | UUID | FK |
| mentor_user_id | UUID | FK |
| mentee_user_id | UUID | FK |
| status | enum | proposed, active, paused, completed, declined |
| goal | varchar(280) | |
| cadence | enum | every_2_weeks, monthly, ad_hoc |
| proposed_by_user_id | UUID | FK |
| started_at | timestamptz | |
| ended_at | timestamptz | |
| completion_reason | text | |

##### `mentorship_sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| mentorship_id | UUID | FK |
| scheduled_for | timestamptz | |
| completed_at | timestamptz | |
| mentor_marked_complete | boolean | |
| mentee_marked_complete | boolean | |
| mentor_reflection | varchar(500) | |
| mentee_reflection | varchar(500) | |
| session_number | integer | |

#### Module 4: Surveys and matching

##### `surveys`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | varchar | |
| description | text | |
| created_by_admin_id | UUID | FK |
| theme | varchar | career_fork, values, peer_support, etc. |
| status | enum | draft, published, closed, archived |
| published_at | timestamptz | |
| closes_at | timestamptz | |
| target_audience_filter | jsonb | e.g., "current students only" |
| matching_strategy | enum | overlap, complementarity |
| match_group_size_min | integer | Default 4 |
| match_group_size_max | integer | Default 6 |

##### `survey_questions`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| survey_id | UUID | FK |
| position | integer | |
| question_text | text | |
| question_type | enum | single_select, multi_select |
| is_required | boolean | |

##### `survey_options`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| question_id | UUID | FK |
| position | integer | |
| option_text | text | |
| option_value | varchar | Used in matching, e.g., "operating_role" |

##### `survey_responses` and `survey_response_answers`
| `survey_responses` columns |
|---|
| id, survey_id, user_id, submitted_at |

| `survey_response_answers` columns |
|---|
| id, response_id, question_id, option_id |

##### `match_groups`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| survey_id | UUID | FK |
| computed_at | timestamptz | |
| matching_signature | jsonb | Option values that defined this cluster |
| proposed_meetup_id | UUID | Nullable, FK |

##### `match_group_members`
| Column | Type | Notes |
|---|---|---|
| match_group_id | UUID | FK |
| user_id | UUID | FK |
| fit_score | float | 0 to 1 |
| notified_at | timestamptz | |
| opted_in | boolean | |

##### `meetups`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| match_group_id | UUID | FK |
| status | enum | proposed, scheduled, completed, cancelled |
| proposed_date | date | |
| confirmed_date | date | |
| venue_id | UUID | FK |
| organizer_admin_id | UUID | FK |
| summary_after | text | Admin's post-event note |

##### `venues`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | varchar | |
| address | text | |
| city | varchar | |
| capacity | integer | |
| notes | text | |

##### `user_match_quotas`
Caps groups per user per period to prevent burnout.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | FK |
| period_start | date | |
| match_groups_assigned | integer | |
| max_per_period | integer | Default 2 |

#### Module 5: Events

##### `events`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | varchar | |
| description | text | |
| source | enum | admin_organized, system_generated_from_meetup |
| event_type | enum | panel, workshop, reunion, dinner, talk |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| timezone | varchar | IANA, e.g., Asia/Kolkata |
| venue_id | UUID | FK |
| capacity | integer | |
| rsvp_deadline | timestamptz | |
| is_published | boolean | |
| created_by_admin_id | UUID | FK |
| generated_from_meetup_id | UUID | Nullable |
| cover_image_url | varchar | |

##### `event_rsvps`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| event_id | UUID | FK |
| user_id | UUID | FK |
| status | enum | attending, waitlisted, declined |
| rsvp_at | timestamptz | |

##### `event_attendance`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| event_id | UUID | FK |
| user_id | UUID | FK |
| checked_in_at | timestamptz | |
| checked_in_by | varchar | admin or self via QR |

#### Module 6: Resource shelf

##### `resource_categories`
Per-tenant configurable.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| code | varchar | |
| display_name | varchar | e.g., "Case Books", "Frameworks" |
| is_active | boolean | |

##### `resource_shelf_items`
Metadata only. No file uploads.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| category_id | UUID | FK |
| title | varchar | |
| description | text | |
| can_share_pointer | boolean | I will tell you where to find it |
| can_run_session | boolean | I will run a session for you |
| tags | varchar[] | e.g., "McKinsey", "Profitability" |
| created_at | timestamptz | |

##### `resource_requests`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| requester_user_id | UUID | FK |
| item_id | UUID | FK |
| message | text | |
| status | enum | pending, accepted, declined |
| requested_at | timestamptz | |
| responded_at | timestamptz | |

#### Module 7: Gamification

##### `contribution_events`
Append-only log.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| event_type | varchar | nudge_responded_within_48h, mentorship_session_completed, etc. |
| points_awarded | integer | Recorded at time of award, not from current rules |
| related_entity_type | varchar | |
| related_entity_id | UUID | |
| occurred_at | timestamptz | |

##### `gamification_rules`
Tenant-configurable point values per event type.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| event_type | varchar | |
| points_value | integer | Signed; can subtract for no-shows |
| conditions | jsonb | e.g., `{"within_hours": 48}` |
| is_active | boolean | |
| valid_from | timestamptz | |
| valid_until | timestamptz | |

##### `user_gamification_state`
1:1 with users. Raw counters, no interpretive scalars.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | FK |
| total_points | integer | |
| current_level | integer | |
| level_achieved_at | timestamptz | |
| current_streak_weeks | integer | |
| longest_streak_weeks | integer | |
| nudges_sent_lifetime | integer | |
| nudges_accepted_lifetime | integer | |
| nudges_received_lifetime | integer | |
| nudges_responded_lifetime | integer | |
| mentorships_as_mentor_count | integer | |
| mentorships_as_mentee_count | integer | |
| events_attended_count | integer | |
| events_hosted_count | integer | |
| resources_shared_count | integer | |
| surveys_completed_count | integer | |

##### `level_definitions`
Per-tenant level configuration.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| level_number | integer | |
| display_name | varchar | "Section A", "Pillar", etc. |
| points_required | integer | |
| unlock_payload | jsonb | extra_nudges_per_week, profile_boost_eligible, etc. |

##### `recognition_badges_history`
Time-limited badge history.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| badge_template_code | varchar | mentor_of_month, top_connector_of_quarter |
| period_start | date | |
| period_end | date | |
| awarded_at | timestamptz | |

#### Module 8: Notifications

##### `notifications`
The in-app inbox.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| type | varchar | nudge_received, meetup_confirmed, etc. |
| title | varchar | |
| body | text | |
| related_entity_type | varchar | |
| related_entity_id | UUID | |
| channels_dispatched | varchar[] | Channels we attempted |
| read_at | timestamptz | |
| created_at | timestamptz | |

##### `notification_dispatches`
One row per channel attempt per notification.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| notification_id | UUID | FK |
| channel | enum | email, push, in_app |
| status | enum | queued, sent, delivered, failed, suppressed_by_preferences |
| provider_message_id | varchar | |
| error_payload | jsonb | |
| sent_at | timestamptz | |

##### `push_tokens`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| token | text | |
| platform | enum | web_push, ios, android |
| device_label | varchar | |
| created_at | timestamptz | |
| last_used_at | timestamptz | |
| revoked_at | timestamptz | Stays in table for audit |

##### `notification_preferences`
1:1 with users.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | FK |
| email_enabled | boolean | Default true |
| push_enabled | boolean | Default true |
| in_app_enabled | boolean | Default true, cannot be disabled |
| quiet_hours_start | time | |
| quiet_hours_end | time | |
| timezone | varchar | IANA |
| signal_filters | jsonb | e.g., `{"mute_signals": ["coffee_chat"]}` |
| event_filters | jsonb | |
| digest_frequency | enum | immediate, daily, weekly |

#### Module 9: Admin and audit

##### `admin_users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK, nullable for non-platform admins |
| email | varchar | |
| name | varchar | |
| role | enum | owner, operator, moderator |
| status | enum | active, invited, suspended |
| invited_by | UUID | FK |
| invited_at | timestamptz | |
| joined_at | timestamptz | |
| suspended_until | timestamptz | |

##### `audit_log_tenant`
Identical structure to control plane audit log, scoped to this tenant.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| actor_user_id | UUID | FK, nullable |
| actor_admin_id | UUID | FK, nullable |
| action | varchar | |
| target_type | varchar | |
| target_id | UUID | |
| payload | jsonb | |
| occurred_at | timestamptz | |
| ip_address | inet | |
| user_agent | text | |

Default retention: 18 months. Configurable per tenant.

##### `blocked_identifiers`
Suspended users may attempt to return under different emails.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| identifier_type | enum | email, phone, linkedin_url, full_name_dob |
| identifier_value | varchar | |
| blocked_by_admin_id | UUID | FK |
| reason | text | |
| blocked_at | timestamptz | |

New registrations check against this list. UI deferred to v1; reserve the table now.

#### Module 10: DPDPA infrastructure

##### `policy_versions`
Immutable.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| policy_type | enum | terms_of_service, privacy_policy, cookie_policy |
| version_number | varchar | |
| effective_from | timestamptz | |
| effective_to | timestamptz | Nullable |
| content_url | varchar | S3 link to immutable PDF or markdown |
| summary_of_changes | text | |

We never edit a policy in place. We publish a new version and require fresh consent.

##### `user_consents`
Audit trail of every consent action.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| consent_type | enum | terms_of_service, privacy_policy, profile_visibility, marketing_communications, third_party_sharing |
| policy_version_accepted | UUID | FK |
| accepted_at | timestamptz | |
| ip_address | inet | |
| user_agent | text | |
| withdrawn_at | timestamptz | Nullable; withdrawals do not delete the original consent record |

##### `data_subject_requests`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| request_type | enum | access, erasure, correction, portability, withdrawal_of_consent |
| status | enum | submitted, in_progress, completed, rejected |
| submitted_at | timestamptz | |
| due_by | timestamptz | Computed from submission per regulation |
| completed_at | timestamptz | |
| response_payload_url | varchar | S3 link to fulfilled response |
| admin_handler_id | UUID | FK |
| rejection_reason | text | |

---

## 13. Data protection and DPDPA posture

The product launches in India. The DPDPA is the governing regime. The product must be exemplary on data protection from day one, both because of substantive obligations and because data posture is the question every competitor will ask in a sales process.

### Consent

Every consent action writes to `user_consents`. Withdrawals do not delete the original consent record; they add a `withdrawn_at` timestamp. Policies are immutable per version. Updating a policy means publishing a new version and requiring fresh consent on next login. The policy versions table keeps the historic record forever.

### Erasure

When a user files a Data Subject Request for erasure, the platform tombstones rather than cascade-deletes. Tombstoning means: the user's PII is replaced with placeholders (name becomes "Deleted User", photo URL nulls, email becomes a hashed value, free-text fields become "[redacted]"), but the structural rows remain so audit logs and other users' histories are not silently rewritten.

This is industry standard for systems with audit obligations. We are upfront about it in the privacy policy. We do not pretend we can erase what we cannot erase without breaking the integrity of other users' records.

The decision to tombstone (not cascade) is being flagged in section 14 for explicit confirmation, since some buyers will have opinions.

### Audit

Every meaningful action writes to either `audit_log_global` (control plane) or `audit_log_tenant`. Default retention is 18 months, configurable per tenant. Audit logs are append-only at the application level.

### Data export

Tenants can request a full data export from the admin panel. JSON dump of all tables in their tenant schema, delivered as a signed download link. Half a day of work to ship at MVP. Saves a sales objection.

### Encryption

At rest: managed by the database provider (Neon or Supabase), AES-256 standard. In transit: TLS everywhere, no exceptions. Verification evidence files and profile photos in object storage with bucket-level encryption and signed URLs that expire in 15 minutes.

---

## 14. Cross-cutting infrastructure concerns

**Soft delete by default.** Writes never destroy state without an audit trail. Hard delete is reserved for DPDPA erasure requests, and even then through tombstoning.

**Rate limiting at the API layer.** Per tenant, per user, per IP. Especially on auth endpoints. Redis-backed limiter. Without this, a single bad actor in any tenant can ruin the day for everyone.

**Background workers.** Email dispatch, push notification dispatch, badge computation, survey clustering, weekly nudge quota resets, expired nudge cleanup. All run via BullMQ on Redis.

**Tenant-aware connection helper.** Every database query goes through middleware that resolves the active tenant from the request context (subdomain or session) and routes to the right schema. No raw queries that bypass this helper. Code review checks for this.

**Secrets management.** Platform secrets in Vercel environment variables. Per-tenant secrets (any future ones, e.g., custom email-from addresses) in a dedicated secrets table with envelope encryption.

**Backup strategy.** Daily snapshots of the entire database. Per-tenant restore is straightforward because each tenant is its own schema; we restore that schema only without affecting others.

---

## 15. Open decisions

These need explicit signoff before further build. Each has a recommendation but is genuinely open.

### 15.1 Erasure mechanics

**Question.** When a user requests deletion, do we tombstone (preserve structural rows, redact PII) or cascade-delete (remove their nudges, mentorships, contribution events from history, including from other users' views)?

**Recommendation.** Tombstone, with explicit policy explanation.

**Status.** Pending confirmation.

### 15.2 Founder badge proof bar

**Question.** What counts as proof for an early-stage founder who is pre-revenue and pre-Tracxn?

**Recommendation.** The founder must provide one of:
- Registered company identifier (e.g., MCA registration in India) plus self-attested declaration of stage
- Public press
- Admin-recognized incubator or accelerator association (ISB has CIE, NSRCEL, etc.)

Admins decide on borderline cases. There will be borderline cases.

**Status.** Pending confirmation.

### 15.3 LinkedIn dependency

**Question.** Are we OK with LinkedIn being admin-manual at MVP?

**Options.** Manual review (recommended), scrape (legal grey zone, declined), drop LinkedIn entirely (relies on admin verification of self-declared work history alone).

**Recommendation.** Manual review at MVP, evaluate alternatives at v2 scale.

**Status.** Pending confirmation.

### 15.4 Survey matching algorithm

**Question.** What clustering algorithm at MVP?

**Recommendation.** Jaccard similarity with diversity penalty, configurable per survey via the `matching_strategy` field. Simple to implement, explainable, modular enough that an AI re-ranking layer slots in later behind the same interface.

**Status.** Pending confirmation.

### 15.5 Tenant data export from day one

**Question.** Do we ship a JSON tenant export at MVP?

**Recommendation.** Yes. Half a day of work. Cannot honestly claim "you own your data" without it.

**Status.** Pending confirmation.

### 15.6 Decline copy for nudges

**Question.** Is templated, gentle, anonymous-feeling decline the right posture?

**Recommendation.** Yes. The single piece of copy disproportionately shapes community feel.

**Status.** Pending confirmation.

### 15.7 PWA versus native apps for v1

**Question.** Web PWA only at v1, or invest in native apps?

**Recommendation.** PWA only. Saves months and dollars. Sufficient for the use case. Revisit if telemetry shows poor retention or unreliable push.

**Status.** Pending confirmation.

### 15.8 Levels and gamification language are tenant-configurable

**Question.** Is per-tenant rename of levels and badges the right architecture?

**Recommendation.** Yes. ISB might use Section A through D; another institution might use House names. Mechanic is universal, labels are local.

**Status.** Pending confirmation.

---

## 16. Things still on the flag list

Smaller open questions and items we have not resolved.

- **Naming.** The product needs a name. Separate exercise.
- **Visual design.** No design system yet. Will follow naming.
- **Pricing.** Per-tenant, per-seat, per-user-active, or flat license? Not yet decided. Needs ISB-specific conversation.
- **Contract length and pilot terms.** What does the ISB pilot look like commercially? Free first quarter? Token license? Discovery call needed.
- **Terms of service and privacy policy text.** Drafts needed before MVP launch.
- **Brand voice.** Tone, register, defaults for system-generated copy (decline notes, meetup proposals, badge announcements). Needs articulation.
- **Onboarding flow specifics.** First-time user experience, profile completion prompts, gamification of profile setup. Not yet wireframed.
- **What happens at tenant offboarding.** If a university chooses to leave, what is the data handover protocol? Should be in the contract from day one.
- **Email-from address.** Per-tenant or platform-wide? Affects deliverability and brand.
- **Calendar integration depth.** .ics file at MVP is fine. Full Google Calendar / Outlook OAuth in v1, for proper two-way sync, has implementation cost worth scoping.

---

## 17. Next steps menu

Pick one to drill into next. Each is roughly equivalent in depth.

**A. API surface design per module.** Concrete endpoint definitions, request/response shapes, error handling conventions. Useful before any engineer touches the code.

**B. Matching algorithm specification.** Pseudo-code for the survey clustering logic at MVP. Includes the diversity penalty math and quota enforcement logic.

**C. Screen-by-screen wireframes.** The card grid, profile expansion, nudge composer, Asks and Offers settings, survey, meetup invite, admin verification queue. Locks interaction details before code.

**D. Security and infrastructure architecture.** Concrete diagram of the deployment, secrets flow, tenant routing, backup strategy. Useful for the security review a sophisticated buyer will run.

**E. Onboarding flow specifics.** First-time user experience design, profile completion gamification, what makes the first 60 seconds feel like the platform is alive.

**F. Pricing and commercial model.** Per-seat versus flat license, pilot terms for ISB, what the renewal conversation looks like. Useful before talking to the ISB administration.

**G. Naming and brand positioning.** Just enough to design with. Names, taglines, tone of voice.

My recommendation, given where we are: **(C) wireframes**, because the data model is now solid enough that interaction details are the next constraint, and because wireframes make the product tangible for the WhatsApp drop in a way schemas do not. (A) is the right answer if engineering starts immediately. (G) is the right answer if ISB conversations happen first.

Tell me which.
