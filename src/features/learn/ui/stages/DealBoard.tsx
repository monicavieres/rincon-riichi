import { useEffect, useRef, useState } from 'react';
import { sfx } from './boardSfx';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { DEALT_HAND } from '../../domain/dealtHand';
import { wallSlot } from './DeckBoard';
import { FELT_Z, IsoCanvas, TILE_T, picture, type IsoHandle, type Painter } from './iso3d';

const ROW = 17;
/** The example opens the dealer's own wall: dice total 9, so the dead wall is stacks 8–14 and drawing starts at stack 7. */
export const OPENED_SIDE = 0;
export const FIRST_DEAD = 8;
export const OUT = [[0, 1], [1, 0], [0, -1], [-1, 0]];
export const ALONG = [[1, 0], [0, -1], [-1, 0], [0, 1]];
const HAND_EDGE = 94.4;
const SEAT_NAME = {
  es: ['Tú · Este (dealer)', 'Sur', 'Oeste', 'Norte'],
  en: ['You · East (dealer)', 'South', 'West', 'North'],
  pt: ['Você · Leste (dealer)', 'Sul', 'Oeste', 'Norte'],
};

export type DealStatus = { done: boolean; step: number };

type Take = { player: number; tiles: number[]; caption: string; extra?: boolean };
type Flight = { player: number; slot: number; start: number; extra: boolean };

export const gAt = (G: number) => ({ side: (OPENED_SIDE + Math.floor(G / ROW) + 4 * 8) % 4, stack: ((G % ROW) + ROW) % ROW });
/** Tile index of a wall tile: sides hold 34 each, lower row first. */
export const tileOf = (side: number, stack: number, level: number) => side * 34 + level * ROW + stack;

