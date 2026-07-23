/**
 * Tiny synth for the summon sequence — all sound is generated live with the
 * Web Audio API, so there are no audio files to ship and it works fully offline.
 * A charge whoosh that rises in pitch, an explosion, and a rarity-scaled chime.
 */

let ctx: AudioContext | null = null;
let muted = false;

export function isMuted() {
  return muted;
}
export function setMuted(m: boolean) {
  muted = m;
}
export function toggleMuted() {
  muted = !muted;
  return muted;
}

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Rising, tension-building whoosh while the orb charges. */
export function playCharge(durationMs = 1500) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const dur = durationMs / 1000;

  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(70, t);
  o.frequency.exponentialRampToValueAtTime(900, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + dur * 0.85);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.1);

  // Shimmer layer an octave up for sparkle.
  const o2 = c.createOscillator();
  const g2 = c.createGain();
  o2.type = "triangle";
  o2.frequency.setValueAtTime(210, t);
  o2.frequency.exponentialRampToValueAtTime(2400, t + dur);
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.9);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
  o2.connect(g2).connect(c.destination);
  o2.start(t);
  o2.stop(t + dur + 0.1);
}

/** The explosion when the orb bursts. */
export function playBurst() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;

  // Filtered noise blast.
  const len = Math.floor(c.sampleRate * 0.6);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
  }
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const nf = c.createBiquadFilter();
  nf.type = "lowpass";
  nf.frequency.setValueAtTime(3200, t);
  nf.frequency.exponentialRampToValueAtTime(400, t + 0.5);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.5, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  noise.connect(nf).connect(ng).connect(c.destination);
  noise.start(t);

  // Low sub thump.
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.4);
  g.gain.setValueAtTime(0.6, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.55);
}

/** Triumphant chime on reveal — grander (and darker) for higher rarities. */
export function playReveal(rarity: string) {
  const c = ac();
  if (!c) return;
  // Note motifs per rarity. Higher tiers = longer / grander; demon = ominous.
  const motifs: Record<string, number[]> = {
    common: [523.25, 659.25],
    rare: [523.25, 659.25, 783.99],
    epic: [523.25, 659.25, 783.99, 1046.5],
    legendary: [523.25, 659.25, 783.99, 1046.5, 1318.51],
    mythic: [587.33, 739.99, 880, 1174.66, 1479.98],
    ultramythic: [523.25, 698.46, 880, 1046.5, 1396.91, 1760],
    chromatic: [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1318.51],
    demon: [98, 130.81, 155.56, 207.65, 103.83], // low, dissonant
    secret: [1318.51, 1244.51, 1396.91, 1046.5, 1567.98], // eerie
  };
  const notes = motifs[rarity] ?? motifs.common;
  const dark = rarity === "demon";
  const t0 = c.currentTime;

  // Grand bass swell for legendary+.
  if (["legendary", "mythic", "ultramythic", "chromatic", "demon", "secret"].includes(rarity)) {
    const b = c.createOscillator();
    const bg = c.createGain();
    b.type = "sine";
    b.frequency.value = dark ? 55 : 130.81;
    bg.gain.setValueAtTime(0.0001, t0);
    bg.gain.exponentialRampToValueAtTime(0.28, t0 + 0.06);
    bg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
    b.connect(bg).connect(c.destination);
    b.start(t0);
    b.stop(t0 + 1.5);
  }

  notes.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = dark ? "sawtooth" : "triangle";
    o.frequency.value = f;
    const t = t0 + i * (dark ? 0.14 : 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(dark ? 0.16 : 0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.9);
    // Shimmer octave for the fancy tiers.
    if (["chromatic", "secret", "ultramythic"].includes(rarity)) {
      const s = c.createOscillator();
      const sg = c.createGain();
      s.type = "sine";
      s.frequency.value = f * 2;
      sg.gain.setValueAtTime(0.0001, t);
      sg.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
      sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      s.connect(sg).connect(c.destination);
      s.start(t);
      s.stop(t + 0.65);
    }
  });
}

/** Blippy "animal-crossing" talk sound — one blip per few characters. */
export function playTalk(text: string, rarity = "common") {
  const c = ac();
  if (!c) return;
  const dark = rarity === "demon" || rarity === "secret";
  const base = dark ? 150 : 620;
  const blips = Math.max(3, Math.min(14, Math.round(text.length / 3)));
  const t0 = c.currentTime;
  for (let i = 0; i < blips; i++) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = dark ? "square" : "triangle";
    o.frequency.value = base + Math.random() * (dark ? 60 : 260);
    const t = t0 + i * 0.085;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.08);
  }
}

// Voices load asynchronously in most browsers — warm them up once.
let cachedVoices: SpeechSynthesisVoice[] = [];
function loadVoices() {
  try {
    cachedVoices = window.speechSynthesis?.getVoices() ?? [];
  } catch {
    cachedVoices = [];
  }
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/** Pick the best-sounding available English voice, preferring natural ones. */
function pickVoice(deep: boolean): SpeechSynthesisVoice | undefined {
  if (!cachedVoices.length) loadVoices();
  const en = cachedVoices.filter((v) => /en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : cachedVoices;
  // Preference order: natural/premium voices first, then a sensible gendered pick.
  const preferred = deep
    ? [/daniel/i, /google uk english male/i, /alex/i, /male/i]
    : [/samantha/i, /google us english/i, /google uk english female/i, /jenny/i, /aria/i, /female/i];
  for (const re of preferred) {
    const hit = pool.find((v) => re.test(v.name));
    if (hit) return hit;
  }
  return pool[0];
}

/** Actually speak the catchphrase aloud via the browser's speech engine. */
export function speak(text: string, rarity = "common") {
  if (muted) return;
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const deep = rarity === "demon" || rarity === "secret";
    const voice = pickVoice(deep);
    if (voice) u.voice = voice;
    // Deep + slow + menacing for demon/secret; warm + lively for the rest.
    // Tuned to stay in a natural range so it doesn't sound like a chipmunk.
    if (deep) {
      u.pitch = 0.35;
      u.rate = 0.82;
    } else {
      u.pitch = 1.15;
      u.rate = 1.0;
    }
    u.volume = 1;
    synth.speak(u);
  } catch {
    // speech not available — the on-screen bubble still shows the words
  }
}
