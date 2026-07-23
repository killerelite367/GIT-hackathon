# StudyQuest — Session Handoff

> Give this file to your next AI session (or teammate) so they have full context on the project, its current state, what's weak, and what to build next.

Last updated: 2026-07-23 (session 2 — core functionality built)

> **Session 2 update:** StudyQuest is no longer a static shell. It's now a real,
> stateful app running fully client-side on localStorage. The differentiator
> (syllabus parser → auto-scheduler) is built, plus working CRUD, a real
> gamification loop, a live GPA engine, smart prioritisation, and the burnout
> radar. `npm run build` passes clean and the app was smoke-tested in a browser
> (completing a task awards XP, updates the streak, and persists). See §7.

---

## 1. What this project is

**StudyQuest** — a gamified digital study diary built for the RP hackathon.

**Problem statement (the brief):** RP students juggle multiple continuous assessments (CAs), group projects, reflections, and deadlines every semester. Existing tools mostly demand *manual* organizing, making it hard to stay on track.

**The four core objectives from the brief:**

1. **Auto-organize workload** — parse assignment dates and schedule automatically.
2. **Track academic progress** — visual GPA and score-milestone dashboards.
3. **Intelligent reminders** — smart, contextual nudge notifications.
4. **Stay productive all semester** — gamified streak counters and daily study goals.

**The judging question that matters most:** *"What unique value proposition separates your solution from a generic calendar?"* Keep this front of mind — right now the app does NOT yet answer it (see critique below).

---

## 2. Current state (as of this handoff)

- Repo: **https://github.com/killerelite367/GIT-hackathon** (branch `main`, 25 files pushed).
  - Owner intends to make it **private** manually via repo Settings → Danger Zone.
- The app is a **static UI shell running on mock data** — it looks good but has no real functionality yet.
- **`npm run build` passes clean** (verified in this session).
- App runs in "demo mode" until Supabase keys are added.

### Tech stack
- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (dark "quest terminal" theme with neon accents)
- **Icons:** lucide-react
- **Backend/DB/Auth (chosen, not yet wired):** Supabase (Postgres + Row Level Security)
- `framer-motion` is in `package.json` but **currently unused** (dead dependency — either use it or remove it).

### File map
```
GIT hackathon/
├── README.md                  project overview + setup
├── GIT_SETUP.md               how to push from your own machine
├── SESSION_HANDOFF.md         <-- this file
├── push-to-github.bat         one-click git setup for Windows
├── .env.example               Supabase env template
├── .gitignore
├── package.json               deps + scripts
├── vite.config.ts / tsconfig*.json / tailwind.config.js / postcss.config.js
├── index.html
├── public/favicon.svg
├── supabase/
│   └── schema.sql             profiles, modules, assignments tables + RLS policies
└── src/
    ├── main.tsx               React entry
    ├── App.tsx                the whole dashboard (single page, no routing yet)
    ├── index.css              theme + grid background
    ├── types.ts               Assignment, Module, StudentStats types
    ├── vite-env.d.ts          Vite env typing
    ├── lib/supabase.ts        Supabase client (falls back to demo mode)
    ├── data/mock.ts           demo data (stats, modules, assignments)
    └── components/
        ├── Sidebar.tsx        nav (links are decorative — no routing)
        ├── StatCard.tsx       streak / XP / week / trend cards
        ├── GpaRing.tsx        SVG GPA ring
        └── AssignmentCard.tsx assignment row with progress bar + priority
```

### How to run
```bash
npm install
npm run dev      # opens on localhost, demo data
npm run build    # typecheck + production build
```

