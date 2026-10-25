import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { dealAssignments, drawOrder, handSlot } from './DealBoard';
import { DEALT, HAND_VIEW, HAND_Y, WIDE_VIEW, WIDTH, byKey, handX, pondPos, sleep, tagsOf, TAG_LOOK, wallPos, type Fly, type Piece } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

/** A hand that waits on 4p or 7p, with a 7p already in your own river: furiten. */
const HAND = ['2m', '3m', '4m', '4p', '5p', '6p', '7s', '8s', '9s', '1z', '1z', '5p', '6p'];
const MINE = ['3z', '7p', '2s'];
const RIVALS = [['4z', '8m'], ['2z', '9s'], ['6z', '1m']];
const WAITS = ['4p', '7p'];
const PRE_TAKEN = 8;

const piecesOf = (codes: string[]): Piece[] => codes.map((code, i) => ({ id: 700 + i, code })).sort(byKey);

/**
 * Furiten, played out: you wait on 4p/7p but already threw a 7p, so the 4p a rival throws cannot win by ron. A tsumo
 * still can.
 */
export function FuritenBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const order = useRef(drawOrder());
  const [hand, setHand] = useState<Piece[]>(() => piecesOf(HAND));
  const [extra, setExtra] = useState<Piece | null>(null);
  const [taken, setTaken] = useState<Set<number>>(() => new Set(order.current.slice(DEALT, DEALT + PRE_TAKEN)));
  const [myPond, setMyPond] = useState<string[]>(MINE);
  const [rivalPonds, setRivalPonds] = useState<string[][]>(RIVALS);
  const [markWaits, setMarkWaits] = useState(false);
  const [markPond, setMarkPond] = useState(false);
  const [hot, setHot] = useState<{ player: number; slot: number } | null>(null);
  const [mark, setMark] = useState<number | null>(null);
  const [view, setView] = useState<'hand' | 'wide'>('hand');
  const [shout, setShout] = useState<{ text: string; bad: boolean } | null>(null);
  const [reveal, setReveal] = useState(false);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const flights = useRef<Fly[]>([]);
  const shown = useRef<Map<number, number>>(new Map());
  const alive = useRef(0);
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 });
  const lastFrame = useRef(0);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('furiten-controls')); }, []);

  const fly = useCallback((entry: Omit<Fly, 'start'>) => {
    flights.current = [...flights.current.filter((f) => f.key !== entry.key), { ...entry, start: performance.now() }];
    scene.current?.invalidate();
    window.setTimeout(() => { flights.current = flights.current.filter((f) => f.key !== entry.key); scene.current?.invalidate(); }, entry.dur + 50);
  }, []);

  const play = useCallback(async () => {
    const run = ++alive.current;
    const live = () => alive.current === run;
    const wait = async (ms: number) => { await sleep(ms); return live(); };
    const said = (title: string, body: string) => setNote({ title, body });
    flights.current = [];
    shown.current.clear();
    setHand(piecesOf(HAND));
    setExtra(null);
    setTaken(new Set(order.current.slice(DEALT, DEALT + PRE_TAKEN)));
    setMyPond(MINE);
    setRivalPonds(RIVALS.map((list) => [...list]));
    setMarkWaits(false);
    setMarkPond(false);
    setHot(null);
    setMark(null);
    setShout(null);
    setReveal(false);
    setView('hand');

    // 1) your wait
    setMarkWaits(true);
    said(t('Tu mano espera 4p o 7p', 'Your hand waits on 4p or 7p', 'Sua mão espera 4p ou 7p'), t('Estás a una ficha de ganar: te sirve un 4 pinzu o un 7 pinzu. Hasta aquí, todo normal.', 'You are one tile from winning: a 4 pinzu or a 7 pinzu completes it. So far, normal.', 'Você está a uma peça de ganhar: um 4 pinzu ou um 7 pinzu completa. Até aqui, normal.'));
    if (!(await wait(5200))) return;

    // 2) the catch: a wait already in your river
    setMarkPond(true);
    setView('wide');
    said(t('Pero ya botaste un 7p', 'But you already threw a 7p', 'Mas você já descartou um 7p'), t('Mira tu río de descartes: ahí hay un 7 pinzu, una de tus esperas. Cuando una ficha de tu espera está en tus propios descartes, estás en furiten.', 'Look at your river: there is a 7 pinzu there, one of your waits. When a tile you wait on is in your own discards, you are in furiten.', 'Veja seu rio de descartes: há um 7 pinzu ali, uma das suas esperas. Quando uma peça da sua espera está nos seus próprios descartes, você está em furiten.'));
    if (!(await wait(6500))) return;

    // 3) a rival throws a winning tile
    const slotRival = handSlot(2, 13, true);
    const drawTile = order.current[DEALT + PRE_TAKEN];
    setTaken((now) => new Set(now).add(drawTile));
    said(t('Enfrente bota un 4p', 'Across throws a 4p', 'À frente descarta um 4p'), t('Justo la ficha que esperas… ¿ron?', 'Exactly the tile you wait on… ron?', 'Justo a peça que você espera… ron?'));
    fly({ key: 'rival-draw', from: wallPos(drawTile), to: { x: slotRival.x, y: slotRival.y, z: FELT_Z + 3, rot: slotRival.rot }, dur: 700, faceUp: false });
    if (!(await wait(750))) return;
    fly({ key: 'rival-throw', code: '4p', from: { x: slotRival.x, y: slotRival.y, z: FELT_Z + 3, rot: slotRival.rot }, to: pondPos(2, RIVALS[1].length), dur: 700, faceUp: true });
    if (!(await wait(750))) return;
    setRivalPonds((now) => now.map((list, k) => (k === 1 ? [...list, '4p'] : list)));
    setHot({ player: 2, slot: RIVALS[1].length });
    if (!(await wait(2200))) return;
    setShout({ text: 'FURITEN', bad: true });
    said(t('¡No puedes hacer ron!', 'You cannot call ron!', 'Você não pode fazer ron!'), t('Aunque sea tu espera, en furiten no puedes ganar con el descarte de un rival: tienes que dejar pasar la ficha.', 'Even though it is your wait, in furiten you cannot win on a rival’s discard: you have to let the tile go.', 'Mesmo sendo sua espera, em furiten você não pode ganhar com o descarte de um rival: precisa deixar a peça passar.'));
    if (!(await wait(6500))) return;
    setShout(null);
    setHot(null);

    // 4) but tsumo still works
    setView('wide');
    const mineTile = order.current[DEALT + PRE_TAKEN + 1];
    said(t('Pero el tsumo sí vale', 'But tsumo still works', 'Mas o tsumo vale'), t('Furiten solo te impide ganar por descarte ajeno (ron). Si la ficha la robas tú del muro, puedes ganar.', 'Furiten only stops you from winning on another’s discard (ron). If you draw the tile yourself from the wall, you can win.', 'Furiten só impede você de ganhar com descarte alheio (ron). Se você mesmo comprar a peça do muro, pode ganhar.'));
    setMark(mineTile);
    if (!(await wait(2400))) return;
    setMark(null);
    setTaken((now) => new Set(now).add(mineTile));
    const goal = handX(12, 14) - WIDTH * 0.95 + WIDTH * 1.9;
    fly({ key: 'mine', from: wallPos(mineTile), to: { x: goal, y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1000, faceUp: false });
    if (!(await wait(1000))) return;
    setView('hand');
    if (!(await wait(300))) return;
    setExtra({ id: 799, code: '7p' });
    setShout({ text: 'TSUMO', bad: false });
    said(t('¡Tsumo!', 'Tsumo!', 'Tsumo!'), t('Robaste el 7 pinzu y ganas por tsumo, aunque estés en furiten. Con ron no habrías podido.', 'You drew the 7 pinzu and win by tsumo, even in furiten. With ron you could not have.', 'Você comprou o 7 pinzu e ganha por tsumo, mesmo em furiten. Com ron não teria podido.'));
    if (!(await wait(4200))) return;
    setReveal(true);
    setMarkWaits(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, fly]);

  useEffect(() => { void play(); return () => { alive.current += 1; }; }, [play]);

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
    if (mark !== null || hot || markPond) g.needsFrame = true;
    const face = (code: string) => picture(`${p.faces}/${code}.svg`);

    myPond.forEach((code, i) => {
      const at = pondPos(0, i);
      const glow = markPond && WAITS.includes(code);
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code), gold: glow, hop: glow ? 1 + Math.sin(g.now / 160) * 0.8 : 0 });
    });
    rivalPonds.forEach((list, k) => list.forEach((code, i) => {
      const at = pondPos(k + 1, i);
      const glow = hot?.player === k + 1 && hot.slot === i;
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code), gold: glow, hop: glow ? 1 + Math.sin(g.now / 160) * 0.8 : 0 });
    }));
    const clock = performance.now();
    flights.current.forEach((f) => {
      const k = Math.min(1, (clock - f.start) / f.dur);
      const e = k * k * (3 - 2 * k);
      const turnTo = ((f.to.rot - f.from.rot + 540) % 360) - 180;
      g.tile(f.from.x + (f.to.x - f.from.x) * e, f.from.y + (f.to.y - f.from.y) * e, f.from.rot + turnTo * e, f.from.z + (f.to.z - f.from.z) * e, { flip: f.faceUp ? 1 : 0, face: f.code ? face(f.code) : null, hop: Math.sin(k * Math.PI) * 6, order: 9e4 });
      if (k < 1) g.needsFrame = true;
    });

    let moving = false;
    const slide = 1 - Math.exp(-dt / 150);
    hand.forEach((piece, i) => {
      const goal = handX(i, total) - (extra ? WIDTH * 0.95 : 0);
      const cur = shown.current.get(piece.id) ?? goal;
      const x = cur + (goal - cur) * slide;
      if (Math.abs(goal - x) > 0.03) moving = true;
      shown.current.set(piece.id, x);
      g.standTile(x, HAND_Y, 0, 90, { face: face(piece.code), joined: true, order: HAND_Y * 100 + 50 });
    });
    if (extra) {
      const goal = handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9;
      const cur = shown.current.get(extra.id) ?? goal;
      const x = cur + (goal - cur) * slide;
      shown.current.set(extra.id, x);
      g.standTile(x, HAND_Y, 0, 90, { face: face(extra.code), joined: true, order: HAND_Y * 100 + 50 });
    }
    if (moving) g.needsFrame = true;
    g.flush();

    if (view === 'hand') {
      // the waits, spelled out over the hand: the two 5p-6p tiles wait on 4p / 7p
      if (markWaits) {
        const pair = hand.filter((piece) => piece.code === '5p' || piece.code === '6p');
        const xs = pair.map((piece) => shown.current.get(piece.id)).filter((x): x is number => x !== undefined);
        if (xs.length) {
          const pos = g.project(Math.min(...xs) + (Math.max(...xs) - Math.min(...xs)) / 2, HAND_Y, FELT_Z + 14);
          g.pill(pos.x, pos.y - 6, t('Esperas 4p · 7p', 'You wait 4p · 7p', 'Espera 4p · 7p'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
        }
      }
      if (reveal) {
        tagsOf([...hand, ...(extra ? [extra] : [])].sort(byKey)).forEach((tag) => {
          const full = [...hand, ...(extra ? [extra] : [])].sort(byKey);
          const a = shown.current.get(full[tag.from].id);
          const b = shown.current.get(full[tag.to].id);
          if (a === undefined || b === undefined) return;
          const look = TAG_LOOK[tag.kind];
          const pos = g.project((a + b) / 2, HAND_Y, FELT_Z + 8);
          g.pill(pos.x, pos.y + 7, look.name[language], { bg: look.bg, fg: look.fg, size: 11, border: look.fg });
        });
      }
    }
    if (markPond) {
      myPond.forEach((code, i) => {
        if (!WAITS.includes(code)) return;
        const at = pondPos(0, i);
        const pos = g.project(at.x, at.y, FELT_Z + 9);
        g.pill(pos.x, pos.y, t('Ya la botaste', 'Already thrown', 'Já descartou'), { bg: '#fbd0cf', fg: '#8a1f2a', size: 11, border: '#8a1f2a' });
      });
    }
    if (mark !== null) {
      const at = wallPos(mark);
      const pos = g.project(at.x, at.y, FELT_Z + 9);
      g.pill(pos.x, pos.y, t('Robas de aquí', 'You draw from here', 'Você compra daqui'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
    }
  };

  const controls = (
    <div className="yaku-controls-inner">
      <button type="button" className="sort-button" onClick={() => { void play(); }}>↻ {t('Ver otra vez', 'Watch again', 'Ver de novo')}</button>
      <a className="sort-button is-primary" href="../practicar/furiten.html" target="_blank" rel="noopener">{t('Saber más sobre furiten ↗', 'Learn more about furiten ↗', 'Saber mais sobre furiten ↗')}</a>
    </div>
  );
  return (
    <div className="sort-stage deck-stage">
      {slot && createPortal(controls, slot)}
      <div className="sort-board deck-board is-table is-hand is-draw is-yaku">
        <IsoCanvas ref={scene} draw={draw} />
        {shout && (
          <div className={`win-shout${shout.bad ? ' is-bad' : ''}`} key={shout.text} role="status">
            <span className="win-cat" aria-hidden="true">{shout.bad ? '🙅' : '🐱'}</span>
            <b>{shout.text}!</b>
          </div>
        )}
        <p className="sort-win is-top is-note" role="status">
          <b>{note?.title}</b>
          <span>{note?.body}</span>
        </p>
      </div>
    </div>
  );
}
