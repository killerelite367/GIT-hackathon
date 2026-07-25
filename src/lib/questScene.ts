import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
/*
 * Types only — this is erased at compile time, so it does NOT pull three into
 * the main bundle. The runtime copy comes from the dynamic import below.
 */
import type * as ThreeNS from "three";

gsap.registerPlugin(ScrollTrigger);

/**
 * The landing page's 3D act.
 *
 * A fixed WebGL canvas sits behind the DOM; one scrubbed GSAP timeline flies
 * the StudyQuest mark from the hero into a planner board deep in the scene,
 * then plays three beats that mirror the three real features — the parser
 * filling the board, the burnout radar flagging an overloaded week, and a
 * focus session paying out a crystal.
 *
 * Design decisions worth knowing:
 *
 * - `three` is imported dynamically. It is ~600kB and only the landing route
 *   needs it; a static import would put it in the main bundle and slow the app
 *   down for everyone who never sees this page.
 * - ONE timeline owns the camera and the mark. Two scrubbed timelines writing
 *   the same objects resolve in nondeterministic order when the page is loaded
 *   mid-scroll or refreshed, which shows up as the mark snapping to a wrong
 *   position on reload.
 * - Colours are read from the live CSS variables, so the scene matches whichever
 *   theme is active instead of hardcoding the dark palette.
 */

export interface QuestScene {
  destroy: () => void;
}

/** Read a themed token from :root as a hex number Three can use. */
function readToken(name: string, fallback: number): number {
  if (typeof getComputedStyle !== "function") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/[\s,]+/).map(Number);
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return fallback;
  return (parts[0] << 16) | (parts[1] << 8) | parts[2];
}

