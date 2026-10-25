import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { DEALT_HAND } from '../../domain/dealtHand';
import { ROT, around, dealAssignments, drawOrder, handSlot, turn } from './DealBoard';
import { wallSlot } from './DeckBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, TILE_T, picture, type IsoHandle, type Painter } from './iso3d';

export const WIDTH = 3.6;
export const HAND_Y = 94.4;
const FLIGHT_MS = 650;
const HIT_Z = FELT_Z + 2.5;
/** What the wall hands you, turn after turn: two that do nothing for the hand, then the one that completes it. */
const DRAWS = ['8s', '9m'];

export type Piece = { id: number; code: string };
type Phase = 'start' | 'rivals' | 'choose' | 'merge' | 'won';
export type Pos = { x: number; y: number; z: number; rot: number };
export type Fly = { key: string; code?: string; from: Pos; to: Pos; start: number; dur: number; faceUp: boolean };

/** What the three rivals throw, round after round (right, across, left). */
const RIVAL_THROWS = [['2z', '7p', '4m'], ['3z', '9s', '1p'], ['5m', '8p', '2s']];
export const DEALT = 53; // tiles taken by the deal: 13 each plus the dealer's first draw
export const HAND_VIEW = { u: 50, v: 74, zoom: 1.55 };
export const WIDE_VIEW = { u: 50, v: 49, zoom: 0.86 };
export const sleep = (ms: number) => new Promise<void>((resolve) => { window.setTimeout(resolve, ms); });
const WHO = [
  { es: 'el jugador de tu derecha', en: 'the player on your right', pt: 'o jogador à sua direita' },
  { es: 'el jugador de enfrente', en: 'the player across from you', pt: 'o jogador à sua frente' },
  { es: 'el jugador de tu izquierda', en: 'the player on your left', pt: 'o jogador à sua esquerda' },
];

export const wallPos = (tile: number): Pos => {
  const side = Math.floor(tile / 34);
  const k = tile % 34;
  const slot = wallSlot(side, k % 17, k < 17 ? 0 : 1);
  return { x: slot.x, y: slot.y, z: FELT_Z + (k < 17 ? 0 : 1) * TILE_T, rot: slot.rot };
};
export const pondPos = (player: number, slot: number): Pos => {
  const own = { x: 50 + ((slot % 6) - 2.5) * 3.7, y: 65 + Math.floor(slot / 6) * 4.9 };
  const at = around(own, player);
  return { x: at.x, y: at.y, z: FELT_Z, rot: ROT[player] };
};
type Grab = { id: number; dx: number; dy: number; x: number; y: number; sx: number; sy: number };

const suitRank = (code: string) => 'mpsz'.indexOf(code[1]);
const sortKey = (code: string) => suitRank(code) * 10 + Number(code[0]);
export const byKey = (a: Piece, b: Piece) => sortKey(a.code) - sortKey(b.code) || a.id - b.id;

export const startHand = (): Piece[] => DEALT_HAND.map((code, id) => ({ id, code })).sort(byKey);

/** Greedy read of a sorted hand: runs and triplets are groups, two alike are a pair, the rest is spare. */
export function tagsOf(hand: Piece[]) {
  const out: Array<{ kind: 'group' | 'pair' | 'spare'; from: number; to: number }> = [];
  let i = 0;
  while (i < hand.length) {
    const n = (k: number) => hand[i + k]?.code;
    const same = (a: string | undefined, b: string | undefined) => !!a && a === b;
    const run = (k: number) => n(k) && n(k + 1) && n(k)![1] === n(k + 1)![1] && n(k)![1] !== 'z' && Number(n(k + 1)![0]) === Number(n(k)![0]) + 1;
    if (same(n(0), n(1)) && same(n(1), n(2))) { out.push({ kind: 'group', from: i, to: i + 2 }); i += 3; }
    else if (n(2) && run(0) && run(1)) { out.push({ kind: 'group', from: i, to: i + 2 }); i += 3; }
    else if (same(n(0), n(1))) { out.push({ kind: 'pair', from: i, to: i + 1 }); i += 2; }
    else { out.push({ kind: 'spare', from: i, to: i }); i += 1; }
  }
  return out;
}

