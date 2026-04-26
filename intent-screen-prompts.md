# Intent — Mockup Generation Prompts
## For Stitch (Google Labs) and similar prompt-based prototyping tools

This document contains 30 sequential prompts to generate every MVP screen of Intent. They are written for Stitch but adapt to most similar tools (Cloud Design, Vercel v0, Galileo) with minor edits.

---

## How to use this document

1. **Open a fresh Stitch project.** Pick the "mobile" canvas, 390pt width.
2. **Paste the Project Preamble below as your first message.** This sets the brand and house style for the whole session. Stitch will hold this context for subsequent generations.
3. **Generate Screen 1** by pasting the prompt under "Screen 1." Review the output. Regenerate or adjust if needed.
4. **Continue sequentially.** Each prompt is self-contained but assumes the preamble is loaded. Stitch's session memory will keep your characters and visual style consistent across screens.
5. **Save each output as a frame in your Stitch project**, named per the screen number and title in this document.
6. When all 30 screens are done, you have a full clickable MVP prototype of Intent that you can drop into the ISB WhatsApp groups for first reactions.

The screens are ordered to follow the natural arc of the user experience (onboarding, core loop, engagement, settings) followed by the admin panel. The full set takes 3 to 4 hours of focused work, or can be split into shorter sittings of 5 to 10 screens at a time.

---

## Project preamble
### Paste this once at the start of your Stitch session

```
You are designing mobile screens for Intent, a community networking product for university alumni and students. The first tenant is the Indian School of Business (ISB), Hyderabad. The product is sold as B2B SaaS to universities. The core mechanic is browsing cards of fellow members, sending a typed nudge tagged with an Ask or Offer, and either getting a 1:1 conversation, a templated polite decline, or silence. Alongside that, Intent runs a recurring lightweight survey mechanic that clusters members into small groups of 4 to 6 and proposes offline meetups.

Every member has an "Intent": the 200-character statement of what they are working toward and what they are looking for. This is the lead element of identity in the product and the namesake of the brand.

Brand voice: direct, warm, professional. Reference points are Linear (precision and restraint), Substack (warmth without informality), and Cred (visual confidence). Avoid the language registers of dating apps, hustle-culture LinkedIn, and consumer social.

House visual style:
- Background: warm off-white, #FAFAF6
- Card surfaces: pure white, #FFFFFF, with soft shadow (0 4px 16px rgba(0,0,0,0.04)) and 16pt rounded corners
- Primary text: near-black, #1A1A1A
- Secondary text: warm gray, #6B6B66
- Tertiary text and borders: warm light gray, #E8E4DA
- Primary accent: deep amber, #B8762A (used for buttons, active states, CTAs)
- Secondary accent: deep forest green, #2D4A3A (used sparingly for verification glyphs and Founder badge accents)
- Typography: Inter for body text and labels; Inter Display (or similar editorial sans) for large headings
- Spacing: 8pt grid throughout; generous whitespace
- Iconography: thin-line, 1.5px stroke, rounded corners
- Photography: photography-forward; cards lead with photos; warm, well-lit headshots; business casual; subtle natural smiles
- Mobile baseline: 390pt width (iPhone 14 reference); respect safe areas

Consistent cast for use across screens (so the same person looks the same in every screen):
- The viewing user is Arjun Mehta, a 30-year-old current ISB PGP student (Class of 2026), 6 years pre-MBA in product management at Flipkart, looking to break into venture capital. Use a warm, well-lit headshot of an Indian man in his late 20s/early 30s, business casual, soft smile.
- Ananya Krishnan, ISB Class of 2018, 8 years experience, ex-McKinsey, now an investor at Lightspeed Venture Partners focused on climate. Based in Bangalore. Late 30s, Indian woman, warm smile, professional headshot.
- Vikram Subramanian, ISB Class of 2014, ex-BCG, now founder of a fintech startup (verified Founder badge, Revenue-stage). Based in Mumbai. Early 40s, Indian man.
- Priya Reddy, ISB Class of 2020, 5 years experience, Goldman Sachs investment banking. Based in Hyderabad. Early 30s, Indian woman.
- Rohan Kapoor, ISB Class of 2016, ex-Bain, currently at Tiger Global. Based in Mumbai. Late 30s, Indian man.
- Rajesh Iyer, ISB Class of 2010, Partner at Bain & Company. Based in Mumbai. Late 40s, Indian man, slightly grayer hair.

Mood throughout: feels editorial and warm, not consumer-app-cheery. Generous whitespace. Photography leads. Amber is the only saturated color and is used sparingly. Type hierarchy is confident.

I will give you one screen prompt at a time. Generate that screen at 390pt width with the above style applied.
```

---

# User panel screens

## Screen 1: Welcome / Splash

**Purpose.** First screen on app launch for a user who has not yet signed up. Communicates the brand and offers the two entry paths.

**Prompt:**

```
Generate the Welcome screen for Intent.

Layout, top to bottom:

1. Status bar (default mobile chrome).
2. Top of screen: the "intent" wordmark, lowercase, in a confident editorial serif/sans hybrid (think Tiempos or similar). Centered, 24pt, in charcoal. 32pt of vertical space below.
3. Hero photograph: full-width, takes about 48% of screen height. The photo shows two Indian professionals in mid-conversation across a small cafe table, slightly out-of-focus background, warm afternoon light filtering through a window. One looks late 20s, one looks mid 40s, both in business casual. Suggests mentorship and connection without being literal. The bottom corners of the image are rounded (16pt).
4. 32pt of vertical space.
5. Large heading: "What's your Intent?" in 32pt Inter Display semibold, charcoal, left-aligned with 24pt margins.
6. 12pt of vertical space.
7. Sub-heading: "Connect with the people in your ISB community whose work and direction align with yours." 16pt Inter regular, warm gray (#6B6B66), left-aligned.
8. Push to the bottom of the screen: a primary button "Create your account" in deep amber (#B8762A) with white text, full width minus 24pt side margins, 56pt tall, 12pt rounded corners.
9. 16pt below: a text button "I already have an account" in charcoal, centered, no background.
10. Footer at the very bottom: small text, "An ISB community." in warm gray, 12pt, centered, 16pt above the safe area.

Mood: editorial, warm, not flashy. The photograph leads. The amber button is the only saturated element on screen.
```

---

## Screen 2: Sign up — email and phone

**Purpose.** Capture email and phone number to begin Tier 1 verification. Phone OTP follows on the next screen.

**Prompt:**

```
Generate the Sign Up screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar with a left-aligned back chevron icon (charcoal, 1.5px stroke) and the small "intent" wordmark centered. 24pt header height.
3. 24pt margin below.
4. Heading: "Create your account" in 28pt Inter Display semibold, charcoal, left-aligned with 24pt side margins.
5. 8pt below: "We'll verify your ISB membership to get you in." 15pt Inter regular, warm gray.
6. 32pt vertical space.
7. Form fields, each with a 14pt label above and 56pt-tall input below, 12pt rounded corners, 1px border in #E8E4DA, 16pt padding inside:
   - "Email address" (use ISB email as placeholder: "you@isb.edu")
   - "Phone number" with a small India flag and "+91" prefix in the input, then placeholder "98765 43210"
   - "Full name" placeholder: "As it appears on your ISB record"
8. 24pt below the last field: a small caption in warm gray, 13pt: "We'll send a 6-digit code to your phone to verify it's you."
9. Push to the bottom: primary amber "Continue" button, full-width minus 24pt margins, 56pt tall, 12pt rounded corners. Above the safe area.
10. Below the button, 16pt vertical space, then small text: "By continuing, you agree to our Terms and Privacy Policy." with "Terms" and "Privacy Policy" in amber as links. 13pt, warm gray, centered.

Mood: clean, minimal, functional. Inputs feel inviting rather than corporate. No visual noise.
```

---

## Screen 3: Phone OTP verification

**Purpose.** Six-digit OTP entry to verify the phone number.

**Prompt:**

```
Generate the Phone OTP verification screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar with back chevron (left) and "intent" wordmark (center). 24pt header height.
3. 24pt margin below.
4. Heading: "Verify your phone" in 28pt Inter Display semibold.
5. 8pt below: "We sent a 6-digit code to +91 98765 43210. Enter it to continue." 15pt Inter regular, warm gray.
6. 40pt vertical space.
7. Six OTP input boxes in a horizontal row, evenly spaced, each 48pt square with 12pt rounded corners and a 1px border in #E8E4DA. The first box has the active focus state with a 2px amber border (#B8762A). The cursor blinks inside it. Boxes 2-6 are empty.
8. 24pt below: a row with two text elements, justified between left and right edges of the OTP row:
   - Left: "Resend code" in warm gray (disabled state) with a countdown next to it: "in 47s"
   - Right: "Change number" in amber as a text link
9. Push toward bottom: primary amber "Verify and continue" button (initially disabled and slightly faded), full-width minus 24pt margins, 56pt tall, 12pt rounded.
10. 16pt vertical, then small text: "Didn't get the code? Check your spam folder or try resending." 13pt, warm gray, centered.

Mood: focused and procedural. Generous space around the OTP boxes makes them the center of attention.
```

---

## Screen 4: Consent and terms

**Purpose.** DPDPA-grade consent capture. The user reviews and accepts terms, privacy policy, and explicit profile-visibility consent.

**Prompt:**

