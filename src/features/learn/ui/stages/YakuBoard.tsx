import { useCallback, useEffect, useRef, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { dealAssignments } from './DealBoard';
import { HAND_VIEW, HAND_Y, TAG_LOOK, WIDTH, byKey, handX, pondPos, sleep, tagsOf, type Piece } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

type Mode = 'tanyao' | 'riichi' | 'yakuhai';
type Sub = 'yes' | 'no' | 'dragon' | 'wind';

const SETS: Record<string, string[]> = {
  tanyao: ['2m', '3m', '4m', '3p', '4p', '5p', '6s', '7s', '8s', '5p', '5p', '5p', '4s', '4s'],
  notTanyao: ['1m', '2m', '3m', '3p', '4p', '5p', '6s', '7s', '8s', '1z', '1z', '1z', '4s', '4s'],
  dragon: ['2m', '3m', '4m', '4p', '5p', '6p', '7s', '8s', '9s', '6z', '6z', '6z', '3m', '3m'],
  wind: ['2m', '3m', '4m', '4p', '5p', '6p', '7s', '8s', '9s', '1z', '1z', '1z', '3m', '3m'],
  riichi: ['2m', '3m', '4m', '4p', '5p', '6p', '7s', '8s', '9s', '1z', '1z', '5p', '6p'],
};
const RIICHI_THROW = '9m';
const PAST = ['4z', '9s', '2p'];

const piecesOf = (codes: string[], base: number): Piece[] => codes.map((code, i) => ({ id: base + i, code })).sort(byKey);
const isSimple = (code: string) => code[1] !== 'z' && Number(code[0]) >= 2 && Number(code[0]) <= 8;

/**
 * Three beginner yaku on the same table, one at a time: tanyao (all simples), riichi (the sideways discard and the
 * stick) and yakuhai (dragons, the round wind or your wind).
 */
export function YakuBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const [mode, setMode] = useState<Mode>('tanyao');
  const [sub, setSub] = useState<Sub>('yes');
  const [hand, setHand] = useState<Piece[]>(() => piecesOf(SETS.tanyao, 0));
  const [extra, setExtra] = useState<Piece | null>(null);
  const [pond, setPond] = useState<string[]>([]);
  const [sideways, setSideways] = useState(false);
  const [stick, setStick] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const shown = useRef<Map<number, number>>(new Map());
  const motion = useRef<{ kind: 'tile' | 'stick'; from: { x: number; y: number }; to: { x: number; y: number }; start: number; dur: number } | null>(null);
  const alive = useRef(0);
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 });
  const lastFrame = useRef(0);

  const show = useCallback((next: Mode, which: Sub) => {
    alive.current += 1;
    motion.current = null;
    shown.current.clear();
    setMode(next);
    setSub(which);
    setBusy(false);
    setSideways(false);
    setStick(false);
    if (next === 'riichi') {
      setHand(piecesOf(SETS.riichi, 100));
      setExtra({ id: 199, code: RIICHI_THROW });
      setPond(PAST);
      setNote({ title: t('Riichi: mano cerrada a una ficha', 'Riichi: closed hand, one tile away', 'Riichi: mão fechada a uma peça'), body: t('Tu mano está cerrada (sin llamadas) y te falta una sola ficha: esperas 4p o 7p. Acabas de robar un 9 manzu que no sirve. Para declarar riichi, pulsa «Declarar riichi».', 'Your hand is closed (no calls) and one tile short: you wait on 4p or 7p. You just drew a 9 manzu that does not help. To declare riichi, press “Declare riichi”.', 'Sua mão está fechada (sem chamadas) e falta uma só peça: você espera 4p ou 7p. Acabou de comprar um 9 manzu que não serve. Para declarar riichi, toque em «Declarar riichi».') });
      return;
    }
    setExtra(null);
    setPond([]);
    if (next === 'tanyao') {
      setHand(piecesOf(which === 'no' ? SETS.notTanyao : SETS.tanyao, 0));
      setNote(which === 'no'
        ? { title: t('Con puntas u honores, no', 'With terminals or honors, no', 'Com pontas ou honras, não'), body: t('Un 1, un 9 o un honor (vientos y dragones) rompe el tanyao. Mira las fichas marcadas: sobran.', 'A 1, a 9 or an honor (winds and dragons) breaks tanyao. Look at the marked tiles: they spoil it.', 'Um 1, um 9 ou uma honra (ventos e dragões) quebra o tanyao. Veja as peças marcadas: elas estragam.') }
        : { title: t('Tanyao · todas simples', 'Tanyao · all simples', 'Tanyao · todas simples'), body: t('Toda la mano son fichas del 2 al 8: sin 1, sin 9 y sin honores. Es el yaku más fácil de ver: si no tienes puntas, ya lo tienes.', 'The whole hand is tiles from 2 to 8: no 1s, no 9s and no honors. It is the easiest yaku to spot: with no terminals, you already have it.', 'A mão toda são peças de 2 a 8: sem 1, sem 9 e sem honras. É o yaku mais fácil de ver: sem pontas, você já tem.') });
    } else {
      setHand(piecesOf(which === 'wind' ? SETS.wind : SETS.dragon, 0));
      setNote(which === 'wind'
        ? { title: t('Yakuhai · viento de la ronda o tuyo', 'Yakuhai · round wind or your wind', 'Yakuhai · vento da rodada ou seu'), body: t('Un trío del viento de la ronda (Este ahora) o de tu propio viento da yaku. Eres Este y la ronda es Este: este trío vale doble. Un viento que no es ninguno de los dos no cuenta.', 'A triplet of the round wind (East now) or of your own wind gives a yaku. You are East and the round is East: this triplet counts double. A wind that is neither does not count.', 'Um trio do vento da rodada (Leste agora) ou do seu vento dá yaku. Você é Leste e a rodada é Leste: este trio vale dobrado. Um vento que não é nenhum dos dois não conta.') }
        : { title: t('Yakuhai · dragones', 'Yakuhai · dragons', 'Yakuhai · dragões'), body: t('Un trío (o cuarteto) de cualquier dragón —blanco, verde o rojo— siempre da yaku, sin importar la ronda ni tu asiento.', 'A triplet (or quad) of any dragon —white, green or red— always gives a yaku, whatever the round or your seat.', 'Um trio (ou quarteto) de qualquer dragão —branco, verde ou vermelho— sempre dá yaku, seja qual for a rodada ou seu assento.') });
    }
  }, [language]);

  useEffect(() => { show('tanyao', 'yes'); return () => { alive.current += 1; }; }, [show]);

  const declare = async () => {
    if (busy || !extra) return;
    const run = ++alive.current;
    const live = () => alive.current === run;
    setBusy(true);
    setNote({ title: t('1 · Botas la ficha girada', '1 · You throw the tile sideways', '1 · Você descarta a peça de lado'), body: t('La ficha que botas al declarar riichi va acostada de lado: así todos ven que declaraste.', 'The tile you throw when declaring riichi lies on its side: that way everyone sees you declared.', 'A peça que você descarta ao declarar riichi fica deitada: assim todos veem que você declarou.') });
    const from = { x: shown.current.get(extra.id) ?? 50, y: HAND_Y };
    const to = pondPos(0, PAST.length);
    motion.current = { kind: 'tile', from, to: { x: to.x + 0.6, y: to.y }, start: performance.now(), dur: 900 };
    await sleep(950);
    if (!live()) return;
    setPond([...PAST, RIICHI_THROW]);
    setSideways(true);
    setExtra(null);
    motion.current = null;
    await sleep(2200);
    if (!live()) return;
    setNote({ title: t('2 · Pones el palito', '2 · You place the stick', '2 · Você coloca o palito'), body: t('Pones un palito de 1000 puntos al frente: es la apuesta del riichi.', 'You place a 1000-point stick in front of you: it is the riichi bet.', 'Você coloca um palito de 1000 pontos à sua frente: é a aposta do riichi.') });
    motion.current = { kind: 'stick', from: { x: 50, y: 90 }, to: { x: 50, y: 73.2 }, start: performance.now(), dur: 900 };
    await sleep(950);
    if (!live()) return;
    setStick(true);
    motion.current = null;
    await sleep(1800);
    if (!live()) return;
    setNote({ title: t('¡Riichi declarado!', 'Riichi declared!', 'Riichi declarado!'), body: t('Desde ahora tu mano queda cerrada y no la cambias: solo robas y botas lo que robas, hasta ganar. A cambio, riichi es yaku por sí mismo.', 'From now on your hand stays closed and you do not change it: you only draw and throw what you draw, until you win. In return, riichi is a yaku by itself.', 'A partir de agora sua mão fica fechada e você não a muda: só compra e descarta o que comprou, até ganhar. Em troca, riichi é yaku por si só.') });
    setBusy(false);
  };

  const total = hand.length + (extra ? 1 : 0);

  const draw = (g: Painter) => {
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    const cam = viewNow.current;
    const dt = Math.min(200, g.now - lastFrame.current);
    lastFrame.current = g.now;
    const ease = 1 - Math.exp(-dt / 420);
    cam.u += (HAND_VIEW.u - cam.u) * ease;
    cam.v += (HAND_VIEW.v - cam.v) * ease;
    cam.zoom += (HAND_VIEW.zoom - cam.zoom) * ease;
    if (Math.abs(HAND_VIEW.zoom - cam.zoom) + Math.abs(HAND_VIEW.v - cam.v) * 0.02 > 0.01) g.needsFrame = true;
    g.view = { ...cam };
    g.table();
    const { palette: p } = g;
    paintDealtTable(g, assignments.current);
    const face = (code: string) => picture(`${p.faces}/${code}.svg`);

    pond.forEach((code, slot) => {
      if (code === RIICHI_THROW && sideways) {
        const at = pondPos(0, slot);
        g.tile(at.x + 0.6, at.y, 90, FELT_Z, { flip: 1, face: face(code) });
        return;
      }
      const at = pondPos(0, slot);
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code) });
    });
    if (stick) drawStick(g, 50, 73.2, 0);

    const m = motion.current;
    if (m) {
      const k = Math.min(1, (performance.now() - m.start) / m.dur);
      const e = k * k * (3 - 2 * k);
      const x = m.from.x + (m.to.x - m.from.x) * e;
      const y = m.from.y + (m.to.y - m.from.y) * e;
      const hop = Math.sin(k * Math.PI) * 7;
      if (m.kind === 'tile') g.tile(x, y, 90 * e, FELT_Z + 1, { flip: 1, face: face(RIICHI_THROW), hop, order: 9e4 });
      else drawStick(g, x, y, hop);
      if (k < 1) g.needsFrame = true;
    }

    let moving = false;
    const slide = 1 - Math.exp(-dt / 150);
    const place = (piece: Piece, goalX: number) => {
      const cur = shown.current.get(piece.id) ?? goalX;
      const x = cur + (goalX - cur) * slide;
      if (Math.abs(goalX - x) > 0.03) moving = true;
      shown.current.set(piece.id, x);
      g.standTile(x, HAND_Y, 0, 90, { face: face(piece.code), joined: true, order: HAND_Y * 100 + 50 });
    };
    hand.forEach((piece, i) => place(piece, handX(i, total) - (extra ? WIDTH * 0.95 : 0)));
    if (extra) place(extra, handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9);
    if (moving) g.needsFrame = true;
    g.flush();

    const at = (piece: Piece) => shown.current.get(piece.id);
    if (mode === 'tanyao' && sub === 'no') {
      hand.forEach((piece) => {
        const x = at(piece);
        if (x === undefined || isSimple(piece.code)) return;
        const pos = g.project(x, HAND_Y, FELT_Z + 8);
        g.pill(pos.x, pos.y + 7, t('No simple', 'Not simple', 'Não simples'), { bg: TAG_LOOK.spare.bg, fg: TAG_LOOK.spare.fg, size: 10, border: TAG_LOOK.spare.fg });
      });
    } else {
      tagsOf(hand).forEach((tag) => {
        const a = at(hand[tag.from]);
        const b = at(hand[tag.to]);
        if (a === undefined || b === undefined) return;
        const isYaku = mode === 'yakuhai' && tag.kind === 'group' && (hand[tag.from].code === '6z' || hand[tag.from].code === '1z');
        const look = isYaku ? { bg: p.gold, fg: p.ink, name: { es: 'Yakuhai', en: 'Yakuhai', pt: 'Yakuhai' } } : mode === 'riichi' && tag.kind === 'spare' ? { bg: p.gold, fg: p.ink, name: { es: 'Espera', en: 'Wait', pt: 'Espera' } } : TAG_LOOK[tag.kind];
        const pos = g.project((a + b) / 2, HAND_Y, FELT_Z + 8);
        g.pill(pos.x, pos.y + 7, look.name[language], { bg: look.bg, fg: look.fg, size: 11, border: look.fg });
      });
    }
    if (mode === 'riichi' && extra) {
      const x = at(extra);
      if (x !== undefined) {
        const pos = g.project(x, HAND_Y, FELT_Z + 8);
        g.pill(pos.x, pos.y + 7, t('Robada: sobra', 'Drawn: spare', 'Comprada: sobra'), { bg: TAG_LOOK.spare.bg, fg: TAG_LOOK.spare.fg, size: 11, border: TAG_LOOK.spare.fg });
      }
    }
  };

  const modes: Array<{ id: Mode; sub: Sub; label: string }> = [
    { id: 'tanyao', sub: 'yes', label: t('Tanyao', 'Tanyao', 'Tanyao') },
    { id: 'riichi', sub: 'yes', label: t('Riichi', 'Riichi', 'Riichi') },
    { id: 'yakuhai', sub: 'dragon', label: t('Yakuhai', 'Yakuhai', 'Yakuhai') },
  ];
  const subs: Array<{ id: Sub; label: string }> = mode === 'tanyao'
    ? [{ id: 'yes', label: t('Sí es tanyao', 'It is tanyao', 'É tanyao') }, { id: 'no', label: t('No lo es', 'It is not', 'Não é') }]
    : mode === 'yakuhai'
      ? [{ id: 'dragon', label: t('Dragones', 'Dragons', 'Dragões') }, { id: 'wind', label: t('Vientos', 'Winds', 'Ventos') }]
      : [];
  return (
    <div className="sort-stage deck-stage">
      <div className="sort-board deck-board is-table is-hand is-draw is-yaku">
        <IsoCanvas ref={scene} draw={draw} />
        <div className="sort-actions deck-actions yaku-actions">
          <div className="yaku-tabs" role="tablist">
            {modes.map((item) => <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} className={`sort-button${mode === item.id ? ' is-primary' : ''}`} onClick={() => show(item.id, item.sub)}>{item.label}</button>)}
          </div>
          {subs.length > 0 && (
            <div className="yaku-tabs">
              {subs.map((item) => <button key={item.id} type="button" className={`sort-button${sub === item.id ? ' is-on' : ''}`} onClick={() => show(mode, item.id)}>{item.label}</button>)}
            </div>
          )}
          {mode === 'riichi' && (
            <button type="button" className="sort-button is-primary" onClick={() => { if (stick) show('riichi', 'yes'); else void declare(); }} disabled={busy}>
              {stick ? t('Repetir', 'Again', 'Repetir') : t('Declarar riichi', 'Declare riichi', 'Declarar riichi')}
            </button>
          )}
        </div>
        <p className="sort-win is-top is-note" role="status">
          <b>{note?.title}</b>
          <span>{note?.body}</span>
        </p>
      </div>
    </div>
  );
}

/** The 1000-point riichi stick lying on the felt. */
function drawStick(g: Painter, x: number, y: number, hop: number) {
  const { palette: p } = g;
  g.add(y * 100 + 70, () => {
    const box = g.box(x, y, FELT_Z + hop, 13, 1.5, 1.2, 0);
    box.sides.forEach((face) => g.poly(face.q, '#e9e2d0', p.ink, g.lw));
    g.poly(box.top, '#fbf7ec', p.ink, g.lw * 1.2);
    g.onQuad(box.top, () => {
      g.ctx.fillStyle = '#d6322b';
      g.ctx.beginPath();
      g.ctx.ellipse(0.5, 0.5, 0.05, 0.3, 0, 0, Math.PI * 2);
      g.ctx.fill();
    });
  });
}
