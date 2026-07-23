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

/** Triumphant chime on reveal — grander for higher rarities. */
export function playReveal(rarity: "common" | "rare" | "epic" | "legendary") {
  const c = ac();
  if (!c) return;
  const chords: Record<string, number[]> = {
    common: [523.25, 659.25],
    rare: [523.25, 659.25, 783.99],
    epic: [523.25, 659.25, 783.99, 1046.5],
    legendary: [523.25, 659.25, 783.99, 1046.5, 1318.51],
  };
  const notes = chords[rarity] ?? chords.common;
  const t0 = c.currentTime;
  notes.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    const t = t0 + i * 0.08;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.75);
  });
}
