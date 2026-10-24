import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { DECK_SIZE, FELT, SIDE_SIZE, TILE_H, TILE_W, clamp, deckPoses, wallSlot, type Pose } from './DeckBoard';
import { FELT_Z, IsoCanvas, TILE_T, type IsoHandle, type Painter } from './iso3d';

const ROW = 17;
const SNAP = 9;
const GRAB = TILE_W * 1.6;
const BOT_DELAY = [1400, 1900, 2400];
const BOT_TICK = 320;
/** Walls are built at the table edge (row A, then row B just inside it), stacked, then slid in to the square. */
const EDGE_Y = 95.4;
const ROW_GAP = TILE_H * 1.15;
const ROT = [0, -90, 180, 90];
const SURFACE = FELT_Z + TILE_T;

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
type Shown = { x: number; y: number; rot: number; h: number };

const turn = (from: number, to: number) => {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

/**
 * The shuffled tiles stay where the last step left them. The player lines up 17 tiles along their own edge, then 17
 * more in a second row, lifts the back row onto the front one and slides the finished wall into the square.
 * The three rivals do the same by themselves as time passes.
 */
export function WallBoard({ language, onStatus }: { language: TutorialLanguage; onStatus?: (status: WallStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const poses = useRef<Pose[]>(deckPoses(34, 34).map((pose) => ({ ...pose })));
  const shown = useRef<Shown[]>(poses.current.map((pose) => ({ x: pose.x, y: pose.y, rot: pose.rot, h: 0 })));
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
  const repaint = () => scene.current?.invalidate();

  /** The pose a tile is heading to right now. */
  const targetOf = (index: number): Pose => {
    const slot = slotOf.current[index];
    let pose = slot ? poseOf(slot.side, slot.k, stages.current[slot.side]) : poses.current[index];
    const moving = pull.current;
    if (slot && slot.side === 0 && moving) {
      if (moving.kind === 'slide') pose = { ...pose, y: pose.y + moving.dy, h: (pose.h ?? 0) + 0.5 };
      else if (slot.k >= ROW) pose = { ...pose, y: pose.y + moving.dy, h: 1.4 };
    }
    return pose;
  };

  const free = () => poses.current.map((_, index) => index).filter((index) => !slotOf.current[index] && dragging.current?.index !== index);

  const setStage = useCallback((side: number, stage: Stage) => {
    stages.current[side] = stage;
    repaint();
    rerender();
  }, []);

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
    repaint();
    rerender();
  }, [finishRival]);

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
  const at = (event: ReactPointerEvent<HTMLCanvasElement>) => scene.current!.unproject(event, SURFACE);

  const onDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = at(event);
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
      pose.h = 1.4;
      setGrabbing(true);
      repaint();
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

  const onMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragging.current;
    const moving = pull.current;
    if (!drag && !moving) return;
    const point = at(event);
    if (drag) {
      const pose = poses.current[drag.index];
      pose.x = clamp(point.x + drag.dx, 4, 96);
      pose.y = clamp(point.y + drag.dy, 4, 96);
      pose.rot *= 0.9;
      const target = nextMine();
      setHot(!!target && Math.hypot(pose.x - target.x, pose.y - target.y) < SNAP);
      repaint();
      return;
    }
    if (!moving) return;
    const travel = moving.kind === 'stack' ? ROW_GAP : EDGE_Y - wallSlot(0, 0, 0).y;
    const raw = point.y - moving.startY;
    moving.dy = moving.kind === 'stack' ? clamp(raw, -1, travel + 1) : clamp(raw, -travel - 1, 1);
    repaint();
  };

  const onUp = () => {
    const drag = dragging.current;
    dragging.current = null;
    setGrabbing(false);
    setHot(false);
    if (drag) {
      const pose = poses.current[drag.index];
      pose.h = 0;
      const target = nextMine();
      if (target && Math.hypot(pose.x - target.x, pose.y - target.y) < SNAP) putInWall(drag.index, 0);
      else {
        pose.x = clamp(pose.x, FELT.x0, FELT.x1);
        pose.y = clamp(pose.y, FELT.y0, FELT.y1);
        pose.z = ++zTop.current;
        repaint();
      }
      return;
    }
    const moving = pull.current;
    pull.current = null;
    if (!moving) return;
    const travel = moving.kind === 'stack' ? ROW_GAP : EDGE_Y - wallSlot(0, 0, 0).y;
    if (Math.abs(moving.dy) > travel * 0.55) setStage(0, moving.kind === 'stack' ? 3 : 4);
    else repaint();
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
    repaint();
  };

  const stage = stages.current[0];
  const target = nextMine();
  const row = stage === 1 ? 1 : 0;
  const rowFilled = counts.current[0] % ROW;

  const hint = stage === 0
    ? { text: t('Alinea 17 fichas en tu borde', 'Line up 17 tiles along your edge', 'Alinhe 17 peças na sua borda'), arrow: '↓' }
    : stage === 1
      ? { text: t('Otras 17 en una segunda fila, pegada a la primera', '17 more in a second row, right behind the first', 'Mais 17 numa segunda fileira, colada à primeira'), arrow: '↓' }
      : stage === 2
        ? { text: t('Arrastra la fila de atrás sobre la de adelante', 'Drag the back row onto the front row', 'Arraste a fileira de trás sobre a da frente'), arrow: '↓' }
        : stage === 3
          ? { text: t('Arrastra el muro hasta el marco punteado', 'Drag the wall to the dotted frame', 'Arraste o muro até o quadro pontilhado'), arrow: '↑' }
          : null;

  const draw = (g: Painter) => {
    g.table();
    // slots first, flat on the felt
    if (stages.current[0] <= 1) {
      for (let stack = 0; stack < ROW; stack += 1) {
        const slot = edgePose(0, row * ROW + stack, false);
        g.ghost(slot.x, slot.y, slot.rot, FELT_Z, { filled: stack < rowFilled, next: stack === rowFilled && !!target, hot });
      }
    }
    if (stages.current[0] === 3) {
      for (let stack = 0; stack < ROW; stack += 1) {
        const slot = wallSlot(0, stack, 0);
        g.ghost(slot.x, slot.y, slot.rot, FELT_Z, { next: true });
      }
    }
    // tiles ease toward where they belong
    let moving = false;
    shown.current.forEach((cur, index) => {
      const goal = targetOf(index);
      const grabbed = dragging.current?.index === index;
      const ease = grabbed ? 1 : 0.2;
      const gh = goal.h ?? 0;
      cur.x += (goal.x - cur.x) * ease;
      cur.y += (goal.y - cur.y) * ease;
      cur.rot += turn(cur.rot, goal.rot) * ease;
      cur.h += (gh - cur.h) * ease;
      if (Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) + Math.abs(turn(cur.rot, goal.rot)) * 0.05 + Math.abs(gh - cur.h) > 0.05) moving = true;
      else { cur.x = goal.x; cur.y = goal.y; cur.rot = goal.rot; cur.h = gh; }
      g.tile(cur.x, cur.y, cur.rot, FELT_Z + cur.h * TILE_T, { order: cur.y * 100 + cur.h * TILE_T + (goal.z % 1000) * 0.001 });
    });
    if (moving) g.needsFrame = true;
    g.flush();

    if (hint) {
      const p = g.project(50, 68, FELT_Z + 6);
      g.pill(p.x, p.y, `${hint.text} ${hint.arrow}`, { bg: 'rgba(10,20,20,0.72)' });
    }
    [1, 2, 3].forEach((side) => {
      const slot = wallSlot(side, 8, 0);
      const out = side === 2 ? { dx: 0, dy: -10 } : side === 1 ? { dx: 12, dy: 0 } : { dx: -12, dy: 0 };
      const p = g.project(slot.x + out.dx, slot.y + out.dy, FELT_Z + 4);
      g.pill(p.x, p.y, `${RIVAL_NAME[language][side - 1]} · ${counts.current[side]}/${SIDE_SIZE}`, { bg: stages.current[side] === 4 ? 'rgba(34,140,90,0.85)' : 'rgba(10,20,20,0.6)', size: 10 });
    });
  };

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-walls${grabbing ? ' is-grabbing' : ''}${done ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} handlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }} />

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
