# StudyQuest 🎮📚

> A gamified digital study diary that auto-organizes coursework, tracks GPA, and keeps students on track — built for the RP hackathon.

## The problem

RP students juggle multiple continuous assessments, group projects, reflections, and deadlines every semester. Existing tools mostly demand manual organizing, making it hard to stay on track.

## What StudyQuest does

- **Auto-organizes workload** — paste a syllabus/assignment brief and it parses dates and schedules everything for you.
- **Tracks academic progress** — visual GPA ring and per-module score milestones.
- **Intelligent reminders** — smart, contextual nudges based on deadlines and weightage.
- **Keeps you productive** — gamified streaks, XP, levels, and daily study goals.

## What makes it different from a generic calendar

A calendar shows you *when* things are due. StudyQuest understands *what* the work is, *how much it's worth*, and *how far along you are* — then turns the whole semester into a quest log you actually want to open.

## Tech stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS (dark, gamified "quest terminal" theme)
- **Icons/animation:** lucide-react, framer-motion
- **Backend/DB/Auth:** Supabase (Postgres + Row Level Security)

## Getting started

```bash
npm install
npm run dev
```

The app runs in **demo mode** on mock data out of the box. To connect real data:

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env` and fill in your project URL and anon key.
4. Restart `npm run dev` — the header will switch to "Supabase connected".

## Project structure

```
src/
  components/    UI pieces (Sidebar, StatCard, GpaRing, AssignmentCard)
  data/mock.ts   demo data so the app runs with zero setup
  lib/supabase.ts  Supabase client (falls back to demo mode)
  types.ts       shared TypeScript types
supabase/schema.sql  database schema + RLS policies
```

## Roadmap

- [ ] Syllabus/brief parser (upload → auto-scheduled assignments)
- [ ] AI-generated weekly study plan
- [ ] Group project shared boards
- [ ] Push/email smart reminders
- [ ] Achievements & leaderboard

---

Built at the RP GIT hackathon.
