import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ScanLine,
  CalendarRange,
  GraduationCap,
  Layers,
  AlertTriangle,
  Gem,
} from "lucide-react";
import {
  useSmoothScroll,
  useScrollReveals,
  useMaskedHeading,
  useMagnetic,
  useWordScrub,
  useCardGlow,
} from "../lib/motion";
import { initQuestScene, type QuestScene } from "../lib/questScene";
import Logo, { LogoMark } from "../components/Logo";
import "../landing.css";

/**
 * The landing page — a brand surface, not app chrome.
 *
 * A fixed WebGL canvas sits behind the content and a scrubbed timeline flies
 * the StudyQuest mark into a planner board (see lib/questScene). The three
 * beats of that scene are the three real features: the parser filling your
 * semester, the burnout radar catching an overloaded week, and focus sessions
 * paying out crystals.
 *
 * Everything degrades: the copy is plain DOM and visible without JS, the page
 * falls back to a static layout if WebGL never boots, and reduced-motion gets
 * a still scene with no pinning.
 */
export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  useSmoothScroll();
  const scope = useScrollReveals<HTMLDivElement>();
  const headingRef = useMaskedHeading<HTMLHeadingElement>(0.15);
  const ctaRef = useMagnetic<HTMLButtonElement>();
  const statementRef = useWordScrub<HTMLParagraphElement>();
  const bentoRef = useCardGlow<HTMLDivElement>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [no3d, setNo3d] = useState(false);

  useEffect(() => {
    let scene: QuestScene | null = null;
    let cancelled = false;

    // If the scene hasn't booted shortly after mount (no WebGL, old browser,
    // chunk blocked), switch to the static layout so no content stays hidden.
    const fallback = setTimeout(() => {
      if (!cancelled && !scene) setNo3d(true);
    }, 3000);

    const el = canvasRef.current;
    if (el) {
      initQuestScene(el)
        .then((s) => {
          if (cancelled) {
            s.destroy();
            return;
          }
          scene = s;
          clearTimeout(fallback);
        })
        .catch(() => setNo3d(true));
    }

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      scene?.destroy();
    };
  }, []);

  return (
    <div ref={scope} className={`lp ${no3d ? "lp-no3d" : ""}`}>
      <canvas ref={canvasRef} className="lp-canvas" aria-hidden="true" />
      <div className="lp-grain" aria-hidden="true" />

      {/* Floating glass nav */}
      <nav className="lp-nav">
        <a href="#top" className="lp-nav-brand">
          <span className="lp-nav-mark">
            <LogoMark size={17} />
          </span>
          <span>StudyQuest</span>
        </a>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#why">Why us</a>
        </div>
        <button onClick={onEnter} className="lp-nav-cta">
          Open the app
        </button>
      </nav>

      <main id="top" className="lp-main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <header className="lp-hero">
          <p className="lp-eyebrow">AI study planner for poly students</p>
          <h1 ref={headingRef} className="lp-title">
            <span className="line">
              <span className="line-inner">Paste your syllabus.</span>
            </span>
            <span className="line">
              <span className="line-inner">
                Get your semester <em>planned</em>.
              </span>
            </span>
          </h1>
          <p className="lp-sub">
            StudyQuest reads your module guides, pulls out every deadline and weightage, and
            spreads the work across your semester — so you always know what to do next.
          </p>
          <div className="lp-hero-ctas">
            <button ref={ctaRef} onClick={onEnter} className="lp-btn lp-btn-primary">
              Open StudyQuest <ArrowRight size={18} className="lp-arrow" />
            </button>
            <a href="#board" className="lp-btn lp-btn-ghost">
              See how it works
            </a>
          </div>
          <div className="lp-scroll-hint" aria-hidden="true">
            <span className="lp-hint-track">
              <span className="lp-hint-dot" />
            </span>
            <span className="lp-hint-label">Scroll</span>
          </div>
        </header>

        {/* ── Gacha Summoning Section ──────────────────────────── */}
        <section className="lp-gacha-hero">
          <div className="lp-gacha-content">
            <h2 className="lp-gacha-title">Every study session summons a new spirit</h2>
            <p className="lp-gacha-desc">
              Finish your focus session → Earn Focus Crystals → Summon a Study Spirit. No pay-to-win.
              Every summon is a real study achievement.
            </p>
          </div>

          <div className="lp-summon-showcase">
            <style>{`
              @keyframes summon-pop {
                0% { transform: scale(0) rotate(-180deg); opacity: 0; }
                60% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes glow {
                0%, 100% { filter: drop-shadow(0 0 10px #00ff41); }
                50% { filter: drop-shadow(0 0 20px #00ff41) drop-shadow(0 0 30px #00ff41); }
              }
              .spirit-item {
                animation: summon-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
              }
              .spirit-item:nth-child(1) { animation-delay: 0.2s; }
              .spirit-item:nth-child(2) { animation-delay: 0.4s; }
              .spirit-item:nth-child(3) { animation-delay: 0.6s; }
              .spirit-item:nth-child(4) { animation-delay: 0.8s; }
              .spirit-item:nth-child(5) { animation-delay: 1s; }
              .spirit-item:nth-child(6) { animation-delay: 1.2s; }
            `}</style>
            <div className="lp-spirit-grid">
              {['🍓', '🫐', '🍇', '🍑', '🥭', '🍋'].map((emoji, i) => (
                <div key={i} className="spirit-item" style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 15px #00ff41)' }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pinned 3D board scene ────────────────────────────── */}
        <section className="board-scene" id="board" aria-label="How StudyQuest plans your semester">
          <div className="board-pin">
            <div className="caption-stack">
              <div className="scene-caption">
                <h2>Paste it once. It plans the rest.</h2>
                <p>
                  Every deadline, weightage and submission in your module guide — read, ranked, and
                  dropped onto your semester without you typing a thing.
                </p>
              </div>
              <div className="scene-caption">
                <h2>
                  It sees the crunch <em>before</em> you do.
                </h2>
                <p>
                  Three deadlines landing in the same week? The burnout radar flags it early and
                  tells you which one to start now.
                </p>
              </div>
              <div className="scene-caption">
                <h2>Study time that pays you back.</h2>
                <p>
                  Real focus sessions become XP and Focus Crystals — the only way to summon Study
                  Spirits. You can't buy your way in.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features bento ───────────────────────────────────── */}
        <section className="lp-sheet lp-features" id="features">
          <h2 className="lp-section-title">
            Everything a study planner
            <br />
            should have done years ago.
          </h2>
          <div ref={bentoRef} className="lp-bento" data-reveal-group>
            <article className="lp-card lp-card-wide" data-reveal>
              <div className="lp-card-icon">
                <ScanLine size={24} />
              </div>
              <h3>Scan any document</h3>
              <p>
                Photograph a module guide, an assignment brief, even a results slip. The AI reads
                the dates, weightages and scores and fills everything in — no typing, no squinting
                at a PDF on your phone.
              </p>
              <span className="lp-card-tag">Photo → planned semester in seconds</span>
            </article>

            <article className="lp-card" data-reveal>
              <div className="lp-card-icon lp-icon-sky">
                <CalendarRange size={24} />
              </div>
              <h3>Auto-scheduled</h3>
              <p>
                Each assignment's effort is spread backward from its deadline into daily blocks —
                and reflows when you fall behind.
              </p>
            </article>

            <article className="lp-card" data-reveal>
              <div className="lp-card-icon lp-icon-grass">
                <GraduationCap size={24} />
              </div>
              <h3>Live GPA</h3>
              <p>
                Credit-weighted on the poly 0–4 scale, updating as you type. Plus: "what do I need
                to hit 3.7?"
              </p>
            </article>

            <article className="lp-card lp-card-wide" data-reveal>
              <div className="lp-card-icon lp-icon-warm">
                <Layers size={24} />
              </div>
              <h3>Notes, flashcards &amp; quizzes</h3>
              <p>
                Paste a chapter or upload a handout and get summarized notes, key terms, a
                flashcard deck and a multiple-choice quiz — generated in one pass, so they all
                describe the same material instead of drifting apart.
              </p>
              <span className="lp-card-tag">Notes · terms · cards · quiz</span>
            </article>
          </div>
        </section>

        {/* ── Word-scrub statement ─────────────────────────────── */}
        <section className="lp-sheet lp-statement" id="why">
          <p ref={statementRef} className="lp-statement-text">
            Most planners make you type in every deadline yourself — which is exactly why most
            planners end up <b>empty</b>. StudyQuest reads the module guide and does it <b>for you</b>.
            That's the whole point.
          </p>
        </section>

        {/* ── Stacking steps ───────────────────────────────────── */}
        <section className="lp-sheet lp-steps" id="how">
          <h2 className="lp-section-title">Three steps. That's the setup.</h2>
          <div className="lp-step-stack">
            <article className="lp-step" style={{ ["--i" as string]: 0 }}>
              <span className="lp-step-num">1</span>
              <div className="lp-step-body">
                <h3>Scan or paste your syllabus</h3>
                <p>
                  Snap a photo of your module guide, or paste the text. StudyQuest extracts every
                  assessment, its weightage and its deadline.
                </p>
              </div>
              <div className="lp-step-art lp-art-scan" aria-hidden="true">
                <ScanLine size={30} />
              </div>
            </article>
            <article className="lp-step" style={{ ["--i" as string]: 1 }}>
              <span className="lp-step-num">2</span>
              <div className="lp-step-body">
                <h3>It plans your whole semester</h3>
                <p>
                  Work is spread into daily study blocks, quests are ranked by urgency × weight, and
                  overloaded weeks get flagged before they land.
                </p>
              </div>
              <div className="lp-step-art lp-art-plan" aria-hidden="true">
                <AlertTriangle size={30} />
              </div>
            </article>
            <article className="lp-step" style={{ ["--i" as string]: 2 }}>
              <span className="lp-step-num">3</span>
              <div className="lp-step-body">
                <h3>Study, and get rewarded</h3>
                <p>
                  Run a focus session, watch the progress move, and turn real study minutes into XP,
                  streaks and Focus Crystals.
                </p>
              </div>
              <div className="lp-step-art lp-art-reward" aria-hidden="true">
                <Gem size={30} />
              </div>
            </article>
          </div>
        </section>

        {/* ── Marquee ──────────────────────────────────────────── */}
        <div className="lp-marquee" aria-hidden="true">
          <div className="lp-marquee-track">
            {[0, 1].map((dup) => (
              <span key={dup} className="lp-marquee-run">
                <span>Free forever</span><i />
                <span>No account needed</span><i />
                <span>Works offline</span><i />
                <span>Auto-scheduled</span><i />
                <span>Flashcards &amp; quizzes</span><i />
                <span>Live GPA</span><i />
                <span>Built for RP students</span><i />
              </span>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="lp-sheet lp-cta cta-band">
          <h2 className="lp-cta-title" data-reveal>
            Your semester is already
            <br />
            planned. Go look.
          </h2>
          <p className="lp-cta-sub" data-reveal>
            Free, works offline, and nothing to sign up for.
          </p>
          <button onClick={onEnter} className="lp-btn lp-btn-primary lp-btn-xl" data-reveal>
            Open StudyQuest <ArrowRight size={20} className="lp-arrow" />
          </button>
        </section>

        <footer className="lp-footer">
          <Logo size="sm" />
          <p>A C240 project · Republic Polytechnic · Semester 2026-S2</p>
        </footer>
      </main>
    </div>
  );
}
