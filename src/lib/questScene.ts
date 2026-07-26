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
 * Scrolling replays the actual loop the app puts a student through, and ends on
 * the thing only StudyQuest has: a Study Spirit summon.
 *
 *   1. CHAOS   a storm of unread module-guide pages tumbling around you
 *   2. ORDER   they snap into a planned semester — a ribbon of task cards
 *   3. FOCUS   cards complete and dissolve into motes that feed a Focus Crystal
 *   4. SUMMON  the crystal charges, cracks, bursts, and a Spirit hatches out
 *
 * Architecture note: the scroll timeline does NOT tween ~90 objects directly.
 * It scrubs a handful of numbers on `S` (formation, harvest, charge, burst…)
 * and the render loop derives every object's transform from those. That keeps
 * the scrub cheap, makes the whole scene a pure function of a few scalars, and
 * means a mid-page refresh can never leave objects in a half-tweened state.
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
/** Map x from [a,b] to [0,1], clamped. Used to slice one scalar into phases. */
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
  scene.fog = new THREE.Fog(C.canvas, 9, 30);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  const camRig = new THREE.Group();
  camRig.add(camera);
  scene.add(camRig);
  camRig.position.set(0, 0.3, 8.5);
  const lookTarget = new THREE.Vector3(0, 0.1, -2);

  // ── lights ─────────────────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0xffffff, C.surface, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(C.brand, 1.0);
  rim.position.set(-6, 2, -4);
  scene.add(rim);
  /** Drives the summon: dark during study, blinding at the burst. */
  const summonLight = new THREE.PointLight(C.warm, 0, 22, 2);
  summonLight.position.set(0, 0.3, -3);
  scene.add(summonLight);

  const std = (color: number, opts: Record<string, unknown> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...opts });

  /*
   * Scene state. Everything below is derived from these scalars in render(),
   * and the scroll timeline only ever scrubs these.
   */
  const S = {
    formation: 0, // 0 = paper storm, 1 = planned semester ribbon
    harvest: 0, // cards completing → motes streaming into the crystal
    charge: 0, // crystal swelling + shaking before the break
    burst: 0, // the crack, shockwave and light
    spirit: 0, // the Spirit hatching and settling
    drift: 1, // ambient tumble, damped once things get serious
  };

  // ── ACT 1: the paper storm ─────────────────────────────────────────────
  /*
   * Each sheet remembers where it tumbles (home) and where it belongs in the
   * finished semester (slot). `formation` slides it between the two, so the
   * chaos→order transition is one number.
   */
  const PAPER_COUNT = 46;
  const papers: {
    mesh: ThreeNS.Mesh;
    home: ThreeNS.Vector3;
    slot: ThreeNS.Vector3;
    spin: ThreeNS.Vector3;
    homeRot: ThreeNS.Euler;
    slotRot: ThreeNS.Euler;
    done: number; // when in `harvest` this card completes (0..1)
  }[] = [];

  const paperGeo = new THREE.BoxGeometry(0.62, 0.84, 0.015);
  const cardTones = [C.brand, C.sky, C.grass, C.warm, C.berry];

  /** How much of `harvest` one card's flare / one mote's flight occupies. */
  const CARD_WINDOW = 0.22;
  const MOTE_WINDOW = 0.34;

  {
    const paperMat = std(C.night, { roughness: 0.85 });
    for (let i = 0; i < PAPER_COUNT; i++) {
      // Tinted edge card for the ordered state, plain sheet while it's chaos.
      const mesh = new THREE.Mesh(paperGeo, paperMat.clone());
      // home: a loose shell of tumbling paper around the camera's path
      const a = Math.random() * Math.PI * 2;
      const r = 3.2 + Math.random() * 5.4;
      const home = new THREE.Vector3(
        Math.cos(a) * r,
        (Math.random() - 0.5) * 7,
        -3 + Math.sin(a) * r * 0.7 + (Math.random() - 0.5) * 4
      );
      // slot: a wide ribbon that arcs away from the camera — the semester
      const col = i % 12;
      const row = Math.floor(i / 12);
      const t = col / 11;
      const slot = new THREE.Vector3(
        lerp(-5.6, 5.6, t),
        1.15 - row * 0.86 + Math.sin(t * Math.PI) * 0.28,
        -3.2 - Math.sin(t * Math.PI) * 2.6
      );
      mesh.position.copy(home);
      const homeRot = new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      mesh.rotation.copy(homeRot);
      papers.push({
        mesh,
        home,
        slot,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        homeRot,
        // face the camera once ordered, with a slight fan
        slotRot: new THREE.Euler(0, lerp(0.42, -0.42, t), 0),
        // provisional stagger; normalised below so everything finishes in time
        done: t + row * 0.09,
      });
      (mesh.material as ThreeNS.MeshStandardMaterial).emissive = new THREE.Color(
        cardTones[i % cardTones.length]
      );
      (mesh.material as ThreeNS.MeshStandardMaterial).emissiveIntensity = 0;
      scene.add(mesh);
    }

    /*
     * Normalise the completion stagger so the LAST card still finishes its
     * whole animation before `harvest` reaches 1. Without this the tail-end
     * cards get clamped mid-flight and freeze on screen — a stuck sheet and a
     * handful of motes hanging in the air right through the summon.
     * MOTE_WINDOW is the longer of the two, so it sets the ceiling.
     */
    const maxDone = Math.max(...papers.map((p) => p.done)) || 1;
    const LAST_FINISH = 1 - MOTE_WINDOW - 0.02; // small margin for float error
    papers.forEach((p) => {
      p.done = (p.done / maxDone) * LAST_FINISH;
    });
  }

  // ── ACT 3: motes of study time feeding the crystal ─────────────────────
  const MOTE_COUNT = 46;
  const motes: ThreeNS.Mesh[] = [];
  {
    const moteGeo = new THREE.OctahedronGeometry(0.075);
    const moteMat = new THREE.MeshBasicMaterial({ color: C.brand, transparent: true, opacity: 0 });
    for (let i = 0; i < MOTE_COUNT; i++) {
      const m = new THREE.Mesh(moteGeo, moteMat.clone());
      m.visible = false;
      motes.push(m);
      scene.add(m);
    }
  }

  // ── the Focus Crystal ──────────────────────────────────────────────────
  const crystalPos = new THREE.Vector3(0, 0.25, -3);
  const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 0),
    std(C.brand, { roughness: 0.12, metalness: 0.55, emissive: C.brand, emissiveIntensity: 0.35 })
  );
  crystal.position.copy(crystalPos);
  crystal.scale.setScalar(0.001);
  scene.add(crystal);

  /* Two shell halves that split apart at the burst. */
  const shellMat = std(C.warm, {
    roughness: 0.2,
    metalness: 0.6,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });
  const shellL = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 30, 20, 0, Math.PI),
    shellMat
  );
  const shellR = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 30, 20, Math.PI, Math.PI),
    shellMat.clone()
  );
  [shellL, shellR].forEach((s) => {
    s.position.copy(crystalPos);
    s.scale.setScalar(0.001);
    scene.add(s);
  });

  /* Shockwave ring + light beams for the moment it breaks. */
  const shock = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.045, 12, 64),
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
    for (let i = 0; i < 10; i++) {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 9), beamMat);
      b.rotation.z = (i / 10) * Math.PI * 2;
      beams.add(b);
    }
  }
  scene.add(beams);

  // ── ACT 4: the Study Spirit ────────────────────────────────────────────
  /*
   * Deliberately simple and readable at distance: a rounded body, big eyes, a
   * tuft, and orbiting crystals. It reads as one of the app's collectible
   * spirits rather than as an abstract shape.
   */
  const spirit = new THREE.Group();
  spirit.position.copy(crystalPos);
  spirit.scale.setScalar(0.001);
  {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 24), std(C.warm, { roughness: 0.4 }));
    body.scale.set(1, 0.92, 0.95);
    spirit.add(body);

    const eyeGeo = new THREE.SphereGeometry(0.085, 16, 12);
    const eyeMat = std(0x1a1420, { roughness: 0.25 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.2, 0.08, 0.52);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.2, 0.08, 0.52);
    spirit.add(eyeL, eyeR);

    const cheekGeo = new THREE.SphereGeometry(0.07, 12, 10);
    const cheekMat = new THREE.MeshBasicMaterial({ color: C.berry, transparent: true, opacity: 0.5 });
    const cl = new THREE.Mesh(cheekGeo, cheekMat);
    cl.position.set(-0.34, -0.08, 0.44);
    const cr = new THREE.Mesh(cheekGeo, cheekMat);
    cr.position.set(0.34, -0.08, 0.44);
    spirit.add(cl, cr);

    // a little tuft, so it has a silhouette
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 12), std(C.grass));
    tuft.position.set(0, 0.62, 0);
    tuft.rotation.z = -0.25;
    spirit.add(tuft);
  }
  scene.add(spirit);

  /* Crystals that orbit the spirit once it lands. */
  const orbiters: ThreeNS.Mesh[] = [];
  {
    const g = new THREE.OctahedronGeometry(0.12);
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: C.brand, transparent: true, opacity: 0 }));
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
        scrub: 1,
      },
      defaults: { ease: "none" },
    });

    const K = 3.0; // the approach out of the storm occupies 0..K

    mainTl
      /* approach — the camera pulls out of the paper storm */
      .to(camRig.position, { z: 5.4, y: 0.45, duration: K, ease: "power1.inOut" }, 0)

      /* ACT 1→2 — chaos resolves into a planned semester */
      .to(S, { formation: 1, duration: 2.6, ease: "power2.inOut" }, K + 0.2)
      .to(S, { drift: 0.12, duration: 2.6 }, K + 0.2)
      .to(caps[0], { opacity: 1, duration: 0.4 }, K + 0.3)
      .to(camRig.position, { z: 3.9, y: 0.35, duration: 2.6, ease: "power1.inOut" }, K + 0.4)
      .to(caps[0], { opacity: 0, duration: 0.4 }, K + 3.4)

      /* ACT 3 — the work gets done; study time becomes crystal */
      .to(caps[1], { opacity: 1, duration: 0.4 }, K + 3.9)
      .to(S, { harvest: 1, duration: 4.0, ease: "power1.inOut" }, K + 3.8)
      .to(camRig.position, { z: 3.0, y: 0.3, duration: 4.0, ease: "power1.inOut" }, K + 3.8)
      .to(caps[1], { opacity: 0, duration: 0.4 }, K + 7.6)

      /* ACT 4 — the summon */
      .to(caps[2], { opacity: 1, duration: 0.4 }, K + 8.1)
      .to(S, { charge: 1, duration: 2.0, ease: "power2.in" }, K + 7.9)
      .to(camRig.position, { z: 2.4, duration: 2.0, ease: "power2.in" }, K + 7.9)
      .to(S, { burst: 1, duration: 0.9, ease: "power3.out" }, K + 9.9)
      .to(S, { spirit: 1, duration: 1.6, ease: "back.out(1.7)" }, K + 10.4)
      .to(caps[2], { opacity: 0, duration: 0.4 }, K + 12.0)
      .to(caps[3], { opacity: 1, duration: 0.4 }, K + 12.3)
      /*
       * Hold the spirit and the last caption to the end of the pinned scroll.
       * Pulling the camera back here would leave a screen of empty space before
       * the next section; instead the Features sheet scrolls up over the canvas.
       */
      .to(caps[3], { opacity: 0, duration: 0.5 }, K + 15.4);

    /* finale — the spirit drifts in behind the CTA */
    gsap
      .timeline({
        scrollTrigger: { trigger: ".cta-band", start: "top 85%", end: "center 45%", scrub: 1 },
      })
      .to(spirit.position, { x: 0, y: -0.7, z: 1.6, ease: "power2.out" }, 0)
      .to(camRig.position, { z: 5.5, y: 0.2, ease: "power2.out" }, 0);
  });

  // ── mouse parallax ─────────────────────────────────────────────────────
  const mouse = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!isTouch && !reduceMotion) window.addEventListener("pointermove", onPointer);

  /* Debug handle: the choreography is scroll-scrubbed, which can't be driven in
     a hidden tab (rAF is paused there, stalling the smooth-scroll layer), so a
     test scrubs the timeline directly and asserts against `S` and the objects. */
  const handle = {
    S, camRig, papers, motes, crystal, shellL, shellR, spirit, shock, summonLight,
    /** Force one frame — needed to assert state where rAF is paused. */
    draw: (t = 0) => drawFrame(t),
    get timeline() {
      return mainTl;
    },
  };
  (window as unknown as Record<string, unknown>).__sqScene = handle;

  // ── render ─────────────────────────────────────────────────────────────
  const tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  let frame = 0;

  /*
   * Derive every object's transform from `S` and draw one frame.
   *
   * Split out of the rAF loop deliberately: since the scroll timeline only
   * scrubs scalars, nothing on screen changes until this runs. Keeping it
   * callable means a test can scrub the timeline and then force a frame —
   * otherwise the scene is unverifiable anywhere rAF is throttled (hidden tab,
   * headless run), which is exactly where automated checks tend to live.
   */
  const drawFrame = (t: number) => {
    // ACT 1/2 — every sheet is a lerp between its tumble and its slot
    const f = easeInOut(S.formation);
    papers.forEach((p, i) => {
      const m = p.mesh;
      // tumbling drift, damped as order takes over
      const wob = S.drift;
      m.position.set(
        lerp(p.home.x + Math.sin(t * 0.5 + i) * 0.35 * wob, p.slot.x, f),
        lerp(p.home.y + Math.sin(t * 0.7 + i * 1.3) * 0.4 * wob, p.slot.y, f),
        lerp(p.home.z + Math.cos(t * 0.45 + i) * 0.3 * wob, p.slot.z, f)
      );
      m.rotation.set(
        lerp(p.homeRot.x + t * p.spin.x * wob, p.slotRot.x, f),
        lerp(p.homeRot.y + t * p.spin.y * wob, p.slotRot.y, f),
        lerp(p.homeRot.z + t * p.spin.z * wob, p.slotRot.z, f)
      );

      // ACT 3 — this card completes, flares, then shrinks away
      const mat = m.material as ThreeNS.MeshStandardMaterial;
      const done = range(S.harvest, p.done, p.done + CARD_WINDOW);
      mat.emissiveIntensity = Math.sin(done * Math.PI) * 1.5;
      const shrink = 1 - easeOut(done);
      m.scale.setScalar(Math.max(0.001, shrink));
      m.visible = shrink > 0.02;
    });

    // ACT 3 — motes fly from each completed card into the crystal
    motes.forEach((mo, i) => {
      const p = papers[i];
      const done = range(S.harvest, p.done, p.done + MOTE_WINDOW);
      const mat = mo.material as ThreeNS.MeshBasicMaterial;
      if (done <= 0 || done >= 1) {
        mo.visible = false;
        return;
      }
      mo.visible = true;
      const e = easeInOut(done);
      tmp.copy(p.slot).lerp(crystalPos, e);
      // a slight arc so they don't travel in dead straight lines
      tmp.y += Math.sin(e * Math.PI) * 0.55;
      mo.position.copy(tmp);
      mo.scale.setScalar(lerp(1, 0.25, e));
      mat.opacity = Math.sin(done * Math.PI) * 0.95;
    });

    // the crystal grows on harvested study time, then charges
    const grow = easeOut(S.harvest);
    const chargeSwell = 1 + S.charge * 0.35;
    const shake = S.charge * (1 - S.burst) * 0.045;
    crystal.scale.setScalar(Math.max(0.001, grow * chargeSwell * (1 - S.burst)));
    crystal.position.set(
      crystalPos.x + (Math.random() - 0.5) * shake,
      crystalPos.y + (Math.random() - 0.5) * shake,
      crystalPos.z
    );
    crystal.rotation.y = t * 0.6;
    crystal.rotation.x = Math.sin(t * 0.4) * 0.25;
    (crystal.material as ThreeNS.MeshStandardMaterial).emissiveIntensity =
      0.35 + S.charge * 2.4;

    // the shell wraps the crystal while charging, then splits
    const shellOn = grow * (S.charge > 0 ? 1 : 0);
    const split = easeOut(S.burst);
    [shellL, shellR].forEach((s, idx) => {
      const dir = idx === 0 ? -1 : 1;
      s.scale.setScalar(Math.max(0.001, shellOn * chargeSwell));
      s.position.set(
        crystalPos.x + dir * split * 3.4 + (Math.random() - 0.5) * shake,
        crystalPos.y + split * 0.7,
        crystalPos.z
      );
      s.rotation.z = dir * split * 1.5;
      (s.material as ThreeNS.MeshStandardMaterial).opacity = 0.95 * (1 - split);
      s.visible = shellOn > 0.02 && split < 0.99;
    });

    // the break: shockwave, beams and a flash of light
    const bw = S.burst;
    shock.scale.setScalar(0.2 + easeOut(bw) * 7);
    (shock.material as ThreeNS.MeshBasicMaterial).opacity = Math.sin(bw * Math.PI) * 0.9;
    shock.rotation.z = t * 0.4;
    beams.rotation.z = t * 0.25;
    beams.children.forEach((b) => {
      ((b as ThreeNS.Mesh).material as ThreeNS.MeshBasicMaterial).opacity =
        Math.sin(bw * Math.PI) * 0.55;
    });
    summonLight.intensity = S.charge * 1.2 + Math.sin(bw * Math.PI) * 14 + S.spirit * 1.6;

    // the Spirit hatches, bobs, blinks in place
    const sp = S.spirit;
    spirit.scale.setScalar(Math.max(0.001, sp));
    spirit.visible = sp > 0.01;
    spirit.position.y = crystalPos.y + Math.sin(t * 1.3) * 0.12 * sp;
    spirit.rotation.y = Math.sin(t * 0.6) * 0.28;
    orbiters.forEach((o, i) => {
      const a = t * 0.9 + (i / orbiters.length) * Math.PI * 2;
      o.position.set(Math.cos(a) * 1.15, Math.sin(a * 1.4) * 0.42, Math.sin(a) * 1.15);
      o.rotation.y = t * 1.6;
      (o.material as ThreeNS.MeshBasicMaterial).opacity = sp * 0.9;
    });

    camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.045;
    camera.position.y += (-mouse.y * 0.22 - camera.position.y) * 0.045;
    camera.lookAt(lookTarget);
    renderer.render(scene, camera);
  };

  const render = () => {
    drawFrame(clock.getElapsedTime());
    frame = requestAnimationFrame(render);
  };
  render();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
       * down AFTER the live second one has published its handle — an
       * unconditional delete there wipes the working scene's handle instead of
       * its own.
       */
      const w = window as unknown as Record<string, unknown>;
      if (w.__sqScene === handle) delete w.__sqScene;
    },
  };
}
