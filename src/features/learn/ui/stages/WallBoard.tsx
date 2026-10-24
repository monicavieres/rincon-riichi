import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { BOARD_H, DECK_SIZE, FELT, SIDE_SIZE, TILE_H, TILE_W, clamp, deckPoses, wallSlot, type Pose } from './DeckBoard';
import { IsoWorld, TILE_THICK, TileBox, billboard, tileTransform, unitsOf } from './iso';

const ROW = 17;
const SNAP = 9;
const GRAB = TILE_W * 1.6;
const BOT_DELAY = [1400, 1900, 2400];
const BOT_TICK = 320;
/** Walls are built at the table edge (row A, then row B just inside it), stacked, then slid in to the square. */
const EDGE_Y = 91;
const ROW_GAP = TILE_H * 1.15;
const ROT = [0, -90, 180, 90];

/** 0 filling row A · 1 filling row B · 2 both rows done, ready to stack · 3 stacked at the edge · 4 slid into place. */
type Stage = 0 | 1 | 2 | 3 | 4;

export type WallStatus = { mine: number; rivals: number; done: boolean };

const RIVAL_NAME = {
  es: ['Rival derecha', 'Rival enfrente', 'Rival izquierda'],
  en: ['Right rival', 'Rival across', 'Left rival'],
  pt: ['Rival à direita', 'Rival em frente', 'Rival à esquerda'],
};

/** Turns a point of the bottom player's edge into the same point for another seat (counter-clockwise). */
function around(point: { x: number; y: number }, side: number) {
  const angle = (-90 * side * Math.PI) / 180;
  const dx = point.x - 50;
  const dy = point.y - 50;
  return { x: 50 + dx * Math.cos(angle) - dy * Math.sin(angle), y: 50 + dx * Math.sin(angle) + dy * Math.cos(angle) };
}

/** Where the k-th tile of a side sits while the wall is still at the table edge. */
function edgePose(side: number, k: number, stacked: boolean): Pose {
  const stack = k % ROW;
  const row = k < ROW ? 0 : 1;
  const point = around({ x: wallSlot(0, stack, 0).x, y: EDGE_Y - (stacked ? 0 : row * ROW_GAP) }, side);
  return { ...point, rot: ROT[side], z: 200 + row * 100 + stack, h: stacked ? row : 0 };
}

const poseOf = (side: number, k: number, stage: Stage): Pose => (stage >= 4 ? wallSlot(side, k % ROW, k < ROW ? 0 : 1) : edgePose(side, k, stage >= 3));

type Pull = { kind: 'stack' | 'slide'; startY: number; dy: number };

/**
 * The shuffled tiles stay where the last step left them. The player lines up 17 tiles along their own edge, then 17
 * more in a second row, lifts the back row onto the front one and slides the finished wall into the square.
 * The three rivals do the same by themselves as time passes.
 */
