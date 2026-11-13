import { useEffect, useState } from 'react';

/**
 * Tile sounds for the tutorials, synthesised with the Web Audio API (no audio files): the click of a tile set down,
 * a discard landing on the felt, a draw from the wall, the rattle of shuffling, dice, point sticks and a small chime.
 * One switch mutes them everywhere; the choice is remembered per viewer.
 */

export type SfxKind = 'place' | 'pick' | 'discard' | 'draw' | 'call' | 'flip' | 'shuffle' | 'wall' | 'dice' | 'stick' | 'win' | 'ok' | 'oops';

const KEY = 'rincon-riichi-sfx';
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let muted = (() => { try { return localStorage.getItem(KEY) === 'off'; } catch { return false; } })();
const listeners = new Set<(m: boolean) => void>();

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!noise) {
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    return ctx;
  } catch { return null; }
}

const jitter = (v: number, k = 0.12) => v * (1 + (Math.random() * 2 - 1) * k);

/** The click of two hard tiles meeting: a filtered noise burst plus a short low knock. */
function clack(c: AudioContext, at: number, { freq = 2600, gain = 0.3, decay = 0.045, body = 170 } = {}) {
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noise;
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = jitter(freq);
  band.Q.value = 2.4;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  src.connect(band).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.15, decay + 0.02);
  if (body) {
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(jitter(body), t);
    o.frequency.exponentialRampToValueAtTime(body * 0.6, t + 0.05);
    og.gain.setValueAtTime(gain * 0.5, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(og).connect(c.destination);
    o.start(t);
    o.stop(t + 0.08);
  }
}

/** A soft slide of a tile across the felt or out of the wall. */
function slide(c: AudioContext, at: number, dur = 0.12, gain = 0.06) {
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noise;
  const low = c.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 1400;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(low).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.05, dur + 0.02);
}

function tone(c: AudioContext, at: number, freq: number, dur: number, gain = 0.1, type: OscillatorType = 'triangle') {
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let lastRattle = 0;

export const sfx = {
  play(kind: SfxKind, delayMs = 0) {
    const c = audio();
    if (!c) return;
    const at = delayMs / 1000;
    switch (kind) {
      case 'pick': clack(c, at, { freq: 3400, gain: 0.12, decay: 0.03, body: 0 }); break;
      case 'place': clack(c, at, { freq: 2600, gain: 0.26 }); break;
      case 'draw': slide(c, at, 0.1, 0.05); clack(c, at + 0.08, { freq: 3000, gain: 0.18, body: 200 }); break;
      case 'discard': clack(c, at, { freq: 2200, gain: 0.34, body: 150 }); clack(c, at + 0.05, { freq: 2600, gain: 0.08, decay: 0.03, body: 0 }); break;
      case 'call': clack(c, at, { freq: 2000, gain: 0.36, body: 140 }); clack(c, at + 0.1, { freq: 2100, gain: 0.32, body: 140 }); break;
      case 'flip': clack(c, at, { freq: 3800, gain: 0.14, decay: 0.03, body: 0 }); break;
      case 'shuffle': for (let i = 0; i < 16; i += 1) clack(c, at + Math.random() * 0.75, { freq: 1800 + Math.random() * 1600, gain: 0.05 + Math.random() * 0.08, decay: 0.035, body: i % 4 ? 0 : 160 }); slide(c, at, 0.8, 0.04); break;
      case 'wall': for (let i = 0; i < 6; i += 1) clack(c, at + i * 0.07, { freq: 2500, gain: 0.14, decay: 0.035, body: i % 2 ? 0 : 170 }); break;
      case 'dice': for (let i = 0; i < 7; i += 1) clack(c, at + 0.06 * i + 0.012 * i * i, { freq: 1500, gain: 0.16 - i * 0.015, decay: 0.03, body: 230 }); break;
      case 'stick': clack(c, at, { freq: 950, gain: 0.22, decay: 0.05, body: 260 }); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(c, at + i * 0.1, f, 0.3, 0.09)); break;
      case 'ok': tone(c, at, 880, 0.12, 0.07); tone(c, at + 0.07, 1320, 0.16, 0.06); break;
      case 'oops': tone(c, at, 300, 0.16, 0.06, 'sine'); tone(c, at + 0.1, 220, 0.2, 0.06, 'sine'); break;
      default: break;
    }
  },
  /** Little clicks while tiles are being stirred by hand; call it on every move, it throttles itself. */
  rattle(energy = 1) {
    const now = performance.now();
    if (now - lastRattle < 70 || energy <= 0) return;
    lastRattle = now;
    const c = audio();
    if (!c) return;
    const n = Math.min(3, 1 + Math.floor(energy / 30));
    for (let i = 0; i < n; i += 1) clack(c, Math.random() * 0.06, { freq: 1800 + Math.random() * 1800, gain: 0.04 + Math.random() * 0.06, decay: 0.03, body: 0 });
  },
  get muted() { return muted; },
  setMuted(next: boolean) {
    muted = next;
    try { localStorage.setItem(KEY, next ? 'off' : 'on'); } catch { /* storage may be blocked */ }
    listeners.forEach((fn) => fn(next));
    if (!next) sfx.play('place');
  },
};

/** The mute state as React state, shared by every switch on the page. */
export function useSfxMuted(): [boolean, () => void] {
  const [value, setValue] = useState(muted);
  useEffect(() => { listeners.add(setValue); return () => { listeners.delete(setValue); }; }, []);
  return [value, () => sfx.setMuted(!muted)];
}
