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

/** Every rival cat shuffles with two paws, entering side by side from its own edge. */
const RIVAL_PAWS = [
  { rival: 0, second: false, x: 96, y: 43, turn: -90 }, { rival: 0, second: true, x: 96, y: 57, turn: -90 },
  { rival: 1, second: false, x: 43, y: 4, turn: 180 }, { rival: 1, second: true, x: 57, y: 4, turn: 180 },
  { rival: 2, second: false, x: 4, y: 57, turn: 90 }, { rival: 2, second: true, x: 4, y: 43, turn: 90 },
];
/** The rivals stop shuffling after this long. */
const RIVAL_MS = 3000;

export type PawLook = 'white' | 'orange' | 'grey' | 'black';

/** Fur and pad colours per cat: yours is white; the rivals are an orange tabby, a grey cat and a black cat. */
const PAW_LOOKS: Record<PawLook, { light: string; dark: string; line: string; pad: string; padLine: string; shine: number; stripes?: boolean }> = {
  white: { light: '#ffffff', dark: '#fde9d6', line: '#ecc9ab', pad: '#f6a3b6', padLine: '#dc7690', shine: 0.65 },
  orange: { light: '#ffcb8e', dark: '#ee9544', line: '#c9742a', pad: '#f9b0bd', padLine: '#d9708a', shine: 0.5, stripes: true },
  grey: { light: '#e2e7ef', dark: '#a9b3c6', line: '#8794ab', pad: '#eaa9c8', padLine: '#c778a5', shine: 0.55 },
  black: { light: '#62627a', dark: '#2d2d39', line: '#707086', pad: '#e88ca7', padLine: '#b45a77', shine: 0.3 },
};

/** A round, chubby cat paw pressing down: four toes, pink beans, no arm. */
export function Palm({ look = 'white' }: { look?: PawLook }) {
  const c = PAW_LOOKS[look];
  const ink = 'var(--tile-ink)';
  const gid = `paw-fur-${look}`;
  const toes: Array<[number, number, number]> = [[19, 44, 15], [38, 23, 16.5], [62, 23, 16.5], [81, 44, 15]];
  const body = 'M50 38C74 38 90 52 90 68C90 86 72 98 50 98C28 98 10 86 10 68C10 52 26 38 50 38Z';
  return (
    <svg viewBox="0 0 100 106" aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx=".38" cy=".28" r=".95">
          <stop offset="0" stopColor={c.light} />
          <stop offset="1" stopColor={c.dark} />
        </radialGradient>
      </defs>
      <g fill={ink} stroke={ink} strokeWidth="5.5" strokeLinejoin="round">
        <path d={body} />
        {toes.map(([cx, cy, r]) => <circle key={`o-${cx}`} cx={cx} cy={cy} r={r} />)}
      </g>
      <g fill={`url(#${gid})`}>
        <path d={body} />
        {toes.map(([cx, cy, r]) => <circle key={`f-${cx}`} cx={cx} cy={cy} r={r} />)}
      </g>
      {c.stripes && (
        <g fill="none" stroke={c.line} strokeWidth="2.6" strokeLinecap="round" opacity=".85">
          {toes.map(([cx, cy, r]) => <path key={`s-${cx}`} d={`M${cx - 5} ${cy - r + 4}l2.600 5M${cx + 1} ${cy - r + 2.600}l0 5.400M${cx + 6} ${cy - r + 4.600}l-2 5`} />)}
        </g>
      )}
      <g fill="none" stroke={c.line} strokeWidth="1.8" strokeLinecap="round" opacity=".85">
        <path d="M28 40q2 7 0 14M50 34v16M72 40q-2 7 0 14" />
      </g>
      <g fill={c.pad} stroke={c.padLine} strokeWidth="1.8">
        <path d="M50 62C38 62 28 70 30 80C32 90 42 90 50 86C58 90 68 90 70 80C72 70 62 62 50 62Z" />
        {toes.map(([cx, cy]) => <ellipse key={`p-${cx}`} cx={cx} cy={cy + 1.5} rx="7.4" ry="8.2" />)}
      </g>
      <g fill="#fff" opacity={c.shine}>
        <ellipse cx="44" cy="69" rx="4.6" ry="2.6" />
        {toes.map(([cx, cy]) => <ellipse key={`h-${cx}`} cx={cx - 2.2} cy={cy - 2} rx="2.4" ry="3" />)}
      </g>
    </svg>
  );
}