```
Generate the Consent screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar with back chevron and "intent" wordmark.
3. Heading: "Before we start" in 28pt Inter Display semibold, charcoal, with 24pt margins.
4. 8pt below: "Quick check on what we'll do with your information." 15pt Inter regular, warm gray.
5. 24pt vertical space.
6. Three consent rows, each with:
   - A custom checkbox (24pt square, 6pt rounded corners, 1.5px charcoal border when unchecked, filled deep amber with a white checkmark when checked) on the left, vertically centered with the row text
   - 16pt of horizontal space, then text on the right:
     - Title in 15pt Inter semibold, charcoal
     - 4pt below, body in 13pt Inter regular, warm gray, with the "Read full terms" / "Read privacy policy" link in amber

Row 1 (checked by default): "I agree to the Terms of Service" / "These cover the basics of using Intent. Read full terms."
Row 2 (checked by default): "I agree to the Privacy Policy" / "How we handle your data, your rights under DPDPA, and how to delete your account. Read privacy policy."
Row 3 (unchecked, optional): "I'm happy to be visible to other ISB members" / "Without this, your card won't appear in discovery. You can change this anytime in Settings."

Each row is separated by a thin divider (1px #E8E4DA) and 20pt vertical padding.

7. 32pt below the last row, a small notice box with #F4F0E8 background and 12pt rounded corners, 16pt internal padding: "You can withdraw any of these consents at any time from Settings → Privacy. We'll log every consent change for our records." 13pt warm gray text.
8. Push to bottom: primary amber "Continue" button, only enabled if rows 1 and 2 are both checked. Full width minus 24pt margins, 56pt tall.

Mood: serious without being intimidating. Looks like a product that takes data protection seriously rather than a click-through.
```

---

## Screen 5: Onboarding — Identity and education

**Purpose.** First step of profile setup. Photo, name, program, batch year. Tier 1 verification matches against the admin's CSV.

**Prompt:**

```
Generate the Onboarding step 1 screen, "Identity and education," for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar with the "intent" wordmark centered, no back arrow.
3. 16pt below: a thin progress bar split into 4 segments, each separated by 4pt of gap. Segment 1 is filled in amber, segments 2, 3, 4 are filled in warm light gray (#E8E4DA). Centered with 24pt margins.
4. Tiny label below the progress bar, 12pt warm gray, centered: "Step 1 of 4 · About you"
5. 32pt vertical space.
6. Heading: "Let's set up your profile" in 28pt Inter Display semibold, charcoal, 24pt margins, left-aligned.
7. 8pt below: "Photo, name, and your time at ISB." 15pt warm gray.
8. 32pt vertical space.
9. Photo upload component: a circular placeholder, 96pt diameter, centered horizontally, with a soft warm gray fill (#F4F0E8) and a thin-line camera icon (24pt) in the middle. Below the circle, a small text link in amber: "Upload your photo"
10. 32pt vertical space.
11. Form fields stacked, each with a 14pt label, 8pt gap, then a 56pt-tall input with 12pt rounded corners and 1px #E8E4DA border:
    - "Full name" (pre-filled with "Arjun Mehta" from the previous step, with a small lock icon on the right indicating it's verified)
    - "Program" as a select-style input showing "PGP" as default selected, with a chevron-down icon on the right
    - "Class year" as a select-style input showing "2026" as default
    - "Specialization (optional)" placeholder: "e.g., Strategy, Finance, Marketing"
12. Push to bottom: primary amber "Continue" button, full-width.

Mood: clean, low-friction, makes profile setup feel like a small task rather than a chore.
```

---

## Screen 6: Onboarding — Career

**Purpose.** Second step. Current and past employment, domain, niche, LinkedIn URL.

**Prompt:**

```
Generate the Onboarding step 2 screen, "Career," for Intent.

Layout, top to bottom:

1. Status bar, top bar with "intent" wordmark.
2. Progress bar, 4 segments, segments 1 and 2 filled amber, 3 and 4 in warm light gray.
3. Caption below: "Step 2 of 4 · Career"
4. Heading: "Where you've been" in 28pt Inter Display semibold, 24pt margins.
5. 8pt below: "We use this to match you with the right people. Verified before going live." 15pt warm gray.
6. 32pt vertical space.
7. A "Current role" section header in 14pt charcoal semibold, 24pt margins.
8. Two stacked input fields:
    - "Company" pre-filled "Flipkart"
    - "Title" pre-filled "Senior Product Manager"
9. 24pt below, a "Past experience" section header. Then a card listing one past job: 
   - Inside a white card with 12pt rounded corners, 1px #E8E4DA border, 16pt padding:
     - "Razorpay · Product Manager · 2019–2022" in 15pt charcoal
     - Small "Edit" text link in amber on the right
   - Below the card, an "Add another role" outline button, full-width, 48pt tall, with a + icon and amber text on a transparent background.
10. 24pt below, the "Domain and niche" section header. Then:
    - A select-style input labeled "Primary domain" showing "Tech / Product" as default
    - 12pt below: "Niche interests (pick up to 3)" as a label, then a row of pill-shaped chips that wrap to multiple lines. Active chips have an amber background and white text. Inactive chips have a warm light gray border, charcoal text, transparent background. Show "AI/ML" and "Fintech" as active (2 of 3 selected), and "Climate", "Healthtech", "Edtech", "Public Policy", "Operating Roles" as inactive.
11. 24pt below, the "LinkedIn" section. A single input with the LinkedIn icon on the left side of the input box, placeholder "linkedin.com/in/your-profile". Caption below in 13pt warm gray: "We'll verify this against your application records before your card goes live."
12. Push to bottom: a row with "Back" text button on the left and primary amber "Continue" button on the right (taking up about 65% of the row width).

Mood: structured but not bureaucratic. The chips and cards make it visually energetic where prose would feel heavy.
```

---

## Screen 7: Onboarding — Your Intent

**Purpose.** The most distinctive screen of the product. The user writes their 200-character Intent statement. This is the namesake of the product.

**Prompt:**

```
Generate the Onboarding step 3 screen, "Your Intent," for Intent.

Layout, top to bottom:

1. Status bar, top bar with "intent" wordmark.
2. Progress bar, 4 segments, segments 1, 2, 3 filled amber, segment 4 in warm light gray.
3. Caption below: "Step 3 of 4 · Your Intent"
4. 32pt vertical space.
5. Large editorial heading: "What's your Intent?" in 32pt Inter Display semibold, charcoal, 24pt side margins. This screen is the product's namesake moment, so the heading should feel emphatic.
6. 12pt below: "In 200 characters, what are you working toward and what are you looking for? This is what other ISB members will see first." 15pt Inter regular, warm gray.
7. 24pt vertical space.
8. The Intent text area: a large input box, full-width minus 24pt margins, 160pt tall, 16pt rounded corners, 1px #E8E4DA border, 16pt internal padding. Placeholder text in warm gray: "Building the Series A bridge for Indian climate startups. Looking for operators who've scaled hardware companies through Tier 2 markets."
9. Below the input, a row with two elements, justified:
    - Left: a small inspirational link in amber, "See examples from other members"
    - Right: a character counter in warm gray, "0 / 200"
10. 32pt vertical space.
11. A subtle examples card with a soft beige background (#F4F0E8), 16pt rounded corners, 16pt internal padding, full-width minus 24pt margins. Heading inside the card: "A good Intent" in 13pt charcoal semibold. Below, three example Intents in italics, separated by 12pt gaps, each in 14pt charcoal:
    - "Building Series A climate bridges for Indian hardware startups. Looking for operators who've scaled in Tier 2 markets."
    - "Switching from consulting to operating in healthtech. Looking for product leaders at scaled health startups."
    - "Open to mentoring younger PMs breaking into venture. Especially women and first-generation MBA grads."
12. Push to bottom: a row with "Back" text button on the left and primary amber "Continue" button on the right.

Mood: this is the product's signature screen. It should feel weighty in the right way, like writing a thoughtful sentence rather than filling a form.
```

---

## Screen 8: Onboarding — Asks and Offers

**Purpose.** The user picks which Asks and Offers they are open to. This sets the connection signals shown on their card.

**Prompt:**

```
Generate the Onboarding step 4 screen, "Asks and Offers," for Intent.

Layout, top to bottom:

1. Status bar, top bar with "intent" wordmark.
2. Progress bar, all 4 segments filled amber.
3. Caption below: "Step 4 of 4 · Asks and Offers"
4. 24pt vertical space.
5. Heading: "What are you open to?" in 28pt Inter Display semibold, 24pt margins.
6. 8pt below: "Pick the kinds of conversations you're saying yes to. You can change these anytime." 15pt warm gray.
7. 24pt vertical space.
8. Three large grouped sections, each as a white card with 16pt rounded corners and soft shadow:

Section A: "Your Asks" with a small downward arrow icon in amber to the left of the heading. Subheading inside: "Things you're looking for." Below, a stacked list of toggle rows. Each row has:
   - A title in 15pt charcoal (e.g., "Looking for a mentor in my domain")
   - A description in 13pt warm gray below
   - A toggle switch on the right: amber when on, warm light gray when off
List with toggles in this state:
   - "Looking for a mentor in my domain" — ON
   - "Curious about working at your company" — ON
   - "Looking for an interview referral" — OFF
   - "Want to chat about a career switch" — ON

Section B: "Your Offers" with a small upward arrow icon in deep forest green (#2D4A3A). Subheading: "Things you're open to giving." List:
   - "Open to mentoring someone in my domain" — OFF
   - "Open to discussing my company" — OFF
   - "Open to giving referrals" — OFF

(A current student like Arjun has more Asks than Offers turned on by default. The pattern flips for senior alumni.)

Section C: "Mutuals" subheading: "Symmetric: you're both looking and open." List:
   - "Open to coffee chat" — ON
   - "Looking for a co-founder" — OFF
   - "Open to case prep partnership" — ON

9. Push to bottom: a "Back" text button on the left and primary amber "Save and finish" button on the right.

Mood: organized, clean, makes a complex decision feel tractable. The two-section layout (Asks vs Offers) reinforces the conceptual model.
```

