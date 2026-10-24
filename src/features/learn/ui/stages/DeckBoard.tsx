import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { FELT_Z, IsoCanvas, TILE_T, type IsoHandle, type Painter } from './iso3d';

export const TILE_BACK = '../assets/tile-back-rincon.svg';
export const DECK_SIZE = 136;
export const SIDE_SIZE = 34;

// Everything is measured in plane units: x and y both run 0–100 across the square table top.
export const BOARD_H = 100;
export const TILE_W = 3.6;
export const TILE_H = TILE_W * (4 / 3);
const SWEEP_R = 16;
export const FELT = { x0: 13, x1: 87, y0: 13, y1: 87 };

export type Pose = { x: number; y: number; rot: number; z: number; h?: number };

export type DeckStatus = { progress: number; done: boolean };

export const rand = (min: number, max: number) => min + Math.random() * (max - min);
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A loose layer of tiles over the middle of the felt, every one face down at its own angle. */
const heap = (spreadX: number, spreadY: number): Pose[] =>
  Array.from({ length: DECK_SIZE }, (_, index) => ({
    x: 50 + rand(-spreadX, spreadX),
    y: BOARD_H / 2 + rand(-spreadY, spreadY),
    rot: rand(-180, 180),
    z: index,
  }));

/** Tile positions survive from the shuffle step to the walls step. */
const shared: { poses: Pose[] | null } = { poses: null };
export const deckPoses = (spreadX: number, spreadY: number): Pose[] => (shared.poses ??= heap(spreadX, spreadY));

/**
 * The four walls sit on the sides of a square: each runs 17 stacks and stops one tile-thickness short of the corner,
 * leaving a small empty square where two walls meet. Row 0 is the lower one.
 */
export function wallSlot(side: number, stack: number, level: number): Pose {
  const run = 17 * TILE_W;
  const box = run + 2 * TILE_H;
  const x0 = (100 - box) / 2;
  const y0 = (BOARD_H - box) / 2;
  const along = stack * TILE_W + TILE_W / 2;
  const z = 200 + level * 100 + stack;
  const h = level;
  // sides in turn order: yours (bottom), then counter-clockwise
  if (side === 0) return { x: x0 + TILE_H + along, y: y0 + box - TILE_H / 2, rot: 0, z, h };
  if (side === 1) return { x: x0 + box - TILE_H / 2, y: y0 + box - TILE_H - along, rot: -90, z, h };
  if (side === 2) return { x: x0 + box - TILE_H - along, y: y0 + TILE_H / 2, rot: 180, z, h };
  return { x: x0 + TILE_H / 2, y: y0 + TILE_H + along, rot: 90, z, h };
}

const RIVAL_START = [{ x: 96, y: 50 }, { x: 50, y: 4 }, { x: 4, y: 50 }];
const RIVAL_TURN = [-90, 180, 90];
/** The rivals stop shuffling after this long. */
const RIVAL_MS = 3000;

/** A tapered finger from (cx, baseY) up to tipY, as an outline path. */
const finger = (cx: number, baseY: number, tipY: number, w: number, lean = 0) => {
  const tip = w * 0.34;
  const mid = baseY + (tipY - baseY) * 0.45;
  const mid2 = tipY + (baseY - tipY) * 0.22;
  const left = cx - w / 2;
  const right = cx + w / 2;
  return `M${left} ${baseY}C${left} ${mid} ${cx - tip + lean} ${mid2} ${cx - tip + lean} ${tipY + tip}A${tip} ${tip} 0 0 1 ${cx + tip + lean} ${tipY + tip}C${cx + tip + lean} ${mid2} ${right} ${mid} ${right} ${baseY}Z`;
};

/** An almond nail sitting on a fingertip. */
const nail = (cx: number, tipY: number, w: number, lean = 0, length = 13) => {
  const a = w * 0.33;
  const x = cx + lean;
  return `M${x - a} ${tipY + length}C${x - a} ${tipY + 4} ${x - a * 0.55} ${tipY + 0.8} ${x} ${tipY + 0.8}C${x + a * 0.55} ${tipY + 0.8} ${x + a} ${tipY + 4} ${x + a} ${tipY + length}Q${x} ${tipY + length + 2.6} ${x - a} ${tipY + length}Z`;
};