const RIVAL_LOOKS: PawLook[] = ['orange', 'grey', 'black'];

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
  const sweep = useCallback((point: { x: number; y: number }, dx: number, dy: number, gain = 1) => {
    const speed = Math.hypot(dx, dy);
    if (speed < 0.03) return;
    const v = vel.current;
    poses.current.forEach((pose, index) => {
      const ox = pose.x - point.x;
      const oy = pose.y - point.y;
      const dist = Math.hypot(ox, oy);
      if (dist > SWEEP_R) return;
      const falloff = (1 - dist / SWEEP_R) ** 1.3;
      v[index * 3] += (dx * 0.55 + (ox / (dist || 1)) * speed * 0.22 + rand(-0.06, 0.06)) * falloff * gain;
      v[index * 3 + 1] += (dy * 0.55 + (oy / (dist || 1)) * speed * 0.22 + rand(-0.06, 0.06)) * falloff * gain;
      v[index * 3 + 2] += (rand(-3, 3) + dx * 1.2) * falloff * gain;
      pose.z = ++zTop.current;
    });
  }, []);

  // The three rivals shuffle too, each from their own side, for the first few seconds.
  const rivalHands = useRef<Array<HTMLSpanElement | null>>([]);
  const rivalAt = useRef<Array<{ x: number; y: number }>>(RIVAL_PAWS.map((paw) => ({ x: paw.x, y: paw.y })));
  const rivalClock = useRef<{ start: number; active: boolean }>({ start: 0, active: false });

  const moveRivals = useCallback((now: number) => {
    const clock = rivalClock.current;
    if (!clock.active) return;
    const elapsed = now - clock.start;
    const done = elapsed > RIVAL_MS;
    RIVAL_PAWS.forEach((paw, hand) => {
      const start = { x: paw.x, y: paw.y };
      const el = rivalHands.current[hand];
      if (!el) return;
      const seconds = elapsed / 1000;
      const phase = paw.rival * 2.1 + (paw.second ? 1.7 : 0);
      const angle = seconds * 3.4 + phase;
      const reach = paw.second ? 21 : 26;
      const path = { x: 50 + reach * Math.cos(angle), y: 50 + (reach - 4) * Math.sin(angle * 1.3 + phase) };
      const ease = Math.min(1, elapsed / 700);
      const target = { x: start.x + (path.x - start.x) * ease, y: start.y + (path.y - start.y) * ease };
      const from = rivalAt.current[hand];
      if (!done) sweep(target, target.x - from.x, target.y - from.y, 0.4);
      rivalAt.current[hand] = target;
      const fade = done ? 0 : Math.min(1, elapsed / 300);
      el.style.opacity = String(fade);
      const at = scene.current?.project(target.x, target.y, FELT_Z + TILE_T + 6);
      if (at) {
        el.style.left = `${at.x}px`;
        el.style.top = `${at.y}px`;
        el.style.transform = `translate(-50%, -50%) rotate(${paw.turn}deg) scale(${at.f})${paw.second ? ' scaleX(-1)' : ''}`;
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
      moved.current += rivalClock.current.active ? energy * 0.2 : energy;
      setProgress(Math.min(1, moved.current / 2700));
    }
    // the second hand trails the first, so the pair feels like two palms mixing
    const hand2 = hand2Ref.current;
    if (hand2 && pointer.current.inside) {
      lag.current.x += (pointer.current.x - 54 - lag.current.x) * 0.16;
      lag.current.y += (pointer.current.y + 18 - lag.current.y) * 0.16;
      hand2.style.transform = `translate(${lag.current.x}px, ${lag.current.y}px) translate(-50%, -50%) scaleX(-1) rotate(${pointer.current.down ? 8 : 3}deg)`;
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
    if (hand) hand.style.transform = `translate(${pointer.current.x}px, ${pointer.current.y}px) translate(-50%, -50%) rotate(${pointer.current.down ? -8 : -3}deg) scale(${pointer.current.down ? 0.95 : 1})`;
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
    g.table();
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
        {RIVAL_PAWS.map((paw, hand) => (
          <span key={`rival-${hand}`} className="deck-rival-hand" ref={(el) => { rivalHands.current[hand] = el; }} style={{ opacity: 0 }}><Palm look={RIVAL_LOOKS[paw.rival]} /></span>
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