---

## Screen 9: Onboarding complete / Welcome

**Purpose.** Confirmation and celebration of profile completion.

**Prompt:**

```
Generate the Onboarding Complete screen for Intent.

Layout, top to bottom:

1. Status bar (no top bar; this is a celebratory moment so let the screen breathe).
2. About 24% of the way down the screen, a small illustration: a thin-line drawn icon of a paper plane in flight, 64pt, centered, in amber. Lightweight, not overdone.
3. 32pt vertical space.
4. Heading: "Welcome to Intent." in 32pt Inter Display semibold, charcoal, centered, 24pt side margins.
5. 12pt below: "Your card is being reviewed. We'll let you know as soon as you're live." 16pt Inter regular, warm gray, centered.
6. 32pt vertical space.
7. A clean info card in white, 16pt rounded corners, soft shadow, full-width minus 24pt margins, 20pt internal padding. Inside the card:
   - Small heading: "What happens next" in 13pt charcoal semibold.
   - Below, three numbered items separated by 12pt gaps, each in 14pt charcoal:
     1. "We verify your details against ISB records (usually under 24 hours)."
     2. "Your card goes live and you can start browsing."
     3. "Check back tomorrow, or watch for an email."
8. 32pt vertical space.
9. A secondary action card in soft beige (#F4F0E8), 16pt rounded corners, 20pt padding, full-width: "While you wait, take a look around." in 14pt charcoal. Below, a text link in amber: "Browse other ISB members →"
10. Push to bottom: primary amber "Take me to my profile" button, full-width minus 24pt margins, 56pt tall.

Mood: warm, calm, confident. Communicates "you're in" without being effusive. The paper plane icon does the celebratory work without confetti.
```

---

# Core user app screens

## Screen 10: Home / Discovery feed

**Purpose.** The main browse surface. Vertical scroll of cards, one per row. Most-viewed screen in the entire app.

**Prompt:**

```
Generate the Home / Discovery feed screen for Intent. This is the most important screen in the app.

Layout, top to bottom:

1. Status bar.
2. Sticky header (white background, 1px bottom border in #E8E4DA, 56pt tall): the "intent" wordmark on the left at 20pt charcoal, and two icons on the right (search magnifying glass and a horizontal-slider filter icon, both 24pt thin-line in charcoal). 16pt side padding.
3. Below the header, a horizontal scrollable filter pill row, 48pt tall with 12pt vertical padding. The pills:
   - "All" — currently active, amber background (#B8762A), white text
   - "Class of 2018" — inactive, white background, 1px #E8E4DA border, charcoal text
   - "Bangalore" — inactive
   - "Climate" — inactive
   - "VC / PE" — inactive
   12pt horizontal padding between pills, all pills 14pt text, 32pt tall, fully rounded corners.
4. The main content area: a vertical scroll of cards. Each card:
   - 16pt margin from screen edges
   - White background, 16pt rounded corners, soft shadow
   - 16pt vertical gap between cards
   - Card structure: photo at top taking 42% of the card height (around 280pt for an iPhone 14 width card). Image is rounded only at top corners (16pt). Below the photo, 16pt internal padding on all sides:
     - Top row: full name in 17pt Inter semibold (e.g., "Ananya Krishnan"), with a small green-glow verification glyph next to the name (4pt deep forest green dot).
     - Below name, in 13pt warm gray: "8 years · Class of 2018" with a small dot separator
     - 8pt below: a horizontal row of company badges, each a 24pt circular monochrome logo. Show: McKinsey, Lightspeed (use plain monogram circles for simplicity since real logos are licensed). To the right of badges, a "+1" pill in warm gray.
     - 12pt below: a domain tag in small caps, amber: "CLIMATE INVESTING" (12pt, letter-spacing 0.5)
     - 8pt below: three small pill chips for niches in white pill with #E8E4DA border, charcoal text: "Climate", "Public Policy", "Hardware" (12pt)
     - 12pt below: a location row with a small map-pin icon (1.5px stroke, 14pt) followed by "Bangalore" in 13pt warm gray.
     - 12pt below: the Intent statement in 14pt charcoal, slightly italic regular: "Building Series A bridges for Indian climate startups. Looking for operators who've scaled hardware in Tier 2 markets."
     - 12pt below, separated by a 1px #E8E4DA divider: a row showing Asks and Offers indicators. Format: "↓ 2 Asks" in amber on the left, dot separator, "↑ 3 Offers" in deep forest green. 13pt.

Show three cards stacked. Card 1 is Ananya Krishnan (described above). Card 2 partially visible at the bottom is Vikram Subramanian (Class of 2014, Mumbai, fintech founder, with a small "Founder" badge below his name in deep forest green).

5. Sticky bottom tab bar, 64pt tall, white background with 1px top border in #E8E4DA. Five tabs evenly spaced:
   - Home (filled house icon, amber) — active
   - Inbox (envelope icon, warm gray)
   - Surveys (clipboard icon, warm gray)
   - Saved (bookmark icon, warm gray)
   - Profile (circle icon for user, warm gray)
   Each tab has the icon (24pt) and a 10pt label below.

Mood: scroll-friendly, photography-forward, professional, generous breathing room between cards. Feels like a curated lookbook of people, not an ad-saturated feed.
```

---

## Screen 11: Filters drawer

**Purpose.** Bottom-sheet drawer for refining the discovery feed.

**Prompt:**

```
Generate the Filters drawer screen for Intent. This is shown as a bottom sheet that takes up about 80% of the screen height, with the home feed dimmed behind it.

Layout (the drawer itself):

1. The dimmed background shows the home feed with a 60% black overlay.
2. The drawer slides up from the bottom. It has:
   - A small drag handle at the top (a 36pt-wide warm gray pill, 4pt tall, centered, 12pt from top of drawer)
   - Top of the drawer is rounded (24pt radius) at top corners only.
   - Background is warm off-white #FAFAF6.
3. Drawer header row (16pt top padding from drag handle): "Filters" heading in 20pt Inter semibold charcoal on the left, "Clear all" text link in warm gray on the right.
4. 24pt below the header, the body of the drawer with 24pt side padding, scrollable.

The body is divided into expandable sections, each separated by a 1px #E8E4DA divider with 16pt vertical padding:

Section 1: "Domain" with a small chevron-down icon on the right indicating it's open. Below, a wrapped row of domain pills:
- "Strategy & Consulting" (inactive, white pill with border)
- "Finance" (inactive)
- "Tech / Product" (inactive)
- "VC / PE" (active, amber background)
- "Climate" (active, amber)
- "Public Policy" (inactive)
- "Healthcare" (inactive)
- "Social Impact" (inactive)

Section 2: "Niche" (chevron right, collapsed)

Section 3: "Class year" (chevron down, expanded). Below, a year-range slider component: a horizontal track with two thumbs (1995 to 2026 range), the active range highlighted in amber. Year labels at the thumbs: "2010" and "2024". Tick marks below at major years.

Section 4: "City" (chevron down, expanded). Below, a wrapped row of city pills: "Mumbai" (active), "Bangalore" (active), "Hyderabad" (active), "Delhi NCR" (inactive), "Chennai" (inactive), "Pune" (inactive), "International" (inactive).

Section 5: "Asks open" (chevron right, collapsed)

Section 6: "Offers open" (chevron right, collapsed)

5. Sticky footer at the bottom of the drawer (above the safe area), 80pt tall, white background with 1px top border:
   - Two side-by-side buttons with 12pt gap:
     - "Cancel" outline button (1px charcoal border, charcoal text, transparent background), 48% width
     - "Show 47 results" primary amber button, 48% width

Mood: organized, fast to use. The active states are clear without being loud.
```

---

## Screen 12: Profile detail (someone else's)

**Purpose.** The expanded view shown when a user taps a card.

**Prompt:**

