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
