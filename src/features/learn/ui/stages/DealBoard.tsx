import { useEffect, useRef, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { wallSlot } from './DeckBoard';
import { FELT_Z, IsoCanvas, TILE_T, picture, type IsoHandle, type Painter } from './iso3d';

const ROW = 17;
/** The example opens the dealer's own wall: dice total 9, so the dead wall is stacks 8–14 and drawing starts at stack 7. */
const OPENED_SIDE = 0;
const FIRST_DEAD = 8;
const OUT = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const ALONG = [[1, 0], [0, -1], [-1, 0], [0, 1]];
const HAND_EDGE = 94.4;
const SEAT_NAME = {
  es: ['Tú · Este (dealer)', 'Sur', 'Oeste', 'Norte'],
  en: ['You · East (dealer)', 'South', 'West', 'North'],
  pt: ['Você · Leste (dealer)', 'Sul', 'Oeste', 'Norte'],
};

export type DealStatus = { done: boolean; step: number };

type Take = { player: number; tiles: number[]; caption: string; extra?: boolean };
type Flight = { player: number; slot: number; start: number; extra: boolean };

const gAt = (G: number) => ({ side: (OPENED_SIDE + Math.floor(G / ROW) + 4 * 8) % 4, stack: ((G % ROW) + ROW) % ROW });
/** Tile index of a wall tile: sides hold 34 each, lower row first. */
const tileOf = (side: number, stack: number, level: number) => side * 34 + level * ROW + stack;

const around = (point: { x: number; y: number }, side: number) => {
  const a = (-90 * side * Math.PI) / 180;
  const dx = point.x - 50;
  const dy = point.y - 50;
  return { x: 50 + dx * Math.cos(a) - dy * Math.sin(a), y: 50 + dx * Math.sin(a) + dy * Math.cos(a) };
};
const ROT = [0, -90, 180, 90];
const turn = (from: number, to: number) => {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

/** Where a player's n-th tile lands: a tidy row along their own edge, the last one set slightly apart. */
function handSlot(player: number, n: number, extra: boolean) {
  const gap = extra ? 2.2 : 0;
  const spacing = 3.7; // tiles touch, like the walls: only their backs show
  const base = { x: 50 + (n - 6) * spacing + gap, y: HAND_EDGE };
  const p = around(base, player);
  return { x: p.x, y: p.y, rot: ROT[player] };
}

/** The order tiles leave the live wall: from the break leftwards, upper tile of a stack first. */
function drawOrder() {
  const order: number[] = [];
  for (let G = FIRST_DEAD - 1; order.length < 60; G -= 1) {
    const at = gAt(G);
    order.push(tileOf(at.side, at.stack, 1), tileOf(at.side, at.stack, 0));
  }
  return order;
}

/**
 * The dealing: with the wall open, each player in turn takes four tiles, three times, then one more each, and
 * the dealer takes a last one: his first draw.
 */
export function DealBoard({ language, onStatus }: { language: TutorialLanguage; onStatus?: (status: DealStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const flights = useRef<Map<number, Flight>>(new Map());
  const counts = useRef([0, 0, 0, 0]);
  const timers = useRef<number[]>([]);
  const [caption, setCaption] = useState('');
  const [current, setCurrent] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [run, setRun] = useState(0);
  const takesRef = useRef<Take[]>([]);

  const plan = (): Take[] => {
    const order = drawOrder();
    let cursor = 0;
    const takes: Take[] = [];
    const next = (n: number) => { const tiles = order.slice(cursor, cursor + n); cursor += n; return tiles; };
    for (let round = 1; round <= 3; round += 1) {
      for (let player = 0; player < 4; player += 1) {
        takes.push({ player, tiles: next(4), caption: t(`Ronda ${round} de 3: cada jugador toma 4 fichas`, `Round ${round} of 3: each player takes 4 tiles`, `Rodada ${round} de 3: cada jogador pega 4 peças`) });
      }
    }
    for (let player = 0; player < 4; player += 1) {
      takes.push({ player, tiles: next(1), caption: t('Ahora, una ficha más para cada uno', 'Now one more tile each', 'Agora mais uma peça para cada um') });
    }
    takes.push({ player: 0, tiles: next(1), caption: t('El dealer toma la última: su primera robada', 'The dealer takes the last one: the first draw', 'O dealer pega a última: a primeira compra'), extra: true });
    return takes;
  };

  useEffect(() => {
    flights.current = new Map();
    counts.current = [0, 0, 0, 0];
    setFinished(false);
    setCurrent(-1);
    const takes = plan();
    takesRef.current = takes;
    let at = 900;
    takes.forEach((take, index) => {
      const start = at;
      timers.current.push(window.setTimeout(() => {
        setCurrent(index);
        setCaption(take.caption);
        take.tiles.forEach((tile, i) => {
          const slot = counts.current[take.player];
          counts.current[take.player] += 1;
          flights.current.set(tile, { player: take.player, slot, start: performance.now() + i * 110, extra: !!take.extra });
        });
        scene.current?.invalidate();
      }, start));
      at += take.tiles.length > 1 ? 1050 : 800;
    });
    timers.current.push(window.setTimeout(() => { setFinished(true); setCaption(''); }, at + 700));
    return () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  }, [run, language]);

  useEffect(() => { onStatus?.({ done: finished, step: current }); }, [finished, current, onStatus]);

  const draw = (g: Painter) => {
    // a steeper look down on the table, so the far hand and the sideways hands are not squeezed together
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    g.view = { u: 50, v: 50, zoom: 0.86 };
    g.table();
    const { palette: p } = g;
    const doraAt = gAt(FIRST_DEAD + 2);
    const dead = new Set<string>();
    for (let G = FIRST_DEAD; G <= FIRST_DEAD + 6; G += 1) { const a = gAt(G); dead.add(`${a.side}:${a.stack}`); }
    const now = g.now;
    let moving = false;

    for (let index = 0; index < 136; index += 1) {
      const side = Math.floor(index / 34);
      const k = index % 34;
      const stack = k % ROW;
      const level = k < ROW ? 0 : 1;
      const home = wallSlot(side, stack, level);
      const G = ((side - OPENED_SIDE + 4) % 4) * ROW + stack;
      const isDead = dead.has(`${side}:${stack}`);
      // the same opened wall as the dice step: dead wall apart, live wall easing away from the cuts
      let dx = 0;
      let dy = 0;
      if (isDead) { dx = OUT[side][0] * 3.4; dy = OUT[side][1] * 3.4; }
      else {
        const dist = G < FIRST_DEAD ? FIRST_DEAD - 1 - G : G - (FIRST_DEAD + 7);
        const pull = Math.max(0, 1 - dist / 5) * 1.8 * (G < FIRST_DEAD ? -1 : 1);
        dx = ALONG[side][0] * pull;
        dy = ALONG[side][1] * pull;
      }
      const isDora = level === 1 && `${side}:${stack}` === `${doraAt.side}:${doraAt.stack}`;
      const flight = flights.current.get(index);
      if (!flight) {
        g.tile(home.x + dx, home.y + dy, home.rot, FELT_Z + level * TILE_T + (isDead ? 0.8 : 0), { gold: isDead, flip: isDora ? 1 : 0, face: isDora ? picture(`${p.faces}/4p.svg`) : null });
        continue;
      }
      const goal = handSlot(flight.player, flight.slot, flight.extra);
      const raw = Math.max(0, Math.min(1, (now - flight.start) / 700));
      const e = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      if (raw < 1) moving = true;
      const fromX = home.x + dx;
      const fromY = home.y + dy;
      g.tile(fromX + (goal.x - fromX) * e, fromY + (goal.y - fromY) * e, home.rot + turn(home.rot, goal.rot) * e, FELT_Z + level * TILE_T * (1 - e) + Math.sin(Math.PI * raw) * 6, { order: 9000 + index });
    }
    if (moving) g.needsFrame = true;
    g.flush();

    // who is taking, and how many tiles each hand holds
    for (let player = 0; player < 4; player += 1) {
      const anchor = around({ x: 50, y: 100 }, player);
      const pos = g.project(anchor.x, anchor.y, FELT_Z + 6);
      const active = current >= 0 && takesRef.current[current]?.player === player && !finished;
      g.pill(pos.x, pos.y, `${SEAT_NAME[language][player]} · ${counts.current[player]}`, { bg: active ? p.gold : 'rgba(10,20,20,0.62)', fg: active ? p.ink : '#fff', size: 10 });
    }
    if (caption) g.pill(g.W / 2, 24, caption, { bg: p.gold, fg: p.ink, size: 13 });
  };

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-deal${finished ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} />
        <p className="deck-caption">{t('El reparto, tomando del muro vivo', 'The deal, from the live wall', 'A distribuição, do muro vivo')}</p>
        <div className="sort-actions deck-actions">
          <span>{finished ? t('13 + 1 fichas', '13 + 1 tiles', '13 + 1 peças') : `${Math.max(0, current + 1)}/17`}</span>
          <button type="button" className="sort-button" onClick={() => setRun((value) => value + 1)}>{t('Repetir', 'Replay', 'Repetir')}</button>
        </div>
        {finished && (
          <p className="sort-win is-top" role="status">
            <b>{t('13 fichas cada uno; el dealer, 14', '13 tiles each; the dealer, 14', '13 peças cada; o dealer, 14')}</b>
            <span>{t('El dealer descarta primero.', 'The dealer discards first.', 'O dealer descarta primeiro.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