```
Generate the Profile Detail screen for Intent, showing Ananya Krishnan's profile to a viewer (Arjun).

Layout, top to bottom:

1. Status bar.
2. A back arrow icon (24pt charcoal) in the top-left at 16pt margin from the top safe area, and on the top-right: a bookmark icon (24pt charcoal, outline). No header bar; let the photo lead.
3. The hero photo: full-width, takes about 45% of screen height. Warm professional headshot of Ananya. The bottom of the photo has a soft gradient fade to transparent.
4. The content section overlaps the photo by 32pt with a white background, 24pt rounded top corners, soft shadow above. Inside this section (24pt padding):
   - Full name in 26pt Inter Display semibold: "Ananya Krishnan"
   - Below the name, a small row of meta: "8 years · Class of 2018 · PGP" in 14pt warm gray
   - 12pt below: a horizontal row of company badges with brand monograms (McKinsey, Lightspeed, with a small +1)
   - 16pt below, the Intent statement in 17pt charcoal regular, slightly italic, with quotation marks treatment (the opening and closing quote marks in a slightly larger amber glyph): "Building Series A bridges for Indian climate startups. Looking for operators who've scaled hardware in Tier 2 markets."
   - 24pt below, a 1px #E8E4DA divider.
   - 16pt below the divider, a metadata grid with three rows:
     - Row 1: small map-pin icon, "Bangalore" in 14pt charcoal
     - Row 2: small briefcase icon, "Climate Investing · Lightspeed" in 14pt charcoal
     - Row 3: small graduation-cap icon, "ISB PGP, Class of 2018, Specialization in Strategy" in 14pt charcoal

5. 24pt vertical space, then a section heading: "What Ananya is open to" in 13pt charcoal semibold.
   - Below, two sub-sections stacked:
     - "↓ Asks" with two pills: "Looking for hardware operators" and "Open to discussing climate"
     - "↑ Offers" with three pills: "Open to mentoring", "Open to discussing my company", "Open to giving referrals"
   - Pills are warm light gray with charcoal text, 13pt, 32pt tall, fully rounded.

6. 32pt vertical space, section heading: "Experience" in 13pt charcoal semibold. Below, a list of three roles, each row:
   - Small monogram circle on the left (Lightspeed, McKinsey, etc.)
   - Right: "Lightspeed Venture Partners — Investor — 2022 to present"
   - Below it: "McKinsey & Company — Engagement Manager — 2018 to 2022"
   - Below it: "Pre-MBA · Tata Power — 2014 to 2016"
   12pt vertical space between rows.

7. 32pt vertical space, section heading: "Badges" in 13pt charcoal semibold. Below, a horizontal scroll of badge cards. Each badge card is 88pt wide, 88pt tall, with a soft gradient background, 12pt rounded corners, an icon (24pt thin-line) at top, and a label below in 11pt charcoal. Show: "Class of 2018", "Climate Champion", "Top Mentor (Q3)".

8. Sticky bottom action bar, white with 1px top border, 80pt tall, padded:
   - Primary amber "Send a nudge" button, 70% width
   - Outline "Save" button (bookmark icon) on the right, 28% width

Mood: editorial, profile-as-portrait. The hero photo and Intent statement do the work. The CTA at the bottom is unmistakable.
```

---

## Screen 13: Nudge composer

**Purpose.** Where the user crafts the 400-character nudge, picks an Ask or Offer, and sends.

**Prompt:**

```
Generate the Nudge Composer screen for Intent. The viewer (Arjun) is composing a nudge to Ananya.

Layout, top to bottom:

1. Status bar.
2. Top bar (white, 1px bottom border): a left "Cancel" text link in warm gray, the "Nudge" title centered in 17pt charcoal semibold, and a right "Send" text button in amber (initially disabled / faded since the nudge is empty).
3. 16pt below the header, a recipient row: a 48pt circular photo of Ananya on the left, then the name "Ananya Krishnan" in 16pt charcoal semibold, with "Class of 2018 · Bangalore" in 13pt warm gray below it.
4. 24pt below, a section labeled "What's this about?" in 13pt charcoal semibold. Below, a row of three suggested signal pills based on Ananya's open Offers and Mutuals (and Arjun's matching Asks):
   - "Looking for a mentor" — currently selected, amber background, white text. With a small downward-arrow icon prefix.
   - "Curious about your company (Lightspeed)" — unselected, white pill with border.
   - "Open to coffee chat" — unselected, with a small bidirectional-arrow icon.
   Caption below the pills in 12pt warm gray: "We only show signals that match what Ananya is open to right now."
5. 24pt below, the message composer:
   - Section header: "Your message" in 13pt charcoal semibold.
   - Below, a large text area, full-width minus 24pt margins, 200pt tall, 16pt rounded corners, 1px #E8E4DA border, 16pt internal padding. Cursor is active. Placeholder text in warm gray: "Be specific. What's the ask? Why Ananya specifically? Senior alumni respond best to concrete outreach."
   - Below the input, a row with:
     - Left: a small "0 / 400" character counter in warm gray
     - Right: a small "See examples" link in amber

6. 24pt below, an info card in soft beige (#F4F0E8), 12pt rounded corners, 16pt internal padding, full-width minus 24pt margins. Heading inside in 13pt charcoal semibold: "A note on cooldowns". Body in 13pt warm gray: "If Ananya doesn't accept, you'll need to wait 30 days before nudging again. Make this one count."

7. Push to bottom: primary amber "Send nudge" button, full-width minus 24pt margins, 56pt tall, initially disabled until a signal is picked and the message has at least one character. Below the button, a small caption in warm gray, centered, 12pt: "You have 4 nudges left this week."

Mood: deliberate, slightly weighted with consequence. The cooldown note makes the user think before sending.
```

---

## Screen 14: Inbox

**Purpose.** The main "things waiting for you" surface. Tabs across nudges received, sent, conversations, saved.

**Prompt:**

```
Generate the Inbox screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top header row: title "Inbox" in 24pt Inter Display semibold, left-aligned, 24pt margin. To the right: a small filter icon and a search icon, both 24pt thin-line in charcoal.
3. 16pt below, a horizontal tab bar (not pills, but underlined tabs). Four tabs evenly spaced, font 15pt, padded 12pt vertical. The tabs:
   - "Received" (active, amber underline 2pt thick, charcoal text). Small badge to the right of the text: amber-filled circle with white "3" indicating 3 unread.
   - "Sent" (inactive, charcoal text, no underline)
   - "Chats" (inactive)
   - "Saved" (inactive)
4. Below the tabs, the content for the Received tab. A vertical list of nudge rows, each:
   - 24pt left padding, 16pt right padding, 16pt vertical padding, separated by 1px #E8E4DA dividers.
   - Left side: a 48pt circular photo of the sender.
   - Middle: stacked content
     - Top: sender name in 15pt charcoal semibold (e.g., "Vikram Subramanian"), with a small "Founder" badge inline next to the name (deep forest green pill, 11pt) and an unread amber dot indicator.
     - Below: signal tag in 12pt amber: "↓ Looking for a co-founder" (or similar), with a small "·" then time stamp "2h ago" in warm gray.
     - Below that: a 1-line preview of the message in 14pt warm gray, truncated with ellipsis: "Arjun, your background at Flipkart and your interest in fintech caught my eye. I'm building a..."
   - Right side: a small chevron-right icon in warm gray.

Show three nudge rows:
   - Row 1 (unread, with dot): Vikram Subramanian, "Looking for a co-founder", 2h ago
   - Row 2 (unread, with dot): Priya Reddy, "Open to coffee chat", 1d ago
   - Row 3 (read, no dot): Rohan Kapoor, "Curious about Tiger Global", 3d ago

5. Below the list, an "Earlier this week" subheader in 12pt warm gray uppercase, 24pt margin, 16pt vertical padding. Then a few more older rows (read, no dot, slightly faded).

6. Sticky bottom tab bar (same as Home screen). The Inbox tab is active here (amber filled envelope icon).

Mood: organized, minimal, looks like a carefully built email inbox rather than a chat app. The unread amber dots and tab badges tell you immediately what needs attention.
```

---

## Screen 15: Nudge received detail

**Purpose.** When the user opens a nudge from another member.

**Prompt:**

```
Generate the Nudge Detail screen for Intent. The viewer (Arjun) is reading a received nudge from Vikram Subramanian.

Layout, top to bottom:

1. Status bar.
2. Top bar: back arrow on the left, "Nudge" title centered in 17pt charcoal semibold, an overflow menu icon (three vertical dots) on the right.
3. The sender card section, 24pt margins, 24pt vertical padding:
   - A 64pt circular photo on the left.
   - Right: "Vikram Subramanian" in 18pt Inter semibold charcoal, with a small deep forest green "Founder" badge pill inline next to the name. Below: "Class of 2014 · Mumbai" in 13pt warm gray. Below that: "Founder, FinAxis · Ex-BCG" in 13pt charcoal.
4. 1px #E8E4DA divider below.
5. 24pt below, an Ask/Offer signal indicator card with soft beige (#F4F0E8) background, 12pt rounded corners, 12pt padding, full-width minus 24pt margins. Inside:
   - Small downward-arrow icon in amber on the left
   - Right: "Vikram is asking" in 12pt warm gray. Below: "Looking for a co-founder" in 14pt charcoal semibold.
6. 24pt below, the message body in 16pt charcoal regular, generous line-height: 
   "Arjun, your background at Flipkart and your interest in fintech caught my eye. I'm building a fraud-detection layer for sub-prime lending in tier-2 markets and looking for a product co-founder who's worked at scale. Would love 30 minutes if you're open to a chat. — Vik"
7. 24pt below, a small "Sent 2 hours ago" timestamp in warm gray.
8. 32pt below, a small footer note card in soft beige with thin amber-tinted left border (3px), 12pt rounded corners, 12pt padding: "Heads up: if you decline, Vikram won't be able to nudge you again for 90 days. If you ignore, the nudge expires in 14 days." 13pt warm gray.
9. Sticky bottom action bar with 1px top border, 96pt tall, white background:
   - Three buttons in a row, evenly spaced with 8pt gaps:
     - "Decline" outline button (1px warm gray border, charcoal text, transparent background), 30% width
     - "Ignore" outline text-only button (no border), 30% width
     - "Accept" primary amber button, 36% width (slightly larger to draw the eye)

Mood: makes the consequences of each action tangible. The cooldown note makes "Decline" feel meaningful. The visual emphasis is on Accept without being pushy.
```

---

## Screen 16: Conversations list

**Purpose.** The list of active 1:1 conversations.

**Prompt:**