export const around = (point: { x: number; y: number }, side: number) => {
  const a = (-90 * side * Math.PI) / 180;
  const dx = point.x - 50;
  const dy = point.y - 50;
  return { x: 50 + dx * Math.cos(a) - dy * Math.sin(a), y: 50 + dx * Math.sin(a) + dy * Math.cos(a) };
};
export const ROT = [0, -90, 180, 90];
export const turn = (from: number, to: number) => {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

/** Where a player's n-th tile lands: a tidy row along their own edge, the last one set slightly apart. */
export function handSlot(player: number, n: number, extra: boolean) {
  const gap = extra ? 2.2 : 0;
  const spacing = 3.6; // tiles touch, like the walls: only their backs show
  const base = { x: 50 + (n - 6) * spacing + gap, y: HAND_EDGE };
  const p = around(base, player);
  return { x: p.x, y: p.y, rot: ROT[player] };
}

/** The order tiles leave the live wall: from the break leftwards, upper tile of a stack first. */
export function drawOrder() {
  const order: number[] = [];
  for (let G = FIRST_DEAD - 1; order.length < 90; G -= 1) {
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
  const revealStart = useRef(0);
  const viewNow = useRef({ u: 50, v: 50, zoom: 0.86 });
  const lastFrame = useRef(0);

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

  /** The deal in chapters: the player presses Next to play each one, so every step can be read before the tiles move. */
  const CHAPTERS = 7;
  const [chapter, setChapter] = useState(0); // chapters already played
  const [waiting, setWaiting] = useState(true);
  const GROUPS = [[0, 4], [4, 8], [8, 12], [12, 16], [16, 17]]; // take ranges of chapters 1–5

  useEffect(() => {
    flights.current = new Map();
    counts.current = [0, 0, 0, 0];
    revealStart.current = 0;
    setFinished(false);
    setCurrent(-1);
    setChapter(0);
    setWaiting(true);
    setCaption('');
    takesRef.current = plan();
    return () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  }, [run, language]);

  const advance = () => {
    if (!waiting || chapter >= CHAPTERS - 1 && finished) return;
    const takes = takesRef.current;
    setWaiting(false);
    const next = chapter + 1;
    setChapter(next);
    const later = (ms: number, action: () => void) => { timers.current.push(window.setTimeout(action, ms)); };
    if (next <= GROUPS.length) {
      const [from, to] = GROUPS[next - 1];
      let at = 200;
      for (let index = from; index < to; index += 1) {
        const take = takes[index];
        later(at, () => {
          setCurrent(index);
          take.tiles.forEach((tile, i) => {
            const slot = counts.current[take.player];
            counts.current[take.player] += 1;
            flights.current.set(tile, { player: take.player, slot, start: performance.now() + i * 110, extra: !!take.extra });
            sfx.play('draw', i * 110 + 380);
          });
          scene.current?.invalidate();
        });
        at += take.tiles.length > 1 ? 900 : 700;
      }
      later(at + 500, () => setWaiting(true));
    } else {
      // the last chapter: the camera comes in on your hand and the tiles turn face up, one by one
      later(200, () => { revealStart.current = performance.now(); scene.current?.invalidate(); });
      later(200 + 14 * 110 + 1500, () => { setFinished(true); });
    }
  };

  useEffect(() => { onStatus?.({ done: finished, step: current }); }, [finished, current, onStatus]);

  const draw = (g: Painter) => {
    // a steeper look down on the table, so the far hand and the sideways hands are not squeezed together
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    const target = revealStart.current > 0 ? { u: 50, v: 90, zoom: 2.3 } : { u: 50, v: 50, zoom: 0.86 };
    const cam = viewNow.current;
    const dt = Math.min(200, g.now - lastFrame.current);
    lastFrame.current = g.now;
    const ease = 1 - Math.exp(-dt / 380);
    cam.u += (target.u - cam.u) * ease;
    cam.v += (target.v - cam.v) * ease;
    cam.zoom += (target.zoom - cam.zoom) * ease;
    if (Math.abs(target.zoom - cam.zoom) + Math.abs(target.v - cam.v) * 0.02 > 0.01) g.needsFrame = true;
    g.view = { ...cam };
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
      if (raw >= 1 && revealStart.current > 0) {
        // the hand is stood up, tile after tile: faces toward its owner, backs toward the middle
        const q = Math.max(0, Math.min(1, (now - revealStart.current - flight.slot * 110) / 800));
        const lift = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
        if (q > 0 && q < 1) moving = true;
        if (q > 0) {
          const face = flight.player === 0 ? picture(`${p.faces}/${DEALT_HAND[flight.slot]}.svg`) : null;
          g.standTile(goal.x, goal.y, goal.rot, lift * 90, { face, joined: lift > 0.8, capLeft: flight.slot === 0 || flight.extra, capRight: flight.slot === 12 || flight.extra });
          continue;
        }
      }
      g.tile(fromX + (goal.x - fromX) * e, fromY + (goal.y - fromY) * e, home.rot + turn(home.rot, goal.rot) * e, FELT_Z + level * TILE_T * (1 - e) + Math.sin(Math.PI * raw) * 6, { order: raw < 1 ? 1e5 + index : undefined });
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
  };

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-deal${finished ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} />
        <p className="deck-caption">{t('El reparto, tomando del muro vivo', 'The deal, from the live wall', 'A distribuição, do muro vivo')}</p>
        <div className="sort-actions deck-actions">
          <span>{finished ? t('13 + 1 fichas', '13 + 1 tiles', '13 + 1 peças') : `${Math.max(0, current + 1)}/17`}</span>
          {!finished && waiting && (
            <button type="button" className="sort-button is-primary" onClick={advance}>
              {chapter === 0 ? t('Empezar el reparto', 'Start the deal', 'Começar a distribuição') : chapter < 5 ? t('Siguiente', 'Next', 'Próximo') : t('Mirar mi mano', 'Look at my hand', 'Ver minha mão')} →
            </button>
          )}
          <button type="button" className="sort-button" onClick={() => setRun((value) => value + 1)}>{t('Repetir', 'Replay', 'Repetir')}</button>
        </div>
        {!finished && (
          <p className="deck-guide" role="status">
            {[
              t('El muro está abierto. Desde el corte, cada jugador toma fichas: primero el dealer (tú) y luego en sentido antihorario.', 'The wall is open. From the cut, each player takes tiles: first the dealer (you), then counter-clockwise.', 'O muro está aberto. A partir do corte, cada jogador pega peças: primeiro o dealer (você) e depois no sentido anti-horário.'),
              t('Ronda 1 de 3: cada jugador toma 4 fichas, uno tras otro. Se toman de a 4 para repartir parejo.', 'Round 1 of 3: each player takes 4 tiles, one after another. Taking 4 at a time keeps the deal even.', 'Rodada 1 de 3: cada jogador pega 4 peças, um após o outro. Pegar de 4 em 4 mantém a distribuição justa.'),
              t('Ronda 2 de 3: otras 4 fichas para cada uno. Ya van 8 por jugador.', 'Round 2 of 3: another 4 tiles each. That makes 8 per player.', 'Rodada 2 de 3: mais 4 peças para cada um. Já são 8 por jogador.'),
              t('Ronda 3 de 3: otras 4 más. Ahora cada jugador tiene 12 fichas.', 'Round 3 of 3: 4 more. Now each player has 12 tiles.', 'Rodada 3 de 3: mais 4. Agora cada jogador tem 12 peças.'),
              t('Una ficha más para cada uno: todos llegan a 13, que es el tamaño de la mano.', 'One more tile each: everyone reaches 13, the size of a hand.', 'Mais uma peça para cada um: todos chegam a 13, o tamanho da mão.'),
              t('El dealer toma una última: su primera robada. Por eso empieza con 14 y es quien debe descartar primero.', 'The dealer takes a last one: the first draw. That is why they start with 14 and discard first.', 'O dealer pega uma última: a primeira compra. Por isso começa com 14 e descarta primeiro.'),
              t('Ahora, ¡mira tu mano! Solo tú ves tus fichas; los demás ven solo sus dorsos.', 'Now, look at your hand! Only you see your tiles; the others see only their backs.', 'Agora, veja a sua mão! Só você vê as suas peças; os outros veem só os versos.'),
            ][Math.min(chapter, 6)]}
            {waiting && chapter < 6 ? ` ${t('Pulsa «Siguiente» para continuar.', 'Press “Next” to continue.', 'Toque em «Próximo» para continuar.')}` : ''}
          </p>
        )}
        {finished && (
          <p className="sort-win is-top" role="status">
            <b>{t('Esta es tu mano: 13 fichas y la robada', 'This is your hand: 13 tiles and the draw', 'Esta é a sua mão: 13 peças e a comprada')}</b>
            <span>{t('Solo tú ves tus fichas. Siguiente: ordénalas.', 'Only you see your tiles. Next: sort them.', 'Só você vê as suas peças. Próximo: ordene-as.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/** Which player holds each wall tile once the deal is over, and in which slot of their hand. */
export function dealAssignments() {
  const order = drawOrder();
  let cursor = 0;
  const map = new Map<number, { player: number; slot: number; extra: boolean }>();
  const counts = [0, 0, 0, 0];
  const take = (player: number, n: number, extra = false) => {
    for (let i = 0; i < n; i += 1) {
      map.set(order[cursor], { player, slot: counts[player], extra });
      counts[player] += 1;
      cursor += 1;
    }
  };
  for (let round = 0; round < 3; round += 1) for (let player = 0; player < 4; player += 1) take(player, 4);
  for (let player = 0; player < 4; player += 1) take(player, 1);
  take(0, 1, true);
  return map;
}
