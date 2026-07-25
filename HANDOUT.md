# StudyQuest — Project Handout

_Last updated: 2026-07-25 · Repo: https://github.com/killerelite367/GIT-hackathon (branch `main`)_

A gamified digital study diary built for the RP hackathon. It reads a student's
module guides, auto-extracts every deadline and weightage, spreads the work
across the semester, and wraps the whole thing in a motivation layer so studying
actually gets rewarded.

---

## 1. The one-line pitch

**Paste your syllabus → get your whole semester planned, prioritised, and
gamified — so you always know what to do next.**

The differentiator vs. a generic calendar: nothing is typed by hand. You paste a
module guide, StudyQuest parses it, schedules it backward from each deadline, and
warns you before an overloaded week lands.

---

## 2. How to run it

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck (tsc) + production build
```

Then open the local URL. The **root URL is the landing page**; **`#/app`** is the app.

> **Dev gotcha (important):** this folder is OneDrive-synced, and the on-disk
> `node_modules` there is corrupted (TypeScript's `lib/` goes missing). If a
> build fails in place, build from a clean local copy: `robocopy` the project
> (excluding `node_modules`/`dist`/`.git`) to a temp dir, `npm install`, then
> `npm run build`. A fresh `npm install` on a normal (non-OneDrive) machine also
> fixes it.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (semantic design tokens) |
| Motion | GSAP + ScrollTrigger, Lenis (landing page) + CSS keyframes (app) |
| Icons | lucide-react |
| Persistence | `localStorage` (works fully offline, no backend needed) |
| AI scanning | Google Gemini 2.5 Flash (vision) — direct from the browser, or via an n8n webhook |
| Fonts | Bricolage Grotesque (display), Figtree (body/UI), JetBrains Mono (data) |
| Backend (scaffolded, unused) | Supabase client — abstracted behind an `AppData` shape, ready to wire |

Everything is client-side. There is no server and no account; your data lives in
the browser and can be exported/imported as JSON.

---

## 4. Information architecture

The landing page sits at the root URL. The app lives at `#/app` and has five
destinations:

- **Today** — the home screen. One "Up next" hero (your single highest-priority
  quest) with a primary *Start focus session* action, the rest of the queue
  below, a compact status strip, and today's plan.
- **Planner** — the semester zoom-out: the timeline, the burnout radar, and the
  day-by-day study blocks.
- **Grades** — a live GPA ring, editable running scores, and the what-if
  calculator.
- **Rewards** — everything motivational, in one place, as sub-tabs:
  **Progress** (level / streak / crystals / spirits / study heatmap /
  achievements), **Summon**, **Garden**, and **Workshop**.
- **Settings** — reminders toggle, export / import backup, reset, and a link back
  to the landing page.

A persistent header shows the screen title, a streak + level HUD, and a settings
gear. `Today / Planner / Grades / Rewards` are the primary nav (sidebar on
desktop, bottom bar on mobile); Settings is the gear.

---

## 5. Features

### Core academic engine (the differentiator)
- **Syllabus parser** — paste any module guide / brief / Brightspace text; it
  extracts title, due date, weightage, type, module code, and an effort
  estimate. Heuristic/offline, shows a confirm list before saving.
- **AI document scan** — photograph a module guide, brief, or results slip
  (camera, drag-drop, paste a screenshot, or a PDF) and Gemini reads it. Returns
  the same `ParsedAssignment` shape as the text parser, so scanned rows flow
  through the identical confirm list → auto-scheduler pipeline. A results slip
  additionally updates module scores, so the GPA moves from a photo.
  Photos are downscaled to 1600px in-browser before upload; nothing is stored.
  Configure under **Settings → AI document scan** (see §11).
- **Auto-scheduler** — spreads each assignment's remaining effort backward from
  its deadline into daily study blocks (capped per day). Reflows when you fall
  behind.
- **Live GPA engine** — credit-weighted on the SG poly 0–4 scale, updates as you
  edit scores, plus a **what-if** solver ("what score do I need to hit 3.7?").
- **Smart prioritisation** — quests ranked by urgency × weight × how little is
  done.
- **Burnout radar** — clusters deadlines by week, flags overloaded weeks, and
  tells you which task to start early.

### Task & study management
- Full CRUD on assignments (add / edit / complete / delete) via a modal.
- **Focus timer** — a real 15/25/50-min session tied to one task; the minutes
  studied convert into progress, XP, and Focus Crystals.
- **Daily Briefing** on Today: overdue / due-today / burnout at a glance.
- **Semester timeline** — the whole term's workload shape in one horizontal view.
- **Study heatmap** — a GitHub-style grid of real daily effort.

### Motivation & rewards
- Working **XP / level / streak** loop and unlockable **achievements**.
- **Study Spirits** gacha (Jayden's work): earn Focus Crystals *only* by
  completing real study work, then summon collectible characters with cinematic
  reveals. 11 rarity tiers, food-flavoured characters, element-themed premium
  summons, escalating "destruction" cinematics, and synthesized sound.
- **GPA Garden** — a garden that reflects your progress; plant spirits for luck.
- **Workshop** — Book Binding (fuse 3 duplicates into a rarer spirit) and the
  Altar of Sacrifice.

### Data & trust
- **Export / Import** your whole state as a JSON backup.
- **Opt-in daily reminder** (browser notification, once a day while the tab is
  open).
- **Reset to demo data**.

---

## 6. Design system

- **Twilight dark theme.** A deep slate base (`#131319`, not harsh black) with
  elevated surfaces, so it reads as a considered mix of tones. One confident
  violet accent carries actions; semantic hues (grass / warm / berry / sky) are
  used only for meaning, never decoration. All text verified WCAG-AA.
- **Semantic tokens** (`canvas`, `surface`, `night`, `dusk`, `haze`, `brand`,
  `line`, …) — the whole app re-themes by changing values, not by rewriting
  components.
- **One `<Button>` component** with a deliberate hierarchy: primary / secondary /
  ghost / danger, so every button reads at the right level.
- **Motion**: animated view/tab transitions, a drifting ambient glow, staggered
  list entrances, count-ups, a drawing GPA ring, and (on the landing) Lenis
  smooth-scroll with GSAP scroll reveals, a line-mask headline, parallax, and a
  magnetic CTA. Everything respects `prefers-reduced-motion`.
- The **Summon / Garden / Workshop** views live on a still-darker "chamber" stage
  so the game spectacle pops and stays visually distinct from the study tools.

---

## 7. Who built what

- **Study & planning core + app shell + design** — the parser, scheduler, GPA
  engine, prioritisation, burnout radar, focus timer, daily briefing, timeline,
  heatmap, backup, the Today / Planner / Grades / Settings screens, the
  information architecture, the button/design system, the landing page, and the
  theming + motion.
- **Jayden** — the entire Study Spirits game layer: the gacha engine (11 tiers,
  34 characters), the summon cinematics, sound, the GPA Garden, and the Workshop
  (Book Binding + Altar of Sacrifice). Re-homed into the Rewards tab during merge.

---

## 8. Landing page

A brand surface distinct from the app: a violet hero with a line-mask headline,
the actual promise as the headline, real product UI rendered as the "imagery"
(the Up-next card, the timeline, the parser extracting rows, a focus session), a
problem → 3-step → feature-bento → rewards narrative, and GSAP scroll motion.
Shown at the root URL; reachable again from **Settings → Landing page → View**.

---

## 9. What's done vs. still open

**Done:** the full academic engine, all five app screens, the reward/game layer,
the landing page, the twilight theme + motion, localStorage persistence with
backup, and mobile-responsive layout. Build passes clean; all screens verified
rendering with AA contrast and no overflow.

**Still open (nice-to-haves, not blockers):**
- Multi-page / batch scanning (one document at a time today).
- Supabase auth + real multi-device sync (the store is abstracted for it).
- Real push notifications when the tab is closed (needs a PWA + service worker).
- Group-project / collaboration features.
- `.ics` calendar export.
- A light/dark theme toggle (would require a CSS-variable token refactor).
- Tests + CI.
- Functional hardening surfaced by the design critique: confirm-before-delete,
  a ⌘K command palette / keyboard shortcuts, and a first-run onboarding.

---

## 10. Git / collaboration notes

- Branch `main` holds everything. Commit history reads as a clear narrative.
- **For Jayden:** branch fresh from `main` (`git checkout main && git pull`)
  rather than continuing on the old `jayden/gacha` branch — that branch predates
  the app restructure and will re-conflict on `nav.ts` / `App.tsx` / `Sidebar`.
- Repo owner is `killerelite367`; add collaborators under repo Settings if a
  teammate needs push access.

---

## 11. AI document scan — setup & security

Two modes, switched in **Settings → AI document scan**.

**Via n8n webhook — the default. Nothing to set up.** The app ships pointing at
the team's live workflow (`DEFAULT_WEBHOOK_URL` in `src/lib/aiConfig.ts`). The
browser POSTs the image there; n8n adds the Gemini key server-side and returns
the parsed rows. Verified from a clean build with no `.env` present: the bundle
contains no API key, and the only network call the page makes is to n8n.

The URL is committed on purpose — it is an address, not a credential. To point
at your own n8n instead, paste a URL in Settings (or set `VITE_SCAN_WEBHOOK_URL`);
clearing it falls back to the shared one. Setup for your own instance is in
`n8n/README.md`.

> Because the endpoint is public, anyone who finds it can spend the workflow's
> Gemini quota. Narrow the webhook node's `allowedOrigins` from `*` to the
> deployed domain once it's known.

**Direct to Gemini** (opt-in; useful offline from n8n). The browser calls the
Gemini API itself. The key comes from either:
- the field in Settings — stored in `localStorage`, never committed, never
  leaves the browser. **Best for a demo.**
- `VITE_GEMINI_API_KEY` in `.env` (gitignored) at build time.

> ⚠️ **Every `VITE_*` value is inlined into the JS bundle.** A key set that way
> is readable by anyone who opens devtools on the deployed site, and scanners
> harvest keys off public repos and deploys. For anything public, use webhook
> mode or have each user paste their own key in Settings.

**Test connection** in Settings verifies the key/webhook before a live demo
(the webhook ping short-circuits before Gemini, so it costs no quota).

Notes:
- Model is `gemini-2.5-flash`. `gemini-2.0-flash` has no free-tier quota.
- The free tier is rate-limited; a 429 surfaces as "the free quota is used up
  for now" and pasting text still works, so a demo never hard-fails.
- iPhone HEIC photos may not decode in-browser — set Camera to "Most
  Compatible", or screenshot the document first.
