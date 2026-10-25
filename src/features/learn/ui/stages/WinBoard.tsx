import { useCallback, useEffect, useRef, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { ROT, dealAssignments, drawOrder, handSlot } from './DealBoard';
import { DEALT, HAND_VIEW, HAND_Y, WIDE_VIEW, WIDTH, byKey, handX, pondPos, sleep, startHand, tileName, tagsOf, TAG_LOOK, wallPos, type Fly, type Piece } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

type Part = 'tsumo' | 'ron';

const WINNER = '6z';
const START_TAKEN = 16; // four full rounds already played when the lesson drops in
const waiting = (): Piece[] => startHand().filter((piece) => piece.code !== '9p');

/** Rivers already on the table when each demonstration starts: yours, then right, across, left. */
const RIVERS: Record<Part, { mine: string[]; rivals: string[][] }> = {
  tsumo: { mine: ['4z', '9s', '2p', '7m'], rivals: [['2z', '7p', '4m', '3z'], ['9p', '1s', '5z', '8m'], ['3p', '7z', '2m', '9m']] },
  ron: { mine: ['3z', '8p', '1m', '5s'], rivals: [['4z', '2s', '9m', '7p'], ['7z', '6p', '3m', '4s'], ['2z', '9s', '5m', '8p']] },
};

/**
 * Two ways to complete the same hand, played as a narrated simulation: first tsumo (your own draw finishes it), then a
 * second game where another player throws the tile you need: ron.
 */
export function WinBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const order = useRef(drawOrder());
  const [hand, setHand] = useState<Piece[]>(waiting);
  const [extra, setExtra] = useState<Piece | null>(null);
  const [part, setPart] = useState<Part>('tsumo');
  const [finished, setFinished] = useState(false);
  const [view, setView] = useState<'hand' | 'wide'>('hand');
  const [taken, setTaken] = useState<Set<number>>(() => new Set(order.current.slice(DEALT, DEALT + START_TAKEN)));
  const [mark, setMark] = useState<number | null>(null);
  const [myPond, setMyPond] = useState<string[]>(RIVERS.tsumo.mine);
  const [rivalPonds, setRivalPonds] = useState<string[][]>(RIVERS.tsumo.rivals);
  const [rivalHold, setRivalHold] = useState<boolean[]>([false, false, false]);
  const [hot, setHot] = useState<{ player: number; slot: number } | null>(null);
  const [tags, setTags] = useState(true);
  const [callout, setCallout] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const revealT = useRef(0);
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

  const lay = useCallback((which: Part) => {
    flights.current = [];
    shown.current.clear();
    setHand(waiting());
    setExtra(null);
    setPart(which);
    setFinished(false);
    setTaken(new Set(order.current.slice(DEALT, DEALT + START_TAKEN)));
    setMark(null);
    setMyPond(RIVERS[which].mine);
    setRivalPonds(RIVERS[which].rivals);
    setRivalHold([false, false, false]);
    setHot(null);
    setCallout(null);
    setReveal(false);
    setWinnerId(null);
    revealT.current = 0;
    setNote(null);
  }, []);

  const script = useCallback(async (which: Part) => {
    const run = ++alive.current;
    const live = () => alive.current === run;
    const wait = async (ms: number) => { await sleep(ms); return live(); };
    let next = DEALT + START_TAKEN;
    const mine = [...RIVERS[which].mine];
    const rivals = RIVERS[which].rivals.map((list) => [...list]);
    const said = (title: string, body: string) => setNote({ title, body });

    const rivalTurn = async (i: number, code: string) => {
      const tile = order.current[next]; next += 1;
      const slot = handSlot(i + 1, 13, true);
      setTaken((now) => new Set(now).add(tile));
      fly({ key: `draw-${tile}`, from: wallPos(tile), to: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, dur: 600, faceUp: false });
      if (!(await wait(650))) return false;
      setRivalHold((now) => now.map((v, k) => (k === i ? true : v)));
      if (!(await wait(250))) return false;
      setRivalHold((now) => now.map((v, k) => (k === i ? false : v)));
      fly({ key: `throw-${i}-${rivals[i].length}`, code, from: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, to: pondPos(i + 1, rivals[i].length), dur: 550, faceUp: true });
      if (!(await wait(600))) return false;
      rivals[i].push(code);
      setRivalPonds(rivals.map((list) => [...list]));
      return true;
    };
    const rivalRound = async (codes: string[]) => {
      for (let i = 0; i < 3; i += 1) if (!(await rivalTurn(i, codes[i]))) return false;
      return true;
    };
    const myDraw = async (code: string) => {
      const tile = order.current[next]; next += 1;
      setMark(tile);
      if (!(await wait(1800))) return null;
      setMark(null);
      setTaken((now) => new Set(now).add(tile));
      const goal = handX(12, 14) - WIDTH * 0.95 + WIDTH * 1.9;
      fly({ key: `mine-${tile}`, from: wallPos(tile), to: { x: goal, y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1000, faceUp: false });
      if (!(await wait(950))) return null;
      setView('hand');
      if (!(await wait(250))) return null;
      const piece = { id: 300 + tile, code };
      setExtra(piece);
      return piece;
    };

    // the opening: the hand and its waits, then the table zooms out
    lay(which);
    setView('hand');
    setTags(true);
    if (which === 'tsumo') {
      said(t('Mitad de la partida', 'Midway through the game', 'Metade da partida'), t('Ya se jugaron varios turnos: cada jugador tiene su río de descartes. Mira tu mano: tres grupos, dos parejas… y te falta una sola ficha, el Este (東) o el Chun (中).', 'Several turns are already played: every player has a river of discards. Look at your hand: three sets, two pairs… and you are one tile short, the East (東) or the Chun (中).', 'Vários turnos já foram jogados: cada jogador tem seu rio de descartes. Veja sua mão: três grupos, dois pares… e falta uma só peça, o Leste (東) ou o Chun (中).'));
      if (!(await wait(5500))) return;
    } else {
      said(t('Rebobinamos', 'Rewind', 'Voltamos atrás'), t('Misma mano y misma espera (Este (東) o Chun (中)), pero otra partida: otros descartes y otro final.', 'Same hand and same wait (East (東) or Chun (中)), but another game: other discards and another ending.', 'Mesma mão e mesma espera (Leste (東) ou Chun (中)), mas outra partida: outros descartes e outro final.'));
      if (!(await wait(4000))) return;
    }
    setView('wide');
    setTags(false);
    if (!(await wait(900))) return;

    // a round where nothing helps
    said(t('Siguen los turnos', 'The turns go on', 'Os turnos continuam'), t('Cada rival roba una ficha del muro y bota otra a su río, uno tras otro.', 'Each rival draws a tile from the wall and throws another into their river, one after the other.', 'Cada rival compra uma peça do muro e descarta outra no seu rio, um após o outro.'));
    if (!(await rivalRound(which === 'tsumo' ? ['5p', '8s', '6m'] : ['1p', '6s', '4p']))) return;
    said(t('Tu turno', 'Your turn', 'Sua vez'), t('Robas la siguiente ficha del muro, la que brilla.', 'You draw the next tile from the wall, the one that glows.', 'Você compra a próxima peça do muro, a que brilha.'));
    const useless = which === 'tsumo' ? '8s' : '9m';
    const first = await myDraw(useless);
    if (!first) return;
    said(t(`Robaste: ${tileName(useless, language)}`, `You drew: ${tileName(useless, language)}`, `Você comprou: ${tileName(useless, language)}`), t('No forma grupo con nada de tu mano: no sirve. La botas y sigues esperando.', 'It makes no set with your hand: it does not help. You throw it and keep waiting.', 'Não forma grupo com nada da sua mão: não serve. Você descarta e continua esperando.'));
    if (!(await wait(2600))) return;
    fly({ key: 'toss', code: useless, from: { x: handX(12, 14) - WIDTH * 0.95 + WIDTH * 1.9, y: HAND_Y, z: FELT_Z + 1, rot: 0 }, to: pondPos(0, mine.length), dur: 650, faceUp: true });
    setExtra(null);
    if (!(await wait(700))) return;
    mine.push(useless);
    setMyPond([...mine]);
    setView('wide');
    if (!(await wait(900))) return;

    if (which === 'tsumo') {
      said(t('Otra vuelta', 'Another lap', 'Outra volta'), t('Los rivales siguen jugando…', 'The rivals keep playing…', 'Os rivais continuam jogando…'));
      if (!(await rivalRound(['6p', '2s', '1m']))) return;
      said(t('Tu turno otra vez', 'Your turn again', 'Sua vez de novo'), t('Vuelves a robar de la siguiente pila.', 'You draw from the next stack again.', 'Você compra da próxima pilha de novo.'));
      const winner = await myDraw(WINNER);
      if (!winner) return;
      setTags(true);
      said(t('¡Robaste el Chun (中)!', 'You drew the Chun (中)!', 'Você comprou o Chun (中)!'), t('Mira tus grupos: 1-2-3 manzu, 4-5-6 pinzu, 3-4-5 souzu y la pareja de Este (東). Tenías dos Chun (中) y te faltaba una tercera: justo la que acabas de robar.', 'Look at your sets: 1-2-3 manzu, 4-5-6 pinzu, 3-4-5 souzu and the pair of East (東). You held two Chun (中) and needed a third: exactly the one you just drew.', 'Veja seus grupos: 1-2-3 manzu, 4-5-6 pinzu, 3-4-5 souzu e o par de Leste (東). Você tinha dois Chun (中) e faltava um terceiro: justo o que acabou de comprar.'));
      if (!(await wait(5500))) return;
      setCallout('TSUMO');
      said(t('Declaras «Tsumo»', 'You declare “Tsumo”', 'Você declara «Tsumo»'), t('La ficha completa tu mano. No la metes en silencio entre las demás: la dejas aparte y dices «Tsumo».', 'The tile completes your hand. You do not slip it in among the others: you leave it apart and say “Tsumo”.', 'A peça completa sua mão. Você não a coloca em silêncio entre as outras: deixa de lado e diz «Tsumo».'));
      if (!(await wait(4500))) return;
      setReveal(true);
      setFinished(true);
      said(t('Muestras tu mano', 'You show your hand', 'Você mostra a mão'), t('Botas tus fichas sobre la mesa para que todos las vean: 4 grupos y 1 pareja. La ficha robada queda aparte, para que se note que fue tu robo. Eso es tsumo: la ronda termina y pagan los tres rivales.', 'You lay your tiles down for all to see: 4 sets and 1 pair. The drawn tile stays apart so it is clear it was your draw. That is tsumo: the round ends and all three rivals pay.', 'Você abaixa suas peças para todos verem: 4 grupos e 1 par. A peça comprada fica separada para se notar que foi sua compra. Isso é tsumo: a rodada termina e os três rivais pagam.'));
      if (!(await wait(7000))) return;
      said(t('Hay otra forma de ganar', 'There is another way to win', 'Há outra forma de ganhar'), t('No siempre la robas tú. Veamos qué pasa cuando la ficha que necesitas la bota otro jugador.', 'You do not always draw it yourself. Let us see what happens when another player throws the tile you need.', 'Nem sempre é você que compra. Vamos ver o que acontece quando outro jogador descarta a peça que você precisa.'));
      if (!(await wait(4000))) return;
      void script('ron');
      return;
    }

    // ron: the player on your left throws the tile you need
    said(t('Otra vuelta', 'Another lap', 'Outra volta'), t('Los rivales siguen jugando…', 'The rivals keep playing…', 'Os rivais continuam jogando…'));
    if (!(await rivalTurn(0, '3p'))) return;
    if (!(await rivalTurn(1, '8m'))) return;
    said(t('Juega el jugador de tu izquierda', 'The player on your left plays', 'Joga o jogador à sua esquerda'), t('Roba su ficha y va a descartar…', 'Draws a tile and is about to throw…', 'Compra sua peça e vai descartar…'));
    if (!(await rivalTurn(2, WINNER))) return;
    setHot({ player: 3, slot: rivals[2].length - 1 });
    said(t('¡Esa es tu ficha!', 'That is your tile!', 'Essa é a sua peça!'), t('No la robaste tú: la botó otro jugador. Pero es el Chun (中) que completa tu grupo, y las reglas te dejan ganar con ella.', 'You did not draw it: another player threw it. But it is the Chun (中) that completes your set, and the rules let you win on it.', 'Você não comprou: outro jogador descartou. Mas é o Chun (中) que completa seu grupo, e as regras deixam você ganhar com ele.'));
    if (!(await wait(5000))) return;
    said(t('Tomas la ficha del rival', 'You take the rival’s tile', 'Você pega a peça do rival'), t('Como completa tu mano, puedes tomarla antes de que siga el juego.', 'Since it completes your hand, you may take it before the game goes on.', 'Como completa sua mão, você pode pegá-la antes do jogo continuar.'));
    const at = pondPos(3, rivals[2].length - 1);
    setHot(null);
    setRivalPonds(rivals.map((list, k) => (k === 2 ? list.slice(0, -1) : list)));
    const goal = handX(12, 14) - WIDTH * 0.95 + WIDTH * 1.9;
    fly({ key: 'claim', code: WINNER, from: at, to: { x: goal, y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1100, faceUp: true });
    if (!(await wait(1000))) return;
    setView('hand');
    setTags(true);
    if (!(await wait(400))) return;
    const piece = { id: 399, code: WINNER };
    setExtra(piece);
    setCallout('RON');
    said(t('Declaras «Ron»', 'You declare “Ron”', 'Você declara «Ron»'), t('La ficha del rival completa tu mano. No la mezclas con las tuyas: la dejas aparte y dices «Ron».', 'The rival’s tile completes your hand. You do not mix it with yours: you leave it apart and say “Ron”.', 'A peça do rival completa sua mão. Você não a mistura com as suas: deixa de lado e diz «Ron».'));
    if (!(await wait(4500))) return;
    setHand((now) => [...now, piece].sort(byKey));
    setExtra(null);
    setWinnerId(piece.id);
    setReveal(true);
    setFinished(true);
    said(t('Muestras tu mano', 'You show your hand', 'Você mostra a mão'), t('Botas tus fichas sobre la mesa para que todos las vean: 4 grupos y 1 pareja, con la ficha que botó otro jugador destacada. Eso es ron: la ronda termina y paga solo quien la botó.', 'You lay your tiles down for all to see: 4 sets and 1 pair, with the tile another player threw highlighted. That is ron: the round ends and only the one who threw it pays.', 'Você abaixa suas peças para todos verem: 4 grupos e 1 par, com a peça que outro jogador descartou destacada. Isso é ron: a rodada termina e só quem descartou paga.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lay, fly, language]);

  useEffect(() => {
    void script('tsumo');
    return () => { alive.current += 1; };
  }, [script]);

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
    if (mark !== null || hot) g.needsFrame = true;

    const face = (code: string) => picture(`${p.faces}/${code}.svg`);
    myPond.forEach((code, slot) => { const at = pondPos(0, slot); g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code) }); });
    rivalPonds.forEach((list, i) => list.forEach((code, slot) => {
      const at = pondPos(i + 1, slot);
      const glow = hot?.player === i + 1 && hot.slot === slot;
      g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code), gold: glow, hop: glow ? 1 + Math.sin(g.now / 160) * 0.8 : 0 });
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
      const turnTo = ((f.to.rot - f.from.rot + 540) % 360) - 180;
      g.tile(f.from.x + (f.to.x - f.from.x) * e, f.from.y + (f.to.y - f.from.y) * e, f.from.rot + turnTo * e, f.from.z + (f.to.z - f.from.z) * e, { flip: f.faceUp ? 1 : 0, face: f.code ? face(f.code) : null, hop: Math.sin(k * Math.PI) * 7, order: 9e4 });
      if (k < 1) g.needsFrame = true;
    });

    let moving = false;
    const slide = 1 - Math.exp(-dt / 150);
    revealT.current += ((reveal ? 1 : 0) - revealT.current) * (1 - Math.exp(-dt / 260));
    if (Math.abs((reveal ? 1 : 0) - revealT.current) > 0.01) g.needsFrame = true;
    const phi = 90 + 90 * revealT.current;
    const place = (piece: Piece, goalX: number) => {
      const st = shown.current.get(piece.id) ?? { x: goalX, lift: 0 };
      st.x += (goalX - st.x) * slide;
      if (Math.abs(goalX - st.x) > 0.03) moving = true;
      shown.current.set(piece.id, st);
      g.standTile(st.x, HAND_Y, 0, phi, { face: face(piece.code), joined: reveal ? false : true, order: HAND_Y * 100 + 50 });
    };
    hand.forEach((piece, i) => place(piece, handX(i, total) - (extra ? WIDTH * 0.95 : 0)));
    if (extra) place(extra, handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9);
    if (moving) g.needsFrame = true;
    g.flush();

    if (tags && view === 'hand') {
      const full = extra && reveal ? [...hand, extra].sort(byKey) : hand;
      tagsOf(full).forEach((tag) => {
        const a = shown.current.get(full[tag.from].id);
        const b = shown.current.get(full[tag.to].id);
        if (!a || !b) return;
        const look = TAG_LOOK[tag.kind];
        const pos = g.project((a.x + b.x) / 2, HAND_Y, FELT_Z + 8);
        g.pill(pos.x, pos.y + 7, look.name[language], { bg: look.bg, fg: look.fg, size: 11, border: look.fg });
      });
    }
    const spot = extra ?? hand.find((piece) => piece.id === winnerId);
    if (reveal && spot) {
      const st = shown.current.get(spot.id);
      if (st) {
        const pos = g.project(st.x, HAND_Y, FELT_Z + 14);
        g.pill(pos.x, pos.y - 4, extra ? t('Tu robo', 'Your draw', 'Sua compra') : t('Ficha del rival', 'Rival’s tile', 'Peça do rival'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
      }
    }
    if (mark !== null) {
      const at = wallPos(mark);
      const pos = g.project(at.x, at.y, FELT_Z + 9);
      g.pill(pos.x, pos.y, t('Robas de aquí', 'You draw from here', 'Você compra daqui'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
    }
    if (hot) {
      const at = pondPos(hot.player, hot.slot);
      const pos = g.project(at.x, at.y, FELT_Z + 9);
      g.pill(pos.x, pos.y, t('La botó un rival', 'A rival threw it', 'Um rival descartou'), { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
    }
  };

  void ROT;
  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-hand is-draw${finished ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} />
        <div className="sort-actions deck-actions">
          <button type="button" className={`sort-button${part === 'tsumo' ? ' is-primary' : ''}`} onClick={() => { void script('tsumo'); }}>{t('Ver tsumo', 'Watch tsumo', 'Ver tsumo')}</button>
          <button type="button" className={`sort-button${part === 'ron' ? ' is-primary' : ''}`} onClick={() => { void script('ron'); }}>{t('Ver ron', 'Watch ron', 'Ver ron')}</button>
        </div>
        {callout && (
          <div className={`win-shout${reveal ? ' is-final' : ''}`} key={callout} role="status">
            <span className="win-cat" aria-hidden="true">🐱</span>
            <b>{callout}!</b>
          </div>
        )}
        <p className={`sort-win is-top${finished ? '' : ' is-note'}`} role="status">
          <b>{note?.title ?? ''}</b>
          <span>{note?.body ?? ''}</span>
        </p>
      </div>
    </div>
  );
}