### Wiring Supabase (not done yet)
1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` → `.env`, fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Restart `npm run dev`. Header badge flips to "Supabase connected".
5. Note: nothing actually reads/writes Supabase yet — the client just initializes. CRUD still needs to be built.

---

## 3. Critique — honest weak points

> **Session 2:** Critical items #1–#5, #8, plus #6 (mobile nav), #11 (a11y basics),
> and #13 (dead dep) are now **addressed** — see §7. Still open: #3 backend/#7 auth
> (store is abstracted, ready to wire), #9 reminders, #10 group projects, #12
> tests/CI, #14 effort model (partly done — assignments now carry `estHours`).

Ordered roughly by how much they matter for the hackathon (original session-1 list).

### Critical (these decide whether the project wins)
1. **The differentiator is missing.** Right now StudyQuest is a good-looking dashboard on fake data — which is *exactly* the "generic calendar" the brief warns against. Nothing auto-parses or auto-schedules anything. The single most important thing to build is the **syllabus/brief → auto-extracted, auto-scheduled assignments** flow. Without it, the pitch has no answer to the judging question.
2. **No real functionality / no interactivity.** Buttons ("+ Add assignment", sidebar nav) do nothing. You can't add, edit, complete, or delete an assignment. It's a mockup, not an app.
3. **Backend not wired.** Supabase client exists but there's no auth, no data fetching, no CRUD. All data is hardcoded in `mock.ts`.
4. **Gamification is cosmetic.** XP, streak, and level are static numbers with no rules, no earning logic, and no persistence. Judges will spot a fake streak instantly. Needs a real loop (complete task → earn XP → streak updates → persists).

### Important
5. **GPA is faked.** The ring shows 3.62 with no calculation behind it. Needs a real grade→GPA engine using RP's actual 0–4 GPA scale and module credits.
6. **Not mobile-ready.** The sidebar is `hidden` on small screens with no hamburger/mobile nav — yet students live on phones. Primary use case is under-served.
7. **No auth / accounts.** RLS policies exist in the schema but there's no sign-in flow to populate `auth.uid()`, so the multi-user model is unusable as-is.
8. **No routing.** Single page; sidebar links are dead. Needs React Router (or similar) for Schedule / Modules / Achievements views.
9. **"Intelligent reminders" pillar absent.** No notifications of any kind. Web push needs a PWA + service worker, or a Supabase edge function + cron for email.
10. **No group-project features.** The brief explicitly calls out teamwork frustration; there's nothing collaborative.

### Polish / quality
11. **Accessibility gaps.** Neon-on-dark contrast likely fails WCAG in places; no aria labels; focus states are default-only.
12. **No loading/empty/error states**, no tests, no CI.
13. **Dead dependency** (`framer-motion`) inflates the bundle (~374 KB JS). Remove or use it.
14. **No effort/time model** — scheduling can't be smart without an estimate of how long each task takes.

---

## 4. Feature roadmap / brainstorm

Grouped by the four core objectives, plus differentiators. ⭐ = high-impact for the hackathon demo.

### A. Auto-organize workload (the killer feature)
- ⭐ **Syllabus/brief parser** — paste text or upload a PDF; an LLM extracts assignment title, due date, type, and weightage into structured data. This is *the* differentiator.
- ⭐ **Auto-scheduler** — given deadlines + weightage + estimated effort, spread work backward from due dates into daily study blocks. Reflows automatically when the student falls behind.
- **Calendar import (.ics)** from the RP LMS (Brightspace) or Google Calendar, so setup is near-zero.

### B. Track academic progress
- ⭐ **Real GPA engine** on RP's 0–4 scale, weighted by module credits.
- **"What-if" calculator** — "what do I need on CA2 to hit 3.7?"
- **Grade projection & trend charts** per module over the semester.

### C. Intelligent reminders
- ⭐ **Smart prioritization** — surface tasks by a score combining due-date proximity × weightage × how little progress is done (e.g., "3 days left, 0% done, worth 30%").
- **Email reminders** via a Supabase edge function + scheduled cron.
- **Browser/PWA push notifications** for daily nudges.

### D. Stay productive (real gamification)
- ⭐ **Working XP/streak loop** — completing tasks and logging study sessions earns XP; daily check-in keeps the streak; levels unlock. All persisted in Supabase.
- **Integrated Pomodoro timer** that logs study minutes and feeds the streak/XP.
- **Achievements/badges** and an optional friends/class leaderboard (privacy-aware).

### E. Group projects (addresses teamwork frustration)
- **Shared project boards** with task assignment per member and visible progress.
- **Teammate nudges** — see who's behind and prompt them.

### F. Differentiators / standout ideas
- ⭐ **Burnout radar** — detect weeks with too many high-weight deadlines stacked together and warn + redistribute the plan. Genuinely unique, shows care for wellbeing, great demo moment.
- **AI study coach** — a chat that knows the student's workload and answers "what should I do today?"
- **Adaptive effort learning** — learns how long tasks actually take vs the estimate and improves future schedules.

### G. Platform / technical
- Supabase auth (magic link or Google), then wire CRUD to replace `mock.ts`.
- React Router + real Schedule/Modules/Achievements pages.
- Mobile-first responsive nav (hamburger + bottom bar).
- PWA (installable + offline).
- Light/dark theme toggle.
- Tests + a simple CI (GitHub Actions) that runs `npm run build`.

### Suggested demo-winning slice (if time is short)
Build, in this order: **syllabus parser → auto-scheduler → Supabase CRUD + auth → one real gamification loop → burnout radar.** That combination directly answers the judging question and demos beautifully.

---

## 5. Setup gotchas & notes for the next session

- **OneDrive + git conflict:** this folder is OneDrive-synced. The AI sandbox can *create* files here but **cannot delete/unlink** them, which breaks git's internals (there's a half-formed `.git` folder that couldn't be cleaned). Do git operations from the user's own Windows machine, or in a clean local temp dir. The successful push in this session was done from a temp copy in the sandbox, pushed over HTTPS with a token.
- **Sandbox network:** `github.com` git operations work from the sandbox, but `api.github.com` (REST API) is **blocked by the proxy** — so no repo-admin actions (like changing visibility) from here.
- **npm install on the OneDrive mount is very slow** (thousands of files syncing). Install in a local temp dir for speed; `node_modules` is gitignored so it never needs to live in the repo.
- **GitHub token:** a fine-grained PAT was used to push. It only had Contents write on this one repo. If it's still active and you're done, consider revoking it at github.com/settings/tokens.
- **Data storage decision:** the owner chose **Supabase**. Stick with it unless there's a strong reason to switch.
- **Design language:** the "quest brief / mission terminal" aesthetic (neon green/cyan/pink on near-black, mono accents) comes from the hackathon slide. Keep it — it's on-brand and distinctive.

---

## 6. TL;DR for the next session

The differentiator and the core loop are now built and working (see §7). The app
answers the judging question: paste a syllabus → deadlines are auto-extracted →
auto-scheduled into daily study blocks → burnout radar warns about overloaded
weeks. What's left is mostly *platform* work (real backend/auth, reminders,
mobile PWA push, group projects) — nice-to-haves for the demo, not blockers.

---

## 7. Session 2 — what was actually built

Everything runs client-side and persists to `localStorage` (no backend setup
needed for the demo). Verified: `npm run build` passes clean and a browser
smoke-test confirmed the flows work.

**Engine (pure logic, `src/lib/`):**
- `parser.ts` — **syllabus/brief parser** (the differentiator). Paste text →
  extracts title, due date, weightage, type, module code, effort estimate.
  Heuristic/regex-based so it runs offline & deterministically for a live demo
  (an LLM parser can slot in behind the same `ParsedAssignment` shape later).
  Includes `SAMPLE_SYLLABUS` for a one-click demo.
- `scheduler.ts` — **auto-scheduler**. Spreads remaining effort backward from
  each deadline into daily study blocks (capped at 3h/task/day).
- `gpa.ts` — **real GPA engine** on the SG poly 0–4 scale, credit-weighted, plus
  a `scoreNeededFor` **what-if** solver (binary search).
- `priority.ts` — **smart prioritisation** score = urgency × weight × (1−progress).
- `gamification.ts` — **working XP/level/streak loop** (XP scales with weight;
  streak tracks consecutive active days; quadratic level curve).
- `achievements.ts` — unlockable badges evaluated from live state.
- `burnout.ts` — **burnout radar**: clusters deadlines by week, flags overloaded
  ones, gives redistribution advice.
- `date.ts` — date helpers (ISO days, week keys, relative labels).

**State:** `src/store/StoreContext.tsx` — React context store with full CRUD,
toasts, achievement detection, and localStorage persistence
(`src/lib/storage.ts`, seeded from `src/data/seed.ts`).

**UI:** routed shell (`App.tsx`) with 4 views (`src/views/`): Dashboard,
Schedule, Modules (+what-if calculator), Achievements. Mobile bottom-nav +
responsive. New components: `AssignmentModal` (add/edit), `SyllabusImport`
(paste → review → import), `BurnoutRadar`, `Toasts`. Assignment cards now have
working complete/edit/delete. Accessibility: focus-visible rings, aria labels,
`prefers-reduced-motion` support.

**Cleanup:** removed dead `framer-motion` dep. Old static data (`data/mock.ts`,
`StudentStats` type) is gone/stubbed — `data/mock.ts` is a stub only because
this sandbox can't delete files on the OneDrive mount (safe to delete locally).

**Still open (roadmap §4):** Supabase wiring + auth (store is abstracted behind
`AppData` so it can swap in), real reminders (edge function/PWA push), group
projects, LLM-upgraded parser, tests/CI, `.ics` import.

### How the build was verified (OneDrive gotcha)
The `node_modules` on the OneDrive mount is incomplete/corrupted (TypeScript's
`lib/tsc.js` was missing), so building in-place fails. Build from a clean local
copy instead: `robocopy` the project (excluding `node_modules`/`dist`) to a
temp dir, `npm install`, then `npm run build`. Bundle: ~415 KB JS (117 KB gzip)
— the weight is mostly `@supabase/supabase-js`.
