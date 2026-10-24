import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';

export const TILE_BACK = '../assets/tile-back-rincon.svg';
export const DECK_SIZE = 136;
export const SIDE_SIZE = 34;

// Everything is measured in "board widths": x runs 0–100 and y runs 0–BOARD_H, so physics stay square.
export const BOARD_H = 62.5;
export const TILE_W = 2.6;
export const TILE_H = TILE_W * (4 / 3);
export const STACK_RISE = 0.7;
const SWEEP_R = 11;
export const FELT = { x0: 12, x1: 88, y0: 7, y1: BOARD_H - 7 };

export type Pose = { x: number; y: number; rot: number; z: number };

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

/** The four walls form a pinwheel: each side runs 17 stacks and tucks against the next. Row 0 is the lower one. */
export function wallSlot(side: number, stack: number, level: number): Pose {
  const run = 17 * TILE_W;
  const box = run + TILE_H;
  const x0 = (100 - box) / 2;
  const y0 = (BOARD_H - box) / 2;
  const along = stack * TILE_W + TILE_W / 2;
  const lift = level * STACK_RISE;
  const z = 200 + level * 100 + stack;
  // sides in turn order: yours (bottom), then counter-clockwise
  if (side === 0) return { x: x0 + TILE_H + along, y: y0 + box - TILE_H / 2 - lift, rot: 0, z };
  if (side === 1) return { x: x0 + box - TILE_H / 2 - lift, y: y0 + box - TILE_H - along, rot: -90, z };
  if (side === 2) return { x: x0 + run - along, y: y0 + TILE_H / 2 - lift, rot: 180, z };
  return { x: x0 + TILE_H / 2 - lift, y: y0 + TILE_H + along, rot: 90, z };
}

const HAND_SHAPES = [
  <rect key="i" x="22" y="14" width="12" height="52" rx="6" />,
  <rect key="m" x="36" y="6" width="12" height="60" rx="6" />,
  <rect key="r" x="50" y="10" width="12" height="56" rx="6" />,
  <rect key="p" x="64" y="22" width="12" height="44" rx="6" />,
  <rect key="t" x="5" y="60" width="34" height="13" rx="6.5" transform="rotate(-38 22 70)" />,
  <rect key="a" x="22" y="48" width="56" height="58" rx="22" />,
];

/** A flat open palm, outlined once around the whole silhouette. */
function Palm() {
  return (
    <svg viewBox="0 0 100 112" aria-hidden="true">
      <g fill="none" stroke="var(--ink)" strokeWidth="7" strokeLinejoin="round">{HAND_SHAPES}</g>
      <g fill="#f4cba5" stroke="none">{HAND_SHAPES}</g>
      <g fill="none" stroke="#c98f66" strokeWidth="1.6" strokeLinecap="round" opacity=".7">
        <path d="M34 70 Q50 80 70 68" /><path d="M36 86 Q50 94 66 86" />
      </g>
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
  const tileRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const poses = useRef<Pose[]>(deckPoses(26, 17));
  const last = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(0);
  const zTop = useRef(DECK_SIZE);
  const [progress, setProgress] = useState(0);

  const place = useCallback((index: number) => {
    const el = tileRefs.current[index];
    if (!el) return;
    const pose = poses.current[index];
    el.style.left = `${pose.x}%`;
    el.style.top = `${(pose.y / BOARD_H) * 100}%`;
    el.style.transform = `translate(-50%, -50%) rotate(${pose.rot}deg)`;
    el.style.zIndex = String(pose.z);
  }, []);

  useEffect(() => {
    for (let index = 0; index < DECK_SIZE; index += 1) place(index);
  }, [place]);

  useEffect(() => {
    onStatus?.({ progress, done: progress >= 1 });
  }, [progress, onStatus]);

  const toUnits = (clientX: number, clientY: number) => {
    const rect = boardRef.current!.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.width) * 100 };
  };

  // Tiles carry a little momentum, so a sweep keeps flowing after the hand has passed.
  const vel = useRef(new Float32Array(DECK_SIZE * 3)); // vx, vy, vrot per tile
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0, inside: false, down: false });
  const lag = useRef({ x: 0, y: 0 });

  const step = useCallback(() => {
    frame.current = 0;
    let energy = 0;
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
      place(index);
    });
    if (energy > 0) {
      moved.current += energy;
      setProgress(Math.min(1, moved.current / 1800));
    }
    // the second hand trails the first, so the pair feels like two palms mixing
    const hand2 = hand2Ref.current;
    if (hand2 && pointer.current.inside) {
      lag.current.x += (pointer.current.x - 54 - lag.current.x) * 0.16;
      lag.current.y += (pointer.current.y + 18 - lag.current.y) * 0.16;
      hand2.style.transform = `translate(${lag.current.x}px, ${lag.current.y}px) translate(-50%, -50%) scaleX(-1) rotate(${pointer.current.down ? 8 : -6}deg)`;
    }
    if (energy > 0.05 || pointer.current.inside) frame.current = requestAnimationFrame(step);
  }, [place]);

  const wake = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(step);
  }, [step]);

  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);

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

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    moveHand(event.clientX, event.clientY);
    const point = toUnits(event.clientX, event.clientY);
    const before = last.current;
    last.current = point;
    if (!before || event.buttons === 0) return;
    const dx = point.x - before.x;
    const dy = point.y - before.y;
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
    wake();
  };

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
  const tiles = useMemo(() => Array.from({ length: DECK_SIZE }, (_, index) => index), []);

  return (
    <div className="sort-stage deck-stage">
      <div
        className={`sort-board deck-board is-shuffle${done ? ' is-sorted' : ''}`}
        ref={boardRef}
        onPointerMove={onMove}
        onPointerLeave={() => { last.current = null; pointer.current.down = false; showHands(false); }}
        onPointerEnter={(event) => { moveHand(event.clientX, event.clientY); showHands(true); }}
        onPointerUp={() => { pointer.current.down = false; }}
        onPointerDown={(event) => { pointer.current.down = true; last.current = toUnits(event.clientX, event.clientY); moveHand(event.clientX, event.clientY); }}
      >
        <div className="deck-felt" aria-hidden="true"><span>{t('Las 136 fichas, boca abajo', 'All 136 tiles, face down', 'As 136 peças, viradas para baixo')}</span></div>

        {tiles.map((index) => (
          <span key={index} className="deck-tile" ref={(el) => { tileRefs.current[index] = el; }} style={{ width: `${TILE_W}%` }}>
            <img src={TILE_BACK} alt="" draggable={false} />
          </span>
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