/** A woman's open hand seen from above, pointing up: long fingers, almond nails, a thin ring and a soft cuff. */
function Palm() {
  const outline = '#a06f5a';
  const digits: Array<{ cx: number; tip: number; w: number; lean: number }> = [
    { cx: 37.4, tip: 24, w: 8.8, lean: -1.2 },
    { cx: 46.8, tip: 12, w: 9, lean: -0.3 },
    { cx: 56.2, tip: 20, w: 8.8, lean: 0.6 },
    { cx: 64.6, tip: 38, w: 7.6, lean: 1.8 },
  ];
  const palm = 'M33.500 86C32 100 34 112 39 123C42 129 43 136 43 152H57C57 136 58 129 61 123C66 112 68 100 66.500 86Z';
  return (
    <svg viewBox="0 0 100 180" aria-hidden="true">
      <defs>
        <linearGradient id="hand-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe5d3" />
          <stop offset="1" stopColor="#f0c4a6" />
        </linearGradient>
        <linearGradient id="hand-nail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4f1" />
          <stop offset="1" stopColor="#f6d3d0" />
        </linearGradient>
      </defs>
      {/* wrist and thumb behind the palm */}
            <g transform="translate(36 112) rotate(-52)">
        <path d={finger(0, 0, -50, 10.4)} fill="url(#hand-skin)" stroke={outline} strokeWidth="1.5" strokeLinejoin="round" />
        <path d={nail(0, -50, 10.4, 0, 12)} fill="url(#hand-nail)" stroke="#e6aeb0" strokeWidth="0.8" />
      </g>
      {digits.map((d) => (
        <path key={d.cx} d={finger(d.cx, 94, d.tip, d.w, d.lean)} fill="url(#hand-skin)" stroke={outline} strokeWidth="1.5" strokeLinejoin="round" />
      ))}
      <path d={palm} fill="url(#hand-skin)" stroke={outline} strokeWidth="1.5" strokeLinejoin="round" />
      {digits.map((d) => (
        <g key={`n-${d.cx}`}>
          <path d={nail(d.cx, d.tip, d.w, d.lean)} fill="url(#hand-nail)" stroke="#e6aeb0" strokeWidth="0.8" />
          <path d={nail(d.cx - d.w * 0.12, d.tip + 1.6, d.w * 0.4, d.lean, 5)} fill="#fff" opacity=".7" />
        </g>
      ))}
      <g fill="none" stroke="#d9a98a" strokeWidth="0.9" strokeLinecap="round" opacity=".7">
        <path d="M35 88q3 2 6 0M44 88q3 2 6 0M53 88q3 2 6 0M61.500 88q3 2 6 0M37 104q12 7 26 0M43 116q7 3 14 0" />
      </g>
      <ellipse cx="56.200" cy="62" rx="4.800" ry="1.800" fill="none" stroke="#d6a93c" strokeWidth="1.500" />
      {/* soft cuff in the style's colours */}
      <g stroke={outline} strokeWidth="1.3" strokeLinejoin="round">
        <rect x="28" y="150" width="44" height="28" rx="9" fill="var(--tile-cream)" />
        <rect x="28" y="158" width="44" height="4.500" fill="var(--tile-back)" />
      </g>
      <g fill="var(--tile-cream)" stroke={outline} strokeWidth="1.1">
        {[33, 40, 47, 54, 61, 67].map((x) => <circle key={x} cx={x} cy="151" r="4.200" />)}
      </g>
      <rect x="31" y="152" width="38" height="5" fill="var(--tile-cream)" />
    </svg>
  );
}

/**
 * The whole deck face down: the pointer is a pair of hands that sweep the tiles around the felt.
 * Positions are kept in `deckPoses`, so the next step (building the walls) starts from this mix.
 */
