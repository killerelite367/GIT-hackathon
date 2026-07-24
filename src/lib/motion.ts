import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Momentum ("buttery") scrolling, wired into GSAP's ticker so ScrollTrigger
 * stays perfectly in sync. Skipped entirely under reduced-motion, where the
 * browser's native scroll is the correct behaviour.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.1,
      // ease-out-expo: fast start, long calm settle
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /*
     * Lenis owns the scroll position, so native anchor jumps (and any
     * scrollIntoView) get overridden on the next frame — in-page links would
     * silently do nothing. Route same-page anchors through Lenis instead.
     */
    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const href = link?.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -16 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);
}

/**
 * Reveal-on-scroll for every `[data-reveal]` inside the container. Elements
 * are visible by default in the DOM and only animated when motion is allowed,
 * so the page can never ship blank if JS or the trigger never fires.
 */
export function useScrollReveals<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      /*
       * `immediateRender: false` is load-bearing: without it gsap.from() would
       * hide every target the moment the tween is created, so any hiccup that
       * stops a trigger from firing (hidden tab, headless render, Lenis
       * desync) ships the section blank. With fromTo + immediateRender:false
       * the content renders normally and the reveal only ever enhances it.
       */
      const FROM = { y: 26, opacity: 0 };
      const TO = { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", immediateRender: false };

      // Grouped reveals: children of [data-reveal-group] stagger together.
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-reveal]");
        if (!items.length) return;
        gsap.fromTo(items, FROM, {
          ...TO,
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: "top 82%", once: true },
        });
      });

      // Standalone reveals.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.closest("[data-reveal-group]")) return;
        gsap.fromTo(el, FROM, {
          ...TO,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // Parallax: [data-parallax="0.15"] drifts as it crosses the viewport.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = parseFloat(el.dataset.parallax || "0.12");
        gsap.to(el, {
          yPercent: -amount * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // Count-up on scroll for [data-count="3.60"].
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseFloat(el.dataset.count || "0");
        const decimals = (el.dataset.count || "").split(".")[1]?.length ?? 0;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = obj.v.toFixed(decimals);
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return scope;
}

/**
 * Line-by-line mask reveal for a heading: each line rises out from behind a
 * clipped wrapper. Expects the heading's lines to already be split into
 * `<span class="line"><span class="line-inner">…</span></span>`.
 */
export function useMaskedHeading<T extends HTMLElement>(delay = 0.1) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const inners = el.querySelectorAll<HTMLElement>(".line-inner");
    if (!inners.length) return;

    // fromTo (not from) so the headline is never left hidden if the tween is
    // interrupted — it starts offset, lands at its natural position.
    const tween = gsap.fromTo(
      inners,
      { yPercent: 115 },
      { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.09, delay }
    );
    return () => {
      tween.kill();
    };
  }, [delay]);

  return ref;
}

/** Subtle magnetic pull toward the cursor — used sparingly, on the main CTA. */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // touch: skip

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.5, ease: "power3.out" });
    };
    const onLeave = () =>
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return ref;
}
