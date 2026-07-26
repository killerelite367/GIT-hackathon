import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
/*
 * Types only — erased at compile time, so it does NOT pull three into the main
 * bundle. The runtime copy comes from the dynamic import inside initQuestScene.
 */
import type * as ThreeNS from "three";

gsap.registerPlugin(ScrollTrigger);

/**
 * The landing page's 3D act — "The Study Loop".
 *
 * Scrolling replays the loop the app actually puts a student through, and ends
 * on the thing only StudyQuest has: a Study Spirit summon.
 *
 *   1. CHAOS   a drift of unread textbooks orbiting the headline
 *   2. ORDER   they close ranks into a planned semester — a shelf of modules
 *   3. FOCUS   books complete, glow, and dissolve into motes feeding a crystal
 *   4. SUMMON  the crystal charges, cracks open, and a Spirit hatches out
 *
 * The Spirit is the real one from the gacha: "Matcha Layer Cake Thesis"
 * (legendary), built to the same recipe the 2D SpiritArt uses — notebook body,
 * lighter belly panel, darker trim, and the legendary crown.
 *
 * Architecture: the scroll timeline does NOT tween ~60 objects. It scrubs a
 * handful of scalars on `S` and one derive step computes every transform from
 * them. The scrub stays cheap, the scene is a pure function of a few numbers,
 * and a mid-page refresh can't leave objects half-tweened.
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

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Map x from [a,b] to [0,1], clamped. Slices one scalar into phases. */
const range = (x: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (x - a) / (b - a)));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function initQuestScene(canvas: HTMLCanvasElement): Promise<QuestScene> {
  const THREE = await import("three");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  const C = {
    canvas: readToken("--c-canvas", 0x131319),
    surface: readToken("--c-surface", 0x1c1c26),
    line: readToken("--c-line", 0x2c2c3a),
    brand: readToken("--c-brand", 0x8f74ff),
    grass: readToken("--c-grass", 0x2fbe85),
    warm: readToken("--c-warm", 0xf2b452),
    berry: readToken("--c-berry", 0xf2687d),
    sky: readToken("--c-sky", 0x5aa7ef),
    night: readToken("--c-night", 0xecebf3),
  };

  // ── renderer / scene / camera ──────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.canvas);
  scene.fog = new THREE.Fog(C.canvas, 10, 34);

  const FOV = 42;

  /*
   * ── Fitting a wide scene onto a narrow screen ──
   *
   * FOV is VERTICAL, so the horizontal field collapses with the aspect ratio:
   * a 16:10 laptop sees ~62° across, a portrait phone barely 20°. Everything
   * was framed for the wide case, so on a phone the crystal, shell, spirit and
   * orbiters all overflowed the narrow view at once and read as one clump.
   *
   * `FIT` scales how far the camera sits from the action. It's capped at 1.9:
   * fitting portrait exactly would need ~3.4x, which pushes the summon past
   * the fog line (10 units) and shrinks it to a speck. Past the cap the shelf
   * layout below reflows instead of the camera retreating further.
   */
  const startAspect = window.innerWidth / window.innerHeight;
  const FIT = Math.min(1.9, Math.max(1, 1.55 / startAspect));
  const PORTRAIT = startAspect < 0.85;

  /** Camera z that sits `d` in front of the action (which lives around z=-3). */
  const camZ = (d: number) => -3 + d * FIT;

  const CAM_Z = camZ(11.5);
  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 100);
  const camRig = new THREE.Group();
  camRig.add(camera);
  scene.add(camRig);
  camRig.position.set(0, 0.3, CAM_Z);
  const lookTarget = new THREE.Vector3(0, 0.1, -2);

  // ── lights ─────────────────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0xffffff, C.surface, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(C.brand, 0.85);
  rim.position.set(-6, 2, -4);
  scene.add(rim);
  /** Drives the summon: dim while studying, blinding at the break. */
  const summonLight = new THREE.PointLight(C.warm, 0, 24, 2);
  summonLight.position.set(0, 0.25, -3);
  scene.add(summonLight);

  const std = (color: number, opts: Record<string, unknown> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.04, ...opts });

  /* Scene state — the timeline only ever scrubs these. */
  const S = {
    formation: 0, // 0 = books drifting, 1 = shelved into a semester
    harvest: 0, // books completing → motes streaming into the crystal
    charge: 0, // crystal swelling before the break
    burst: 0, // the crack, shockwave and flash
    spirit: 0, // the Spirit hatching and settling
    drift: 1, // ambient float, damped once things get serious
  };

  /*
   * ── Keeping books off the headline ──
   *
   * The hero copy is centred and fills the middle of the screen, so books
   * placed by world position alone end up scattered straight across it (and
   * perspective makes it worse: something far back at x=4 still projects near
   * the centre). Instead we choose each book's position in NORMALISED SCREEN
   * space, reject anything landing inside the text box, and convert back to
   * world coordinates at its own depth. That keeps the corridor clear at any
   * aspect ratio, and it can be recomputed on resize.
   */
  /*
   * The corridor is MEASURED from the live DOM, not hardcoded. Fixed constants
   * tuned on a 16:10 desktop were far too small in portrait, where the headline
   * wraps to more lines and spans nearly the full width — books landed straight
   * across it on a phone. Reading the real rects means the corridor is correct
   * at any viewport, and it is recomputed on resize.
   */
  let SAFE_X = 0.88;
  let SAFE_Y = 0.76;
  let SPREAD_X = 1.5;
  let SPREAD_Y = 1.32;

  function measureCorridor() {
    const parts = [".lp-eyebrow", ".lp-title", ".lp-sub", ".lp-hero-ctas"];
    let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
    for (const sel of parts) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const q = el.getBoundingClientRect();
      if (!q.width || !q.height) continue;
      l = Math.min(l, q.left);
      r = Math.max(r, q.right);
      t = Math.min(t, q.top);
      b = Math.max(b, q.bottom);
    }
    if (!Number.isFinite(l)) return; // hero not laid out yet — keep defaults
    const W = window.innerWidth, H = window.innerHeight;
    const nx = Math.max(Math.abs((l / W) * 2 - 1), Math.abs((r / W) * 2 - 1));
    const ny = Math.max(Math.abs(1 - (t / H) * 2), Math.abs(1 - (b / H) * 2));
    SAFE_X = Math.min(nx + 0.14, 1.5); // margin for a book's own footprint
    SAFE_Y = Math.min(ny + 0.14, 1.5);
    // Always leave a usable band outside the corridor to sample from.
    SPREAD_X = SAFE_X + 0.62;
    SPREAD_Y = SAFE_Y + 0.62;
  }
  measureCorridor();

  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

  /** Normalised screen coords (-1..1) → world position at depth z. */
  function screenToWorld(sx: number, sy: number, z: number, out: ThreeNS.Vector3) {
    const halfH = tanHalfFov * (CAM_Z - z);
    return out.set(sx * halfH * camera.aspect, sy * halfH, z);
  }

  /** Half-extent of a book on screen, in half-height units, at depth z. */
  const bookScreenRadius = (z: number) => 0.55 / (tanHalfFov * (CAM_Z - z));

  /*
   * Place a book: outside the text corridor AND clear of every book already
   * placed. Avoiding the text alone still let them pile on top of each other,
   * which read as clutter. Distances are measured in half-height units so the
   * x axis is scaled by the aspect ratio and the check stays circular.
   */
  const placed: { sx: number; sy: number; r: number }[] = [];
  function safeScreenPoint(z: number): { sx: number; sy: number } {
    const r = bookScreenRadius(z);
    let best = { sx: SPREAD_X * 0.9, sy: SPREAD_Y * 0.8 };
    let bestGap = -Infinity;
    for (let i = 0; i < 200; i++) {
      const sx = (Math.random() * 2 - 1) * SPREAD_X;
      const sy = (Math.random() * 2 - 1) * SPREAD_Y;
      if (Math.abs(sx) <= SAFE_X && Math.abs(sy) <= SAFE_Y) continue; // over the copy

      // gap to the nearest already-placed book (negative = overlapping)
      let gap = Infinity;
      for (const p of placed) {
        const dx = (sx - p.sx) * camera.aspect;
        const dy = sy - p.sy;
        gap = Math.min(gap, Math.hypot(dx, dy) - (r + p.r));
      }
      if (gap > 0.06) {
        placed.push({ sx, sy, r });
        return { sx, sy };
      }
      // keep the roomiest candidate in case nothing fully clears
      if (gap > bestGap) {
        bestGap = gap;
        best = { sx, sy };
      }
    }
    placed.push({ ...best, r });
    return best;
  }

  // ── ACT 1: drifting textbooks ──────────────────────────────────────────
  /**
   * A real book: hard cover, visible page block, and a rounded spine — so it
   * reads as a textbook rather than a flat sheet of confetti.
   */
  function buildBook(cover: number) {
    const g = new THREE.Group();
    const W = 0.66, H = 0.88, D = 0.16;

    const coverMat = std(cover, { roughness: 0.5 });
    const front = new THREE.Mesh(new THREE.BoxGeometry(W, H, D * 0.28), coverMat);
    front.position.z = D * 0.36;
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, D * 0.28), coverMat);
    back.position.z = -D * 0.36;

    // page block, inset so a white sliver shows on three edges
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(W * 0.94, H * 0.93, D * 0.5),
      std(0xfdfdfa, { roughness: 0.95 })
    );
    pages.position.x = W * 0.02;

    // rounded spine down the left edge
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(D / 2, D / 2, H, 14, 1, false, 0, Math.PI),
      coverMat
    );
    spine.rotation.z = Math.PI / 2;
    spine.rotation.y = Math.PI / 2;
    spine.position.x = -W / 2;

    g.add(back, pages, front, spine);
    return g;
  }

  const BOOK_COUNT = 18;
  const bookTones = [C.brand, C.sky, C.grass, C.warm, C.berry];
  const books: {
    group: ThreeNS.Group;
    screen: { sx: number; sy: number };
    depth: number;
    home: ThreeNS.Vector3;
    slot: ThreeNS.Vector3;
    spin: ThreeNS.Vector3;
    homeRot: ThreeNS.Euler;
    slotRot: ThreeNS.Euler;
    done: number;
  }[] = [];

  /** How much of `harvest` one book's flare / one mote's flight occupies. */
  const BOOK_WINDOW = 0.2;
  const MOTE_WINDOW = 0.3;

  {
    for (let i = 0; i < BOOK_COUNT; i++) {
      const group = buildBook(bookTones[i % bookTones.length]);
      const depth = -1.5 - Math.random() * 7.5;
      const screen = safeScreenPoint(depth);
      const home = screenToWorld(screen.sx, screen.sy, depth, new THREE.Vector3());

      // slot: a tidy two-row shelf, the planned semester
      /*
       * The shelf reflows for portrait. A 2-row shelf spanning ±4.9 needs a
       * very wide view; on a phone it either overflows the sides or forces the
       * camera so far back the books become specks. Narrow and tall fits a
       * portrait screen the way a phone layout should.
       */
      const rows = PORTRAIT ? 5 : 2;
      const halfWidth = PORTRAIT ? 1.75 : 4.0;
      const rowGap = PORTRAIT ? 0.62 : 1.15;
      const topRow = PORTRAIT ? 1.35 : 0.72;
      const perRow = Math.ceil(BOOK_COUNT / rows);
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const t = perRow > 1 ? col / (perRow - 1) : 0.5;
      const slot = new THREE.Vector3(
        lerp(-halfWidth, halfWidth, t),
        topRow - row * rowGap,
        -2.6 - Math.sin(t * Math.PI) * (PORTRAIT ? 0.6 : 1.6)
      );

      group.position.copy(home);
      const homeRot = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 1.2
      );
      group.rotation.copy(homeRot);
      scene.add(group);

      books.push({
        group,
        screen,
        depth,
        home,
        slot,
        // gentler than before — the old spin read as tumbling debris
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.22,
          (Math.random() - 0.5) * 0.26,
          (Math.random() - 0.5) * 0.16
        ),
        homeRot,
        slotRot: new THREE.Euler(0, lerp(0.3, -0.3, t), 0),
        done: t + row * 0.08,
      });
    }

    /*
     * Normalise the completion stagger so the LAST book still finishes its
     * whole animation before `harvest` reaches 1. Without this the tail-end
     * ones get clamped mid-flight and freeze on screen through the summon.
     * MOTE_WINDOW is the longer of the two, so it sets the ceiling.
     */
    const maxDone = Math.max(...books.map((b) => b.done)) || 1;
    const LAST_FINISH = 1 - MOTE_WINDOW - 0.02;
    books.forEach((b) => {
      b.done = (b.done / maxDone) * LAST_FINISH;
    });
  }

  // ── ACT 3: motes of study time feeding the crystal ─────────────────────
  const motes: ThreeNS.Mesh[] = [];
  {
    const moteGeo = new THREE.OctahedronGeometry(0.08);
    const moteMat = new THREE.MeshBasicMaterial({ color: C.brand, transparent: true, opacity: 0 });
    for (let i = 0; i < BOOK_COUNT; i++) {
      const m = new THREE.Mesh(moteGeo, moteMat.clone());
      m.visible = false;
      motes.push(m);
      scene.add(m);
    }
  }

  // ── the Focus Crystal ──────────────────────────────────────────────────
  const crystalPos = new THREE.Vector3(0, 0.2, -3);
  const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 0),
    std(C.brand, { roughness: 0.1, metalness: 0.6, emissive: C.brand, emissiveIntensity: 0.4 })
  );
  crystal.position.copy(crystalPos);
  crystal.scale.setScalar(0.001);
  scene.add(crystal);

  /* Shell halves that split apart at the burst. */
  const shellMat = std(C.warm, {
    roughness: 0.18,
    metalness: 0.65,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });
  const shellL = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 22, 0, Math.PI), shellMat);
  const shellR = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 22, Math.PI, Math.PI),
    shellMat.clone()
  );
  [shellL, shellR].forEach((s) => {
    s.position.copy(crystalPos);
    s.scale.setScalar(0.001);
    scene.add(s);
  });

  /* Shockwave ring + light beams for the moment it breaks. */
  const shock = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.04, 12, 64),
    new THREE.MeshBasicMaterial({ color: C.warm, transparent: true, opacity: 0, depthWrite: false })
  );
  shock.position.copy(crystalPos);
  scene.add(shock);

  const beams = new THREE.Group();
  beams.position.copy(crystalPos);
  {
    const beamMat = new THREE.MeshBasicMaterial({
      color: C.warm,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 12; i++) {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 10), beamMat);
      b.rotation.z = (i / 12) * Math.PI * 2;
      beams.add(b);
    }
  }
  scene.add(beams);

  // ── ACT 4: the Spirit — "Matcha Layer Cake Thesis" (legendary) ─────────
  /*
   * Built to the same recipe as the app's 2D SpiritArt: a notebook body in the
   * spirit's `body` colour, a lighter `belly` panel, darker `trim` edging, big
   * eyes — plus the crown that marks a legendary. Colours are lifted straight
   * from that spirit's art definition in lib/gacha.ts so the 3D and 2D versions
   * are recognisably the same character.
   */
  const MATCHA = { body: 0x9fd67a, trim: 0x5a9b3a, belly: 0xe6f6d4, gold: 0xf5c451 };
  const spirit = new THREE.Group();
  spirit.position.copy(crystalPos);
  spirit.scale.setScalar(0.001);
  {
    const W = 1.16, H = 1.4, D = 0.4;
    const bodyMat = std(MATCHA.body, { roughness: 0.55 });
    const trimMat = std(MATCHA.trim, { roughness: 0.5 });

    // notebook covers + page block
    const front = new THREE.Mesh(new THREE.BoxGeometry(W, H, D * 0.3), bodyMat);
    front.position.z = D * 0.35;
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, D * 0.3), bodyMat);
    back.position.z = -D * 0.35;
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(W * 0.93, H * 0.94, D * 0.52),
      std(0xfdfdfa, { roughness: 0.95 })
    );
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(D / 2, D / 2, H, 16, 1, false, 0, Math.PI),
      trimMat
    );
    spine.rotation.z = Math.PI / 2;
    spine.rotation.y = Math.PI / 2;
    spine.position.x = -W / 2;
    spirit.add(back, pages, front, spine);

    // belly panel — the lighter label the 2D art puts on its front
    const belly = new THREE.Mesh(
      new THREE.BoxGeometry(W * 0.66, H * 0.5, 0.03),
      std(MATCHA.belly, { roughness: 0.8 })
    );
    belly.position.set(0.03, -0.22, D * 0.35 + D * 0.16);
    spirit.add(belly);

    // face
    const eyeGeo = new THREE.SphereGeometry(0.085, 18, 14);
    const eyeMat = std(0x241f2b, { roughness: 0.3 });
    const eyeZ = D * 0.35 + D * 0.16;
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.2, 0.3, eyeZ);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.2, 0.3, eyeZ);
    spirit.add(eyeL, eyeR);

    const glintGeo = new THREE.SphereGeometry(0.03, 10, 8);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const gl = new THREE.Mesh(glintGeo, glintMat);
    gl.position.set(-0.17, 0.34, eyeZ + 0.06);
    const gr = new THREE.Mesh(glintGeo, glintMat);
    gr.position.set(0.23, 0.34, eyeZ + 0.06);
    spirit.add(gl, gr);

    const cheekMat = new THREE.MeshBasicMaterial({
      color: 0xff9aa8,
      transparent: true,
      opacity: 0.55,
    });
    const chL = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), cheekMat);
    chL.position.set(-0.34, 0.14, eyeZ + 0.01);
    const chR = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), cheekMat);
    chR.position.set(0.34, 0.14, eyeZ + 0.01);
    spirit.add(chL, chR);

    // legendary crown
    const crown = new THREE.Group();
    const goldMat = std(MATCHA.gold, { roughness: 0.25, metalness: 0.7 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 20, 1, true), goldMat);
    crown.add(band);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 10), goldMat);
      spike.position.set(Math.cos(a) * 0.3, 0.15, Math.sin(a) * 0.3);
      crown.add(spike);
    }
    crown.position.set(0, H / 2 + 0.06, 0);
    spirit.add(crown);
  }
  scene.add(spirit);

  /* Crystals that orbit the Spirit once it lands. */
  const orbiters: ThreeNS.Mesh[] = [];
  {
    const g = new THREE.OctahedronGeometry(0.11);
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({ color: C.brand, transparent: true, opacity: 0 })
      );
      orbiters.push(m);
      spirit.add(m);
    }
  }

  // ── scroll choreography ────────────────────────────────────────────────
  let mainTl: gsap.core.Timeline | null = null;

  const ctx = gsap.context(() => {
    if (reduceMotion) return;

    const caps = gsap.utils.toArray<HTMLElement>(".scene-caption");

    mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".loop-scene",
        start: "top bottom",
        end: "bottom bottom",
        // higher scrub = more inertia; the scene glides instead of snapping
        scrub: 1.4,
      },
      defaults: { ease: "none" },
    });

    const K = 3.0; // the approach occupies 0..K

    mainTl
      /* approach */
      .to(camRig.position, { z: camZ(8.6), y: 0.42, duration: K, ease: "power1.inOut" }, 0)

      /* ACT 1→2 — drifting books close ranks into a shelved semester */
      .to(S, { formation: 1, duration: 3.0, ease: "power2.inOut" }, K + 0.2)
      .to(S, { drift: 0.1, duration: 3.0, ease: "power2.inOut" }, K + 0.2)
      .to(caps[0], { opacity: 1, duration: 0.5 }, K + 0.4)
      .to(camRig.position, { z: camZ(7.1), y: 0.32, duration: 3.0, ease: "power1.inOut" }, K + 0.4)
      .to(caps[0], { opacity: 0, duration: 0.5 }, K + 3.6)

      /* ACT 3 — the work gets done; study time becomes crystal */
      .to(caps[1], { opacity: 1, duration: 0.5 }, K + 4.1)
      .to(S, { harvest: 1, duration: 4.4, ease: "power1.inOut" }, K + 4.0)
      .to(camRig.position, { z: camZ(6.1), y: 0.28, duration: 4.4, ease: "power1.inOut" }, K + 4.0)
      .to(caps[1], { opacity: 0, duration: 0.5 }, K + 8.1)

      /* ACT 4 — the summon */
      .to(caps[2], { opacity: 1, duration: 0.5 }, K + 8.6)
      /*
       * Pacing of the summon. The earlier version crammed it into ~2.8s of
       * timeline with power2.in / power3.out, so the charge rushed the last
       * moment and the break was over in a couple of frames. Longer beats,
       * gentler curves, and a deliberate overlap between the burst and the
       * Spirit so one hands off to the other instead of cutting.
       */
      .to(S, { charge: 1, duration: 3.2, ease: "power1.in" }, K + 8.4)
      .to(camRig.position, { z: camZ(5.6), duration: 3.2, ease: "power1.inOut" }, K + 8.4)
      /*
       * `burst` is scrubbed LINEARLY on purpose. Every effect derived from it
       * (shockwave, crystal collapse, shell split, flash) applies its own curve
       * in drawFrame, so an eased tween here compounded with those and made the
       * crystal vanish inside a couple of scroll pixels.
       */
      .to(S, { burst: 1, duration: 2.8, ease: "none" }, K + 11.6)
      .to(S, { spirit: 1, duration: 3.2, ease: "back.out(0.9)" }, K + 12.8)
      // Hold "then you spend it" until the Spirit has actually landed (its
      // tween ends at K+14.2) — swapping at 13.0 retitled the moment mid-hatch.
      .to(caps[2], { opacity: 0, duration: 0.7 }, K + 16.0)
      .to(caps[3], { opacity: 1, duration: 0.7 }, K + 16.6)
      /*
       * Hold the Spirit and the last caption to the end of the pinned scroll.
       * Pulling the camera back here would leave a screen of empty space before
       * the next section; instead the Features sheet scrolls up over the canvas.
       */
      .to(caps[3], { opacity: 0, duration: 0.7 }, K + 20.0);

    /* finale — the Spirit drifts in behind the CTA */
    gsap
      .timeline({
        scrollTrigger: { trigger: ".cta-band", start: "top 85%", end: "center 45%", scrub: 1.4 },
      })
      .to(spirit.position, { x: 0, y: -0.6, z: 1.4, ease: "power2.out" }, 0)
      .to(camRig.position, { z: camZ(8.6), y: 0.2, ease: "power2.out" }, 0);
  });

  // ── mouse parallax ─────────────────────────────────────────────────────
  const mouse = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!isTouch && !reduceMotion) window.addEventListener("pointermove", onPointer);

  // ── render ─────────────────────────────────────────────────────────────
  const tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  let frame = 0;

  /*
   * Derive every object's transform from `S` and draw one frame.
   *
   * Split out of the rAF loop deliberately: since the timeline only scrubs
   * scalars, nothing on screen changes until this runs. Keeping it callable
   * means a test can scrub the timeline and force a frame — otherwise the
   * scene is unverifiable anywhere rAF is throttled (hidden tab, headless),
   * which is exactly where automated checks live.
   */
  const drawFrame = (t: number) => {
    const f = easeInOut(S.formation);

    books.forEach((b, i) => {
      const g = b.group;
      const wob = S.drift;
      // Gentle float while drifting; settles precisely into the shelf slot.
      g.position.set(
        lerp(b.home.x + Math.sin(t * 0.34 + i) * 0.22 * wob, b.slot.x, f),
        lerp(b.home.y + Math.sin(t * 0.44 + i * 1.3) * 0.26 * wob, b.slot.y, f),
        lerp(b.home.z + Math.cos(t * 0.3 + i) * 0.18 * wob, b.slot.z, f)
      );
      g.rotation.set(
        lerp(b.homeRot.x + t * b.spin.x * wob, b.slotRot.x, f),
        lerp(b.homeRot.y + t * b.spin.y * wob, b.slotRot.y, f),
        lerp(b.homeRot.z + t * b.spin.z * wob, b.slotRot.z, f)
      );

      // ACT 3 — this book completes, flares, then shrinks away
      const done = range(S.harvest, b.done, b.done + BOOK_WINDOW);
      const shrink = 1 - easeOut(done);
      g.scale.setScalar(Math.max(0.001, shrink));
      g.visible = shrink > 0.02;
    });

    // motes fly from each completed book into the crystal
    motes.forEach((mo, i) => {
      const b = books[i];
      const done = range(S.harvest, b.done, b.done + MOTE_WINDOW);
      const mat = mo.material as ThreeNS.MeshBasicMaterial;
      if (done <= 0 || done >= 1) {
        mo.visible = false;
        return;
      }
      mo.visible = true;
      const e = easeInOut(done);
      tmp.copy(b.slot).lerp(crystalPos, e);
      tmp.y += Math.sin(e * Math.PI) * 0.5; // slight arc, not a dead straight line
      mo.position.copy(tmp);
      mo.rotation.y = t * 1.2 + i;
      mo.scale.setScalar(lerp(1, 0.25, e));
      mat.opacity = Math.sin(done * Math.PI) * 0.95;
    });

    // the crystal grows on harvested study time, then charges
    const grow = easeOut(S.harvest);
    const swell = 1 + S.charge * 0.32;
    // a fine tremor while charging — smaller and smoother than a random jitter
    /*
     * The tremor eases in with the charge rather than tracking it linearly, and
     * at ~22rad/s instead of 42 — the faster jitter read as noise rather than as
     * something straining to break open.
     */
    const shake = easeInOut(range(S.charge, 0.15, 1)) * (1 - S.burst) * 0.028;
    /*
     * Collapse the crystal smoothly across the first half of the burst. It used
     * to be a bare `1 - S.burst`, and since `burst` eases with power3.out (very
     * front-loaded) the crystal effectively vanished in a single frame.
     */
    const crush = easeInOut(range(S.burst, 0.08, 0.78));
    crystal.scale.setScalar(Math.max(0.001, grow * swell * (1 - crush)));
    crystal.position.set(
      crystalPos.x + Math.sin(t * 22) * shake,
      crystalPos.y + Math.cos(t * 19) * shake,
      crystalPos.z
    );
    crystal.rotation.y = t * 0.5;
    crystal.rotation.x = Math.sin(t * 0.32) * 0.2;
    (crystal.material as ThreeNS.MeshStandardMaterial).emissiveIntensity = 0.4 + S.charge * 2.6;

    // shell wraps the crystal while charging, then splits
    /*
     * The shell fades in over the first third of the charge. This used to be
     * `S.charge > 0 ? 1 : 0` — a binary step that popped the shell into
     * existence at full size the instant charging began, which was the visible
     * jolt going into the summon.
     */
    const shellIn = easeInOut(range(S.charge, 0, 0.55));
    const shellOn = grow * shellIn;
    const split = easeOut(S.burst);
    [shellL, shellR].forEach((s, idx) => {
      const dir = idx === 0 ? -1 : 1;
      s.scale.setScalar(Math.max(0.001, shellOn * swell));
      s.position.set(
        crystalPos.x + dir * split * 3.6 + Math.sin(t * 40) * shake,
        crystalPos.y + split * 0.8,
        crystalPos.z
      );
      s.rotation.z = dir * split * 1.6;
      // fade with the shell's own entrance too, so it never blinks on at 0.95
      (s.material as ThreeNS.MeshStandardMaterial).opacity = 0.95 * shellIn * (1 - split);
      s.visible = shellOn > 0.004 && split < 0.995;
    });

    // the break
    const bw = S.burst;
    shock.scale.setScalar(0.2 + easeOut(bw) * 7.5);
    (shock.material as ThreeNS.MeshBasicMaterial).opacity = Math.sin(bw * Math.PI) * 0.85;
    shock.rotation.z = t * 0.3;
    beams.rotation.z = t * 0.2;
    beams.children.forEach((b) => {
      ((b as ThreeNS.Mesh).material as ThreeNS.MeshBasicMaterial).opacity =
        Math.sin(bw * Math.PI) * 0.5;
    });
    summonLight.intensity = S.charge * 1.1 + Math.sin(bw * Math.PI) * 15 + S.spirit * 1.5;

    // the Spirit hatches, then bobs and sways
    const sp = S.spirit;
    spirit.scale.setScalar(Math.max(0.001, sp));
    spirit.visible = sp > 0.01;
    spirit.position.y = crystalPos.y + Math.sin(t * 1.1) * 0.11 * sp;
    spirit.rotation.y = Math.sin(t * 0.5) * 0.24;
    spirit.rotation.z = Math.sin(t * 0.7) * 0.04;
    orbiters.forEach((o, i) => {
      const a = t * 0.75 + (i / orbiters.length) * Math.PI * 2;
      o.position.set(Math.cos(a) * 1.25, Math.sin(a * 1.3) * 0.4, Math.sin(a) * 1.25);
      o.rotation.y = t * 1.3;
      (o.material as ThreeNS.MeshBasicMaterial).opacity = sp * 0.85;
    });

    camera.position.x += (mouse.x * 0.34 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(lookTarget);
    renderer.render(scene, camera);
  };

  const render = () => {
    drawFrame(clock.getElapsedTime());
    frame = requestAnimationFrame(render);
  };
  render();

  const handle = {
    S, camRig, books, motes, crystal, shellL, shellR, spirit, shock, summonLight,
    /** Force one frame — needed to assert state where rAF is paused. */
    draw: (t = 0) => drawFrame(t),
    /** Screen-space positions of the books, for asserting the text stays clear. */
    bookScreens: () => books.map((b) => b.screen),
    get timeline() {
      return mainTl;
    },
  };
  (window as unknown as Record<string, unknown>).__sqScene = handle;

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    /*
     * A resize changes both the aspect ratio AND how much room the copy takes
     * (the headline re-wraps), so simply re-projecting the old points would drag
     * books back over the text — badly so on a portrait rotation. Re-measure the
     * corridor and lay the books out again. Only while the hero is on screen;
     * past that the timeline owns their positions.
     */
    if (window.scrollY < window.innerHeight * 0.5) {
      measureCorridor();
      placed.length = 0;
      books.forEach((b) => {
        b.screen = safeScreenPoint(b.depth);
        screenToWorld(b.screen.sx, b.screen.sy, b.depth, b.home);
      });
    }
  };
  window.addEventListener("resize", onResize);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      ctx.revert();
      scene.traverse((o) => {
        const m = o as ThreeNS.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mm = m.material as ThreeNS.Material | ThreeNS.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
        else mm?.dispose();
      });
      renderer.dispose();
      /*
       * Only clear the debug handle if this scene still owns it. React
       * StrictMode mounts effects twice, so a discarded first scene can tear
       * down AFTER the live second one published its handle — an unconditional
       * delete there wipes the working scene's handle instead of its own.
       */
      const w = window as unknown as Record<string, unknown>;
      if (w.__sqScene === handle) delete w.__sqScene;
    },
  };
}
