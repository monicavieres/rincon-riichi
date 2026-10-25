import { useCallback, useEffect, useRef, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { DEALT_HAND } from '../../domain/dealtHand';
import { dealAssignments } from './DealBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

const WIDTH = 3.6;
const HAND_Y = 94.4;
const FLIGHT_MS = 650;
/** What the wall hands you, turn after turn: two that do nothing for the hand, then the one that completes it. */
const DRAWS = ['8s', '9m', '6z'];

type Piece = { id: number; code: string };
type Flight = { piece: Piece; fromX: number; slot: number; start: number };
type Phase = 'start' | 'wait' | 'choose' | 'won';

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
const pondAt = (slot: number) => ({ x: 50 + ((slot % 6) - 2.5) * 3.9, y: 71.5 + Math.floor(slot / 6) * 5.2 });

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
  const spare = phase === 'start' ? hand.find((piece) => tagsOf(hand).some((tag) => tag.kind === 'spare' && hand[tag.from].id === piece.id)) : undefined;

  const throwAway = useCallback((piece: Piece) => {
    const fromX = shown.current.get(piece.id)?.x ?? 50;
    flight.current = { piece, fromX, slot: pond.length, start: performance.now() };
    setPond((now) => [...now, piece]);
    window.setTimeout(() => { flight.current = null; scene.current?.invalidate(); }, FLIGHT_MS + 60);
  }, [pond.length]);

  const dropSpare = () => {
    if (!spare) return;
    throwAway(spare);
    setHand((now) => now.filter((piece) => piece.id !== spare.id));
    setNote({ title: t('Esa 9p no se junta con nada', 'That 9p joins nothing', 'Esse 9p não se junta a nada'), body: t('La botamos a tu río (tu zona de descartes). Ahora tu mano espera con 13 fichas.', 'It goes to your pond (your discard area). Now your hand waits with 13 tiles.', 'Ela vai para o seu rio (sua área de descartes). Agora sua mão espera com 13 peças.') });
    setPhase('wait');
  };

  useEffect(() => {
    if (phase !== 'wait') return undefined;
    const timer = window.setTimeout(() => {
      setDrawn({ id: 100 + round, code: DRAWS[round] });
      setPhase('choose');
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [phase, round]);

  const helps = drawn?.code === '6z';

  const keep = () => {
    if (!drawn) return;
    if (!helps) {
      setNote({ title: t('Esta no encaja', 'That one does not fit', 'Essa não se encaixa'), body: t('No forma grupo con ninguna de tus fichas ni mejora una pareja. Mejor botarla y robar otra.', 'It makes no set with your tiles and does not improve a pair. Better to throw it and draw again.', 'Não forma grupo com nenhuma das suas peças nem melhora um par. Melhor descartar e comprar outra.') });
      return;
    }
    setHand((now) => [...now, drawn].sort(byKey));
    setDrawn(null);
    setPhase('won');
    setNote({ title: t('¡Mano completa!', 'Complete hand!', 'Mão completa!'), body: t('Con la 6z juntaste tres iguales: ya tienes 4 grupos y 1 pareja. Ese es el objetivo; si no sirve, botas y sigues robando hasta lograrlo.', 'With the 6z you made three alike: you now have 4 sets and 1 pair. That is the goal; when a draw does not help, you throw it and keep drawing until you get there.', 'Com o 6z você juntou três iguais: agora tem 4 grupos e 1 par. Esse é o objetivo; se a compra não ajuda, descarta e continua comprando até conseguir.') });
  };

  const toss = () => {
    if (!drawn) return;
    if (helps) {
      setNote({ title: t('¡Ojo, esta sirve!', 'Careful, this one helps!', 'Atenção, essa serve!'), body: t('Tienes dos 6z: con una tercera forman un grupo. Quédatela.', 'You hold two 6z: a third makes a set. Keep it.', 'Você tem dois 6z: com um terceiro formam um grupo. Fique com ela.') });
      return;
    }
    throwAway(drawn);
    setDrawn(null);
    setNote({ title: t('Bien botada', 'Well thrown', 'Bem descartada'), body: t('No ayudaba a la mano, así que sale. Robamos otra.', 'It did not help the hand, so it goes. We draw again.', 'Não ajudava a mão, então sai. Compramos outra.') });
    setRound((now) => now + 1);
    setPhase('wait');
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

  const draw = (g: Painter) => {
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    const cam = viewNow.current;
    const dt = Math.min(200, g.now - lastFrame.current);
    lastFrame.current = g.now;
    const ease = 1 - Math.exp(-dt / 420);
    const target = { u: 50, v: 76, zoom: 1.6 };
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
      const y = HAND_Y + (to.y - HAND_Y) * e;
      g.tile(x, y, 0, FELT_Z + 1, { flip: 1, face: picture(`${p.faces}/${flying.piece.code}.svg`), hop: Math.sin(k * Math.PI) * 7, order: 9e4 });
      if (k < 1) g.needsFrame = true;
    }

    // your hand, standing; the drawn tile waits a little apart on the right
    let moving = false;
    const slide = 1 - Math.exp(-dt / 150);
    const place = (piece: Piece, goalX: number, goalLift: number, from?: number) => {
      const st = shown.current.get(piece.id) ?? { x: from ?? goalX, lift: from === undefined ? 0 : 7 };
      st.x += (goalX - st.x) * slide;
      st.lift += (goalLift - st.lift) * slide;
      if (Math.abs(goalX - st.x) > 0.03 || Math.abs(goalLift - st.lift) > 0.03) moving = true;
      shown.current.set(piece.id, st);
      g.standTile(st.x, HAND_Y, 0, 90, { face: picture(`${p.faces}/${piece.code}.svg`), joined: true, order: HAND_Y * 100 + 50 + st.lift * 3, lift: st.lift });
    };
    hand.forEach((piece, i) => place(piece, handX(i, total) - (drawn ? WIDTH * 0.95 : 0), 0));
    if (drawn) place(drawn, handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9, 0.8, handX(hand.length - 1, total) + WIDTH * 4);
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

  const busy = phase === 'wait';
  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-hand is-draw${phase === 'won' ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} />
        <div className="sort-actions deck-actions">
          <span>{total} {t('fichas', 'tiles', 'peças')}</span>
          {phase === 'start' && <button type="button" className="sort-button is-primary" onClick={dropSpare}>{t('Botar la 9p', 'Throw the 9p', 'Descartar o 9p')}</button>}
          {phase === 'choose' && (
            <>
              <button type="button" className="sort-button" onClick={toss} disabled={busy}>{t('Botarla', 'Throw it', 'Descartar')}</button>
              <button type="button" className="sort-button is-primary" onClick={keep} disabled={busy}>{t('Quedármela', 'Keep it', 'Ficar com ela')}</button>
            </>
          )}
          {phase === 'won' && <button type="button" className="sort-button" onClick={restart}>{t('Repetir', 'Again', 'Repetir')}</button>}
        </div>
        <p className={`sort-win is-top${phase === 'won' ? '' : ' is-note'}`} role="status">
          <b>{note?.title ?? (phase === 'start' ? t('Tu mano ordenada', 'Your sorted hand', 'Sua mão ordenada') : phase === 'choose' ? t('¿Te sirve este robo?', 'Does this draw help?', 'Essa compra serve?') : t('Robando del muro…', 'Drawing from the wall…', 'Comprando do muro…'))}</b>
          <span>{note?.body ?? (phase === 'start'
            ? t('Mira: tres grupos de tres, dos parejas… y una ficha suelta. Tu meta es 4 grupos y 1 pareja. Bota la que sobra.', 'Look: three sets of three, two pairs… and one loose tile. Your goal is 4 sets and 1 pair. Throw the spare one.', 'Veja: três grupos de três, dois pares… e uma peça solta. Sua meta é 4 grupos e 1 par. Descarte a que sobra.')
            : phase === 'choose'
              ? t('Fíjate si forma un grupo o mejora una pareja. Si no, se bota; si sí, te la quedas.', 'See whether it makes a set or improves a pair. If not, throw it; if so, keep it.', 'Veja se forma um grupo ou melhora um par. Se não, descarte; se sim, fique com ela.')
              : '')}</span>
        </p>
      </div>
    </div>
  );
}