```
Generate the Conversations list screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top header: title "Chats" in 24pt Inter Display semibold, left-aligned, 24pt margin. Right side: a search icon and a "compose" pencil icon, both 24pt thin-line charcoal.
3. The same 4-tab bar from the Inbox screen, with "Chats" tab now active.
4. Below the tabs, a scrollable list of conversation rows. Each row:
   - 24pt left padding, 16pt right padding, 16pt vertical padding, 1px #E8E4DA bottom dividers.
   - Left: a 56pt circular photo of the conversation partner. A small green online dot in the bottom-right of the photo if the person is online (use only on Row 1 for visual interest).
   - Middle stacked content:
     - Top row: name in 15pt charcoal semibold (e.g., "Rajesh Iyer"), with a small "Mentor" pill in deep forest green next to the name. On the right of this row, a timestamp like "10:42 AM" in 12pt warm gray.
     - Below: a 1-line message preview in 14pt warm gray (truncated): "Sounds great, let's lock in next Tuesday at 4pm IST..."
   - Right end of the row: an unread message badge (small amber-filled circle with white number) for some rows.

Show four rows:
   - Row 1: Rajesh Iyer (with online dot, Mentor pill), preview "Sounds great, let's lock in next Tuesday at 4pm IST...", 10:42 AM, unread badge "2"
   - Row 2: Ananya Krishnan (no online dot), preview "Thanks for sharing your deck. Quick question on slide 3...", "Yesterday", no unread badge
   - Row 3: Priya Reddy, preview "Have you read the Goldman 2026 outlook? Curious about your...", "Mon", unread badge "1"
   - Row 4: Rohan Kapoor, preview "Will send the pitch deck doc tomorrow am", "Aug 12", no unread

5. Sticky bottom tab bar (same as before; Inbox tab is active because Chats are part of Inbox).

Mood: looks like a well-built mature messaging app, similar to Superhuman or Linear's polish but warmer. Not WhatsApp-busy.
```

---

## Screen 17: Conversation detail / Chat

**Purpose.** A 1:1 chat thread between Arjun and a senior alumnus.

**Prompt:**

```
Generate the Conversation Detail screen for Intent. The viewer (Arjun) is in a chat with Rajesh Iyer.

Layout, top to bottom:

1. Status bar.
2. Top bar (white, 1px bottom border, 64pt tall):
   - Back arrow (left, 24pt charcoal)
   - Center: a 36pt circular photo of Rajesh, then to the right of it the name "Rajesh Iyer" in 15pt charcoal semibold, with "Online" status in 11pt deep forest green below the name
   - Right end: a small calendar icon (for scheduling a session) and an info icon (24pt each, charcoal)
3. Below the header, a thin info banner (28pt tall) in soft beige (#F4F0E8) with 13pt warm gray text, centered: "You're in an active mentorship · See goals" — with "See goals" as an amber link.
4. The main message area: a vertical scrolling list of message bubbles with 16pt vertical gaps between bubble groups. Backgrounds:
   - Messages from Rajesh: white bubble with 1px #E8E4DA border, 16pt rounded corners (with the bottom-left corner only 4pt rounded for "tail" effect), left-aligned, 16pt padding, max width 75% of screen.
   - Messages from Arjun (current user): amber-tinted bubble (#FAF1E5 with #E8C285 1px border), 16pt rounded with bottom-right 4pt rounded, right-aligned.
   - Below each bubble group: a small timestamp in 11pt warm gray, aligned to the bubble side.

Sample conversation, oldest at top:
   - Rajesh (Sept 14, 9:02 AM): "Arjun, glad we connected. Saw your note about transitioning into VC. Happy to share what I know about the path from operating roles."
   - Arjun (Sept 14, 9:08 AM): "Thanks Rajesh. I've been thinking about the gap between operating PM work and the kind of pattern recognition VCs hire for. Would love your read on whether to join an early-stage startup first or apply directly."
   - Rajesh (Sept 14, 9:21 AM): "It depends. If your goal is later-stage growth investing, direct entry can work — many of my Bain colleagues went directly. For early-stage, operating experience is a real edge. Can we put a 30-min call on the calendar next week?"
   - Arjun (today, 10:38 AM): "Yes, definitely. Tuesday 4pm IST works for me."
   - Rajesh (today, 10:42 AM): "Sounds great, let's lock in next Tuesday at 4pm IST. I'll send a Google Meet invite."

5. Sticky bottom composer (white background, 1px top border, padded):
   - A row with:
     - On the left: a paperclip icon (24pt charcoal) for attachments.
     - Middle: a text input field, full-width minus icons, 44pt tall, 1px #E8E4DA border, 12pt rounded corners, placeholder "Reply to Rajesh..." in warm gray.
     - On the right: an amber circular send button (40pt diameter, with white paper-plane icon).

Mood: focused, calm, single conversation in the spotlight. The mentorship banner at the top makes it clear this is a structured relationship.
```

---

## Screen 18: My profile (own view)

**Purpose.** What the user sees when they tap the Profile tab.

**Prompt:**

```
Generate the My Profile screen for Intent, showing Arjun Mehta's view of his own profile.

Layout, top to bottom:

1. Status bar.
2. Top bar: title "My profile" centered in 17pt charcoal semibold. On the right, a settings gear icon (24pt thin-line charcoal). On the left, no back arrow.
3. The hero section: a large card with white background, 16pt margins, 16pt rounded corners, soft shadow. Inside:
   - At the top: a 96pt circular photo of Arjun, centered, with a small camera icon overlay at the bottom right indicating "tap to change."
   - 16pt below the photo: name "Arjun Mehta" in 24pt Inter Display semibold, centered.
   - 6pt below: "PGP Class of 2026 · Hyderabad" in 13pt warm gray, centered.
   - 16pt below: an "Edit profile" outline button, 80% width, centered, charcoal text, 1px charcoal border.
4. 16pt below the hero card, three quick-stat cards in a single horizontal row, evenly spaced (16pt margin from screen edges, 8pt gaps between cards). Each card is white, 16pt rounded corners, 16pt internal padding, 92pt tall:
   - Stat 1: "12" in 24pt charcoal semibold, "Connections" label below in 12pt warm gray.
   - Stat 2: "Level 2" in 24pt charcoal, "Contributor" label below.
   - Stat 3: "47" in 24pt charcoal, "Points" label below.
5. 16pt below, a section heading "Your Intent" in 13pt charcoal semibold, 24pt margin.
   - Below in a soft beige card (#F4F0E8) with 16pt rounded corners and 16pt padding: the Intent statement in 16pt charcoal, slightly italic: "Pre-MBA PM at Flipkart looking to break into early-stage venture. Curious about climate, fintech, and consumer ops at scale."
   - Below the statement, a "Edit your Intent" small text link in amber.
6. 24pt below, a section heading "Open to" in 13pt charcoal semibold.
   - Three grouped pill rows:
     - Row 1, prefixed by a small "↓" icon: "3 Asks" in amber. On the right of this row: a small chevron-right indicating tap-to-edit.
     - Row 2, prefixed by a small "↑" icon: "1 Offer" in deep forest green. Tap-to-edit chevron.
     - Row 3, prefixed by a small "↔" icon: "2 Mutuals". Tap-to-edit chevron.
7. 24pt below, a section "Activity" with three thin rows separated by dividers:
   - "12 nudges sent · 8 accepted" with a small chevron-right
   - "3 surveys completed" with chevron
   - "1 meetup attended" with chevron
8. 32pt below, two-row footer:
   - "Share your profile" outline button, full-width, with a small share icon prefix.
   - "View your card as others see it" text link in amber, centered, 13pt.
9. Sticky bottom tab bar (Profile tab active).

Mood: self-reflective, structured, gives the user a clear sense of their progress and what's editable.
```

---

## Screen 19: Edit profile

**Purpose.** Where the user adjusts their Intent statement, Asks, Offers, work history, photo.

**Prompt:**

```
Generate the Edit Profile screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar: a "Cancel" text link on the left in warm gray, "Edit profile" title centered in 17pt charcoal semibold, "Save" text button on the right in amber (initially disabled until a change is made).
3. Below the header, the body is a scrollable form, organized into sections separated by 16pt vertical gaps and 1px #E8E4DA dividers.

Section 1: Photo
- A 96pt circular photo of Arjun on the left, centered vertically. Right of the photo: an outline "Change photo" button, 40% width.

Section 2: Your Intent (the most important section, given more visual weight)
- Section heading "Your Intent" in 13pt charcoal semibold uppercase.
- Below, a large text area with the current Intent: "Pre-MBA PM at Flipkart looking to break into early-stage venture. Curious about climate, fintech, and consumer ops at scale." (16pt charcoal, slightly italic). Border in 1px #E8E4DA, 12pt rounded corners, 16pt padding, 120pt tall.
- Below: character counter "152 / 200" right-aligned in 12pt warm gray.

Section 3: Career
- Section heading "Career".
- A "Current role" row with the inline text "Senior PM at Flipkart" and an Edit chevron on the right.
- A "Past experience" row with "Razorpay (2019–2022)" with an Edit chevron.
- An "Add experience" outline button, 100% width with a + icon.

Section 4: Domain and niches
- Section heading.
- "Primary domain: Tech / Product" with an Edit chevron.
- "Niches: AI/ML, Fintech" with an Edit chevron.

Section 5: Asks, Offers, Mutuals
- Three sub-rows, each with the type label, the count, and a chevron:
  - "Your Asks (3 active)" with a small downward arrow icon in amber, then the chevron
  - "Your Offers (1 active)" with an upward arrow in deep forest green
  - "Your Mutuals (2 active)" with bidirectional arrow

Section 6: Visibility
- Section heading.
- A toggle row "Visible in discovery" with the toggle on (amber).
- Below it, in 13pt warm gray: "Off would hide your card from other members but you can still browse."

Section 7: City
- "Hyderabad" with edit chevron.

Mood: form-based but well-organized, never overwhelming. Each section is visually distinct. The Intent text area has the most visual weight.
```