export const TAG_LOOK = {
  group: { bg: '#cdeedd', fg: '#14683f', name: { es: 'Grupo', en: 'Set', pt: 'Grupo' } },
  pair: { bg: '#fff0b8', fg: '#7a5a00', name: { es: 'Pareja', en: 'Pair', pt: 'Par' } },
  spare: { bg: '#fbd0cf', fg: '#8a1f2a', name: { es: 'Sobra', en: 'Spare', pt: 'Sobra' } },
} as const;

const HONOR = {
  es: ['Este (東)', 'Sur (南)', 'Oeste (西)', 'Norte (北)', 'Hatsu (發)', 'Chun (中)', 'Haku (白)'],
  en: ['East (東)', 'South (南)', 'West (西)', 'North (北)', 'Hatsu (發)', 'Chun (中)', 'Haku (白)'],
  pt: ['Leste (東)', 'Sul (南)', 'Oeste (西)', 'Norte (北)', 'Hatsu (發)', 'Chun (中)', 'Haku (白)'],
};
/** A tile as people say it: "8 souzu", "Chun (中)". */
export const tileName = (code: string, language: TutorialLanguage) => (code[1] === 'z' ? HONOR[language][Number(code[0]) - 1] : `${code[0]} ${{ m: 'manzu', p: 'pinzu', s: 'souzu' }[code[1] as 'm' | 'p' | 's']}`);

export const handX = (index: number, count: number) => 50 + (index - (count - 1) / 2) * WIDTH;

/**
 * Step after sorting: the same table, your hand in order. Each turn you draw one tile; keep it if it builds a group,
 * throw it into your pond if it does not.
 */
