import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { BOARD_H, DECK_SIZE, FELT, SIDE_SIZE, STACK_RISE, TILE_H, TILE_W, TILE_BACK, clamp, deckPoses, wallSlot, type Pose } from './DeckBoard';

const ROW = 17;
const SNAP = 7;
const GRAB = TILE_W * 1.5;
const BOT_DELAY = [1400, 1900, 2400];
const BOT_TICK = 340;

export type WallStatus = { mine: number; rivals: number; done: boolean };

/** Where the k-th tile of a side goes: the lower row of 17 first, then the upper row on top of it. */
const slotFor = (side: number, k: number) => wallSlot(side, k % ROW, k < ROW ? 0 : 1);

const RIVAL_NAME = {
  es: ['Rival derecha', 'Rival enfrente', 'Rival izquierda'],
  en: ['Right rival', 'Rival across', 'Left rival'],
  pt: ['Rival à direita', 'Rival em frente', 'Rival à esquerda'],
};

/**
 * The shuffled tiles stay where the last step left them. The player drags tiles into the outlined strip to build
 * their own wall (lower row first); the three rivals build theirs by themselves as time passes.
 */
export function WallBoard({ language, onStatus }: { language: TutorialLanguage; onStatus?: (status: WallStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const boardRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const poses = useRef<Pose[]>(deckPoses(16, 10).map((pose) => ({ ...pose })));
  const slotOf = useRef<Array<{ side: number; k: number } | null>>(Array(DECK_SIZE).fill(null));
  const counts = useRef([0, 0, 0, 0]);
  const dragging = useRef<{ index: number; dx: number; dy: number } | null>(null);
  const zTop = useRef(DECK_SIZE);
  const [mine, setMine] = useState(0);
  const [rivals, setRivals] = useState(0);
  const [hot, setHot] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const place = useCallback((index: number) => {
    const el = tileRefs.current[index];
    if (!el) return;
    const slot = slotOf.current[index];
    const pose = slot ? slotFor(slot.side, slot.k) : poses.current[index];
    el.style.left = `${pose.x}%`;
    el.style.top = `${(pose.y / BOARD_H) * 100}%`;
    el.style.transform = `translate(-50%, -50%) rotate(${pose.rot}deg)`;
    el.style.zIndex = String(pose.z);
  }, []);

  const sync = useCallback(() => {
    setMine(counts.current[0]);
    setRivals(counts.current[1] + counts.current[2] + counts.current[3]);
  }, []);

  const free = () => poses.current.map((_, index) => index).filter((index) => !slotOf.current[index] && dragging.current?.index !== index);

  const putInWall = useCallback((index: number, side: number) => {
    if (slotOf.current[index] || counts.current[side] >= SIDE_SIZE) return;
    slotOf.current[index] = { side, k: counts.current[side] };
    counts.current[side] += 1;
    place(index);
    sync();
  }, [place, sync]);

  useEffect(() => {
    for (let index = 0; index < DECK_SIZE; index += 1) place(index);
  }, [place, runKey]);

  // The rivals pick a loose tile each and stack it, every few moments, starting one after another.
  useEffect(() => {
    const timers: number[] = [];
    const intervals: number[] = [];
    [1, 2, 3].forEach((side) => {
      timers.push(window.setTimeout(() => {
        intervals.push(window.setInterval(() => {
          if (counts.current[side] >= SIDE_SIZE) return;
          const loose = free();
          if (!loose.length) return;
          putInWall(loose[Math.floor(Math.random() * loose.length)], side);
        }, BOT_TICK));
      }, BOT_DELAY[side - 1]));
    });
    return () => { timers.forEach(window.clearTimeout); intervals.forEach(window.clearInterval); };
  }, [putInWall, runKey]);

  const done = mine >= SIDE_SIZE && rivals >= SIDE_SIZE * 3;
  useEffect(() => { onStatus?.({ mine, rivals, done }); }, [mine, rivals, done, onStatus]);

  const toUnits = (clientX: number, clientY: number) => {
    const rect = boardRef.current!.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.width) * 100 };
  };

  const nextMine = () => (counts.current[0] < SIDE_SIZE ? slotFor(0, counts.current[0]) : null);

  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (counts.current[0] >= SIDE_SIZE) return;
    const point = toUnits(event.clientX, event.clientY);
    let best = -1;
    let bestDistance = GRAB;
    free().forEach((index) => {
      const pose = poses.current[index];
      const distance = Math.hypot(pose.x - point.x, pose.y - point.y);
      if (distance < bestDistance || (distance === bestDistance && pose.z > (poses.current[best]?.z ?? -1))) {
        best = index;
        bestDistance = distance;
      }
    });
    if (best < 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const pose = poses.current[best];
    dragging.current = { index: best, dx: pose.x - point.x, dy: pose.y - point.y };
    pose.z = ++zTop.current + 600;
    tileRefs.current[best]?.classList.add('is-dragging');
    setGrabbing(true);
    place(best);
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragging.current;
    if (!drag) return;
    const point = toUnits(event.clientX, event.clientY);
    const pose = poses.current[drag.index];
    pose.x = clamp(point.x + drag.dx, 2, 98);
    pose.y = clamp(point.y + drag.dy, 2, BOARD_H - 2);
    pose.rot *= 0.9;
    place(drag.index);
    const target = nextMine();
    setHot(!!target && Math.hypot(pose.x - target.x, pose.y - target.y) < SNAP);
  };

  const onUp = () => {
    const drag = dragging.current;
    dragging.current = null;
    setGrabbing(false);
    setHot(false);
    if (!drag) return;
    tileRefs.current[drag.index]?.classList.remove('is-dragging');
    const pose = poses.current[drag.index];
    const target = nextMine();
    if (target && Math.hypot(pose.x - target.x, pose.y - target.y) < SNAP) putInWall(drag.index, 0);
    else {
      pose.x = clamp(pose.x, FELT.x0, FELT.x1);
      pose.y = clamp(pose.y, FELT.y0, FELT.y1);
      pose.z = ++zTop.current;
      place(drag.index);
    }
  };

  // Click alternative to dragging: the loose tile closest to the next slot goes there.
  const placeOne = useCallback(() => {
    const target = nextMine();
    if (!target) return;
    const loose = free();
    if (!loose.length) return;
    loose.sort((a, b) => Math.hypot(poses.current[a].x - target.x, poses.current[a].y - target.y) - Math.hypot(poses.current[b].x - target.x, poses.current[b].y - target.y));
    putInWall(loose[0], 0);
  }, [putInWall]);

  const fillMine = useCallback(() => {
    const timer = window.setInterval(() => {
      if (counts.current[0] >= SIDE_SIZE) { window.clearInterval(timer); return; }
      placeOne();
    }, 70);
  }, [placeOne]);

  const restart = () => {
    slotOf.current = Array(DECK_SIZE).fill(null);
    counts.current = [0, 0, 0, 0];
    sync();
    setRunKey((key) => key + 1);
  };

  const row = Math.min(1, Math.floor(mine / ROW));
  const rowFilled = mine % ROW;
  const target = nextMine();
  const labelSlot = wallSlot(0, 8, row);

  return (
    <div className="sort-stage deck-stage">
      <div
        className={`sort-board deck-board is-walls${grabbing ? ' is-grabbing' : ''}${done ? ' is-sorted' : ''}`}
        ref={boardRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="deck-felt" aria-hidden="true"><span>{t('Tu muro es el de abajo', 'Your wall is the bottom one', 'Seu muro é o de baixo')}</span></div>

        {/* outlines of the three rival walls, filled in by themselves */}
        {[1, 2, 3].map((side) => Array.from({ length: ROW }, (_, stack) => {
          const pose = wallSlot(side, stack, 0);
          return <i key={`${side}-${stack}`} className="deck-ghost is-rival" style={{ left: `${pose.x}%`, top: `${(pose.y / BOARD_H) * 100}%`, width: `${TILE_W}%`, transform: `translate(-50%, -50%) rotate(${pose.rot}deg)` }} />;
        }))}

        {/* the strip the player has to fill: lower row first, then the upper row */}
        {Array.from({ length: ROW }, (_, stack) => {
          const pose = wallSlot(0, stack, row);
          const state = stack < rowFilled ? ' is-filled' : stack === rowFilled && target ? ` is-next${hot ? ' is-hot' : ''}` : '';
          return <i key={`me-${stack}-${row}`} className={`deck-ghost is-mine${state}`} style={{ left: `${pose.x}%`, top: `${(pose.y / BOARD_H) * 100}%`, width: `${TILE_W}%` }} />;
        })}
        {target && (
          <span className="deck-hint" style={{ left: `${labelSlot.x}%`, top: `${((labelSlot.y + TILE_H * 1.55) / BOARD_H) * 100}%` }}>
            <b aria-hidden="true">↑</b>
            {row === 0
              ? t('Arrastra tus fichas aquí', 'Drag your tiles here', 'Arraste suas peças aqui')
              : t('Ahora la fila de arriba', 'Now the upper row', 'Agora a fileira de cima')}
          </span>
        )}
        {(['right', 'across', 'left'] as const).map((_, index) => {
          const side = index + 1;
          const pose = wallSlot(side, 8, 0);
          const place = side === 2
            ? { left: pose.x, top: pose.y - TILE_H * 1.7, anchor: '-50%, -50%' }
            : side === 1
              ? { left: pose.x + TILE_H * 1.3, top: pose.y, anchor: '0, -50%' }
              : { left: pose.x - TILE_H * 1.3, top: pose.y, anchor: '-100%, -50%' };
          return (
            <span key={side} className={`deck-tag${counts.current[side] >= SIDE_SIZE ? ' is-done' : ''}`} style={{ left: `${place.left}%`, top: `${(place.top / BOARD_H) * 100}%`, transform: `translate(${place.anchor})` }}>
              {RIVAL_NAME[language][index]} · {counts.current[side]}/{SIDE_SIZE}
            </span>
          );
        })}

        {Array.from({ length: DECK_SIZE }, (_, index) => (
          <span key={index} className="deck-tile" ref={(el) => { tileRefs.current[index] = el; }} style={{ width: `${TILE_W}%` }}>
            <img src={TILE_BACK} alt="" draggable={false} />
          </span>
        ))}

        <div className="sort-actions deck-actions">
          <span>{t('Tú', 'You', 'Você')} {mine}/{SIDE_SIZE}</span>
          {mine < SIDE_SIZE && <button type="button" className="sort-button is-primary" onClick={placeOne}>{t('Colocar ficha →', 'Place tile →', 'Colocar peça →')}</button>}
          {mine < SIDE_SIZE && <button type="button" className="sort-button" onClick={fillMine}>{t('Completar', 'Fill', 'Completar')}</button>}
          <button type="button" className="sort-button" onClick={restart}>{t('Reiniciar', 'Restart', 'Reiniciar')}</button>
        </div>

        {done && (
          <p className="sort-win" role="status">
            <b>{t('136 fichas en cuatro muros', '136 tiles in four walls', '136 peças em quatro muros')}</b>
            <span>{t('17 pilas × 2 de alto × 4 lados.', '17 stacks × 2 high × 4 sides.', '17 pilhas × 2 de altura × 4 lados.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
