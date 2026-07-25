import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Gacha-themed landing page animation
 * As you scroll, spirits get pulled and appear on screen with glowing effects
 */

export interface GachaLandingScene {
  destroy: () => void;
}

export function initGachaLandingScene(): GachaLandingScene {
  const spiritContainer = document.querySelector(".spirits-container") as HTMLElement;
  if (!spiritContainer) return { destroy: () => {} };

  // Spirit emoji data
  const spirits = ["🍓", "🫐", "🍇", "🍑", "🥭", "🍋", "🍃"];
  const spiritElements: HTMLElement[] = [];

  // Create spirit elements
  spirits.forEach((emoji, idx) => {
    const spirit = document.createElement("div");
    spirit.className = "spirit-orb";
    spirit.textContent = emoji;
    spirit.style.cssText = `
      position: absolute;
      font-size: 2rem;
      filter: drop-shadow(0 0 10px #00ff41);
      opacity: 0;
      transform: scale(0) rotate(0deg);
      pointer-events: none;
    `;
    spiritContainer.appendChild(spirit);
    spiritElements.push(spirit);
  });

  // Scroll-triggered summon animations
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".gacha-hero",
      start: "top center",
      end: "bottom center",
      scrub: 1,
    },
  });

  spiritElements.forEach((el, idx) => {
    const startX = Math.random() * 100 - 50;
    const startY = Math.random() * 100 - 50;
    const endX = (idx - spirits.length / 2) * 60;
    const endY = Math.sin(idx) * 40;

    timeline.to(
      el,
      {
        opacity: 1,
        scale: 1,
        x: endX,
        y: endY,
        rotation: 360,
        duration: 1.5,
        ease: "elastic.out(0.8)",
      },
      idx * 0.15
    );
  });

  // Particle effects on scroll
  const createSummonEffect = () => {
    const particles = document.querySelectorAll(".summon-particle");
    particles.forEach((p) => {
      const particle = p as HTMLElement;
      particle.style.cssText = `
        position: fixed;
        pointer-events: none;
        font-size: 1rem;
        animation: summon-burst 1s ease-out forwards;
      `;
    });
  };

  // Add CSS for animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes summon-burst {
      0% {
        opacity: 1;
        transform: translate(0, 0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(var(--tx), var(--ty)) scale(0);
      }
    }

    @keyframes glow-pulse {
      0%, 100% {
        filter: drop-shadow(0 0 8px #00ff41);
      }
      50% {
        filter: drop-shadow(0 0 20px #00ff41) drop-shadow(0 0 10px #00ff41);
      }
    }

    .spirit-orb {
      animation: glow-pulse 2s ease-in-out infinite !important;
    }
  `;
  document.head.appendChild(style);

  return {
    destroy() {
      timeline.kill();
      spiritElements.forEach((el) => el.remove());
      style.remove();
    },
  };
}
