# Intent

**Community networking for universities. Structured access to the people around you.**

Intent is a B2B SaaS platform that gives university communities — students, recent graduates, and alumni — a structured way to find each other for mentorship, recruitment help, domain insight, career switching advice, and peer connection. The existing alternatives (LinkedIn, WhatsApp groups, alumni office email blasts) are noisy, undirected, and structureless. Intent replaces them with a card-based, signal-tagged, gamified networking layer configured per institution.

The first tenant is **ISB (Indian School of Business)**, India.

---

## Table of Contents

- [The Problem](#the-problem)
- [How Intent Solves It](#how-intent-solves-it)
- [Core Mechanics](#core-mechanics)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [What Has Been Built](#what-has-been-built)
- [Project Structure](#project-structure)
- [Screens and Routes](#screens-and-routes)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
- [Design System](#design-system)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Deploying to Production](#deploying-to-production)
- [Phasing Roadmap](#phasing-roadmap)
- [Open Decisions](#open-decisions)
- [Contributing](#contributing)

---

## The Problem

Inside any university, placement, mentorship, and informal career capital are bottlenecked not by absence of supply but by absence of structured access. The social cost of cold outreach in a known community is higher than people will admit. The most extroverted people in the most central social positions capture the network value; everyone else gets scraps.

- **LinkedIn** is too noisy and not institution-bounded
- **WhatsApp groups** are broadcast-only, no structure, no direction
- **Alumni office email lists** are one-way, low-signal

The result: the network value implicit in attending an institution is captured haphazardly.

## How Intent Solves It

Intent lowers the social cost of asking by giving people a sanctioned mechanism to reach out, tagged with a clear purpose, inside a trust-bounded community. There is no public rejection. No swipe-to-reject. No visible score of "given vs received." The product is designed so that both sides of the network show up more often.

Every member has an **Intent** — a 200-character statement of what they are working toward and what they are looking for. The product is named for it, the profile is built around it, and the entire experience is Intent-centric.

## Core Mechanics

### Cards and Discovery
Photography-forward member cards with verified claims. Browse by domain, niche, company, city, years of experience, and open Asks/Offers. No swipe-to-reject — you either tap to learn more, scroll past, or save privately.

### Asks and Offers
Every connection request is tagged with purpose. An **Ask** is something you're seeking (mentor, referral, career switch advice). An **Offer** is something you're giving (mentorship, referrals, domain expertise). A **Mutual** is symmetric (case prep partner, coffee chat, co-founder search). The system understands ask-offer pairing: someone looking for a mentor gets nudges from people who are open to mentoring, not from peers who are also looking.

### Nudges
The only outbound action. A short message (400 chars) with an Ask or Offer attached. 5 per week at MVP. The receiver can Accept (opens 1:1 chat), Decline politely (templated, anonymous-feeling soft no), or Ignore (auto-expires after 14 days). Cooling-off rules prevent harassment: 90-day cooldown after decline, 30-day after ignore.

### Survey-to-Meetup Loop
The engagement engine. Admin publishes a short survey (5-10 questions, 60 seconds). System clusters responses into small groups of 4-6. Platform proposes an offline meetup. Users opt in. Admin confirms date and venue. Group meets. Post-event check-in feeds gamification. This is what makes the platform a habit and what produces shareable, real-world moments.

### Mentorship Scaffolding
When a mentorship nudge is accepted, both users see an optional scaffold: shared goal, cadence (bi-weekly/monthly/ad-hoc), session scheduling, per-session reflections. Enables but does not enforce.

### Gamification
Points for community contribution (responding to nudges within 48h, completing mentorship sessions, attending meetups, sharing resources, completing surveys). Levels with per-tenant configurable names. Unlocks: extra nudges, event hosting privileges, profile boost. Nothing feels childish — recognition reflects actual contribution.

### Verification
Three tiers. Tier 1: email match against admin-uploaded member list + phone OTP (gates entry). Tier 2: LinkedIn URL manually reviewed by admin (validates profile claims). Tier 3: structured declaration with proof for special badges like Founder. The discipline: the card only shows what has been verified.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16.2.4 (App Router) | SSR, Server Components, API routes |
| Language | TypeScript 5 | Type safety throughout |
| UI | React 19, Tailwind CSS 4, shadcn/ui | Component primitives, fast iteration |
| State | React Query (TanStack) | Server state caching |
| ORM | Prisma 7.8.0 | Type-safe database access, migrations |
| Database | PostgreSQL (production), SQLite (local dev) | Schema-per-tenant isolation |
| Auth | NextAuth 4 (Credentials + JWT) | Multi-tenant sessions |
| Forms | react-hook-form + Zod | Validation |
| Email | Resend | Transactional emails |
| Icons | Lucide React | Consistent iconography |
| Mobile | Progressive Web App | Install prompt, offline cache |
| Hosting | Firebase App Hosting | Auto-deploy from GitHub |
| Database Hosting | Neon (recommended) | Serverless PostgreSQL |

---

## Architecture

- **App Router** with Server Components by default, `"use client"` only where interactivity requires it
- **Multi-tenant** — each university is a hard-isolated tenant (schema-per-tenant in Postgres, no cross-university data leakage)
- **API envelope** — all responses follow `{ success, data, error }` with consistent pagination `{ data, total, page, pageSize, hasMore }`
- **Role-based access** — User, Owner, Operator, Moderator roles enforced in middleware
- **Soft delete** throughout — writes never destroy state without audit trail
- **Rate limiting** — per-tenant, per-user, per-IP at the API layer
- **DPDPA compliance** — consent logging, audit trail, data subject requests, tombstone-based erasure
- **Modular boundaries** — discovery, nudging, matching, events, surveys, gamification, notifications are decoupled modules

---

## What Has Been Built

The MVP codebase is **feature-complete** across all planned screens and API routes. Here is what exists:

### Authentication and Onboarding (10 screens)
- Login and signup with email/password
- Email verification flow
- DPDPA/privacy consent capture
- 4-step onboarding: personal info, education & experience, interests & signals, final review
- Onboarding completion screen

### Discovery and Browse (2 screens)
- Card grid with photography-forward member cards
- Filter system: domain, niche, company, city, experience, open signals
- Save-for-later (private, never visible to saved person)

### Connection Layer (5 screens)
- Nudge composer with Ask/Offer tagging
- Nudge inbox with sent/received views
- Nudge detail with accept/decline/ignore
- 1:1 chat (conversation list + single conversation)
- Saved users list

### Surveys and Matching (3 screens)
- Survey list and survey-taking interface
- Match group detail view

### Events and Gamification (2 screens)
- Events list with RSVP
- Contributions/gamification dashboard with levels and streaks

### Profile (3 screens)
- View other user's full profile
- My profile view
- Profile editing

### Admin Panel (6 screens)
- Admin dashboard with statistics
- Admin login
- Bulk member import (CSV upload)
- Survey creation
- Verification queue (list + individual review)

### Infrastructure
- 26 API endpoints covering all features
- 7 custom React Query hooks for client-side data fetching
- 35 UI components (24 shadcn/ui + 11 custom domain components)
- Rate limiting, audit logging, gamification engine, email service
- PWA manifest and service worker
- Security headers (HSTS, X-Frame-Options, CSP, etc.)

---

## Project Structure

```
intent-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # 26 REST API endpoints
│   │   ├── (auth)/                   # Auth layout group (login, signup, onboarding)
│   │   ├── (app)/                    # Main app layout group (home, chats, inbox, etc.)
│   │   ├── (admin)/                  # Admin layout group (dashboard, members, surveys)
│   │   ├── layout.tsx                # Root layout
│   │   ├── providers.tsx             # React Query + context providers
│   │   └── middleware.ts             # Auth, rate limiting, role checks
│   │
│   ├── components/
│   │   ├── ui/                       # 24 shadcn/ui components
│   │   ├── admin/                    # Admin sidebar, header, tab bar
│   │   ├── member-card.tsx           # Discovery card component
│   │   ├── filter-drawer.tsx         # Mobile filter UI
│   │   ├── nudge-row.tsx             # Nudge list item
│   │   ├── signal-toggle.tsx         # Ask/Offer toggle
│   │   └── ...                       # 11 custom domain components total
│   │
│   ├── hooks/                        # 7 React Query hooks
│   │   ├── use-api.ts                # Base fetch wrapper
│   │   ├── use-current-user.ts
│   │   ├── use-discovery.ts
│   │   ├── use-nudges.ts
│   │   ├── use-conversations.ts
│   │   ├── use-surveys.ts
│   │   └── use-saved-users.ts
│   │
│   ├── lib/                          # Server-side utilities
│   │   ├── auth.ts                   # NextAuth configuration
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── api-helpers.ts            # withAuth, withAdminAuth, response wrappers
│   │   ├── gamification.ts           # Points, levels, contribution tracking
│   │   ├── email.ts                  # Resend email templates
│   │   ├── consent.ts                # DPDPA consent management
│   │   ├── audit.ts                  # Audit logging
│   │   ├── tenant.ts                 # Multi-tenant utilities
│   │   └── rate-limit.ts             # Sliding window rate limiter
│   │
│   ├── config/
│   │   └── brand.ts                  # Design tokens, colors, typography, signals
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   │
│   └── generated/prisma/             # Auto-generated Prisma client
│
├── prisma/
│   ├── schema.prisma                 # 50+ data models
│   └── seed.ts                       # ISB tenant, domains, niches, signals, sample users
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
│
├── apphosting.yaml                   # Firebase App Hosting config
├── firebase.json                     # Firebase project config
├── next.config.ts                    # Security headers, image optimization
├── master-plan-intent.md             # Full product specification
└── intent-screen-prompts.md          # 30 screen specifications
```

---

## Screens and Routes

### Authentication `/(auth)/`
| Route | Screen |
|---|---|
| `/login` | Login |
| `/signup` | Registration |
| `/signup/verify` | Email verification |
| `/signup/consent` | DPDPA privacy consent |
| `/onboarding` | Onboarding intro |
| `/onboarding/step1` | Personal info |
| `/onboarding/step2` | Education & experience |
| `/onboarding/step3` | Interests & signals |
| `/onboarding/step4` | Final review |
| `/onboarding/complete` | Completion |

### Main App `/(app)/`
| Route | Screen |
|---|---|
| `/home` | Discovery feed (card grid) |
| `/chats` | Conversations list |
| `/chats/[conversationId]` | Single conversation |
| `/inbox` | Nudges inbox |
| `/inbox/[nudgeId]` | Nudge detail |
| `/nudge/[userId]` | Send nudge |
| `/profile/[id]` | View user profile |
| `/my-profile` | My profile |
| `/my-profile/edit` | Edit profile |
| `/saved` | Saved users |
| `/surveys` | Surveys list |
| `/surveys/[surveyId]` | Take survey |
| `/matches/[groupId]` | Match group |
| `/events` | Events list |
| `/contributions` | Gamification dashboard |
| `/settings` | User settings |

### Admin `/(admin)/`
| Route | Screen |
|---|---|
| `/admin` | Dashboard |
| `/admin/login` | Admin login |
| `/admin/members/upload` | Bulk member import |
| `/admin/surveys/create` | Create survey |
| `/admin/verify` | Verification queue |
| `/admin/verify/[requestId]` | Review verification |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/auth/signup` | User registration |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Current user with all relations |
| GET | `/api/users/[id]` | User by ID |
| PUT | `/api/users/me/profile` | Update profile |
| GET | `/api/users/me/signals` | User's open signals |
| POST | `/api/users/me/data-export` | GDPR data export |
| POST | `/api/users/me/delete-account` | Soft delete account |

### Discovery
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/discovery` | Paginated, filterable feed |
| GET | `/api/discovery/filters` | Filter options (domains, niches, cities) |

### Nudges
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/nudges` | Send nudge |
| GET | `/api/nudges/[id]` | Get nudge |
| PATCH | `/api/nudges/[id]` | Respond (accept/decline) |
| GET | `/api/nudges/quota` | Weekly quota status |

### Conversations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/[id]` | Conversation with messages |
| POST | `/api/conversations/[id]/messages` | Send message |

### Surveys
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/surveys` | List surveys |
| GET | `/api/surveys/[id]` | Survey questions |
| POST | `/api/surveys/[id]/respond` | Submit response |

### Other
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/saved-users` | Save/unsave user |
| GET | `/api/match-groups` | List match groups |
| POST | `/api/consents` | Accept policies |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET/POST | `/api/admin/members` | List / bulk import members |
| GET/POST | `/api/admin/surveys` | List / create surveys |
| GET/POST | `/api/admin/verifications` | List / create verifications |
| PATCH | `/api/admin/verifications/[id]` | Review verification |
| GET | `/api/admin/activity` | Audit logs |

---

## Data Model

50+ Prisma models organized into modules:

| Module | Models | Purpose |
|---|---|---|
| **Identity** | User, UserProfile, UserEducation, UserExperience, LinkedinLink | Core user data |
| **Taxonomy** | Domain, Niche, Company | Controlled vocabularies per tenant |
| **Badges & Signals** | BadgeTemplate, TenantBadge, UserBadge, SignalTemplate, TenantSignal, UserOpenSignal | Trust and connection tagging |
| **Connection** | SavedUser, Nudge, NudgeSignal, NudgeRelationship, NudgeQuota, Conversation, Message | Nudging and messaging |
| **Mentorship** | Mentorship, MentorshipSession | Structured mentoring |
| **Surveys** | Survey, SurveyQuestion, SurveyOption, SurveyResponse, MatchGroup, MatchGroupMember, Meetup, Venue | Survey-to-meetup pipeline |
| **Events** | Event, EventRsvp, EventAttendance | Community events |
| **Gamification** | ContributionEvent, GamificationRule, UserGamificationState, LevelDefinition | Points, levels, streaks |
| **Notifications** | Notification, NotificationPreference | In-app and email notifications |
| **Admin** | AdminUser, Tenant, SuperAdmin, AuditLog | Multi-tenant administration |
| **Verification** | VerificationRequest, VerificationEvidenceFile | Trust verification workflow |
| **DPDPA** | PolicyVersion, UserConsent, DataSubjectRequest | Data protection compliance |
| **Resources** | ResourceCategory, ResourceShelfItem | Metadata-only resource shelf |

See `prisma/schema.prisma` for full definitions and `master-plan-intent.md` Section 12 for design rationale.

---

## Design System

| Element | Value |
|---|---|
| Background | `#FAFAF6` (warm off-white) |
| Surface | `#FFFFFF` (pure white, soft shadow) |
| Primary accent | `#B8762A` (deep amber) |
| Secondary accent | `#2D4A3A` (forest green, for verification) |
| Primary text | `#1A1A1A` |
| Secondary text | `#6B6B66` |
| Body font | Inter |
| Heading font | Inter Tight |
| Grid | 8pt baseline |
| Card radius | 16px |
| Mobile baseline | 390pt (iPhone 14) |

The visual identity: professional but warm, uncluttered, photography-forward, generous whitespace. Feels like Linear meets Substack, not like a dating app or hustle-culture LinkedIn.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/nss-ark/intent-app.git
cd intent-app

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create and seed the local SQLite database
npx prisma migrate dev
npm run db:seed

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`. Demo mode is enabled by default (`NEXT_PUBLIC_DEMO_MODE=true` in `.env`), allowing you to browse all screens without authentication.

### Environment Variables (Local)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="intent-dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_DEMO_MODE="true"
```

---

## Deploying to Production

The app is configured for **Firebase App Hosting**, which has built-in GitHub integration and auto-deploys on push to `main`. No separate CI/CD pipeline needed.

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g., `intent-app`)
3. Enable the **Blaze plan** (pay-as-you-go; required for App Hosting, free tier is generous)

### Step 2: Provision a PostgreSQL Database

The app uses SQLite locally but requires PostgreSQL in production.

1. Go to [neon.tech](https://neon.tech) (free tier, serverless Postgres)
2. Create a project
3. Copy the connection string: `postgresql://user:pass@host/intent?sslmode=require`

### Step 3: Install Firebase CLI and Initialize App Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init apphosting
```

When prompted:
- Select your Firebase project
- Connect your GitHub repository (`nss-ark/intent-app`)
- Select `main` as the live branch

Firebase will set up auto-deploy: every push to `main` triggers a build and deploy automatically.

### Step 4: Set Secrets in Firebase

```bash
# Set the database connection string
firebase apphosting:secrets:set database-url
# Paste your Neon connection string when prompted

# Set the NextAuth secret
firebase apphosting:secrets:set nextauth-secret
# Paste the output of: openssl rand -base64 32
```

### Step 5: Set the Production URL

After your first deploy, Firebase gives you a URL (e.g., `https://intent-app--main-abc123.web.app`). Set it as the NextAuth URL:

```bash
firebase apphosting:config:set NEXTAUTH_URL=https://your-app-url.web.app
```

Or, if you add a custom domain later (e.g., `isb.intent.community`), use that instead.

### Step 6: Run Initial Database Migration

From your local machine, point at the production database:

```bash
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
DATABASE_URL="your-neon-connection-string" npm run db:seed
```

This creates all tables and seeds the ISB tenant with domains, niches, signals, badges, and sample data.

### Step 7: Push to Main

```bash
git push origin main
```

Firebase auto-deploys. Your app is live.

### Configuration Reference

The `apphosting.yaml` file configures Firebase App Hosting:

```yaml
runConfig:
  concurrency: 80
  cpu: 1
  memoryMiB: 512
  minInstances: 0
  maxInstances: 10

env:
  - variable: NEXT_PUBLIC_DEMO_MODE
    value: "false"
  - variable: DATABASE_URL
    secret: database-url
  - variable: NEXTAUTH_SECRET
    secret: nextauth-secret
  - variable: NEXTAUTH_URL
    availability: [BUILD, RUNTIME]
```

---

## Phasing Roadmap

### MVP (Current — ready for ISB WhatsApp drop)
- [x] Identity: Tier 1 (CSV upload + phone OTP) and Tier 2 (admin-manual LinkedIn check)
- [x] Profile and card with all card fields
- [x] Browse and filters
- [x] Nudge with Asks/Offers tagging, cooling-off, receiver capacity
- [x] Accept/decline/ignore
- [x] 1:1 chat
- [x] Survey-to-meetup cycle
- [x] Admin panel: branding, member onboarding via CSV, badge management, verification queue, basic reporting
- [x] Three admin sub-roles (Owner, Operator, Moderator)
- [x] Gamification: contribution event logging and level display
- [x] Mobile-friendly responsive web with PWA
- [x] DPDPA consent log, audit log, soft-delete pattern
- [ ] Production deployment (Firebase App Hosting + Neon Postgres)
- [ ] Terms of service and privacy policy text
- [ ] ISB tenant configuration and real member data

### V1 (After first cohort feedback)
- Tier 3 verification for Founder badge (structured declaration + proof)
- Push notifications via web push
- Recurring survey cadence (bi-weekly default)
- Full mentorship scaffolding
- Expanded gamification with unlocks and recognition badges
- Deeper admin reporting
- Refined Asks/Offers taxonomy from observed usage
- Calendar API integration (Google Calendar, Outlook)

### V2
- AI re-ranking in matching (vector embeddings on profiles and intents)
- Online events
- Cross-tenant federation (opt-in)
- Student-side monetization (extra nudges, profile boosts)
- Second tenant onboarded
- SSO integration
- Native mobile apps (if PWA telemetry warrants it)

---

## Open Decisions

These are documented in `master-plan-intent.md` Section 15 and need explicit signoff before production launch:

| Decision | Recommendation | Status |
|---|---|---|
| Erasure mechanics (tombstone vs cascade) | Tombstone with explicit policy | Pending |
| Founder badge proof bar | MCA registration + self-attestation | Pending |
| LinkedIn dependency at MVP | Manual admin review | Pending |
| Survey matching algorithm | Jaccard + diversity penalty | Pending |
| Tenant data export at MVP | Yes, JSON dump | Pending |
| Nudge decline copy tone | Templated, gentle, anonymous | Pending |
| PWA vs native at V1 | PWA only | Pending |
| Per-tenant level/badge naming | Yes, tenant-configurable | Pending |

---

## Contributing

This is a private repository. Development is by the NSS Ark team.

### Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Generate Prisma client + build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed the database with sample data
```

### Key Documents

- **`master-plan-intent.md`** — Full product specification, architecture decisions, data model rationale
- **`intent-screen-prompts.md`** — 30 screen specifications
- **`prisma/schema.prisma`** — Complete data model (50+ models)
- **`src/config/brand.ts`** — Design tokens, colors, typography

---

Built by [NSS Ark](https://github.com/nss-ark) for Comply Ark.