export async function initQuestScene(canvas: HTMLCanvasElement): Promise<QuestScene> {
  const THREE = await import("three");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  const C = {
    canvas: readToken("--c-canvas", 0x131319),
    surface: readToken("--c-surface", 0x1c1c26),
    brand: readToken("--c-brand", 0x8f74ff),
    grass: readToken("--c-grass", 0x2fbe85),
    warm: readToken("--c-warm", 0xf2b452),
    berry: readToken("--c-berry", 0xf2687d),
    sky: readToken("--c-sky", 0x5aa7ef),
    night: readToken("--c-night", 0xecebf3),
  };

  // ── renderer / scene / camera ──────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.canvas);
  scene.fog = new THREE.Fog(C.canvas, 11, 30);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 120);
  const camRig = new THREE.Group();
  camRig.add(camera);
  scene.add(camRig);
  camRig.position.set(0, 0.4, 7);
  const lookTarget = new THREE.Vector3(0, 0.2, 0);

  // ── lights ─────────────────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0xffffff, C.surface, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(C.brand, 0.85);
  rim.position.set(-6, 2, -4);
  scene.add(rim);
  const rewardGlow = new THREE.PointLight(C.brand, 0, 16, 2);
  scene.add(rewardGlow);

  const mat = (color: number, opts: Record<string, unknown> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.08, ...opts });
  const matBrand = mat(C.brand);
  const matSurface = mat(C.surface, { roughness: 0.65 });
  const matPaper = mat(C.night, { roughness: 0.8 });
  const matGrass = mat(C.grass);
  const matWarm = mat(C.warm);
  const matSky = mat(C.sky);

  // ── the StudyQuest mark in 3D: a Q whose tail is a check ───────────────
  function buildMark(scale = 1) {
    const g = new THREE.Group();
    // Ring with a gap at the lower right — TorusGeometry's `arc` argument gives
    // us the same 301° sweep the 2D logo uses.
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.86, 0.17, 20, 80, Math.PI * 1.67),
      matBrand
    );
    ring.rotation.z = -Math.PI * 0.28;
    g.add(ring);
    // The tail, as two capsules meeting at a knee.
    const seg = (len: number, rot: number, x: number, y: number) => {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, len, 8, 20), matBrand);
      m.rotation.z = rot;
      m.position.set(x, y, 0);
      return m;
    };
    g.add(seg(0.34, Math.PI * 0.24, 0.28, -0.66));
    g.add(seg(0.78, -Math.PI * 0.34, 0.86, -0.3));
    g.scale.setScalar(scale);
    return g;
  }

  const markGroup = new THREE.Group(); // scroll-driven
  const markMesh = buildMark(); // idle bob/spin
  markGroup.add(markMesh);

  /*
   * Hero placement. The headline is centred and fills the middle of the
   * viewport, so a centred mark collides with the text and the CTAs. On wide
   * screens it floats out into the right margin beside the headline; anything
   * narrower keeps it low-centre and smaller, clear of the stacked buttons.
   */
  const floatsRight = () => window.innerWidth >= 1000;
  const aspect = () => window.innerWidth / window.innerHeight;
  const homeX = () => (floatsRight() ? Math.min(3.1, Math.max(1.9, 1.45 * aspect())) : 0);
  const homeY = () => (floatsRight() ? 0.1 : -1.45);
  const baseScale = () =>
    floatsRight() ? Math.min(0.78, Math.max(0.58, window.innerWidth / 2300)) : 0.5;
  markGroup.position.set(homeX(), homeY(), 0.6);
  markGroup.scale.setScalar(baseScale());
  scene.add(markGroup);

  // ── ambient drift: little task cards + focus crystals ──────────────────
  const minis: ThreeNS.Object3D[] = [];
  const miniGroup = new THREE.Group();
  {
    const spots: [number, number, number][] = [
      [-3.6, 1.7, -2.5], [3.7, 2.4, -3.5], [-3.7, -2.0, -2.8],
      [4.1, -1.8, -2.4], [-4.4, 0.4, -4.5], [-2.9, 2.7, -2.2],
    ];
    spots.forEach((p, i) => {
      let m: ThreeNS.Mesh;
      if (i % 2 === 0) {
        // a crystal (Focus Crystals are a real currency in the app)
        m = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), matBrand);
      } else {
        // a task card
        m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.03), matSurface);
      }
      m.position.set(...p);
      m.userData.phase = Math.random() * Math.PI * 2;
      m.userData.speed = 0.4 + Math.random() * 0.5;
      miniGroup.add(m);
      minis.push(m);
    });
  }
  scene.add(miniGroup);

  // ── the planner board, deep in the scene ───────────────────────────────
  const BOARD_Z = -30;
  const board = new THREE.Group();
  board.position.set(0, 0.85, BOARD_Z);
  scene.add(board);

  const BW = 5.6, BH = 3.6, BT = 0.14;
  {
    const backing = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, 0.1), matSurface);
    backing.position.z = -0.06;
    board.add(backing);
    const frame: [number, number, number, number, number][] = [
      [BW, BT, 0, BH / 2, 0], [BW, BT, 0, -BH / 2, 0],
      [BT, BH, -BW / 2, 0, 0], [BT, BH, BW / 2, 0, 0],
    ];
    frame.forEach(([w, h, x, y, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.18), matBrand);
      m.position.set(x, y, z);
      board.add(m);
    });
    // faint week columns, so the board reads as a semester grid
    for (let i = 1; i < 5; i++) {
      const div = new THREE.Mesh(new THREE.BoxGeometry(0.02, BH - BT * 2, 0.02), matPaper);
      div.position.set(-BW / 2 + (BW / 5) * i, 0, 0.02);
      board.add(div);
    }
  }

  /* Task cards that fly in during stage 1, laid out on the week grid. */
  const cards: ThreeNS.Mesh[] = [];
  let crunchCard: ThreeNS.Mesh;
  let crunchHalo: ThreeNS.Mesh;
  {
    const colX = (c: number) => -BW / 2 + (BW / 5) * (c + 0.5);
    const rowY = [0.95, 0.1, -0.75];
    const tone = [matBrand, matSky, matGrass, matWarm, matBrand];
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 3; r++) {
        // leave a couple of gaps so it reads as a real week, not a filled grid
        if ((c === 1 && r === 2) || (c === 4 && r === 1)) continue;
        const card = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.05), tone[c]);
        card.position.set(colX(c), rowY[r], 0.1);
        card.scale.setScalar(0.001);
        board.add(card);
        cards.push(card);
        if (c === 3 && r === 0) crunchCard = card;
      }
    }
    // amber halo for the overloaded-week beat
    crunchHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.035, 12, 48),
      new THREE.MeshBasicMaterial({ color: C.warm, transparent: true, opacity: 0, depthWrite: false })
    );
    crunchHalo.position.copy(crunchCard!.position);
    crunchHalo.position.z += 0.12;
    board.add(crunchHalo);
  }

  /* The reward crystal that rises in stage 3. */
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.34),
    mat(C.brand, { roughness: 0.15, metalness: 0.35 })
  );
  crystal.position.set(0, -0.9, 0.5);
  crystal.scale.setScalar(0.001);
  board.add(crystal);
  rewardGlow.position.set(0, 0.85, BOARD_Z + 2);

  /*
   * Keep the camera inside crisp fog range on every screen. Rather than backing
   * the camera off to fit a narrow viewport (which buries the board in fog),
   * shrink the board itself.
   */
  const camTanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  const SCALE = THREE.MathUtils.clamp((11 * camTanH - 0.4) / 2.6, 0.5, 1);
  board.scale.setScalar(SCALE);
  const bwy = (ly: number) => 0.85 + ly * SCALE;
  const bwz = (lz: number) => BOARD_Z + lz * SCALE;
  const fitDist = () => Math.max(8.5, (2.6 * SCALE + 0.4) / camTanH);

  // ── scroll choreography ────────────────────────────────────────────────
  let mainTl: gsap.core.Timeline | null = null;

  const ctx = gsap.context(() => {
    if (reduceMotion) return;

    const dist = fitDist();
    const zApproach = BOARD_Z + dist;
    const zClose = BOARD_Z + dist * 0.82;

    const caps = gsap.utils.toArray<HTMLElement>(".scene-caption");
    const K = 3.4; // the approach occupies timeline 0..K

    mainTl = gsap
      .timeline({
        scrollTrigger: {
          trigger: ".board-scene",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
        },
        defaults: { ease: "none" },
      })
      /* approach — the mark flies toward the board, camera follows */
      .to(markGroup.position, { x: 0, y: bwy(0.4), z: bwz(2.4), duration: K, ease: "power2.in" }, 0)
      .to(markGroup.scale, { x: 0.3 * SCALE, y: 0.3 * SCALE, z: 0.3 * SCALE, duration: K, ease: "power2.in" }, 0)
      .to(camRig.position, { z: zApproach, y: 0.7, duration: K, ease: "power1.inOut" }, 0)
      .to(lookTarget, { z: BOARD_Z, y: 0.85, duration: K, ease: "power1.inOut" }, 0)
      .to(miniGroup.position, { z: -6, duration: K }, 0)

      /* stage 1 — the parser fills the board */
      .to(caps[0], { opacity: 1, duration: 0.4 }, K + 0.2)
      .to(
        cards.map((c) => c.scale),
        { x: 1, y: 1, z: 1, ease: "back.out(2.1)", duration: 0.5, stagger: 0.055 },
        K + 0.5
      )
      .to(markGroup.position, { y: bwy(1.55), z: bwz(0.9), duration: 0.8, ease: "power1.inOut" }, K + 1.9)
      .to(markGroup.scale, { x: 0.2 * SCALE, y: 0.2 * SCALE, z: 0.2 * SCALE, duration: 0.8 }, K + 1.9)
      .to(caps[0], { opacity: 0, duration: 0.4 }, K + 2.7)

      /* stage 2 — burnout radar flags an overloaded week */
      .to(camRig.position, { z: zClose, x: 0.35, duration: 2.4, ease: "power1.inOut" }, K + 2.7)
      .to(caps[1], { opacity: 1, duration: 0.4 }, K + 3.3)
      .to(crunchHalo.material, { opacity: 0.9, duration: 0.4 }, K + 3.4)
      .to(crunchHalo.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 3 }, K + 3.4)
      .to(crunchCard!.rotation, { z: 0.08, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 5 }, K + 3.6)
      .to(crunchCard!.rotation, { z: 0, duration: 0.2 }, K + 5.0)
      .to(crunchHalo.material, { opacity: 0, duration: 0.4 }, K + 5.4)
      .to(caps[1], { opacity: 0, duration: 0.4 }, K + 5.7)

      /* stage 3 — a focus session pays out */
      .to(camRig.position, { x: -0.5, z: zClose + 0.5, duration: 2.2, ease: "power1.inOut" }, K + 5.9)
      .to(caps[2], { opacity: 1, duration: 0.4 }, K + 6.3)
      .to(crystal.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(2)" }, K + 6.1)
      .to(crystal.position, { y: 0.25, duration: 1.1, ease: "power2.out" }, K + 6.1)
      .to(rewardGlow, { intensity: 2.6, duration: 0.7 }, K + 6.3)
      .to(rewardGlow, { intensity: 0.6, duration: 0.9 }, K + 8.0)
      /*
       * Hold the last caption and the board on screen to the end of the pinned
       * scroll. Pulling the camera back here would leave a screen of empty
       * space before the next section arrives; instead the Features sheet
       * simply scrolls up and covers the canvas like a curtain.
       */
      .to(caps[2], { opacity: 0, duration: 0.4 }, K + 12.6);

    /* finale — the mark returns centre stage behind the CTA */
    gsap
      .timeline({
        scrollTrigger: { trigger: ".cta-band", start: "top 85%", end: "center 45%", scrub: 1 },
      })
      .to(markGroup.position, { x: 0, y: -1.0, z: 1.5, ease: "power2.out" }, 0)
      .to(markGroup.scale, { x: 0.9, y: 0.9, z: 0.9, ease: "power2.out" }, 0);
  });

  // ── mouse parallax + render loop ───────────────────────────────────────
  const mouse = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!isTouch && !reduceMotion) window.addEventListener("pointermove", onPointer);

  /*
   * Debug handle for automated verification. The choreography is scroll-scrubbed,
   * which can't be driven in a headless/hidden tab (rAF is paused there, so the
   * smooth-scroll layer never advances). Exposing the timeline lets a test scrub
   * it directly and assert the camera and objects actually move.
   */
  (window as unknown as Record<string, unknown>).__sqScene = {
    camRig, markGroup, board, cards, crystal, crunchHalo, lookTarget,
    get timeline() {
      return mainTl;
    },
  };

  const clock = new THREE.Clock();
  let frame = 0;
  const render = () => {
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      markMesh.rotation.y = t * 0.5;
      markMesh.rotation.x = Math.sin(t * 0.4) * 0.16;
      markMesh.position.y = Math.sin(t * 1.1) * 0.11;
      crystal.rotation.y = t * 0.9;
      minis.forEach((m) => {
        m.position.y += Math.sin(t * m.userData.speed + m.userData.phase) * 0.0022;
        m.rotation.y = t * 0.3 + m.userData.phase;
      });
    }
    camera.position.x += (mouse.x * 0.42 - camera.position.x) * 0.045;
    camera.position.y += (-mouse.y * 0.24 - camera.position.y) * 0.045;
    camera.lookAt(lookTarget);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  render();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Only re-home the mark while the hero is still on screen; mid-scroll the
    // timeline owns its position and writing to it here would fight the scrub.
    if (window.scrollY < window.innerHeight * 0.5) {
      markGroup.scale.setScalar(baseScale());
      markGroup.position.x = homeX();
      markGroup.position.y = homeY();
    }
  };
  window.addEventListener("resize", onResize);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      ctx.revert(); // kills the ScrollTriggers this scene created
      scene.traverse((o) => {
        const m = o as ThreeNS.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mm = m.material as ThreeNS.Material | ThreeNS.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
        else mm?.dispose();
      });
      renderer.dispose();
    },
  };
}
