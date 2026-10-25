import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { tilePath } from './SortBoard';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { dealAssignments } from './DealBoard';
import { HAND_VIEW, WIDE_VIEW, HAND_Y, TAG_LOOK, WIDTH, byKey, handX, pondPos, sleep, tagsOf, type Piece } from './DrawBoard';
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
  const [shout, setShout] = useState(false);
  const [focus, setFocus] = useState<'hand' | 'wide' | 'compass' | 'plate'>('hand');
  const [windTags, setWindTags] = useState<'none' | 'seats' | 'plate'>('none');
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const shown = useRef<Map<number, number>>(new Map());
  const motion = useRef<{ kind: 'tile' | 'stick'; from: { x: number; y: number }; to: { x: number; y: number }; start: number; dur: number } | null>(null);
  const alive = useRef(0);
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 });
  const lastFrame = useRef(0);

  const tour = async () => {
    const run = ++alive.current;
    const live = () => alive.current === run;
    const wait = async (ms: number) => { await sleep(ms); return live(); };
    const said = (title: string, body: string) => setNote({ title, body });
    setFocus('wide');
    said(t('Yakuhai: ¿cuál es tu viento y cuál el de la ronda?', 'Yakuhai: which is your wind and which is the round’s?', 'Yakuhai: qual é o seu vento e qual o da rodada?'), t('Un trío de dragones siempre da yaku. Los vientos solo cuentan si son el viento de la ronda o el tuyo. Veamos dónde se ven en la mesa.', 'A triplet of dragons always gives a yaku. Winds only count if they are the round wind or yours. Let us see where they show on the table.', 'Um trio de dragões sempre dá yaku. Os ventos só contam se forem o vento da rodada ou o seu. Vamos ver onde aparecem na mesa.'));
    if (!(await wait(4800))) return;
    setFocus('compass');
    setWindTags('seats');
    said(t('Este es tu viento', 'This is your wind', 'Este é o seu vento'), t('En el compass, el viento que queda frente a ti es tu viento de asiento. Eres el dealer, así que eres Este (東). Los demás, en orden, son Sur, Oeste y Norte. Tu viento cambia si cambia el dealer.', 'On the compass, the wind facing you is your seat wind. You are the dealer, so you are East (東). The others, in order, are South, West and North. Your wind changes when the dealer changes.', 'No compass, o vento voltado para você é o seu vento de assento. Você é o dealer, então é Leste (東). Os outros, em ordem, são Sul, Oeste e Norte. Seu vento muda quando o dealer muda.'));
    if (!(await wait(8000))) return;
    setFocus('plate');
    setWindTags('plate');
    said(t('Este es el viento de la ronda', 'This is the round wind', 'Este é o vento da rodada'), t('La placa en el borde de la mesa marca el viento de la ronda: ahora Este (東). Es el mismo para los cuatro y solo cambia cuando la partida avanza a la ronda del Sur.', 'The plate at the edge of the table marks the round wind: now East (東). It is the same for all four and only changes when the game moves on to the South round.', 'A placa na borda da mesa marca o vento da rodada: agora Leste (東). É o mesmo para os quatro e só muda quando a partida avança para a rodada do Sul.'));
    if (!(await wait(8000))) return;
    setFocus('hand');
    setWindTags('none');
    said(t('Un trío de Este vale doble', 'An East triplet counts double', 'Um trio de Leste vale dobrado'), t('Eres Este y la ronda es Este: un trío de Este (東) te da 2 yaku. Un trío de Sur, Oeste o Norte no da ninguno.', 'You are East and the round is East: a triplet of East (東) gives you 2 yaku. A triplet of South, West or North gives none.', 'Você é Leste e a rodada é Leste: um trio de Leste (東) dá 2 yaku. Um trio de Sul, Oeste ou Norte não dá nenhum.'));
  };

  const show = useCallback((next: Mode, which: Sub) => {
    alive.current += 1;
    motion.current = null;
    shown.current.clear();
    setMode(next);
    setSub(which);
    setBusy(false);
    setShout(false);
    setSideways(false);
    setStick(false);
    setFocus('hand');
    setWindTags('none');
    if (next === 'yakuhai') {
      setHand(piecesOf(SETS.wind, 300));
      setExtra(null);
      setPond([]);
      void tour();
      return;
    }
    if (next === 'riichi') {
      setHand(piecesOf(SETS.riichi, 100));
      const drawn = { id: 199, code: RIICHI_THROW };
      setExtra(drawn);
      void declare(drawn);
      setPond(PAST);
      setNote({ title: t('Riichi: mano cerrada a una ficha', 'Riichi: closed hand, one tile away', 'Riichi: mão fechada a uma peça'), body: t('Tu mano está cerrada (sin llamadas) y te falta una sola ficha: esperas 4p o 7p. Acabas de robar un 9 manzu que no sirve. Veamos cómo se declara riichi.', 'Your hand is closed (no calls) and one tile short: you wait on 4p or 7p. You just drew a 9 manzu that does not help. Let us see how riichi is declared.', 'Sua mão está fechada (sem chamadas) e falta uma só peça: você espera 4p ou 7p. Acabou de comprar um 9 manzu que não serve. Vamos ver como se declara riichi.') });
      return;
    }
    setExtra(null);
    setPond([]);
    setNote(null);
  }, [language]);

  useEffect(() => { show('tanyao', 'yes'); return () => { alive.current += 1; }; }, [show]);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('yaku-controls')); }, []);

  const declare = async (piece: Piece) => {
    const run = ++alive.current;
    const live = () => alive.current === run;
    setBusy(true);
    await sleep(3800);
    if (!live()) return;
    setShout(true);
    setNote({ title: t('¡Riichi!', 'Riichi!', 'Riichi!'), body: t('Antes de nada, lo dices en voz alta: «Riichi». Estás declarando que tu mano está a una ficha de ganar.', 'First, you say it out loud: “Riichi”. You are announcing that your hand is one tile from winning.', 'Antes de tudo, você diz em voz alta: «Riichi». Está anunciando que sua mão está a uma peça de ganhar.') });
    await sleep(3200);
    if (!live()) return;
    setShout(false);
    setNote({ title: t('1 · Botas la ficha girada', '1 · You throw the tile sideways', '1 · Você descarta a peça de lado'), body: t('La ficha que botas al declarar riichi va acostada de lado: así todos ven que declaraste.', 'The tile you throw when declaring riichi lies on its side: that way everyone sees you declared.', 'A peça que você descarta ao declarar riichi fica deitada: assim todos veem que você declarou.') });
    const from = { x: shown.current.get(piece.id) ?? 50, y: HAND_Y };
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
    setNote({ title: t('2 · Pones el palito', '2 · You place the stick', '2 · Você coloca o palito'), body: t('Pones un palito de 1000 puntos sobre el compass, frente a ti: es la apuesta del riichi.', 'You place a 1000-point stick on the compass in front of you: it is the riichi bet.', 'Você coloca um palito de 1000 pontos sobre o compass à sua frente: é a aposta do riichi.') });
    motion.current = { kind: 'stick', from: { x: 50, y: 88 }, to: { x: 50, y: 60.6 }, start: performance.now(), dur: 900 };
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
    const target = focus === 'hand' ? HAND_VIEW : focus === 'wide' ? WIDE_VIEW : focus === 'compass' ? { u: 50, v: 52, zoom: 2.7 } : { u: 82, v: 84, zoom: 3 };
    cam.u += (target.u - cam.u) * ease;
    cam.v += (target.v - cam.v) * ease;
    cam.zoom += (target.zoom - cam.zoom) * ease;
    if (Math.abs(target.zoom - cam.zoom) + Math.abs(target.v - cam.v) * 0.02 + Math.abs(target.u - cam.u) * 0.02 > 0.01) g.needsFrame = true;
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
    if (stick) drawStick(g, 50, 60.6, 2.5);

    const m = motion.current;
    if (m) {
      const k = Math.min(1, (performance.now() - m.start) / m.dur);
      const e = k * k * (3 - 2 * k);
      const x = m.from.x + (m.to.x - m.from.x) * e;
      const y = m.from.y + (m.to.y - m.from.y) * e;
      const hop = Math.sin(k * Math.PI) * 7;
      if (m.kind === 'tile') g.tile(x, y, 90 * e, FELT_Z + 1, { flip: 1, face: face(RIICHI_THROW), hop, order: 9e4 });
      else drawStick(g, x, y, 2.5 + hop);
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
    if (mode === 'riichi') tagsOf(hand).forEach((tag) => {
      const a = at(hand[tag.from]);
      const b = at(hand[tag.to]);
      if (a === undefined || b === undefined) return;
      const look = tag.kind === 'spare' ? { bg: p.gold, fg: p.ink, name: { es: 'Espera', en: 'Wait', pt: 'Espera' } } : TAG_LOOK[tag.kind];
      const pos = g.project((a + b) / 2, HAND_Y, FELT_Z + 8);
      g.pill(pos.x, pos.y + 7, look.name[language], { bg: look.bg, fg: look.fg, size: 11, border: look.fg });
    });
    if (windTags === 'seats') {
      const seats = [{ x: 50, y: 58.6, name: t('Tu viento: Este 東', 'Your wind: East 東', 'Seu vento: Leste 東'), me: true }, { x: 60.6, y: 50, name: t('Sur 南', 'South 南', 'Sul 南'), me: false }, { x: 50, y: 41.4, name: t('Oeste 西', 'West 西', 'Oeste 西'), me: false }, { x: 39.4, y: 50, name: t('Norte 北', 'North 北', 'Norte 北'), me: false }];
      seats.forEach((seat) => {
        const pos = g.project(seat.x, seat.y, FELT_Z + 7);
        g.pill(pos.x, pos.y, seat.name, { bg: seat.me ? p.gold : '#ffffffdd', fg: p.ink, size: seat.me ? 14 : 10, border: p.ink });
      });
      g.needsFrame = true;
    }
    if (windTags === 'plate') {
      const pos = g.project(89, 79.5, FELT_Z + 2);
      g.pill(pos.x, pos.y, t('Viento de la ronda: Este 東', 'Round wind: East 東', 'Vento da rodada: Leste 東'), { bg: p.gold, fg: p.ink, size: 14, border: p.ink });
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
  const subs: Array<{ id: Sub; label: string }> = [];
  const controls = (
    <div className="yaku-controls-inner">
      <div className="yaku-tabs" role="tablist">
        {modes.map((item) => <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} className={`sort-button${mode === item.id ? ' is-primary' : ''}`} onClick={() => show(item.id, item.sub)}>{item.label}</button>)}
      </div>
      {subs.length > 0 && (
        <div className="yaku-tabs">
          {subs.map((item) => <button key={item.id} type="button" className={`sort-button${sub === item.id ? ' is-on' : ''}`} onClick={() => show(mode, item.id)}>{item.label}</button>)}
        </div>
      )}
      <a className="sort-button" href="../aprender/yaku-reference.html" target="_blank" rel="noopener">{t('Aprender los otros yaku ↗', 'Learn the other yaku ↗', 'Aprender os outros yaku ↗')}</a>
    </div>
  );
  return (
    <div className="sort-stage deck-stage">
      {slot && createPortal(controls, slot)}
      {mode === 'riichi' || mode === 'yakuhai' ? (
        <div className="sort-board deck-board is-table is-hand is-draw is-yaku">
          <IsoCanvas ref={scene} draw={draw} />
          <div className="sort-actions deck-actions">
            <button type="button" className="sort-button" onClick={() => show(mode, 'yes')}>↻ {t('Reiniciar animación', 'Restart animation', 'Reiniciar animação')}</button>
          </div>
          {shout && (
            <div className="win-shout" role="status">
              <span className="win-cat" aria-hidden="true">🐱</span>
              <b>RIICHI!</b>
            </div>
          )}
          <p className="sort-win is-top is-note" role="status">
            <b>{note?.title}</b>
            <span>{note?.body}</span>
          </p>
        </div>
      ) : (
        <div className="sort-board deck-board yaku-static"><TanyaoCard t={t} /></div>
      )}
    </div>
  );
}

const Tile = ({ code, tone }: { code: string; tone?: 'ok' | 'no' }) => <img className={`yk-tile${tone ? ` is-${tone}` : ''}`} src={tilePath(code)} alt={code} draggable={false} />;
const range = (suit: string, from = 1, to = 9) => Array.from({ length: to - from + 1 }, (_, i) => `${from + i}${suit}`);

/** Tanyao as one picture: the tiles that count, the ones that spoil it, and an example hand. */
function TanyaoCard({ t }: { t: (es: string, en: string, pt: string) => string }) {
  return (
    <div className="yk-card">
      <h3>{t('Tanyao · todas simples', 'Tanyao · all simples', 'Tanyao · todas simples')}</h3>
      <p className="yk-lead">{t('Toda tu mano debe ser fichas del 2 al 8. Si hay un 1, un 9 o un honor, no es tanyao.', 'Your whole hand must be tiles from 2 to 8. With a 1, a 9 or an honor it is not tanyao.', 'Toda a sua mão deve ser peças de 2 a 8. Com um 1, um 9 ou uma honra não é tanyao.')}</p>
      <div className="yk-rows">
        {['m', 'p', 's'].map((suit) => (
          <div key={suit} className="yk-row">{range(suit).map((code) => <Tile key={code} code={code} tone={isSimple(code) ? 'ok' : 'no'} />)}</div>
        ))}
        <div className="yk-row">{range('z', 1, 7).map((code) => <Tile key={code} code={code} tone="no" />)}<span className="yk-note">{t('Honores: no cuentan', 'Honors: do not count', 'Honras: não contam')}</span></div>
      </div>
      <div className="yk-legend"><span className="is-ok">{t('✔ Simples (2 a 8)', '✔ Simples (2 to 8)', '✔ Simples (2 a 8)')}</span><span className="is-no">{t('✘ Puntas (1, 9) y honores', '✘ Terminals (1, 9) and honors', '✘ Pontas (1, 9) e honras')}</span></div>
      <p className="yk-sub">{t('Ejemplo de mano tanyao', 'Example tanyao hand', 'Exemplo de mão tanyao')}</p>
      <div className="yk-row is-hand">{SETS.tanyao.map((code, i) => <Tile key={i} code={code} />)}</div>
    </div>
  );
}

/** The 1000-point riichi stick, lying in the compass slot. */
function drawStick(g: Painter, x: number, y: number, lift: number) {
  const { palette: p } = g;
  g.add(y * 100 + 70, () => {
    const box = g.box(x, y, FELT_Z + lift, 9.6, 1.4, 1.1, 0);
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
