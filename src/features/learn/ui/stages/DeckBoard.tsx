import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';

export const TILE_BACK = '../assets/tile-back-rincon.svg';
const DECK_SIZE = 136;
const SIDE_SIZE = 34;

// Everything is measured in "board widths": x runs 0–100 and y runs 0–BOARD_H, so physics stay square.
const BOARD_H = 62.5;
const TILE_W = 2.6;
const TILE_H = TILE_W * (4 / 3);
const STACK_RISE = 0.7;
const SWEEP_R = 10;
const FELT = { x0: 12, x1: 88, y0: 7, y1: BOARD_H - 7 };

type Pose = { x: number; y: number; rot: number; z: number };

export type DeckStatus = { progress: number; done: boolean; built: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A loose layer of tiles over the middle of the felt, every one face down at its own angle. */
const heap = (spreadX: number, spreadY: number): Pose[] =>
  Array.from({ length: DECK_SIZE }, (_, index) => ({
    x: 50 + rand(-spreadX, spreadX),
    y: BOARD_H / 2 + rand(-spreadY, spreadY),
    rot: rand(-180, 180),
    z: index,
  }));

/** The four walls form a pinwheel: each side runs 17 stacks and tucks against the next. */
function wallSlot(index: number): Pose {
  const side = Math.floor(index / SIDE_SIZE);
  const within = index % SIDE_SIZE;
  const stack = Math.floor(within / 2);
  const level = within % 2;
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

const SIDE_NAME = {
  es: ['tu lado', 'derecha', 'enfrente', 'izquierda'],
  en: ['your side', 'right', 'across', 'left'],
  pt: ['seu lado', 'direita', 'em frente', 'esquerda'],
};

/**
 * The whole deck face down. In "shuffle" mode the pointer is a hand that sweeps the tiles around the felt;
 * in "walls" mode the tiles are slid into four walls of 34, one side at a time.
 */
export function DeckBoard({ mode, language, onStatus }: { mode: 'shuffle' | 'walls'; language: TutorialLanguage; onStatus?: (status: DeckStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const boardRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const poses = useRef<Pose[]>(mode === 'shuffle' ? heap(26, 17) : heap(16, 10));
  const last = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(0);
  const zTop = useRef(DECK_SIZE);
  const [progress, setProgress] = useState(0);
  const [built, setBuilt] = useState(0);
  const [settling, setSettling] = useState(false);

  const place = useCallback((index: number) => {
    const el = tileRefs.current[index];
    if (!el) return;
    const wall = mode === 'walls' && Math.floor(index / SIDE_SIZE) < built;
    const pose = wall ? wallSlot(index) : poses.current[index];
    el.style.left = `${pose.x}%`;
    el.style.top = `${(pose.y / BOARD_H) * 100}%`;
    el.style.transform = `translate(-50%, -50%) rotate(${pose.rot}deg)`;
    el.style.zIndex = String(pose.z);
    // the lower row of 17 goes down first, the upper row of 17 lands on top of it afterwards
    const within = index % SIDE_SIZE;
    el.style.transitionDelay = wall ? `${(within % 2) * 0.9 + Math.floor(within / 2) * 0.04}s` : '0s';
  }, [built, mode]);

  useEffect(() => {
    for (let index = 0; index < DECK_SIZE; index += 1) place(index);
  }, [place]);

  useEffect(() => {
    onStatus?.({ progress, done: mode === 'shuffle' ? progress >= 1 : built >= 4, built });
  }, [progress, built, mode, onStatus]);

  const toUnits = (clientX: number, clientY: number) => {
    const rect = boardRef.current!.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.width) * 100 };
  };

  const moveHand = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    const hand = handRef.current;
    if (!rect || !hand) return;
    hand.style.left = `${clientX - rect.left}px`;
    hand.style.top = `${clientY - rect.top}px`;
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    moveHand(event.clientX, event.clientY);
    if (mode !== 'shuffle') return;
    const point = toUnits(event.clientX, event.clientY);
    const before = last.current;
    last.current = point;
    if (!before || event.buttons === 0) return;
    const dx = point.x - before.x;
    const dy = point.y - before.y;
    const speed = Math.hypot(dx, dy);
    if (speed < 0.05) return;
    let total = 0;
    poses.current.forEach((pose, index) => {
      const ox = pose.x - point.x;
      const oy = pose.y - point.y;
      const dist = Math.hypot(ox, oy);
      if (dist > SWEEP_R) return;
      const falloff = 1 - dist / SWEEP_R;
      const push = (dx * 0.85 + (ox / (dist || 1)) * speed * 0.35 + rand(-0.25, 0.25)) * falloff * 1.1;
      const pushY = (dy * 0.85 + (oy / (dist || 1)) * speed * 0.35 + rand(-0.25, 0.25)) * falloff * 1.1;
      pose.x = clamp(pose.x + push, FELT.x0, FELT.x1);
      pose.y = clamp(pose.y + pushY, FELT.y0, FELT.y1);
      pose.rot += rand(-16, 16) * falloff + dx * 2;
      pose.z = ++zTop.current;
      total += Math.hypot(push, pushY);
      place(index);
    });
    if (total > 0) {
      moved.current += total;
      setProgress(Math.min(1, moved.current / 1400));
    }
  };

  // Keyboard- and tap-friendly alternative to sweeping: one shove across the whole felt.
  const stir = useCallback(() => {
    if (settling) return;
    setSettling(true);
    let total = 0;
    poses.current = poses.current.map((pose, index) => {
      const next = {
        x: clamp(pose.x + rand(-26, 26), FELT.x0, FELT.x1),
        y: clamp(pose.y + rand(-16, 16), FELT.y0, FELT.y1),
        rot: pose.rot + rand(-120, 120),
        z: index,
      };
      total += Math.hypot(next.x - pose.x, next.y - pose.y);
      return next;
    });
    for (let index = 0; index < DECK_SIZE; index += 1) place(index);
    moved.current += total * 0.5;
    setProgress(Math.min(1, moved.current / 1400));
    window.setTimeout(() => setSettling(false), 700);
  }, [place, settling]);

  const buildNext = useCallback(() => setBuilt((count) => Math.min(4, count + 1)), []);
  const buildAll = useCallback(() => setBuilt(4), []);
  const reset = useCallback(() => setBuilt(0), []);

  const done = mode === 'shuffle' ? progress >= 1 : built >= 4;
  const tiles = useMemo(() => Array.from({ length: DECK_SIZE }, (_, index) => index), []);

  return (
    <div className="sort-stage deck-stage">
      <div
        className={`sort-board deck-board is-${mode}${done ? ' is-sorted' : ''}`}
        ref={boardRef}
        onPointerMove={onMove}
        onPointerLeave={() => { last.current = null; if (handRef.current) handRef.current.style.opacity = '0'; }}
        onPointerEnter={() => { if (handRef.current) handRef.current.style.opacity = '1'; }}
        onPointerDown={(event) => { last.current = toUnits(event.clientX, event.clientY); moveHand(event.clientX, event.clientY); }}
      >
        <div className="deck-felt" aria-hidden="true"><span>{mode === 'shuffle' ? t('Las 136 fichas, boca abajo', 'All 136 tiles, face down', 'As 136 peças, viradas para baixo') : t('Cuatro muros de 34 fichas', 'Four walls of 34 tiles', 'Quatro muros de 34 peças')}</span></div>

        {tiles.map((index) => (
          <span key={index} className="deck-tile" ref={(el) => { tileRefs.current[index] = el; }} style={{ width: `${TILE_W}%` }}>
            <img src={TILE_BACK} alt="" draggable={false} />
          </span>
        ))}

        {mode === 'shuffle' && <div className="deck-hand" ref={handRef} aria-hidden="true" style={{ opacity: 0 }}><i /></div>}

        <div className="sort-actions deck-actions">
          {mode === 'shuffle' ? (
            <>
              <span>{Math.round(progress * 100)}% {t('mezclado', 'shuffled', 'embaralhado')}</span>
              <button type="button" className="sort-button" onClick={stir} disabled={settling}>{t('Revolver', 'Stir', 'Mexer')}</button>
            </>
          ) : (
            <>
              <span>{built}/4 {t('muros', 'walls', 'muros')}</span>
              {built < 4 && <button type="button" className="sort-button is-primary" onClick={buildNext}>{t(`Armar ${SIDE_NAME.es[built]}`, `Build ${SIDE_NAME.en[built]}`, `Montar ${SIDE_NAME.pt[built]}`)}</button>}
              {built < 3 && <button type="button" className="sort-button" onClick={buildAll}>{t('Todos', 'All', 'Todos')}</button>}
              {built > 0 && <button type="button" className="sort-button" onClick={reset}>{t('Deshacer', 'Reset', 'Desfazer')}</button>}
            </>
          )}
        </div>

        {mode === 'shuffle' && (
          <div className="deck-meter" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></div>
        )}

        {done && (
          <p className="sort-win" role="status">
            {mode === 'shuffle' ? (
              <>
                <b>{t('¡Bien mezcladas!', 'Well shuffled!', 'Bem embaralhadas!')}</b>
                <span>{t('Nadie sabe qué ficha está dónde. Sigue: armar los muros.', 'Nobody knows which tile is where. Next: build the walls.', 'Ninguém sabe qual peça está onde. Próximo: montar os muros.')}</span>
              </>
            ) : (
              <>
                <b>{t('136 fichas en cuatro muros', '136 tiles in four walls', '136 peças em quatro muros')}</b>
                <span>{t('17 pilas × 2 de alto × 4 lados.', '17 stacks × 2 high × 4 sides.', '17 pilhas × 2 de altura × 4 lados.')}</span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
