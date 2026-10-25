import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { DEALT_HAND } from '../../domain/dealtHand';
import { dealAssignments } from './DealBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

const WIDTH = 3.6;
const HAND_Y = 94.4;
const FLIGHT_MS = 650;
const HIT_Z = FELT_Z + 2.5;
/** What the wall hands you, turn after turn: two that do nothing for the hand, then the one that completes it. */
const DRAWS = ['8s', '9m', '6z'];

type Piece = { id: number; code: string };
type Flight = { piece: Piece; fromX: number; fromY: number; slot: number; start: number };
type Phase = 'start' | 'wait' | 'choose' | 'merge' | 'won';
type Grab = { id: number; dx: number; dy: number; x: number; y: number; sx: number; sy: number };

const suitRank = (code: string) => 'mpsz'.indexOf(code[1]);
const sortKey = (code: string) => suitRank(code) * 10 + Number(code[0]);
const byKey = (a: Piece, b: Piece) => sortKey(a.code) - sortKey(b.code) || a.id - b.id;

const startHand = (): Piece[] => DEALT_HAND.map((code, id) => ({ id, code })).sort(byKey);

/** Greedy read of a sorted hand: runs and triplets are groups, two alike are a pair, the rest is spare. */
function tagsOf(hand: Piece[]) {
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

const TAG_LOOK = {
  group: { bg: '#cdeedd', fg: '#14683f', name: { es: 'Grupo', en: 'Set', pt: 'Grupo' } },
  pair: { bg: '#fff0b8', fg: '#7a5a00', name: { es: 'Pareja', en: 'Pair', pt: 'Par' } },
  spare: { bg: '#fbd0cf', fg: '#8a1f2a', name: { es: 'Sobra', en: 'Spare', pt: 'Sobra' } },
} as const;

const handX = (index: number, count: number) => 50 + (index - (count - 1) / 2) * WIDTH;
const pondAt = (slot: number) => ({ x: 14 + (slot % 6) * 3.9, y: 76 + Math.floor(slot / 6) * 5.4 });

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
  const flight = useRef<Flight | null>(null);
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 });
  const lastFrame = useRef(0);
  const scene = useRef<IsoHandle>(null);

  const total = hand.length + (drawn ? 1 : 0);
  const grab = useRef<Grab | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const helps = drawn?.code === '6z';

  const throwAway = useCallback((piece: Piece, fromX: number, fromY: number) => {
    flight.current = { piece, fromX, fromY, slot: pond.length, start: performance.now() };
    setPond((now) => [...now, piece]);
    window.setTimeout(() => { flight.current = null; scene.current?.invalidate(); }, FLIGHT_MS + 60);
  }, [pond.length]);

  // after a throw, the wall hands you the next tile
  useEffect(() => {
    if (phase !== 'wait') return undefined;
    const timer = window.setTimeout(() => {
      const code = DRAWS[round];
      setDrawn({ id: 100 + round, code });
      if (code === '6z') {
        setPhase('merge');
        setNote({ title: t('Robaste la 6z', 'You drew the 6z', 'Você comprou o 6z'), body: t('Ya tenías dos 6z: con esta forman un grupo de tres.', 'You already held two 6z: with this one they make a set of three.', 'Você já tinha dois 6z: com este formam um grupo de três.') });
      } else {
        setPhase('choose');
        setNote({ title: t(`Robaste la ${code}`, `You drew the ${code}`, `Você comprou o ${code}`), body: t('Ahora tienes 14 fichas: bota una. Toca o arrastra hacia arriba la que no ayuda a tu mano.', 'Now you hold 14 tiles: throw one. Tap or drag up the one that does not help your hand.', 'Agora você tem 14 peças: descarte uma. Toque ou arraste para cima a que não ajuda sua mão.') });
      }
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [phase, round]);

  // a draw that completes the hand slides into place
  useEffect(() => {
    if (phase !== 'merge' || !drawn) return undefined;
    const timer = window.setTimeout(() => {
      setHand((now) => [...now, drawn].sort(byKey));
      setDrawn(null);
      setPhase('won');
      setNote({ title: t('¡Mano completa!', 'Complete hand!', 'Mão completa!'), body: t('Tres grupos, el grupo de 6z y la pareja: 4 grupos y 1 pareja. Ese es el objetivo; cuando un robo no sirve, botas una ficha y sigues hasta lograrlo.', 'Three sets, the 6z set and the pair: 4 sets and 1 pair. That is the goal; when a draw does not help, you throw one tile and go on until you get there.', 'Três grupos, o grupo de 6z e o par: 4 grupos e 1 par. Esse é o objetivo; quando a compra não ajuda, descarta uma peça e segue até conseguir.') });
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [phase, drawn]);

  const tryThrow = (piece: Piece, fromX: number, fromY: number) => {
    if (phase === 'merge' || phase === 'won' || phase === 'wait') {
      if (phase === 'merge') setNote({ title: t('¡Ojo, esa sí!', 'Careful, that one yes!', 'Atenção, essa sim!'), body: t('Con esta robada completas la mano: no botes nada.', 'This draw completes your hand: throw nothing.', 'Essa compra completa sua mão: não descarte nada.') });
      return;
    }
    const target = phase === 'start' ? '9p' : drawn?.code;
    if (piece.code === target) {
      throwAway(piece, fromX, fromY);
      if (piece.id === drawn?.id) setDrawn(null);
      else setHand((now) => now.filter((other) => other.id !== piece.id));
      setNote({ title: t('¡Sí, esa!', 'Yes, that one!', 'Isso, essa!'), body: phase === 'start'
        ? t('La 9p no se junta con nada: sale a tu río (tu zona de descartes). Quedas con 13 fichas.', 'The 9p joins nothing: it goes to your pond (your discard area). You are left with 13 tiles.', 'O 9p não se junta a nada: vai para o seu rio (sua área de descartes). Você fica com 13 peças.')
        : t('No ayudaba a la mano, así que sale. Quedas con 13 y robas otra.', 'It did not help the hand, so it goes. You are back to 13 and draw again.', 'Não ajudava a mão, então sai. Você volta a 13 e compra outra.') });
      if (phase !== 'start') setRound((now) => now + 1);
      else setRound(0);
      setPhase('wait');
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
    flight.current = null;
    shown.current.clear();
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
    const target = { u: 50, v: 86, zoom: 2.15 };
    cam.u += (target.u - cam.u) * ease;
    cam.v += (target.v - cam.v) * ease;
    cam.zoom += (target.zoom - cam.zoom) * ease;
    if (Math.abs(target.zoom - cam.zoom) + Math.abs(target.v - cam.v) * 0.02 > 0.01) g.needsFrame = true;
    g.view = { ...cam };
    g.table();
    const { palette: p } = g;
    paintDealtTable(g, assignments.current);

    // your pond: what you threw lies face up in front of your hand
    const flying = flight.current;
    pond.forEach((piece, slot) => {
      if (flying && flying.piece.id === piece.id) return;
      const at = pondAt(slot);
      g.tile(at.x, at.y, 0, FELT_Z, { flip: 1, face: picture(`${p.faces}/${piece.code}.svg`) });
    });
    if (flying) {
      const k = Math.min(1, (performance.now() - flying.start) / FLIGHT_MS);
      const e = 1 - (1 - k) * (1 - k);
      const to = pondAt(flying.slot);
      const x = flying.fromX + (to.x - flying.fromX) * e;
      const y = flying.fromY + (to.y - flying.fromY) * e;
      g.tile(x, y, 0, FELT_Z + 1, { flip: 1, face: picture(`${p.faces}/${flying.piece.code}.svg`), hop: Math.sin(k * Math.PI) * 7, order: 9e4 });
      if (k < 1) g.needsFrame = true;
    }

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
    if (drawn) put(drawn, handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9, 0.8, handX(hand.length - 1, total) + WIDTH * 4);
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
            ? t('Mira: tres grupos de tres, dos parejas… y una ficha suelta. Tu meta es 4 grupos y 1 pareja. Toca o arrastra hacia arriba la que sobra para botarla.', 'Look: three sets of three, two pairs… and one loose tile. Your goal is 4 sets and 1 pair. Throw the spare one.', 'Veja: três grupos de três, dois pares… e uma peça solta. Sua meta é 4 grupos e 1 par. Descarte a que sobra.')
            : phase === 'choose'
              ? t('Fíjate si forma un grupo o mejora una pareja. Si no, se bota; si sí, te la quedas.', 'See whether it makes a set or improves a pair. If not, throw it; if so, keep it.', 'Veja se forma um grupo ou melhora um par. Se não, descarte; se sim, fique com ela.')
              : '')}</span>
        </p>
      </div>
    </div>
  );
}