---

## Screen 20: Settings

**Purpose.** Notifications, privacy, account, help, DPDPA-compliant data controls.

**Prompt:**

```
Generate the Settings screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar: back arrow on the left, "Settings" title centered in 17pt charcoal semibold.
3. The body is a vertical list of grouped sections. Each section has a small uppercase heading in 11pt warm gray with 1.5pt letter-spacing (e.g., "NOTIFICATIONS"), followed by a white card containing rows. Sections separated by 24pt vertical gaps. Cards have 16pt rounded corners and soft shadow, 16pt margins from screen edges. Each row inside a card is 56pt tall with 16pt horizontal padding, separated by 1px #E8E4DA dividers.

Section 1: NOTIFICATIONS
- Row "Push notifications" with a toggle on the right, on (amber).
- Row "Email notifications" with toggle on.
- Row "Quiet hours" with right-side text "10pm – 8am" in warm gray and chevron.
- Row "Digest frequency" with right-side text "Immediate" in warm gray and chevron.

Section 2: PRIVACY
- Row "Visible in discovery" with toggle on.
- Row "Show my city" with toggle on.
- Row "Allow nudges from current students" with toggle on.

Section 3: ACCOUNT
- Row "Change phone number" with right-side text "+91 98765 43210" in warm gray and chevron.
- Row "Change email" with right-side text "arjun.mehta@isb.edu" and chevron.
- Row "Change password" with chevron.
- Row "Linked accounts" with right-side text "LinkedIn connected" and chevron.

Section 4: DATA AND PRIVACY (DPDPA)
- Row "Download my data" with chevron. Caption below in 12pt warm gray (only on this row): "Get a copy of everything Intent stores about you."
- Row "Manage consents" with chevron.
- Row "Delete my account" with chevron, text in red (#B5392F).

Section 5: HELP
- Row "Help center" with chevron.
- Row "Contact support" with chevron.
- Row "Terms of Service" with chevron.
- Row "Privacy Policy" with chevron.

Section 6: ABOUT
- Row "Version 1.0.0 (build 47)" no chevron, just info text in warm gray.

7. Footer at the bottom: a "Sign out" text button in red, centered, 16pt margin. 

Mood: standard settings UI done very cleanly. The DPDPA section is treated as first-class.
```

---

# Engagement screens

## Screen 21: Active survey

**Purpose.** The user is taking a 7-question survey to be matched into a small meetup group.

**Prompt:**

```
Generate the Active Survey screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar: "Cancel" text link on left in warm gray, "Career fork" title centered in 15pt charcoal semibold, an "exit" X icon on the right.
3. Below the header, a thin progress bar split into 7 segments separated by 4pt gaps. Segments 1, 2, 3 filled amber. Segments 4-7 in warm light gray. Caption below in 12pt warm gray, centered: "Question 4 of 7"
4. 32pt vertical space.
5. The question card: full-width minus 16pt margins, white background, 24pt rounded corners, soft shadow, 24pt internal padding.
   - Small question category label at the top in 11pt amber uppercase: "POST-MBA PATH"
   - 12pt below: the question in 22pt Inter Display semibold charcoal, generous line-height: "Where do you see yourself five years out?"
   - 24pt below the question, four answer option cards. Each option is:
     - A row with a 28pt circle on the left (white fill, 1.5px charcoal border for unselected, deep amber fill with white check for selected)
     - A 16pt charcoal label to the right
     - 16pt vertical padding above and below
     - 1px #E8E4DA divider between options

   Options (one selected to show interaction):
     - "Operating role at a venture-backed startup" — selected (amber circle with check)
     - "Founding my own company"
     - "Returning to consulting at a senior level"
     - "PE or VC investing"

6. 24pt below the card, an info note in 12pt warm gray, centered: "We'll group you with 4-6 ISB members who answered similarly across all 7 questions."
7. Push to bottom: a row with "Back" text button on the left and primary amber "Next question" button on the right (disabled until an option is selected).

Mood: focused, single-question-in-spotlight, doesn't feel like a corporate survey but like a thoughtful self-reflection prompt.
```

---

## Screen 22: Match group invite and meetup proposal

**Purpose.** After the survey, the user gets a notification that they have been matched.

**Prompt:**

```
Generate the Match Group Invite screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar: back arrow on the left, "You've been matched" title centered in 17pt charcoal semibold.
3. 24pt below, a hero illustration: a thin-line drawn icon of five interconnected circles, 96pt wide, centered, with the connections in amber and the circles in charcoal.
4. 24pt below the illustration, the headline in 26pt Inter Display semibold, charcoal, centered, 24pt margins: "We found 5 ISB members who think like you."
5. 12pt below: "Based on the Career Fork survey you took on Tuesday." 14pt warm gray, centered.
6. 32pt below, a card titled "Your match group" in 13pt charcoal semibold (24pt margin). The card is full-width minus 24pt margins, white background, 16pt rounded corners, soft shadow, 16pt padding. Inside:
   - A vertical list of 5 member rows, each:
     - 40pt circular photo on the left
     - Right: name in 14pt charcoal semibold (e.g., "Ananya Krishnan"), then "Class of 2018 · Bangalore" in 12pt warm gray below
     - 12pt vertical padding, 1px #E8E4DA dividers between rows
   Members shown:
     - Ananya Krishnan, Class of 2018, Bangalore
     - Vikram Subramanian, Class of 2014, Mumbai
     - Priya Reddy, Class of 2020, Hyderabad
     - Rohan Kapoor, Class of 2016, Mumbai
     - Arjun Mehta (you), Class of 2026, Hyderabad — with a small "(You)" tag in amber inline next to your name

7. 24pt below, a section heading "What you have in common" in 13pt charcoal semibold.
   - Below, a wrapped row of insight pills in soft beige, 13pt charcoal: "Operating roles", "Climate-leaning", "5+ years experience", "Drawn to early-stage"
8. 24pt below, a Meetup proposal card in soft beige (#F4F0E8), 16pt rounded corners, 16pt padding:
   - Heading: "We've proposed a meetup" in 14pt charcoal semibold.
   - Body: "Friday Nov 15, 7:30pm at Olive Bistro, Banjara Hills, Hyderabad. The first 4 to RSVP confirms the booking."
   - Below: a small clock icon and "RSVP closes in 3 days" in 12pt warm gray.

9. Sticky bottom action bar with two buttons in a row:
   - "Maybe later" outline button, 30% width, charcoal text
   - "Yes, I'll be there" primary amber button, 70% width

Mood: the moment of arriving at this screen should feel like getting an interesting envelope in the mail. Curated, personal, real.
```

---

## Screen 23: Events list and detail

**Purpose.** Combined screen showing upcoming events with one event expanded.

**Prompt:**

```
Generate the Events screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top header: title "Events" in 24pt Inter Display semibold, left-aligned, 24pt margin. Right side: a calendar icon (24pt thin-line charcoal).
3. 16pt below, a horizontal tab bar with two tabs:
   - "Upcoming" (active, amber underline 2pt thick)
   - "Past" (inactive)
4. Below the tabs, a vertical list of event cards, 16pt margins, 16pt gap between cards. Each card is white with 16pt rounded corners and soft shadow, padded 16pt.

Card 1 (expanded, with rich detail):
- A small horizontal pill at the top of the card content in deep forest green (#2D4A3A) with white text, 11pt: "MATCHED MEETUP" (this is a system-generated event)
- 8pt below: title "Career Fork dinner — Group A" in 18pt Inter Display semibold charcoal.
- 8pt below: a row with calendar icon "Friday, Nov 15 · 7:30pm" in 13pt charcoal.
- 6pt below: a row with map-pin icon "Olive Bistro, Banjara Hills, Hyderabad" in 13pt charcoal.
- 16pt below, a horizontal stack of 5 small overlapping circular avatars (32pt each, white border 2px, slightly overlapping by 6pt) of the matched group members, with "+0" pill on the right showing capacity.
- 16pt below, a row "5 of 5 confirmed" in 12pt deep forest green.
- 16pt below, the action row: a primary amber "View details" button, 60% width, "Add to calendar" outline icon button on the right (32% width).

Card 2 (collapsed but visible):
- A small "ADMIN-ORGANIZED" pill in amber, 11pt.
- Title "Founders' Friday: Sumeet Kapoor on going from idea to Series B" in 18pt Inter Display semibold.
- Date/location row.
- "37 going · 12 spots left" in 12pt warm gray.
- "RSVP" amber button on the right.

Card 3 (collapsed):
- "MATCHED MEETUP" pill.
- Title "Climate Operators dinner — Group B"
- Date and location.
- "3 of 5 confirmed" warm gray.

5. Sticky bottom tab bar (Surveys tab active because Events live under Surveys in the tab structure).

Mood: pragmatic, calendar-y, makes upcoming meetups feel like real things on the calendar rather than abstract notifications.
```

---

## Screen 24: My contributions / dashboard

**Purpose.** The user's private gamification dashboard. Levels, points, streaks, badges, raw activity counters.

**Prompt:**

