import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { FIRST_DEAD, around, dealAssignments, drawOrder, gAt, handSlot } from './DealBoard';
import { DEALT, HAND_VIEW, HAND_Y, WIDE_VIEW, WIDTH, byKey, handX, pondPos, sleep, wallPos, type Fly, type Piece } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

type Call = 'chii' | 'pon' | 'kan';

/** Seats counter-clockwise: you (0), the player on your right (1), across (2) and on your left (3). */
type Scene = { from: number; tile: string; own: string[]; hand: string[]; spare: string; skipped: number[]; shout: string };
const SCENES: Record<Call, Scene> = {
  chii: { from: 3, tile: '5p', own: ['4p', '6p'], hand: ['1m', '2m', '3m', '4p', '6p', '7s', '8s', '9s', '1z', '1z', '2s', '3s', '5m'], spare: '5m', skipped: [], shout: 'CHII' },
  pon: { from: 2, tile: '6z', own: ['6z', '6z'], hand: ['1m', '2m', '3m', '4p', '5p', '6p', '7s', '8s', '9s', '6z', '6z', '2s', '5m'], spare: '5m', skipped: [3], shout: 'PON' },
  kan: { from: 1, tile: '3s', own: ['3s', '3s', '3s'], hand: ['1m', '2m', '3m', '4p', '5p', '6p', '3s', '3s', '3s', '7s', '8s', '1z', '1z'], spare: '8s', skipped: [2, 3], shout: 'KAN' },
};
const SEATS = {
  es: ['Tú', 'Derecha', 'Enfrente', 'Izquierda'],
  en: ['You', 'Right', 'Across', 'Left'],
  pt: ['Você', 'Direita', 'Em frente', 'Esquerda'],
};
const PRE_TAKEN = 8;
const PRE_PONDS = [['9s', '2p'], ['4z', '8m'], ['3z', '7p']];

const piecesOf = (codes: string[]): Piece[] => codes.map((code, i) => ({ id: 500 + i, code })).sort(byKey);

/** Where the tiles of an open meld lie: to the right of your hand, the called one turned toward who threw it. */
function meldSpots(count: number, sidewaysAt: number) {
  const widths = Array.from({ length: count }, (_, i) => (i === sidewaysAt ? 4.8 : 3.6));
  let x = 97 - widths.reduce((a, b) => a + b, 0);
  return widths.map((w, i) => { const spot = { x: x + w / 2, rot: i === sidewaysAt ? 90 : 0 }; x += w; return spot; });
}

/**
 * Calls on the table: chii, pon and kan, one at a time. A rival throws, you take the tile, the meld lies turned toward
 * who threw it, turn order jumps and your hand turns from closed to open.
 */