export function WallBoard({ language, onStatus }: { language: TutorialLanguage; onStatus?: (status: WallStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const planeRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const poses = useRef<Pose[]>(deckPoses(34, 34).map((pose) => ({ ...pose })));
  const slotOf = useRef<Array<{ side: number; k: number } | null>>(Array(DECK_SIZE).fill(null));
  const counts = useRef([0, 0, 0, 0]);
  const stages = useRef<Stage[]>([0, 0, 0, 0]);
  const dragging = useRef<{ index: number; dx: number; dy: number } | null>(null);
  const pull = useRef<Pull | null>(null);
  const zTop = useRef(DECK_SIZE);
  const timers = useRef<number[]>([]);
  const [, setVersion] = useState(0);
  const [hot, setHot] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const rerender = () => setVersion((value) => value + 1);

  const place = useCallback((index: number) => {
    const el = tileRefs.current[index];
    if (!el) return;
    const slot = slotOf.current[index];
    let pose = slot ? poseOf(slot.side, slot.k, stages.current[slot.side]) : poses.current[index];
    const moving = pull.current;
    if (slot && slot.side === 0 && moving) {
      if (moving.kind === 'slide') pose = { ...pose, y: pose.y + moving.dy, h: (pose.h ?? 0) + 0.6 };
      else if (slot.k >= ROW) pose = { ...pose, y: pose.y + moving.dy, h: 1.4 };
    }
    el.style.left = `${pose.x}%`;
    el.style.top = `${(pose.y / BOARD_H) * 100}%`;
    el.style.transform = tileTransform(pose);
  }, []);

  const placeAll = useCallback(() => {
    for (let index = 0; index < DECK_SIZE; index += 1) place(index);
  }, [place]);

  const free = () => poses.current.map((_, index) => index).filter((index) => !slotOf.current[index] && dragging.current?.index !== index);

  const setStage = useCallback((side: number, stage: Stage) => {
    stages.current[side] = stage;
    placeAll();
    rerender();
  }, [placeAll]);

  const later = (ms: number, action: () => void) => { timers.current.push(window.setTimeout(action, ms)); };

  /** A rival whose two rows are down stacks them, then slides the wall in. */
  const finishRival = useCallback((side: number) => {
    setStage(side, 2);
    later(700, () => setStage(side, 3));
    later(1700, () => setStage(side, 4));
  }, [setStage]);

  const putInWall = useCallback((index: number, side: number) => {
    if (slotOf.current[index] || counts.current[side] >= SIDE_SIZE) return;
    slotOf.current[index] = { side, k: counts.current[side] };
    counts.current[side] += 1;
    const count = counts.current[side];
    if (side === 0) {
      stages.current[0] = count >= SIDE_SIZE ? 2 : count >= ROW ? 1 : 0;
    } else if (count >= SIDE_SIZE) finishRival(side);
    place(index);
    rerender();
  }, [place, finishRival]);

  useEffect(() => { placeAll(); }, [placeAll, runKey]);

  // The rivals pick a loose tile each and line it up, every few moments, starting one after another.
  useEffect(() => {
    const intervals: number[] = [];
    [1, 2, 3].forEach((side) => {
      later(BOT_DELAY[side - 1], () => {
        intervals.push(window.setInterval(() => {
          if (counts.current[side] >= SIDE_SIZE) return;
          const loose = free();
          if (!loose.length) return;
          putInWall(loose[Math.floor(Math.random() * loose.length)], side);
        }, BOT_TICK));
      });
    });
    return () => { timers.current.forEach(window.clearTimeout); timers.current = []; intervals.forEach(window.clearInterval); };
  }, [putInWall, runKey]);

  const mine = counts.current[0];
  const rivals = counts.current[1] + counts.current[2] + counts.current[3];
  const done = stages.current.every((stage) => stage === 4);
  useEffect(() => { onStatus?.({ mine, rivals, done }); }, [mine, rivals, done, onStatus]);

  const nextMine = () => (counts.current[0] < SIDE_SIZE ? edgePose(0, counts.current[0], false) : null);

  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = unitsOf(event);
    const stage = stages.current[0];
    if (stage <= 1) {
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
      pose.z = ++zTop.current;
      pose.h = 1.6;
      tileRefs.current[best]?.classList.add('is-dragging');
      setGrabbing(true);
      place(best);
      return;
    }
    const backRowY = EDGE_Y - ROW_GAP;
    const onWall = point.x > 18 && point.x < 84;
    if (stage === 2 && onWall && Math.abs(point.y - backRowY) < TILE_H) {
      event.currentTarget.setPointerCapture(event.pointerId);
      pull.current = { kind: 'stack', startY: point.y, dy: 0 };
      setGrabbing(true);
    } else if (stage === 3 && onWall && Math.abs(point.y - EDGE_Y) < TILE_H) {
      event.currentTarget.setPointerCapture(event.pointerId);
      pull.current = { kind: 'slide', startY: point.y, dy: 0 };
      setGrabbing(true);
    }
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = unitsOf(event);
    const drag = dragging.current;
    if (drag) {
      const pose = poses.current[drag.index];
      pose.x = clamp(point.x + drag.dx, 4, 96);
      pose.y = clamp(point.y + drag.dy, 4, BOARD_H - 4);
      pose.rot *= 0.9;
      place(drag.index);
      const target = nextMine();
      setHot(!!target && Math.hypot(pose.x - target.x, pose.y - target.y) < SNAP);
      return;
    }
    const moving = pull.current;
    if (!moving) return;
    const travel = moving.kind === 'stack' ? ROW_GAP : EDGE_Y - wallSlot(0, 0, 0).y;
    const raw = point.y - moving.startY;
    moving.dy = moving.kind === 'stack' ? clamp(raw, -1, travel + 1) : clamp(raw, -travel - 1, 1);
    placeAll();
  };

  const onUp = () => {
    const drag = dragging.current;
    dragging.current = null;
    setGrabbing(false);
    setHot(false);
    if (drag) {
      tileRefs.current[drag.index]?.classList.remove('is-dragging');
      const pose = poses.current[drag.index];
      pose.h = 0;
      const target = nextMine();
      if (target && Math.hypot(pose.x - target.x, pose.y - target.y) < SNAP) putInWall(drag.index, 0);
      else {
        pose.x = clamp(pose.x, FELT.x0, FELT.x1);
        pose.y = clamp(pose.y, FELT.y0, FELT.y1);
        pose.z = ++zTop.current;
        place(drag.index);
      }
      return;
    }
    const moving = pull.current;
    pull.current = null;
    if (!moving) return;
    const travel = moving.kind === 'stack' ? ROW_GAP : EDGE_Y - wallSlot(0, 0, 0).y;
    if (Math.abs(moving.dy) > travel * 0.55) setStage(0, moving.kind === 'stack' ? 3 : 4);
    else { placeAll(); }
    setGrabbing(false);
  };

  // Click alternatives to dragging.
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
    timers.current.push(timer);
  }, [placeOne]);

  const restart = () => {
    slotOf.current = Array(DECK_SIZE).fill(null);
    counts.current = [0, 0, 0, 0];
    stages.current = [0, 0, 0, 0];
    pull.current = null;
    setRunKey((key) => key + 1);
  };

  const stage = stages.current[0];
  const target = nextMine();
  const row = stage === 1 ? 1 : 0;
  const rowFilled = counts.current[0] % ROW;
  const slotStyle = (pose: Pose) => ({ left: `${pose.x}%`, top: `${(pose.y / BOARD_H) * 100}%`, width: `${TILE_W}%`, transform: `translate3d(-50%, -50%, calc(var(--u) * ${(pose.h ?? 0) * TILE_THICK + 0.05})) rotate(${pose.rot}deg)` });

  const hint = stage === 0
    ? { text: t('Alinea 17 fichas en tu borde', 'Line up 17 tiles along your edge', 'Alinhe 17 peças na sua borda'), arrow: '↓' }
    : stage === 1
      ? { text: t('Otras 17 en una segunda fila, pegada a la primera', '17 more in a second row, right behind the first', 'Mais 17 numa segunda fileira, colada à primeira'), arrow: '↓' }
      : stage === 2
        ? { text: t('Arrastra la fila de atrás sobre la de adelante', 'Drag the back row onto the front row', 'Arraste a fileira de trás sobre a da frente'), arrow: '↓' }
        : stage === 3
          ? { text: t('Arrastra el muro hasta el marco punteado', 'Drag the wall to the dotted frame', 'Arraste o muro até o quadro pontilhado'), arrow: '↑' }
          : null;

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-walls${grabbing ? ' is-grabbing' : ''}${done ? ' is-sorted' : ''}`}>
        <IsoWorld planeRef={planeRef} handlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }}>
          {/* the strip the player is filling at their own edge */}
          {stage <= 1 && Array.from({ length: ROW }, (_, stack) => {
            const state = stack < rowFilled ? ' is-filled' : stack === rowFilled && target ? ` is-next${hot ? ' is-hot' : ''}` : '';
            return <i key={`me-${stack}-${row}`} className={`deck-ghost is-mine${state}`} style={slotStyle(edgePose(0, row * ROW + stack, false))} />;
          })}
          {/* where the finished wall will go */}
          {stage === 3 && Array.from({ length: ROW }, (_, stack) => (
            <i key={`goal-${stack}`} className="deck-ghost is-mine is-next" style={slotStyle(wallSlot(0, stack, 0))} />
          ))}

          {hint && (
            <span className="deck-hint" style={{ left: '50%', top: '68%', transform: billboard('-50%, -50%', 7) }}>
              {hint.text} <b aria-hidden="true">{hint.arrow}</b>
            </span>
          )}
          {[1, 2, 3].map((side) => {
            const pose = wallSlot(side, 8, 0);
            const out = side === 2 ? { dx: 0, dy: -10 } : side === 1 ? { dx: 12, dy: 0 } : { dx: -12, dy: 0 };
            return (
              <span key={side} className={`deck-tag${stages.current[side] === 4 ? ' is-done' : ''}`} style={{ left: `${pose.x + out.dx}%`, top: `${pose.y + out.dy}%`, transform: billboard('-50%, -50%', 5) }}>
                {RIVAL_NAME[language][side - 1]} · {counts.current[side]}/{SIDE_SIZE}
              </span>
            );
          })}

          {Array.from({ length: DECK_SIZE }, (_, index) => (
            <TileBox key={index} refCb={(el) => { tileRefs.current[index] = el; }} style={{ width: `${TILE_W}%` }} />
          ))}
        </IsoWorld>

        <div className="sort-actions deck-actions">
          <span>{t('Tú', 'You', 'Você')} {mine}/{SIDE_SIZE}</span>
          {stage <= 1 && <button type="button" className="sort-button is-primary" onClick={placeOne}>{t('Colocar ficha →', 'Place tile →', 'Colocar peça →')}</button>}
          {stage <= 1 && <button type="button" className="sort-button" onClick={fillMine}>{t('Completar', 'Fill', 'Completar')}</button>}
          {stage === 2 && <button type="button" className="sort-button is-primary" onClick={() => setStage(0, 3)}>{t('Apilar filas', 'Stack rows', 'Empilhar fileiras')}</button>}
          {stage === 3 && <button type="button" className="sort-button is-primary" onClick={() => setStage(0, 4)}>{t('Llevar al centro', 'Slide in', 'Levar ao centro')}</button>}
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