export function DeckBoard({ language, onStatus }: { language: TutorialLanguage; onStatus?: (status: DeckStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const boardRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const hand2Ref = useRef<HTMLDivElement>(null);
  const poses = useRef<Pose[]>(deckPoses(34, 34));
  const last = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(0);
  const zTop = useRef(DECK_SIZE);
  const [progress, setProgress] = useState(0);

  const scene = useRef<IsoHandle>(null);

  useEffect(() => {
    onStatus?.({ progress, done: progress >= 1 });
  }, [progress, onStatus]);

  // Tiles carry a little momentum, so a sweep keeps flowing after the hand has passed.
  const vel = useRef(new Float32Array(DECK_SIZE * 3)); // vx, vy, vrot per tile
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0, inside: false, down: false });
  const lag = useRef({ x: 0, y: 0 });

  /** A hand passing over the felt at `point`, moving (dx, dy) since the last frame, pushes the tiles around it. */
  const sweep = useCallback((point: { x: number; y: number }, dx: number, dy: number) => {
    const speed = Math.hypot(dx, dy);
    if (speed < 0.03) return;
    const v = vel.current;
    poses.current.forEach((pose, index) => {
      const ox = pose.x - point.x;
      const oy = pose.y - point.y;
      const dist = Math.hypot(ox, oy);
      if (dist > SWEEP_R) return;
      const falloff = (1 - dist / SWEEP_R) ** 1.3;
      v[index * 3] += (dx * 0.55 + (ox / (dist || 1)) * speed * 0.22 + rand(-0.06, 0.06)) * falloff;
      v[index * 3 + 1] += (dy * 0.55 + (oy / (dist || 1)) * speed * 0.22 + rand(-0.06, 0.06)) * falloff;
      v[index * 3 + 2] += (rand(-3, 3) + dx * 1.2) * falloff;
      pose.z = ++zTop.current;
    });
  }, []);

  // The three rivals shuffle too, each from their own side, for the first few seconds.
  const rivalHands = useRef<Array<HTMLSpanElement | null>>([]);
  const rivalAt = useRef<Array<{ x: number; y: number }>>(RIVAL_START.map((start) => ({ ...start })));
  const rivalClock = useRef<{ start: number; active: boolean }>({ start: 0, active: false });

  const moveRivals = useCallback((now: number) => {
    const clock = rivalClock.current;
    if (!clock.active) return;
    const elapsed = now - clock.start;
    const done = elapsed > RIVAL_MS;
    RIVAL_START.forEach((start, hand) => {
      const el = rivalHands.current[hand];
      if (!el) return;
      const seconds = elapsed / 1000;
      const phase = hand * 2.1;
      const angle = seconds * 3.4 + phase;
      const path = { x: 50 + 26 * Math.cos(angle), y: 50 + 22 * Math.sin(angle * 1.3 + phase) };
      const ease = Math.min(1, elapsed / 700);
      const target = { x: start.x + (path.x - start.x) * ease, y: start.y + (path.y - start.y) * ease };
      const from = rivalAt.current[hand];
      if (!done) sweep(target, target.x - from.x, target.y - from.y);
      rivalAt.current[hand] = target;
      const fade = done ? 0 : Math.min(1, elapsed / 300);
      el.style.opacity = String(fade);
      const at = scene.current?.project(target.x, target.y, FELT_Z + TILE_T + 6);
      if (at) {
        el.style.left = `${at.x}px`;
        el.style.top = `${at.y}px`;
        el.style.transform = `translate(-50%, -78%) rotate(${RIVAL_TURN[hand]}deg) scale(${at.f})${hand === 1 ? ' scaleX(-1)' : ''}`;
      }
    });
    if (done) clock.active = false;
  }, [sweep]);

  const step = useCallback(() => {
    frame.current = 0;
    let energy = 0;
    moveRivals(performance.now());
    const v = vel.current;
    poses.current.forEach((pose, index) => {
      const vx = v[index * 3];
      const vy = v[index * 3 + 1];
      const vr = v[index * 3 + 2];
      if (Math.abs(vx) + Math.abs(vy) + Math.abs(vr) < 0.012) return;
      pose.x += vx;
      pose.y += vy;
      pose.rot += vr;
      if (pose.x < FELT.x0 || pose.x > FELT.x1) { pose.x = clamp(pose.x, FELT.x0, FELT.x1); v[index * 3] = -vx * 0.4; } else v[index * 3] = vx * 0.9;
      if (pose.y < FELT.y0 || pose.y > FELT.y1) { pose.y = clamp(pose.y, FELT.y0, FELT.y1); v[index * 3 + 1] = -vy * 0.4; } else v[index * 3 + 1] = vy * 0.9;
      v[index * 3 + 2] = vr * 0.9;
      energy += Math.hypot(vx, vy);
    });
    scene.current?.invalidate();
    if (energy > 0) {
      moved.current += energy;
      setProgress(Math.min(1, moved.current / 2700));
    }
    // the second hand trails the first, so the pair feels like two palms mixing
    const hand2 = hand2Ref.current;
    if (hand2 && pointer.current.inside) {
      lag.current.x += (pointer.current.x - 54 - lag.current.x) * 0.16;
      lag.current.y += (pointer.current.y + 18 - lag.current.y) * 0.16;
      hand2.style.transform = `translate(${lag.current.x}px, ${lag.current.y}px) translate(-50%, -50%) scaleX(-1) rotate(${pointer.current.down ? 8 : -6}deg)`;
    }
    if (energy > 0.05 || pointer.current.inside || rivalClock.current.active) frame.current = requestAnimationFrame(step);
  }, [moveRivals]);

  const wake = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(step);
  }, [step]);

  useEffect(() => {
    rivalClock.current = { start: performance.now(), active: true };
    wake();
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [wake]);

  const moveHand = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current.x = clientX - rect.left;
    pointer.current.y = clientY - rect.top;
    const hand = handRef.current;
    if (hand) hand.style.transform = `translate(${pointer.current.x}px, ${pointer.current.y}px) translate(-50%, -50%) rotate(${pointer.current.down ? -10 : 4}deg) scale(${pointer.current.down ? 0.94 : 1})`;
  };

  const showHands = (visible: boolean) => {
    pointer.current.inside = visible;
    [handRef.current, hand2Ref.current].forEach((el) => { if (el) el.style.opacity = visible ? '1' : '0'; });
    if (visible) {
      lag.current = { x: pointer.current.x - 54, y: pointer.current.y + 18 };
      wake();
    }
  };

  const onSweep = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = scene.current!.unproject(event, FELT_Z + TILE_T);
    const before = last.current;
    last.current = point;
    if (!before || event.buttons === 0) return;
    sweep(point, point.x - before.x, point.y - before.y);
    wake();
  };

  const onSweepDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    last.current = scene.current!.unproject(event, FELT_Z + TILE_T);
  };

  const draw = useCallback((g: Painter) => {
    poses.current.forEach((pose) => {
      g.tile(pose.x, pose.y, pose.rot, FELT_Z + (pose.h ?? 0) * TILE_T, { order: pose.y * 100 + (pose.z % 1000) * 0.01 });
    });
    g.flush();
  }, []);

  // Keyboard- and tap-friendly alternative to sweeping: one shove across the whole felt.
  const stir = useCallback(() => {
    const v = vel.current;
    for (let index = 0; index < DECK_SIZE; index += 1) {
      v[index * 3] += rand(-1.6, 1.6);
      v[index * 3 + 1] += rand(-1, 1);
      v[index * 3 + 2] += rand(-14, 14);
    }
    wake();
  }, [wake]);

  const done = progress >= 1;

  return (
    <div className="sort-stage deck-stage">
      <div
        className={`sort-board deck-board is-shuffle${done ? ' is-sorted' : ''}`}
        ref={boardRef}
        onPointerMove={(event) => moveHand(event.clientX, event.clientY)}
        onPointerLeave={() => { last.current = null; pointer.current.down = false; showHands(false); }}
        onPointerEnter={(event) => { moveHand(event.clientX, event.clientY); showHands(true); }}
        onPointerUp={() => { pointer.current.down = false; }}
        onPointerDown={(event) => { pointer.current.down = true; moveHand(event.clientX, event.clientY); }}
      >
        <IsoCanvas ref={scene} draw={draw} handlers={{ onPointerMove: onSweep, onPointerDown: onSweepDown }} />
        {RIVAL_START.map((_, hand) => (
          <span key={`rival-${hand}`} className="deck-rival-hand" ref={(el) => { rivalHands.current[hand] = el; }} style={{ opacity: 0 }}><Palm /></span>
        ))}

        {(
          <>
            <div className="deck-hand" ref={hand2Ref} aria-hidden="true" style={{ opacity: 0 }}><Palm /></div>
            <div className="deck-hand" ref={handRef} aria-hidden="true" style={{ opacity: 0 }}><Palm /></div>
          </>
        )}

        <div className="sort-actions deck-actions">
          <span>{Math.round(progress * 100)}% {t('mezclado', 'shuffled', 'embaralhado')}</span>
          <button type="button" className="sort-button" onClick={stir}>{t('Revolver', 'Stir', 'Mexer')}</button>
        </div>

        <div className="deck-meter" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></div>

        {done && (
          <p className="sort-win" role="status">
            <b>{t('¡Bien mezcladas!', 'Well shuffled!', 'Bem embaralhadas!')}</b>
            <span>{t('Nadie sabe qué ficha está dónde. Sigue: armar los muros.', 'Nobody knows which tile is where. Next: build the walls.', 'Ninguém sabe qual peça está onde. Próximo: montar os muros.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
