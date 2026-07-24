import {
  Sparkles,
  ArrowRight,
  Wand2,
  CalendarRange,
  Timer,
  GraduationCap,
  AlertTriangle,
  Gem,
  Check,
  Clock,
} from "lucide-react";

/**
 * The landing page — a brand surface, not app chrome. Committed violet hero,
 * then a light canvas, then one dark band for the Spirits reward layer.
 * All imagery is real product UI rendered in markup, so what you see on the
 * page is genuinely what the app looks like.
 */
export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 500px at 85% -10%, rgba(255,255,255,0.22), transparent 60%), radial-gradient(700px 420px at 0% 100%, rgba(243,154,26,0.28), transparent 60%)",
          }}
        />

        {/* Nav */}
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles size={18} />
            </div>
            <span className="font-display text-lg font-bold tracking-tightish">StudyQuest</span>
          </div>
          <div className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex">
            <a href="#how" className="transition hover:text-white">
              How it works
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#spirits" className="transition hover:text-white">
              Rewards
            </a>
          </div>
          <button
            onClick={onEnter}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-deep shadow-lg transition hover:bg-white/90 active:scale-95"
          >
            Open StudyQuest
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Wand2 size={13} /> Built for Republic Polytechnic
            </p>
            <h1 className="mt-5 text-balance font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tighter2 sm:text-[3.6rem] lg:text-[4rem]">
              Paste your syllabus. Get your semester planned.
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/85">
              StudyQuest reads your module guides, pulls out every deadline and weightage, then
              spreads the work backward across your calendar — so you always know what to do next.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-bold text-brand-deep shadow-xl transition hover:bg-white/90 active:scale-95"
              >
                Start planning — it's free
                <ArrowRight size={17} />
              </button>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10"
              >
                See how it works
              </a>
            </div>
            <p className="mt-5 text-sm text-white/65">
              No account needed · works offline · your data stays in your browser
            </p>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <UpNextPreview />
            </div>
            <div className="mt-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <TimelinePreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-balance font-display text-[2rem] font-bold leading-[1.1] tracking-tighter2 text-night sm:text-[2.6rem]">
              Four modules. Eleven deadlines. One week where they all land.
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-dusk">
              CAs, group projects, reflections, quizzes — every module hands you a different
              schedule, in a different format, at a different time. Most planners make you retype
              all of it by hand, so most students stop after week three.
            </p>
            <p className="mt-4 max-w-md text-[16px] font-semibold text-night">
              StudyQuest does the typing for you.
            </p>
          </div>

          {/* A real module-guide fragment → what gets extracted */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-haze">
                Your module guide
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-dusk">
{`C240 Data Engineering
- CA2: ETL Pipeline Report
  due 27 Jul, worth 25%
- Quiz 4 on 24 July (10%)
- Sprint 3 Demo 29/07, 30%`}
              </pre>
            </div>
            <div className="rounded-2xl border border-brand/25 bg-brand-soft/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-deep">
                What StudyQuest pulls out
              </p>
              <div className="mt-2 space-y-2">
                {[
                  { t: "CA2: ETL Pipeline Report", d: "27 Jul", w: "25%" },
                  { t: "Quiz 4", d: "24 Jul", w: "10%" },
                  { t: "Sprint 3 Demo", d: "29 Jul", w: "30%" },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="flex items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-1.5"
                  >
                    <span className="min-w-0 truncate text-xs font-semibold text-night">{r.t}</span>
                    <span className="shrink-0 font-mono text-[10px] text-dusk">
                      {r.d} · {r.w}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how" className="border-y border-line bg-surface/60 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="max-w-xl text-balance font-display text-[2rem] font-bold leading-[1.1] tracking-tighter2 text-night sm:text-[2.4rem]">
            Three steps, then it runs itself.
          </h2>

          <div className="mt-12 space-y-14">
            <Step
              n="01"
              title="Paste your module guide"
              body="Drop in the text from Brightspace, a PDF, or an announcement. The parser finds each assignment's title, due date, weightage, and rough effort — then shows you what it found before anything is saved."
            >
              <ParserPreview />
            </Step>
            <Step
              n="02"
              title="It schedules the work backward"
              body="Every deadline gets broken into daily study blocks, spread back from its due date and capped so no single day gets buried. Fall behind and the plan reflows around you."
              flip
            >
              <TimelinePreview light />
            </Step>
            <Step
              n="03"
              title="Study, and watch it pay off"
              body="Start a focus session on whatever's next. Real minutes move the progress bar, earn XP, and keep your streak alive — so the reward is tied to work you actually did."
            >
              <FocusPreview />
            </Step>
          </div>
        </div>
      </section>

      {/* ── Features bento ───────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h2 className="max-w-xl text-balance font-display text-[2rem] font-bold leading-[1.1] tracking-tighter2 text-night sm:text-[2.4rem]">
          Everything a semester throws at you, in one place.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {/* Wide feature */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-berry-soft text-berry-deep">
                <AlertTriangle size={18} />
              </span>
              <h3 className="font-display text-lg font-bold text-night">Burnout radar</h3>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-dusk">
              It watches for weeks where several heavy deadlines stack up, warns you before you walk
              into one, and tells you which task to start early to spread the load.
            </p>
            <BurnoutPreview />
          </div>

          {/* Tall-ish feature */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-soft text-sky-deep">
                <GraduationCap size={18} />
              </span>
              <h3 className="font-display text-lg font-bold text-night">Live GPA</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-dusk">
              Credit-weighted on the poly 0–4 scale. Edit a score and watch it move.
            </p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold tabular text-night">3.60</span>
              <span className="text-sm font-medium text-dusk">/ 4.00</span>
            </div>
            <p className="mt-3 rounded-lg bg-surface2 px-3 py-2 text-xs font-medium text-dusk">
              “What do I need on CA2 to hit 3.7?” — the what-if calculator answers it.
            </p>
          </div>

          {/* Three smaller */}
          <FeatureSmall
            icon={<CalendarRange size={18} />}
            tone="bg-brand-soft text-brand"
            title="Semester timeline"
            body="See the whole term at a glance — where the work piles up and where it eases off."
          />
          <FeatureSmall
            icon={<Timer size={18} />}
            tone="bg-warm-soft text-warm-deep"
            title="Focus sessions"
            body="A real timer tied to one task. Minutes studied become progress, XP, and crystals."
          />
          <FeatureSmall
            icon={<Wand2 size={18} />}
            tone="bg-grass-soft text-grass-deep"
            title="Smart ordering"
            body="Quests rank by how soon they're due, how much they're worth, and how little is done."
          />
        </div>
      </section>

      {/* ── Spirits (dark band) ──────────────────────────── */}
      <section id="spirits" className="summon-stage border-y border-brand/20 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              <Gem size={13} /> The reward layer
            </p>
            <h2 className="mt-5 text-balance font-display text-[2rem] font-bold leading-[1.1] tracking-tighter2 text-white sm:text-[2.4rem]">
              The only way to earn a summon is to study.
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/70">
              Finishing real coursework earns Focus Crystals — the single currency in the game. Spend
              them to summon Study Spirits, collectible companions that give you a small XP bonus
              while equipped. No payments, ever. The grind is your actual degree.
            </p>
            <button
              onClick={onEnter}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-bold text-brand-deep transition hover:bg-white/90 active:scale-95"
            >
              Summon your first spirit
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { e: "🐉", n: "Sage", r: "Legendary", c: "text-[#ffe14d] border-[#ffe14d]/40" },
              { e: "🦊", n: "Focus Fox", r: "Rare", c: "text-[#5fd0ff] border-[#5fd0ff]/40" },
              { e: "🌟", n: "Nova", r: "Epic", c: "text-[#a98bff] border-[#a98bff]/40" },
            ].map((s) => (
              <div
                key={s.n}
                className={`rounded-2xl border bg-white/[0.04] p-4 text-center ${s.c}`}
              >
                <div className="text-4xl">{s.e}</div>
                <p className="mt-2 text-sm font-bold text-white">{s.n}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wide ${s.c.split(" ")[0]}`}>
                  {s.r}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h2 className="text-balance font-display text-[2.2rem] font-extrabold leading-[1.05] tracking-tighter2 text-night sm:text-[2.9rem]">
          Set your semester up in about two minutes.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-dusk">
          Paste one module guide and you'll have a plan for the next three months. Everything saves
          to your browser — no sign-up, nothing to cancel.
        </p>
        <button
          onClick={onEnter}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-4 text-base font-bold text-white shadow-brand transition hover:bg-brand-deep active:scale-95"
        >
          Open StudyQuest
          <ArrowRight size={18} />
        </button>
      </section>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-haze sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
              <Sparkles size={14} />
            </div>
            <span className="font-display font-bold text-night">StudyQuest</span>
          </div>
          <p>Built for RP students · Semester 2026-S2</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Section helpers ───────────────────────────────────── */

function Step({
  n,
  title,
  body,
  children,
  flip,
}: {
  n: string;
  title: string;
  body: string;
  children: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className={flip ? "lg:order-2" : ""}>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold text-brand">{n}</span>
          <h3 className="font-display text-2xl font-bold leading-tight tracking-tightish text-night">
            {title}
          </h3>
        </div>
        <p className="mt-3 max-w-md text-[16px] leading-relaxed text-dusk">{body}</p>
      </div>
      <div className={flip ? "lg:order-1" : ""}>{children}</div>
    </div>
  );
}

function FeatureSmall({
  icon,
  tone,
  title,
  body,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      <h3 className="mt-3 font-display text-lg font-bold text-night">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-dusk">{body}</p>
    </div>
  );
}

/* ── Product previews (real UI, rendered as imagery) ───── */

function UpNextPreview() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface">
      <div className="bg-brand-soft/70 px-4 pt-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep">
          <Timer size={11} /> Up next
        </p>
      </div>
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-surface2 px-1.5 py-0.5 font-mono text-[10px] font-medium text-dusk">
            C240
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-haze">CA</span>
        </div>
        <p className="mt-1.5 font-display text-lg font-bold leading-tight text-night">
          CA2: ETL Pipeline Report
        </p>
        <p className="mt-0.5 text-xs font-medium text-dusk">4d left · 25% of grade · 40% done</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full w-[40%] rounded-full bg-grass" />
        </div>
        <div className="mt-3 flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">
            <Timer size={12} /> Start focus session
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-dusk">
            <Check size={12} /> Mark done
          </span>
        </div>
      </div>
    </div>
  );
}

const TL = [1.5, 2.4, 0.8, 3, 2.2, 1.1, 2.8, 1.9, 0.6, 2.5, 3, 1.4, 2.1, 0.9, 2.7, 1.2, 2.9, 1.7];

function TimelinePreview({ light }: { light?: boolean }) {
  const max = Math.max(...TL);
  return (
    <div className={`rounded-xl p-4 ${light ? "border border-line bg-surface shadow-soft" : "bg-surface"}`}>
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold text-night">Semester timeline</p>
        <span className="text-[10px] font-medium text-haze">18 days</span>
      </div>
      <div className="mt-3 flex items-end gap-[3px]">
        {TL.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-3 items-end">
              {(i === 4 || i === 10) && (
                <span className={`h-1.5 w-1.5 rounded-full ${i === 4 ? "bg-berry" : "bg-warm"}`} />
              )}
            </div>
            <div className="flex h-12 w-full items-end overflow-hidden rounded-sm bg-surface2">
              <div
                className={`w-full rounded-sm ${i === 0 ? "bg-brand" : "bg-brand/35"}`}
                style={{ height: `${(h / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-3 text-[9px] font-medium text-haze">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-berry" /> high-priority deadline
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-2 rounded-sm bg-brand/35" /> planned hours
        </span>
      </div>
    </div>
  );
}

function ParserPreview() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
      <div className="rounded-xl border border-line bg-surface2 p-3">
        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-dusk">
{`- Weekly Reflection #10 due 2026-07-25 (5%)
- Dashboard Prototype by 2 Aug 2026, worth 20%
- Final Exam: 12 August 2026, 40% of grade`}
        </pre>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">
          <Wand2 size={12} /> Extract assignments
        </span>
        <span className="text-xs font-medium text-haze">3 found · 92% confidence</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { t: "Weekly Reflection #10", m: "25 Jul · 5%" },
          { t: "Dashboard Prototype", m: "2 Aug · 20%" },
          { t: "Final Exam", m: "12 Aug · 40%" },
        ].map((r) => (
          <div
            key={r.t}
            className="flex items-center gap-2.5 rounded-lg border border-brand/25 bg-brand-soft/40 px-2.5 py-1.5"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-brand text-white">
              <Check size={10} />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-night">{r.t}</span>
            <span className="shrink-0 font-mono text-[10px] text-dusk">{r.m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const WEEKS = [
  { label: "Week of 13 Jul", pct: 28, level: "calm" as const, meta: "2 tasks · 15%" },
  { label: "Week of 20 Jul", pct: 46, level: "busy" as const, meta: "3 tasks · 30%" },
  { label: "Week of 27 Jul", pct: 100, level: "overload" as const, meta: "3 tasks · 75%" },
];
const BAR: Record<string, string> = {
  calm: "bg-grass",
  busy: "bg-warm",
  overload: "bg-berry",
};

function BurnoutPreview() {
  return (
    <div className="mt-5 rounded-xl border border-line bg-surface2 p-4">
      <div className="space-y-2.5">
        {WEEKS.map((w) => (
          <div key={w.label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-dusk">{w.label}</span>
              <span className="font-mono text-haze">{w.meta}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-line">
              <div className={`h-full rounded-full ${BAR[w.level]}`} style={{ width: `${w.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-berry-soft/60 px-2.5 py-2 text-[11px] font-medium text-berry-deep">
        <AlertTriangle size={13} className="mt-px shrink-0" />
        3 deadlines worth 75% land in the week of 27 Jul — start “Sprint 3 Demo” early.
      </p>
    </div>
  );
}

function FocusPreview() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-soft">
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#eae7f4" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#6d49ff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * 0.38}
          />
        </svg>
        <span className="absolute font-mono text-2xl font-bold tabular text-night">15:24</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-night">CA2: ETL Pipeline Report</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-grass-soft px-2.5 py-1 text-grass-deep">+30 XP</span>
        <span className="rounded-full bg-berry-soft px-2.5 py-1 text-berry-deep">+15 💎</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-warm-soft px-2.5 py-1 text-warm-deep">
          <Clock size={11} /> streak kept
        </span>
      </div>
    </div>
  );
}