export function DrawBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const assignments = useRef(dealAssignments());
  const [hand, setHand] = useState<Piece[]>(startHand);
  const [drawn, setDrawn] = useState<Piece | null>(null);
  const [pond, setPond] = useState<Piece[]>([]);
  const [phase, setPhase] = useState<Phase>('start');
  const [round, setRound] = useState(0);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const shown = useRef<Map<number, { x: number; lift: number }>>(new Map());
  const flights = useRef<Fly[]>([]);
  const alive = useRef(0);
  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [rivalPonds, setRivalPonds] = useState<string[][]>([[], [], []]);
  const [rivalHold, setRivalHold] = useState<boolean[]>([false, false, false]);
  const [mark, setMark] = useState<number | null>(null);
  const [view, setView] = useState<'hand' | 'wide'>('hand');
  const order = useRef(drawOrder());
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 });
  const lastFrame = useRef(0);
  const scene = useRef<IsoHandle>(null);

  const total = hand.length + (drawn ? 1 : 0);
  const grab = useRef<Grab | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const helps = drawn?.code === '6z';

  const fly = useCallback((entry: Omit<Fly, 'start'>) => {
    flights.current = [...flights.current.filter((f) => f.key !== entry.key), { ...entry, start: performance.now() }];
    scene.current?.invalidate();
    window.setTimeout(() => { flights.current = flights.current.filter((f) => f.key !== entry.key); scene.current?.invalidate(); }, entry.dur + 50);
  }, []);

  const throwAway = useCallback((piece: Piece, fromX: number, fromY: number) => {
    fly({ key: `mine-${piece.id}`, code: piece.code, from: { x: fromX, y: fromY, z: FELT_Z + 1, rot: 0 }, to: pondPos(0, pond.length), dur: FLIGHT_MS, faceUp: true });
    window.setTimeout(() => setPond((now) => [...now, piece]), FLIGHT_MS);
  }, [pond.length, fly]);

  // the rest of the table plays: each rival draws from the wall and throws; then the wall hands you yours
  useEffect(() => {
    if (phase !== 'rivals') return undefined;
    const run = ++alive.current;
    const live = () => alive.current === run;
    const go = async () => {
      setView('wide');
      await sleep(900);
      for (let i = 0; i < 3 && live(); i += 1) {
        const player = i + 1;
        const tile = order.current[DEALT + round * 4 + i];
        const slot = handSlot(player, 13, true);
        setNote({ title: t(`Roba ${WHO[i].es}`, `${WHO[i].en[0].toUpperCase()}${WHO[i].en.slice(1)} draws`, `${WHO[i].pt[0].toUpperCase()}${WHO[i].pt.slice(1)} compra`), body: t('Toma la siguiente ficha del muro y después bota una a su río.', 'Takes the next tile from the wall and then throws one into their pond.', 'Pega a próxima peça do muro e depois descarta uma no seu rio.') });
        setTaken((now) => new Set(now).add(tile));
        fly({ key: `draw-${tile}`, from: wallPos(tile), to: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, dur: 800, faceUp: false });
        await sleep(850);
        if (!live()) return;
        setRivalHold((now) => now.map((v, k) => (k === i ? true : v)));
        await sleep(450);
        const code = RIVAL_THROWS[round][i];
        const to = pondPos(player, rivalPonds[i].length);
        setRivalHold((now) => now.map((v, k) => (k === i ? false : v)));
        fly({ key: `throw-${player}-${rivalPonds[i].length}`, code, from: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, to, dur: 650, faceUp: true });
        await sleep(700);
        if (!live()) return;
        setRivalPonds((now) => now.map((list, k) => (k === i ? [...list, code] : list)));
      }
      if (!live()) return;
      const tile = order.current[DEALT + round * 4 + 3];
      const code = DRAWS[round];
      setNote({ title: t('Te toca robar', 'Your turn to draw', 'Sua vez de comprar'), body: t('Tu ficha viene de la siguiente pila del muro: la que brilla.', 'Your tile comes from the next stack of the wall: the one that glows.', 'Sua peça vem da próxima pilha do muro: a que brilha.') });
      setMark(tile);
      await sleep(2200);
      if (!live()) return;
      setMark(null);
      setTaken((now) => new Set(now).add(tile));
      const goal = handX(hand.length - 1, hand.length + 1) - WIDTH * 0.95 + WIDTH * 1.9;
      fly({ key: `draw-${tile}`, from: wallPos(tile), to: { x: goal, y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1100, faceUp: false });
      await sleep(1000);
      if (!live()) return;
      setView('hand');
      await sleep(150);
      setDrawn({ id: 100 + round, code });
      if (code === '6z') {
        setPhase('merge');
        setNote({ title: t('Robaste el Chun (中)', 'You drew the Chun (中)', 'Você comprou o Chun (中)'), body: t('Ya tenías dos Chun (中): con esta forman un grupo de tres.', 'You already held two Chun (中): with this one they make a set of three.', 'Você já tinha dois Chun (中): com este formam um grupo de três.') });
      } else {
        setPhase('choose');
        setNote({ title: t(`Robaste: ${tileName(code, language)}`, `You drew: ${tileName(code, language)}`, `Você comprou: ${tileName(code, language)}`), body: t('Ahora tienes 14 fichas: bota una. Toca o arrastra hacia arriba la que no ayuda a tu mano.', 'Now you hold 14 tiles: throw one. Tap or drag up the one that does not help your hand.', 'Agora você tem 14 peças: descarte uma. Toque ou arraste para cima a que não ajuda sua mão.') });
      }
    };
    void go();
    return () => { alive.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  // a draw that completes the hand slides into place
  useEffect(() => {
    if (phase !== 'merge' || !drawn) return undefined;
    const timer = window.setTimeout(() => {
      setHand((now) => [...now, drawn].sort(byKey));
      setDrawn(null);
      setPhase('won');
      setNote({ title: t('¡Mano completa!', 'Complete hand!', 'Mão completa!'), body: t('Tres grupos, el grupo de Chun (中) y la pareja: 4 grupos y 1 pareja. Ese es el objetivo; cuando un robo no sirve, botas una ficha y sigues hasta lograrlo.', 'Three sets, the Chun (中) set and the pair: 4 sets and 1 pair. That is the goal; when a draw does not help, you throw one tile and go on until you get there.', 'Três grupos, o grupo de Chun (中) e o par: 4 grupos e 1 par. Esse é o objetivo; quando a compra não ajuda, descarta uma peça e segue até conseguir.') });
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [phase, drawn]);

  const tryThrow = (piece: Piece, fromX: number, fromY: number) => {
    if (phase === 'merge' || phase === 'won' || phase === 'rivals') {
      if (phase === 'merge') setNote({ title: t('¡Ojo, esa sí!', 'Careful, that one yes!', 'Atenção, essa sim!'), body: t('Con esta robada completas la mano: no botes nada.', 'This draw completes your hand: throw nothing.', 'Essa compra completa sua mão: não descarte nada.') });
      return;
    }
    const target = phase === 'start' ? '9p' : drawn?.code;
    if (piece.code === target) {
      throwAway(piece, fromX, fromY);
      if (piece.id === drawn?.id) setDrawn(null);
      else setHand((now) => now.filter((other) => other.id !== piece.id));
      setNote({ title: t('¡Sí, esa!', 'Yes, that one!', 'Isso, essa!'), body: phase === 'start'
        ? t('El 9 pinzu no se junta con nada: sale a tu río (tu zona de descartes). Quedas con 13 fichas.', 'The 9 pinzu joins nothing: it goes to your pond (your discard area). You are left with 13 tiles.', 'O 9 pinzu não se junta a nada: vai para o seu rio (sua área de descartes). Você fica com 13 peças.')
        : t('No ayudaba a la mano, así que sale. Quedas con 13 y robas otra.', 'It did not help the hand, so it goes. You are back to 13 and draw again.', 'Não ajudava a mão, então sai. Você volta a 13 e compra outra.') });
      if (phase === 'start') { setRound(0); setPhase('rivals'); return; }
      if (round + 1 >= DRAWS.length) {
        setPhase('won');
        setNote({ title: t('Dos turnos listos', 'Two turns done', 'Dois turnos prontos'), body: t('Así se juega: robas, miras si te sirve y botas la que no. Tu mano espera un Este (東) o un Chun (中) para completarse. ¿Cómo se gana con ella? Lo vemos en el siguiente paso.', 'That is how it plays: draw, see if it helps, throw the one that does not. Your hand waits for an East (東) or a Chun (中) to complete. How do you win with it? We see that in the next step.', 'É assim que se joga: compra, vê se serve e descarta a que não. Sua mão espera um Leste (東) ou um Chun (中) para completar. Como se ganha com ela? Vemos no próximo passo.') });
        return;
      }
      setRound((now) => now + 1);
      setPhase('rivals');
      return;
    }
    const tag = tagsOf(hand).find((entry) => hand.slice(entry.from, entry.to + 1).some((other) => other.id === piece.id));
    setNote({
      title: t('¡Ojo, esa no!', 'Careful, not that one!', 'Atenção, essa não!'),
      body: tag?.kind === 'group'
        ? t('Esa ficha ya forma parte de un grupo. Busca la que no se junta con nada.', 'That tile is already part of a set. Look for the one that joins nothing.', 'Essa peça já faz parte de um grupo. Procure a que não se junta a nada.')
        : tag?.kind === 'pair'
          ? t('Es una pareja: con una tercera igual sería un grupo. Busca la que no se junta con nada.', 'It is a pair: with a third alike it would be a set. Look for the one that joins nothing.', 'É um par: com uma terceira igual seria um grupo. Procure a que não se junta a nada.')
          : t('Esa te sirve. Busca la que no ayuda.', 'That one helps you. Look for the one that does not.', 'Essa serve. Procure a que não ajuda.'),
    });
  };

  const restart = () => {
    alive.current += 1;
    flights.current = [];
    shown.current.clear();
    setTaken(new Set());
    setRivalPonds([[], [], []]);
    setRivalHold([false, false, false]);
    setMark(null);
    setView('hand');
    setHand(startHand());
    setDrawn(null);
    setPond([]);
    setRound(0);
    setNote(null);
    setPhase('start');
  };

  const pieceAt = (x: number, y: number) => {
    if (Math.abs(y - (HAND_Y + 1)) > 7) return null;
    const all = drawn ? [...hand, drawn] : hand;
    let best: Piece | null = null;
    let gap = WIDTH * 0.6;
    all.forEach((piece) => {
      const st = shown.current.get(piece.id);
      if (st && Math.abs(st.x - x) < gap) { gap = Math.abs(st.x - x); best = piece; }
    });
    return best as Piece | null;
  };

  const onDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = scene.current!.unproject(event, HIT_Z);
    const piece = pieceAt(point.x, point.y);
    if (!piece) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const st = shown.current.get(piece.id)!;
    grab.current = { id: piece.id, dx: st.x - point.x, dy: HAND_Y - point.y, x: st.x, y: HAND_Y, sx: point.x, sy: point.y };
    setGrabbing(true);
    scene.current?.invalidate();
  };

  const onMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const current = grab.current;
    if (!current) return;
    const point = scene.current!.unproject(event, HIT_Z);
    current.x = point.x + current.dx;
    current.y = Math.min(HAND_Y, point.y + current.dy);
    scene.current?.invalidate();
  };

  const onUp = () => {
    const current = grab.current;
    grab.current = null;
    setGrabbing(false);
    if (!current) { return; }
    const piece = [...hand, ...(drawn ? [drawn] : [])].find((entry) => entry.id === current.id);
    if (!piece) return;
    const moved = Math.hypot(current.x - (shown.current.get(piece.id)?.x ?? current.x), HAND_Y - current.y);
    const clicked = moved < 1.2;
    if (clicked || current.y < HAND_Y - 7) tryThrow(piece, current.x, current.y);
    scene.current?.invalidate();
  };

  const draw = (g: Painter) => {
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    const cam = viewNow.current;
    const dt = Math.min(200, g.now - lastFrame.current);
    lastFrame.current = g.now;
    const ease = 1 - Math.exp(-dt / 420);
    const target = view === 'hand' ? HAND_VIEW : WIDE_VIEW;
    cam.u += (target.u - cam.u) * ease;
    cam.v += (target.v - cam.v) * ease;
    cam.zoom += (target.zoom - cam.zoom) * ease;
    if (Math.abs(target.zoom - cam.zoom) + Math.abs(target.v - cam.v) * 0.02 > 0.01) g.needsFrame = true;
    g.view = { ...cam };
    g.table();
    const { palette: p } = g;
    paintDealtTable(g, assignments.current, { taken, mark });
    if (mark !== null) g.needsFrame = true;

    // ponds: everything thrown lies face up in front of its owner
    pond.forEach((piece, slot) => {
      const at = pondPos(0, slot);
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: picture(`${p.faces}/${piece.code}.svg`) });
    });
    rivalPonds.forEach((list, i) => list.forEach((code, slot) => {
      const at = pondPos(i + 1, slot);
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: picture(`${p.faces}/${code}.svg`) });
    }));
    rivalHold.forEach((holding, i) => {
      if (!holding) return;
      const slot = handSlot(i + 1, 13, true);
      g.standTile(slot.x, slot.y, slot.rot, 90, { joined: true, capLeft: true, capRight: true });
    });
    const clock = performance.now();
    flights.current.forEach((f) => {
      const k = Math.min(1, (clock - f.start) / f.dur);
      const e = k * k * (3 - 2 * k);
      const rot = f.from.rot + turn(f.from.rot, f.to.rot) * e;
      g.tile(f.from.x + (f.to.x - f.from.x) * e, f.from.y + (f.to.y - f.from.y) * e, rot, f.from.z + (f.to.z - f.from.z) * e, { flip: f.faceUp ? 1 : 0, face: f.code ? picture(`${p.faces}/${f.code}.svg`) : null, hop: Math.sin(k * Math.PI) * 7, order: 9e4 });
      if (k < 1) g.needsFrame = true;
    });

    // your hand, standing; the drawn tile waits a little apart on the right
    let moving = false;
    const slide = 1 - Math.exp(-dt / 150);
    function place(piece: Piece, goalX: number, goalLift: number, from?: number) {
      const st = shown.current.get(piece.id) ?? { x: from ?? goalX, lift: from === undefined ? 0 : 7 };
      st.x += (goalX - st.x) * slide;
      st.lift += (goalLift - st.lift) * slide;
      if (Math.abs(goalX - st.x) > 0.03 || Math.abs(goalLift - st.lift) > 0.03) moving = true;
      shown.current.set(piece.id, st);
      g.standTile(st.x, HAND_Y, 0, 90, { face: picture(`${p.faces}/${piece.code}.svg`), joined: true, order: HAND_Y * 100 + 50 + st.lift * 3, lift: st.lift });
    }
    const held = grab.current;
    const put = (piece: Piece, goalX: number, goalLift: number, from?: number) => {
      if (held?.id === piece.id) {
        const st = shown.current.get(piece.id)!;
        g.standTile(held.x, held.y, 0, 90, { face: picture(`${p.faces}/${piece.code}.svg`), joined: true, order: 9e4, lift: st.lift + 2.2 });
        return;
      }
      place(piece, goalX, goalLift, from);
    };
    hand.forEach((piece, i) => put(piece, handX(i, total) - (drawn ? WIDTH * 0.95 : 0), 0));
    if (drawn) put(drawn, handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9, 0.8);
    if (moving) g.needsFrame = true;
    g.flush();

    tagsOf(hand).forEach((tag) => {
      const a = shown.current.get(hand[tag.from].id);
      const b = shown.current.get(hand[tag.to].id);
      if (!a || !b) return;
      const look = TAG_LOOK[tag.kind];
      const pos = g.project((a.x + b.x) / 2, HAND_Y, FELT_Z + 8);
      g.pill(pos.x, pos.y + 7, look.name[language], { bg: look.bg, fg: look.fg, size: 11, border: look.fg });
    });
    if (mark !== null) {
      const at = wallPos(mark);
      const pos = g.project(at.x, at.y, FELT_Z + 9);
      g.pill(pos.x, pos.y, t('Robas de aquí', 'You draw from here', 'Você compra daqui'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
    }
    if (drawn) {
      const st = shown.current.get(drawn.id);
      if (st) {
        const pos = g.project(st.x, HAND_Y, FELT_Z + 8);
        g.pill(pos.x, pos.y + 7, t('Tu robo', 'Your draw', 'Sua compra'), { bg: p.gold, fg: p.ink, size: 11, border: p.ink });
      }
    }
  };

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-hand is-draw${grabbing ? ' is-grabbing' : ''}${phase === 'won' ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} handlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }} />
        <div className="sort-actions deck-actions">
          <span>{total} {t('fichas', 'tiles', 'peças')}</span>
          {phase === 'won' && <button type="button" className="sort-button" onClick={restart}>{t('Repetir', 'Again', 'Repetir')}</button>}
        </div>
        <p className={`sort-win is-top${phase === 'won' ? '' : ' is-note'}`} role="status">
          <b>{note?.title ?? (phase === 'start' ? t('Tu mano ordenada', 'Your sorted hand', 'Sua mão ordenada') : phase === 'choose' ? t('¿Te sirve este robo?', 'Does this draw help?', 'Essa compra serve?') : t('Robando del muro…', 'Drawing from the wall…', 'Comprando do muro…'))}</b>
          <span>{note?.body ?? (phase === 'start'
            ? t('Ya robaste tu ficha 14 al repartir, así que solo falta botar. Mira: tres grupos, dos parejas… y una ficha suelta. Toca o arrastra hacia arriba la que sobra.', 'You already drew your 14th tile in the deal, so all that is left is to throw. Look: three sets, two pairs… and one loose tile. Tap or drag up the spare one.', 'Você já comprou sua 14ª peça na distribuição, então só falta descartar. Veja: três grupos, dois pares… e uma peça solta. Toque ou arraste para cima a que sobra.')
            : phase === 'choose'
              ? t('Fíjate si forma un grupo o mejora una pareja. Si no, se bota; si sí, te la quedas.', 'See whether it makes a set or improves a pair. If not, throw it; if so, keep it.', 'Veja se forma um grupo ou melhora um par. Se não, descarte; se sim, fique com ela.')
              : '')}</span>
        </p>
      </div>
    </div>
  );
}