```
Generate the My Contributions / Dashboard screen for Intent.

Layout, top to bottom:

1. Status bar.
2. Top bar: back arrow on the left, "Your contributions" title centered.
3. 24pt below, the level hero card: full-width minus 16pt margins, with a soft amber-to-cream gradient background (#FFE9CB to #FAFAF6), 20pt rounded corners, 24pt internal padding.
   Inside the card:
   - Top row: a small "LEVEL 2" label in 11pt amber uppercase semibold.
   - 8pt below: "Contributor" title in 28pt Inter Display semibold charcoal.
   - 16pt below: a segmented progress bar (4 segments) showing progress to Level 3. Segments 1 and 2 fully filled amber, segment 3 partially filled (about 60%), segment 4 empty.
   - 12pt below the bar: "47 / 75 points to next level" in 13pt warm gray.
   - 16pt below: a small 3-line description in 13pt charcoal: "You're a Contributor. Connectors get an extra 2 nudges per week and early access to high-demand panels."

4. 24pt below, a section "Recognition" in 13pt charcoal semibold.
   - A horizontally scrollable row of badge cards, each 96pt square. Each badge card has a soft warm gradient (different per badge), a thin-line icon at top (24pt), and a label below in 11pt charcoal:
     - "Class of 2026" (active student badge)
     - "First Connection" (achievement)
     - "First Survey" (achievement)
     - Three more cards faded out / locked, with icons in warm light gray and labels in warm gray, e.g., "Top Mentor (locked)", "Connector (locked)", "Pillar (locked)".

5. 24pt below, a section "This week" in 13pt charcoal semibold. A white card with 4 stat rows separated by 1px dividers:
   - "Nudges responded within 48 hours: 2" with "+10 pts" in amber on the right.
   - "Sessions completed: 1" with "+15 pts".
   - "Survey completed: 1" with "+5 pts".
   - "Meetup attended: 1" with "+20 pts".

6. 24pt below, a section "Lifetime activity" in 13pt charcoal semibold. A grid of 6 small stat tiles, 2 columns x 3 rows, each tile in a soft beige card with 12pt rounded corners and 12pt padding, showing:
   - "12" / "Connections made"
   - "8" / "Mentorship sessions"
   - "3" / "Events attended"
   - "47" / "Total points"
   - "5" / "Surveys completed"
   - "2" / "Resources shared"
   The number is 22pt charcoal semibold, the label below is 12pt warm gray.

7. 24pt below, a small caption in warm gray, centered: "We don't share your activity stats with other members."

Mood: rewarding without feeling like a video game. The level card feels earned. The lifetime stats give the user a sense of accumulated value.
```

---

# Admin panel screens

## Screen 25: Admin login

**Purpose.** A separate, more utilitarian login surface for tenant admins.

**Prompt:**

```
Generate the Admin Login screen for Intent.

The visual language here is slightly different: more utilitarian, less editorial. Same color palette but reduce the photographic warmth.

Layout, top to bottom:

1. Status bar.
2. Centered vertically and horizontally on the screen, a 320pt-wide stacked layout:
   - The "intent" wordmark at the top, 20pt charcoal, centered.
   - Below it, a small "ADMIN" pill in 11pt amber uppercase, fully rounded, with 8pt horizontal padding, on a white background with 1px amber border. Sits 8pt below the wordmark, centered.
   - 32pt vertical space.
   - Heading: "Sign in to your workspace" in 22pt Inter semibold charcoal, centered.
   - 8pt below: "ISB · Alumni Office" in 14pt warm gray, centered.
   - 32pt vertical space.
   - Form fields stacked, each 56pt tall:
     - "Email" with placeholder "you@isb.edu" 
     - "Password" with show/hide eye toggle inside the input
   - Below fields, a "Forgot password" text link in amber, right-aligned.
   - 24pt below, primary amber "Sign in" button, full-width inside the 320pt container.
   - 16pt below: "Or sign in with Google" outline button with the Google icon, full-width.
   - 24pt below: small text in warm gray, centered: "Only ISB-registered admin emails can sign in here. Need access? Contact alumnioffice@isb.edu."

3. Footer at the very bottom: small text "Intent · Privacy · Terms · v1.0.0" in 11pt warm gray, centered, 16pt above the safe area.

Mood: utilitarian, clean, slightly more sober than the user-facing screens. The "ADMIN" pill is the only signal that this is a different surface.
```

---

## Screen 26: Admin dashboard

**Purpose.** The Operator's home screen. Key metrics, recent verifications needing review, activity at a glance.

**Prompt:**

```
Generate the Admin Dashboard screen for Intent (Operator role view).

Layout, top to bottom:

1. Status bar.
2. Top header: a row with the "intent · admin" wordmark on the left (20pt charcoal, with "admin" in slightly smaller amber suffix), and on the right a small notification bell icon and a 32pt circular admin profile photo.
3. 16pt below, a greeting line: "Good morning, Meera." in 22pt Inter Display semibold, charcoal, 16pt margins. Below in 14pt warm gray: "Here's what's happening at ISB today."
4. 24pt below, a 2x2 grid of metric tiles, 16pt margins, 12pt gaps between tiles. Each tile is a white card with 16pt rounded corners, soft shadow, 16pt padding:
   - Tile 1: top label "ACTIVE MEMBERS" in 11pt warm gray uppercase, big number "1,247" in 28pt charcoal semibold, then a row "+24 this week" in 12pt deep forest green with a small up-arrow icon.
   - Tile 2: "NUDGES SENT" / "3,891" / "+412 this week"
   - Tile 3: "MEETUPS HELD" / "23" / "+5 this week"
   - Tile 4: "PENDING VERIFICATIONS" / "12" / "Review needed" in amber (this is a clickable hint)

5. 24pt below, a section "Pending verifications" in 13pt charcoal semibold with a "View all" amber link on the right of the row.
   - Below, a white card with 16pt rounded corners. Inside, three verification request rows, each with:
     - Left: 36pt circular member photo
     - Middle: name in 14pt charcoal semibold (e.g., "Karthik Subramanyam"), then "Founder badge · submitted 4h ago" in 12pt warm gray below
     - Right: a small amber "Review" button, 60pt wide, 32pt tall
     - Rows separated by 1px #E8E4DA dividers, 16pt vertical padding

   Three rows:
     - Karthik Subramanyam · Founder badge (Pre-revenue) · 4h ago
     - Sneha Ramaswamy · Company verification (Sequoia) · 6h ago
     - Aditi Bhatnagar · Domain Expert badge · 1d ago

6. 24pt below, a "Recent activity" section in 13pt charcoal semibold.
   - A simple text-list with timestamps:
     - "Survey 'Career Fork' published · 2h ago · by Meera"
     - "5 new members onboarded · 4h ago"
     - "Meetup 'Climate Ops Group A' confirmed · yesterday"

7. 24pt below, a "Quick actions" section. A row of three large outline buttons (full-width row, 8pt gaps), each 56pt tall:
   - "+ Add members" with a small upload icon
   - "+ New survey" with a clipboard icon
   - "+ New event" with a calendar icon
   On mobile, these stack vertically.

8. Sticky bottom tab bar (admin version, slightly different from user app):
   - Dashboard (active, amber)
   - Members
   - Verify
   - Surveys
   - Reports

Mood: workmanlike, dense without being cluttered. The admin should feel they can run their tenant from this screen.
```

---

## Screen 27: Member onboarding (CSV upload)

**Purpose.** Where the Operator uploads a CSV of verified ISB members.

**Prompt:**

```
Generate the Member Onboarding (CSV upload) screen for Intent's admin panel.

Layout, top to bottom:

1. Status bar.
2. Top bar: back arrow on the left, "Add members" title centered.
3. 24pt below, page heading: "Upload member list" in 24pt Inter Display semibold charcoal, 24pt margins.
4. 8pt below: "We'll cross-check uploaded emails against new sign-ups to verify ISB membership." 14pt warm gray.
5. 24pt vertical space.
6. The upload zone: a large dashed-border area, full-width minus 24pt margins, 240pt tall, 16pt rounded corners, 2px dashed #E8E4DA border, soft beige background (#FAFAF6). Inside, centered:
   - A thin-line cloud-upload icon, 48pt, in warm gray.
   - 16pt below: "Drag your CSV here" in 16pt charcoal semibold.
   - 4pt below: "or" in 12pt warm gray.
   - 12pt below: a small outline "Browse files" button, 32pt tall, charcoal text and border.
7. 16pt below, a small caption in 12pt warm gray, centered: "Accepted formats: .csv, .xlsx · Max file size: 10MB"
8. 24pt below, a section "What we expect in the file" with a 13pt charcoal semibold heading.
   - Below, a white card with a small table (4 columns wide) showing the expected schema:
     - Header row in 12pt warm gray uppercase: "EMAIL" "FULL NAME" "PROGRAM" "CLASS YEAR"
     - Two example rows in 13pt charcoal:
       - "ananya.k@isb.edu" "Ananya Krishnan" "PGP" "2018"
       - "vikram.s@isb.edu" "Vikram Subramanian" "PGP" "2014"
9. 16pt below the table, a "Download template" text link in amber.
10. 32pt below, a section "Past uploads" in 13pt charcoal semibold.
    - A list of 3 past upload rows, each with:
      - A small file icon on the left
      - "members_pgp_2024.csv" in 14pt charcoal, "Uploaded by Meera · 247 records · 2 days ago" in 12pt warm gray below
      - A right-side overflow icon (3 dots)
    - Separated by 1px dividers.
11. Push to bottom: a primary amber "Upload" button (disabled until a file is dropped or selected), full-width minus 24pt margins, 56pt tall.

Mood: functional, supportive, makes a tedious task feel manageable. The schema preview prevents the most common upload failure.
```

---

## Screen 28: Verification queue

**Purpose.** A list of pending verification requests for the Moderator to work through.

**Prompt:**

