import { useCallback, useEffect, useRef, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { ROT, dealAssignments, drawOrder, handSlot } from './DealBoard';
import { DEALT, HAND_VIEW, HAND_Y, WIDE_VIEW, WIDTH, byKey, handX, pondPos, sleep, startHand, tagsOf, TAG_LOOK, wallPos, type Fly, type Piece } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

type How = 'tsumo' | 'ron';
type Phase = 'idle' | 'playing' | 'offer' | 'won';

const WINNER = '6z';
const waiting = (): Piece[] => startHand().filter((piece) => piece.code !== '9p');

/**
 * Two ways to complete the same hand: tsumo (you draw the tile yourself) and ron (a rival throws it and you claim it).
 */
export function WinBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const order = useRef(drawOrder());
  const [hand, setHand] = useState<Piece[]>(waiting);
  const [extra, setExtra] = useState<Piece | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [how, setHow] = useState<How | null>(null);
  const [view, setView] = useState<'hand' | 'wide'>('hand');
  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [mark, setMark] = useState<number | null>(null);
  const [rivalPond, setRivalPond] = useState(false);
  const [rivalHold, setRivalHold] = useState(false);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const flights = useRef<Fly[]>([]);
  const shown = useRef<Map<number, { x: number; lift: number }>>(new Map());
  const alive = useRef(0);
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 });
  const lastFrame = useRef(0);

  const fly = useCallback((entry: Omit<Fly, 'start'>) => {
    flights.current = [...flights.current.filter((f) => f.key !== entry.key), { ...entry, start: performance.now() }];
    scene.current?.invalidate();
    window.setTimeout(() => { flights.current = flights.current.filter((f) => f.key !== entry.key); scene.current?.invalidate(); }, entry.dur + 50);
  }, []);

  const reset = () => {
    alive.current += 1;
    flights.current = [];
    shown.current.clear();
    setHand(waiting());
    setExtra(null);
    setTaken(new Set());
    setMark(null);
    setRivalPond(false);
    setRivalHold(false);
    setHow(null);
    setNote(null);
    setView('hand');
    setPhase('idle');
  };

  const complete = (piece: Piece, key: string) => {
    setHand((now) => [...now, piece].sort(byKey));
    setExtra(null);
    setPhase('won');
    setNote(key === 'tsumo'
      ? { title: t('¡Tsumo!', 'Tsumo!', 'Tsumo!'), body: t('Ganaste con una ficha que robaste tú del muro. Pagan los tres rivales.', 'You won on a tile you drew yourself from the wall. All three rivals pay.', 'Você ganhou com uma peça que comprou do muro. Os três rivais pagam.') }
      : { title: t('¡Ron!', 'Ron!', 'Ron!'), body: t('Ganaste con la ficha que descartó un rival. Paga solo quien la botó.', 'You won on a tile a rival discarded. Only the one who threw it pays.', 'Você ganhou com a peça que um rival descartou. Só quem a descartou paga.') });
  };

  const play = async (kind: How) => {
    reset();
    await sleep(60);
    const run = ++alive.current;
    const live = () => alive.current === run;
    setHow(kind);
    setPhase('playing');
    setView('wide');
    await sleep(900);
    if (!live()) return;
    if (kind === 'tsumo') {
      const tile = order.current[DEALT + 3];
      setNote({ title: t('Tsumo: robas tú', 'Tsumo: you draw', 'Tsumo: você compra'), body: t('Es tu turno: robas la siguiente ficha del muro, la que brilla.', 'It is your turn: you draw the next tile from the wall, the one that glows.', 'É sua vez: você compra a próxima peça do muro, a que brilha.') });
      setMark(tile);
      await sleep(2200);
      if (!live()) return;
      setMark(null);
      setTaken((now) => new Set(now).add(tile));
      const goal = handX(hand.length - 1, hand.length + 1) - WIDTH * 0.95 + WIDTH * 1.9;
      fly({ key: 'win', from: wallPos(tile), to: { x: goal, y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1100, faceUp: false });
      await sleep(1000);
      if (!live()) return;
      setView('hand');
      setExtra({ id: 200, code: WINNER });
      setNote({ title: t('¡Es la 6z!', 'It is the 6z!', 'É o 6z!'), body: t('Con ella tus dos 6z se vuelven un grupo: la mano queda completa.', 'With it your two 6z become a set: the hand is complete.', 'Com ela seus dois 6z viram um grupo: a mão fica completa.') });
      await sleep(2000);
      if (!live()) return;
      complete({ id: 200, code: WINNER }, 'tsumo');
      return;
    }
    // ron: the player across draws and throws the tile you need
    const tile = order.current[DEALT + 1];
    const slot = handSlot(2, 13, true);
    setNote({ title: t('Ron: un rival la bota', 'Ron: a rival throws it', 'Ron: um rival descarta'), body: t('El jugador de enfrente roba y va a descartar una ficha…', 'The player across draws and is about to discard a tile…', 'O jogador à frente compra e vai descartar uma peça…') });
    setTaken((now) => new Set(now).add(tile));
    fly({ key: 'rival-draw', from: wallPos(tile), to: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, dur: 800, faceUp: false });
    await sleep(850);
    if (!live()) return;
    setRivalHold(true);
    await sleep(500);
    setRivalHold(false);
    fly({ key: 'rival-throw', code: WINNER, from: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, to: pondPos(2, 0), dur: 700, faceUp: true });
    await sleep(750);
    if (!live()) return;
    setRivalPond(true);
    setPhase('offer');
    setNote({ title: t('¡Esa te sirve!', 'That one helps you!', 'Essa serve!'), body: t('Es la 6z que esperabas. No la robaste: la botó un rival. Puedes reclamarla diciendo «Ron».', 'It is the 6z you were waiting for. You did not draw it: a rival threw it. You can claim it by calling “Ron”.', 'É o 6z que você esperava. Você não comprou: um rival descartou. Pode reivindicá-la dizendo «Ron».') });
  };

  const callRon = async () => {
    if (phase !== 'offer') return;
    const run = ++alive.current;
    const live = () => alive.current === run;
    setPhase('playing');
    setRivalPond(false);
    const goal = handX(hand.length - 1, hand.length + 1) - WIDTH * 0.95 + WIDTH * 1.9;
    fly({ key: 'claim', code: WINNER, from: pondPos(2, 0), to: { x: goal, y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1100, faceUp: true });
    await sleep(900);
    if (!live()) return;
    setView('hand');
    await sleep(300);
    setExtra({ id: 201, code: WINNER });
    await sleep(1400);
    if (!live()) return;
    complete({ id: 201, code: WINNER }, 'ron');
  };

  useEffect(() => () => { alive.current += 1; }, []);

  const total = hand.length + (extra ? 1 : 0);

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

    if (rivalPond) {
      const at = pondPos(2, 0);
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: picture(`${p.faces}/${WINNER}.svg`), gold: true, hop: 1 + Math.sin(g.now / 160) * 0.8 });
      g.needsFrame = true;
    }
    if (rivalHold) {
      const slot = handSlot(2, 13, true);
      g.standTile(slot.x, slot.y, slot.rot, 90, { joined: true });
    }
    const clock = performance.now();
    flights.current.forEach((f) => {
      const k = Math.min(1, (clock - f.start) / f.dur);
      const e = k * k * (3 - 2 * k);
      const turnTo = ((f.to.rot - f.from.rot + 540) % 360) - 180;
      g.tile(f.from.x + (f.to.x - f.from.x) * e, f.from.y + (f.to.y - f.from.y) * e, f.from.rot + turnTo * e, f.from.z + (f.to.z - f.from.z) * e, { flip: f.faceUp ? 1 : 0, face: f.code ? picture(`${p.faces}/${f.code}.svg`) : null, hop: Math.sin(k * Math.PI) * 7, order: 9e4 });
      if (k < 1) g.needsFrame = true;
    });

    let moving = false;
    const slide = 1 - Math.exp(-dt / 150);
    const place = (piece: Piece, goalX: number) => {
      const st = shown.current.get(piece.id) ?? { x: goalX, lift: 0 };
      st.x += (goalX - st.x) * slide;
      if (Math.abs(goalX - st.x) > 0.03) moving = true;
      shown.current.set(piece.id, st);
      g.standTile(st.x, HAND_Y, 0, 90, { face: picture(`${p.faces}/${piece.code}.svg`), joined: true, order: HAND_Y * 100 + 50 });
    };
    hand.forEach((piece, i) => place(piece, handX(i, total) - (extra ? WIDTH * 0.95 : 0)));
    if (extra) place(extra, handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9);
    if (moving) g.needsFrame = true;
    g.flush();

    if (phase === 'won' || phase === 'idle') {
      tagsOf(hand).forEach((tag) => {
        const a = shown.current.get(hand[tag.from].id);
        const b = shown.current.get(hand[tag.to].id);
        if (!a || !b) return;
        const look = TAG_LOOK[tag.kind];
        const pos = g.project((a.x + b.x) / 2, HAND_Y, FELT_Z + 8);
        g.pill(pos.x, pos.y + 7, look.name[language], { bg: look.bg, fg: look.fg, size: 11, border: look.fg });
      });
    }
    if (mark !== null) {
      const at = wallPos(mark);
      const pos = g.project(at.x, at.y, FELT_Z + 9);
      g.pill(pos.x, pos.y, t('Robas de aquí', 'You draw from here', 'Você compra daqui'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
    }
    if (rivalPond) {
      const at = pondPos(2, 0);
      const pos = g.project(at.x, at.y, FELT_Z + 9);
      g.pill(pos.x, pos.y, t('La botó un rival', 'A rival threw it', 'Um rival descartou'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
    }
  };

  void ROT;
  const idle = phase === 'idle' || phase === 'won';
  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-hand is-draw${phase === 'won' ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} />
        <div className="sort-actions deck-actions">
          <span>{t('Esperas 1z o 6z', 'You wait on 1z or 6z', 'Você espera 1z ou 6z')}</span>
          {idle && (
            <>
              <button type="button" className={`sort-button${how === 'tsumo' ? ' is-primary' : ''}`} onClick={() => { void play('tsumo'); }}>{t('Tsumo: la robo yo', 'Tsumo: I draw it', 'Tsumo: eu compro')}</button>
              <button type="button" className={`sort-button${how === 'ron' ? ' is-primary' : ''}`} onClick={() => { void play('ron'); }}>{t('Ron: la bota un rival', 'Ron: a rival throws it', 'Ron: um rival descarta')}</button>
            </>
          )}
          {phase === 'offer' && <button type="button" className="sort-button is-primary" onClick={() => { void callRon(); }}>{t('¡Ron!', 'Ron!', 'Ron!')}</button>}
        </div>
        <p className={`sort-win is-top${phase === 'won' ? '' : ' is-note'}`} role="status">
          <b>{note?.title ?? t('Tu mano espera una ficha', 'Your hand waits on a tile', 'Sua mão espera uma peça')}</b>
          <span>{note?.body ?? t('Te falta una sola ficha: la 1z o la 6z. Hay dos maneras de completarla; pruébalas.', 'You are one tile away: the 1z or the 6z. There are two ways to complete it; try them.', 'Falta uma só peça: o 1z ou o 6z. Há duas maneiras de completar; experimente.')}</span>
        </p>
      </div>
    </div>
  );
}