export function CallsBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const order = useRef(drawOrder());
  const [call, setCall] = useState<Call>('chii');
  const [hand, setHand] = useState<Piece[]>(() => piecesOf(SCENES.chii.hand));
  const [taken, setTaken] = useState<Set<number>>(() => new Set(order.current.slice(DEALT, DEALT + PRE_TAKEN)));
  const [myPond, setMyPond] = useState<string[]>([]);
  const [ponds, setPonds] = useState<string[][]>(PRE_PONDS);
  const [meld, setMeld] = useState<{ codes: string[]; at: number } | null>(null);
  const [turn, setTurn] = useState<number | null>(null);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [hot, setHot] = useState<{ player: number; slot: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'hand' | 'wide'>('wide');
  const [shout, setShout] = useState<string | null>(null);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const flights = useRef<Fly[]>([]);
  const shown = useRef<Map<number, number>>(new Map());
  const alive = useRef(0);
  const viewNow = useRef({ u: 50, v: 49, zoom: 0.86 });
  const lastFrame = useRef(0);

  const fly = useCallback((entry: Omit<Fly, 'start'>) => {
    flights.current = [...flights.current.filter((f) => f.key !== entry.key), { ...entry, start: performance.now() }];
    scene.current?.invalidate();
    window.setTimeout(() => { flights.current = flights.current.filter((f) => f.key !== entry.key); scene.current?.invalidate(); }, entry.dur + 50);
  }, []);

  const play = useCallback(async (which: Call) => {
    const run = ++alive.current;
    const live = () => alive.current === run;
    const wait = async (ms: number) => { await sleep(ms); return live(); };
    const sc = SCENES[which];
    const said = (title: string, body: string) => setNote({ title, body });
    flights.current = [];
    shown.current.clear();
    setCall(which);
    const mine = piecesOf(sc.hand);
    setHand(mine);
    setTaken(new Set(order.current.slice(DEALT, DEALT + PRE_TAKEN)));
    setMyPond([]);
    setPonds(PRE_PONDS.map((list) => [...list]));
    setMeld(null);
    setSkipped([]);
    setHot(null);
    setOpen(false);
    setShout(null);
    setView('wide');
    setTurn(null);

    const intro = {
      chii: [t('Chii · una secuencia con la ficha de tu izquierda', 'Chii · a sequence with the tile from your left', 'Chii · uma sequência com a peça da sua esquerda'), t('Además de robar del muro, puedes tomar la ficha que acaba de botar un rival: eso se llama llamada. Con chii solo puedes tomar la del jugador que juega justo antes que tú (tu izquierda), y solo para armar una secuencia con dos fichas tuyas.', 'Besides drawing from the wall, you may take the tile a rival has just thrown: that is called a call. With chii you can only take the one from the player who plays right before you (your left), and only to make a sequence with two of your tiles.', 'Além de comprar do muro, você pode pegar a peça que um rival acabou de descartar: isso se chama chamada. Com chii só pode pegar a do jogador que joga logo antes de você (sua esquerda), e só para formar uma sequência com duas das suas peças.')],
      pon: [t('Pon · un trío con el descarte de cualquiera', 'Pon · a triplet with anyone’s discard', 'Pon · um trio com o descarte de qualquer um'), t('Con dos fichas iguales en la mano puedes tomar la tercera que bote cualquier jugador, no solo el de tu izquierda, y formar un trío.', 'With two identical tiles in hand you can take the third one thrown by any player, not only the one on your left, and make a triplet.', 'Com duas peças iguais na mão você pode pegar a terceira descartada por qualquer jogador, não só o da esquerda, e formar um trio.')],
      kan: [t('Kan · un cuarteto', 'Kan · a quad', 'Kan · um quarteto'), t('Con tres fichas iguales en la mano puedes tomar la cuarta que bote cualquier rival y formar un cuarteto. Es poco frecuente y da bonus.', 'With three identical tiles in hand you can take the fourth one any rival throws and make a quad. It is uncommon and gives a bonus.', 'Com três peças iguais na mão você pode pegar a quarta que qualquer rival descartar e formar um quarteto. É pouco frequente e dá bônus.')],
    }[which];
    said(intro[0], intro[1]);
    setTurn(sc.from === 3 ? 2 : sc.from - 1);
    if (!(await wait(5500))) return;

    // the rival throws
    const names = SEATS[language];
    setTurn(sc.from);
    const slot = handSlot(sc.from, 13, true);
    const to = pondPos(sc.from, PRE_PONDS[sc.from - 1].length);
    said(t(`${names[sc.from]} bota`, `${names[sc.from]} throws`, `${names[sc.from]} descarta`), {
      chii: t('Tu izquierda bota un 5 pinzu. Tú tienes un 4 y un 6 pinzu: con ese 5 formarías 4-5-6.', 'Your left throws a 5 pinzu. You hold a 4 and a 6 pinzu: with that 5 you would make 4-5-6.', 'Sua esquerda descarta um 5 pinzu. Você tem um 4 e um 6 pinzu: com esse 5 formaria 4-5-6.'),
      pon: t('El jugador de enfrente bota un Chun (中). Tú tienes dos Chun: con ese serían un trío.', 'The player across throws a Chun (中). You hold two Chun: with that it would be a triplet.', 'O jogador à frente descarta um Chun (中). Você tem dois Chun: com esse seria um trio.'),
      kan: t('Tu derecha bota un 3 souzu. Tú tienes tres 3 souzu: con ese serían cuatro.', 'Your right throws a 3 souzu. You hold three 3 souzu: with that it would be four.', 'Sua direita descarta um 3 souzu. Você tem três 3 souzu: com esse seriam quatro.'),
    }[which]);
    fly({ key: 'throw', code: sc.tile, from: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, to, dur: 800, faceUp: true });
    if (!(await wait(850))) return;
    setPonds((now) => now.map((list, k) => (k === sc.from - 1 ? [...list, sc.tile] : list)));
    setHot({ player: sc.from, slot: PRE_PONDS[sc.from - 1].length });
    if (!(await wait(3500))) return;

    // the call
    setShout(sc.shout);
    setHot(null);
    if (sc.skipped.length > 0) setSkipped(sc.skipped);
    setTurn(0);
    said(t(`¡${sc.shout}!`, `${sc.shout}!`, `${sc.shout}!`), which === 'chii'
      ? t('Dices «Chii» antes de que juegue el siguiente. El turno es tuyo.', 'You say “Chii” before the next one plays. The turn is yours.', 'Você diz «Chii» antes de o próximo jogar. A vez é sua.')
      : t(`Dices «${sc.shout[0]}${sc.shout.slice(1).toLowerCase()}»: el turno salta a ti y ${sc.skipped.length === 1 ? 'el jugador de tu izquierda pierde' : 'los jugadores de enfrente y de tu izquierda pierden'} su turno.`, `You say “${sc.shout[0]}${sc.shout.slice(1).toLowerCase()}”: the turn jumps to you and ${sc.skipped.length === 1 ? 'the player on your left loses' : 'the players across and on your left lose'} their turn.`, `Você diz «${sc.shout[0]}${sc.shout.slice(1).toLowerCase()}»: a vez pula para você e ${sc.skipped.length === 1 ? 'o jogador da sua esquerda perde' : 'os jogadores à frente e à esquerda perdem'} a vez.`));
    if (!(await wait(3200))) return;

    // the meld forms, the called tile turned toward who threw it
    const sidewaysAt = sc.from === 3 ? 0 : sc.from === 2 ? 1 : (sc.own.length + 1) - 1;
    const codes = which === 'chii' ? ['4p', '5p', '6p'] : which === 'pon' ? ['6z', '6z', '6z'] : ['3s', '3s', '3s', '3s'];
    const spots = meldSpots(codes.length, sidewaysAt);
    const ownLeft = [...sc.own];
    const gone: Piece[] = [];
    mine.forEach((piece) => { const k = ownLeft.indexOf(piece.code); if (k >= 0) { ownLeft.splice(k, 1); gone.push(piece); } });
    const from = ponds;
    void from;
    const callSpot = spots[sidewaysAt];
    const owns = spots.filter((_, i) => i !== sidewaysAt);
    setPonds((now) => now.map((list, k) => (k === sc.from - 1 ? list.slice(0, -1) : list)));
    fly({ key: 'called', code: sc.tile, from: { ...pondPos(sc.from, PRE_PONDS[sc.from - 1].length), z: FELT_Z }, to: { x: callSpot.x, y: 95.4, z: FELT_Z, rot: callSpot.rot }, dur: 1200, faceUp: true });
    gone.forEach((piece, i) => {
      fly({ key: `own-${piece.id}`, code: piece.code, from: { x: shown.current.get(piece.id) ?? 50, y: HAND_Y, z: FELT_Z + 2, rot: 0 }, to: { x: owns[i].x, y: 95.4, z: FELT_Z, rot: 0 }, dur: 1200, faceUp: true });
    });
    setHand((now) => now.filter((piece) => !gone.some((g) => g.id === piece.id)));
    setView('hand');
    said(which === 'chii' ? t('La ficha ajena va girada', 'The borrowed tile lies turned', 'A peça emprestada fica girada') : which === 'pon' ? t('Pon: la ficha va hacia quien la botó', 'Pon: the tile points to who threw it', 'Pon: a peça aponta para quem descartou') : t('Kan: cuatro fichas, una girada', 'Kan: four tiles, one turned', 'Kan: quatro peças, uma girada'), {
      chii: t('Pones las tres fichas boca arriba a un lado de tu mano. La ficha tomada va girada hacia donde está quien la botó: aquí, a la izquierda. Esta vez no robas del muro: la ficha tomada reemplaza tu robo.', 'You lay the three tiles face up beside your hand. The taken tile lies turned toward whoever threw it: here, to the left. This time you do not draw from the wall: the taken tile replaces your draw.', 'Você coloca as três peças viradas para cima ao lado da mão. A peça pega fica girada para onde está quem descartou: aqui, à esquerda. Desta vez não compra do muro: a peça pega substitui sua compra.'),
      pon: t('La ficha tomada va girada hacia quien la botó: aquí, al centro, porque fue el de enfrente. Las otras dos salen de tu mano. Tampoco robas esta vez.', 'The taken tile lies turned toward whoever threw it: here, in the middle, because it was the player across. The other two come from your hand. You do not draw this time either.', 'A peça pega fica girada para quem descartou: aqui, no meio, porque foi o da frente. As outras duas saem da sua mão. Também não compra desta vez.'),
      kan: t('La ficha tomada va girada hacia quien la botó: aquí, a la derecha. Como el kan agrega una ficha extra, robas una de reemplazo del muro muerto, se revela otro dora, y luego botas.', 'The taken tile lies turned toward whoever threw it: here, to the right. Since a kan adds an extra tile, you draw a replacement from the dead wall, another dora is revealed, and then you throw.', 'A peça pega fica girada para quem descartou: aqui, à direita. Como o kan acrescenta uma peça extra, você compra uma de reposição do muro morto, outro dora é revelado e depois você descarta.'),
    }[which]);
    if (!(await wait(1300))) return;
    setMeld({ codes, at: sidewaysAt });
    setShout(null);
    if (!(await wait(3800))) return;

    // closed becomes open
    setOpen(true);
    said(t('Tu mano ahora está abierta', 'Your hand is now open', 'Sua mão agora está aberta'), t('Al hacer una llamada tu mano deja de ser cerrada y pasa a ser abierta: ya no puedes declarar riichi y algunos yaku valen menos o no cuentan. A cambio, avanzas más rápido.', 'Making a call turns your hand from closed to open: you can no longer declare riichi and some yaku are worth less or do not count. In return, you move faster.', 'Ao fazer uma chamada sua mão deixa de ser fechada e passa a ser aberta: você não pode mais declarar riichi e alguns yaku valem menos ou não contam. Em troca, avança mais rápido.'));
    if (!(await wait(5500))) return;

    // you throw and the turn goes on to your right
    if (which === 'kan') {
      const dead = gAt(FIRST_DEAD + 5);
      const tile = dead.side * 34 + dead.stack;
      const goal = handX(hand.length - 1, mine.length - gone.length + 1);
      fly({ key: 'dead', from: wallPos(tile), to: { x: goal, y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1200, faceUp: false });
      said(t('Robas del muro muerto', 'You draw from the dead wall', 'Você compra do muro morto'), t('Un kan agrega una ficha, así que robas una de reemplazo del muro muerto y se revela un nuevo dora.', 'A kan adds a tile, so you draw a replacement from the dead wall and a new dora is revealed.', 'Um kan acrescenta uma peça, então você compra uma de reposição do muro morto e um novo dora é revelado.'));
      if (!(await wait(3800))) return;
    }
    const spare = mine.find((piece) => piece.code === sc.spare && !gone.includes(piece))!;
    fly({ key: 'toss', code: spare.code, from: { x: shown.current.get(spare.id) ?? 50, y: HAND_Y, z: FELT_Z + 1, rot: 0 }, to: pondPos(0, 0), dur: 800, faceUp: true });
    setHand((now) => now.filter((piece) => piece.id !== spare.id));
    setTurn(1);
    said(t('Botas y sigue el juego', 'You throw and play goes on', 'Você descarta e o jogo segue'), t('Botas una ficha y el turno pasa al jugador de tu derecha, como siempre. Ya tienes una llamada hecha.', 'You throw a tile and the turn passes to the player on your right, as usual. You have made a call.', 'Você descarta uma peça e a vez passa ao jogador da sua direita, como sempre. Você fez uma chamada.'));
    if (!(await wait(900))) return;
    setMyPond([spare.code]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, fly]);

  useEffect(() => { void play('chii'); return () => { alive.current += 1; }; }, [play]);

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
    paintDealtTable(g, assignments.current, { taken });
    const face = (code: string) => picture(`${p.faces}/${code}.svg`);

    myPond.forEach((code, slot) => { const at = pondPos(0, slot); g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code) }); });
    ponds.forEach((list, i) => list.forEach((code, slot) => {
      const at = pondPos(i + 1, slot);
      const glow = hot?.player === i + 1 && hot.slot === slot;
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code), gold: glow, hop: glow ? 1 + Math.sin(g.now / 160) * 0.8 : 0 });
    }));
    if (hot) g.needsFrame = true;
    if (meld) {
      const spots = meldSpots(meld.codes.length, meld.at);
      meld.codes.forEach((code, i) => g.tile(spots[i].x, 95.4, spots[i].rot, FELT_Z, { flip: 1, face: face(code) }));
    }
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
    const shift = meld ? -WIDTH * (meld.codes.length + 0.6) / 2 : 0;
    hand.forEach((piece, i) => {
      const goal = handX(i, hand.length) + shift;
      const cur = shown.current.get(piece.id) ?? goal;
      const x = cur + (goal - cur) * slide;
      if (Math.abs(goal - x) > 0.03) moving = true;
      shown.current.set(piece.id, x);
      g.standTile(x, HAND_Y, 0, 90, { face: face(piece.code), joined: true, order: HAND_Y * 100 + 50 });
    });
    if (moving) g.needsFrame = true;
    g.flush();

    // who plays: a pill at every seat, the one on turn in gold
    const names = SEATS[language];
    for (let seat = 0; seat < 4; seat += 1) {
      const at = around({ x: 50, y: seat === 0 ? 80.5 : 79 }, seat);
      const pos = g.project(at.x, at.y, FELT_Z + 4);
      const on = turn === seat;
      const out = skipped.includes(seat);
      g.pill(pos.x, pos.y, `${on ? '▶ ' : ''}${names[seat]}${out ? ` · ${t('pierde turno', 'loses turn', 'perde a vez')}` : ''}`, { bg: on ? p.gold : out ? '#fbd0cf' : '#ffffffcc', fg: out ? '#8a1f2a' : p.ink, size: 10, border: p.ink });
    }
    const spots = hand.length > 0 ? shown.current.get(hand[hand.length - 1].id) : undefined;
    if (view === 'hand' && spots !== undefined) {
      const pos = g.project(handX(0, hand.length) + shift - 2, HAND_Y, FELT_Z + 12);
      g.pill(pos.x, pos.y - 10, open ? t('Mano abierta', 'Open hand', 'Mão aberta') : t('Mano cerrada', 'Closed hand', 'Mão fechada'), { bg: open ? '#ffd9b5' : '#cdeedd', fg: open ? '#8a4300' : '#14683f', size: 12, border: open ? '#8a4300' : '#14683f' });
    }
  };

  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('calls-controls')); }, []);
  const tabs: Array<{ id: Call; label: string }> = [{ id: 'chii', label: 'Chii' }, { id: 'pon', label: 'Pon' }, { id: 'kan', label: 'Kan' }];
  const controls = (
    <div className="yaku-controls-inner">
          <div className="yaku-tabs" role="tablist">
            {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={call === item.id} className={`sort-button${call === item.id ? ' is-primary' : ''}`} onClick={() => { void play(item.id); }}>{item.label}</button>)}
          </div>
          <button type="button" className="sort-button" onClick={() => { void play(call); }}>{t('Ver otra vez', 'Watch again', 'Ver de novo')}</button>
    </div>
  );
  return (
    <div className="sort-stage deck-stage">
      {slot && createPortal(controls, slot)}
      <div className="sort-board deck-board is-table is-hand is-draw is-yaku">
        <IsoCanvas ref={scene} draw={draw} />
        {shout && (
          <div className="win-shout" key={shout} role="status">
            <span className="win-cat" aria-hidden="true">🐱</span>
            <b>{shout}!</b>
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