```
Generate the Verification Queue screen for Intent's admin panel.

Layout, top to bottom:

1. Status bar.
2. Top bar: back arrow on the left, "Verifications" title centered. On the right, a filter icon (24pt thin-line).
3. 16pt below, a horizontal tab bar with three tabs:
   - "Pending (12)" — active, amber underline
   - "Info requested (3)" — inactive
   - "Decided (89)" — inactive
4. Below the tabs, a vertical list of verification request rows. Each row is 96pt tall, with 24pt left padding and 16pt right padding, 1px #E8E4DA bottom dividers, white background.
   Each row contains:
   - A 56pt circular photo of the member on the left
   - Middle stacked content:
     - Top: member name in 15pt charcoal semibold (e.g., "Karthik Subramanyam")
     - Below: a request-type pill in 11pt amber uppercase, e.g., "FOUNDER BADGE · PRE-REVENUE"
     - Below that: "Submitted 4 hours ago · 0 admin notes" in 12pt warm gray
   - Right: an SLA indicator. A small color-coded dot with text:
     - Green dot: "Within SLA (under 24h)" — for fresh requests
     - Amber dot: "SLA: 8h left" — for older
     - Red dot: "SLA breached" — for overdue
   - On the very right edge: a chevron-right icon

Show six rows with varied states:
   - Karthik Subramanyam · FOUNDER BADGE · PRE-REVENUE · 4h ago · Green SLA
   - Sneha Ramaswamy · COMPANY VERIFICATION · SEQUOIA · 6h ago · Green SLA
   - Aditi Bhatnagar · DOMAIN EXPERT BADGE · 1d ago · Amber SLA
   - Pranav Bhattacharya · FOUNDER BADGE · FUNDED · 2d ago · Amber SLA
   - Riya Mehrotra · COMPANY VERIFICATION · MCKINSEY · 3d ago · Red SLA breached
   - Tarun Goyal · MENTOR BADGE · 4d ago · Red SLA breached

5. Sticky bottom tab bar (admin version), with the Verify tab active.

Mood: utilitarian queue. The SLA color codes give immediate sense of priority. Easy to scan for urgent items.
```

---

## Screen 29: Verification request detail

**Purpose.** A single verification request open for review with Approve / Request Info / Reject actions.

**Prompt:**

```
Generate the Verification Request Detail screen for Intent's admin panel.

Layout, top to bottom:

1. Status bar.
2. Top bar: back arrow on the left, "Verification request" title centered.
3. 24pt below, a member summary card: white background, 16pt rounded corners, 16pt padding, 16pt margins.
   Inside:
   - Top row: 56pt photo of "Karthik Subramanyam" on the left. Right: name in 18pt charcoal semibold, "Class of 2019 · PGP · Mumbai" in 13pt warm gray below.
4. 16pt below the member card, a request type heading section:
   - Small label in 11pt amber uppercase: "REQUEST TYPE"
   - Below: "Founder Badge · Pre-revenue stage" in 18pt charcoal semibold.
5. 24pt below, a section "Member's declaration" in 13pt charcoal semibold.
   - A white card containing a structured field display:
     - "Company legal name: ZenithLabs Technologies Pvt Ltd"
     - "Registration number: U72200KA2024PTC183421"
     - "Country of incorporation: India"
     - "Founded: March 2024"
     - "Funding raised: ₹0 (bootstrapped)"
     - "Revenue band: Pre-revenue"
     - "Founder's role: Co-Founder & CEO"
     Each field is presented as a row with the label in 12pt warm gray uppercase and the value in 14pt charcoal below it, separated by 1px dividers and 12pt vertical padding.

6. 24pt below, a section "Evidence submitted" in 13pt charcoal semibold.
   - Three thumbnail/preview cards in a row, each 88pt tall and proportional width:
     - "MCA registration certificate.pdf" thumbnail (a generic PDF icon with file label below)
     - "linkedin.com/in/karthiksubramanyam" thumbnail (LinkedIn favicon with URL below)
     - "Company website" thumbnail (a small website preview)
   - Each is tappable for full-screen viewing.

7. 24pt below, a section "Cross-checks" in 13pt charcoal semibold.
   - A list of 3 status rows:
     - "✓ MCA registration verified" in deep forest green, 13pt
     - "✓ LinkedIn URL matches stated company" in deep forest green
     - "⚠ Company website domain registered 2024 (matches founding year)" in amber

8. 24pt below, a section "Admin notes" in 13pt charcoal semibold.
   - An editable text area, 96pt tall, 1px #E8E4DA border, 12pt rounded, placeholder "Internal notes (not shared with the member)" in warm gray.

9. Sticky bottom action bar with three buttons:
   - "Reject" outline button with red text and red border, 28% width
   - "Request more info" outline charcoal button, 32% width
   - "Approve" primary amber button, 36% width

Mood: forensic but clean. Everything the moderator needs is present and scannable. The cross-checks section is the visual hero, surfacing what the system already verified automatically.
```

---

## Screen 30: Survey creation

**Purpose.** Where the Operator creates a new survey: title, theme, audience, questions, options, matching strategy.

**Prompt:**

```
Generate the Survey Creation screen for Intent's admin panel.

Layout, top to bottom:

1. Status bar.
2. Top bar: "Cancel" link on the left, "New survey" title centered, "Save draft" amber link on the right.
3. The body is a vertical scrollable form.

Section 1: Basics (24pt margins, 24pt vertical padding, 1px divider between sections)
- Section heading "BASICS" in 11pt warm gray uppercase.
- Field "Survey title" with placeholder "e.g., Career fork", labeled above. 56pt tall input.
- Field "Theme" as a select-style input with chevron, value "Career fork".
- Field "Description (optional)" as a 96pt-tall text area, placeholder "What is this survey for? Members will see this on the survey card."

Section 2: Audience
- Section heading "AUDIENCE".
- Toggle row "Current students only" with toggle off.
- Toggle row "Recent grads only (under 2 years)" off.
- Toggle row "Specific class years" off; if on, would expand a year-range picker.
- Toggle row "Specific cities" off.

Section 3: Questions
- Section heading "QUESTIONS (3)".
- A vertical list of 3 question cards, each:
   - White card, 12pt rounded corners, 1px #E8E4DA border, 16pt padding.
   - Top of card: small label "QUESTION 1" in 11pt warm gray, with a drag-handle icon on the right and a 3-dot overflow icon.
   - Below: question text in 14pt charcoal, e.g., "Where do you see yourself five years out?"
   - Below: a small caption "Single select · 4 options" in 12pt warm gray.
   - Below: a small "Edit" amber link.
- 16pt gap between question cards.
- Below the cards, an outline "+ Add question" button, full-width, 48pt tall.

Section 4: Matching
- Section heading "MATCHING".
- A toggle row "Group similar answers (Jaccard overlap)" with toggle on.
- Toggle row "Apply diversity penalty" with toggle on. Below in 12pt warm gray: "Prevents the same people from being clustered together repeatedly."
- A row "Group size" with a small range picker, defaulting to "4 to 6".
- A row "Match cap per member" with current value "2 per quarter" and a chevron.

Section 5: Schedule
- Section heading "SCHEDULE".
- Field "Publish on" with date and time picker, value "Tomorrow, 9:00 AM".
- Field "Closes after" with select, value "7 days".

Sticky bottom action bar:
- "Save and preview" outline button, 50% width
- "Publish" primary amber button, 50% width

Mood: structured, looks like a serious editorial tool. Question cards drag-and-drop affordance hints at a richer drag-and-drop builder. Toggles for matching parameters give the admin a sense of control.
```

---

# Workflow tips

**Iteration discipline.** Stitch's first generation per prompt is rarely the final output. Expect to regenerate each screen 2 to 4 times. Common second-pass adjustments: "make the photo larger and the typography smaller," "tone down the amber, it's too saturated," "add more whitespace at the top."

**Naming and organizing in Stitch.** Name each generated frame with the screen number from this document (e.g., "S10 - Discovery feed"). When all 30 are done, you can re-order them in Stitch's left panel to match the user flow. Use Stitch's flow-arrow tool to wire screens together (S1 → S2 → S3, S10 → S12 when a card is tapped, etc.).

**What to share with first reviewers.** When you drop the prototype into ISB WhatsApp groups, share the link to the clickable Stitch flow rather than individual frames. People react more strongly to clicking through a sequence than to looking at a static screenshot. Include a 1-line note: "Quick prototype of an idea I'm working on. 60 seconds of clicks. Would love your gut reaction."

**What signals to listen for.** First reactions matter most. The questions to extract from feedback:
- Did the brand "Intent" land or feel forced?
- Did the card-as-the-unit feel right, or did it feel dating-app-like despite our efforts?
- Was the Asks/Offers concept immediately legible or did it need explanation?
- Did the survey-to-meetup mechanic excite or confuse people?
- Would they actually use this if it existed?

Negative signal you should listen for hardest: people saying it's "nice" but cannot articulate when they would use it. That means the value prop is unclear. Strong positive signal: people asking when they can sign up.

**After Stitch.** Once frames are generated and reviewed, the next deliverables are:
1. A high-fidelity interactive prototype (Figma) for actual user testing rather than just look-and-feel review.
2. Engineering specs derived from these mockups: component libraries, design tokens, interaction states.
3. A motion-design pass for transitions between key screens (card → profile detail, send-nudge → confirmation, etc.).

Do not skip step 1. Stitch outputs are good for reactions, not for engineering handoff.

**On the user-facing copy.** Every word in this document is provisional. The placeholder names, the example Intents, the decline copy, and the survey questions should all be revisited with a copywriter or with you yourself once the visual direction is locked. The visuals carry the brand; the copy carries the voice. They need to sing in tune.
