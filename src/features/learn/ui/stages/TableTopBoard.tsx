import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { BOARD_H, TILE_BACK, TILE_H, TILE_W, clamp, wallSlot } from './DeckBoard';

const ROW = 17;
const CENTER = { x: 50, y: BOARD_H / 2 };
const COMPASS = 15;
/** The wind plate stands against the table edge, to the right of the first dealer (bottom of the board). */
const PLATE_TARGET = { x: 86, y: 55 };
const PLATE_W = 6;
const PLATE_H = 4.4;
const SNAP = 8;

export type TableTopStatus = { compass: boolean; plate: boolean; rolled: number | null; dealerRoll: number | null; done: boolean };

/** Rivals always roll low and the player always rolls the 6, so the next lesson can start from the dealer's seat. */
const SEAT_ROLLS = [6, 1, 3, 4];
const SEAT_AT = [
  { x: CENTER.x, y: CENTER.y + 11 },
  { x: CENTER.x + 13, y: CENTER.y },
  { x: CENTER.x, y: CENTER.y - 11 },
  { x: CENTER.x - 13, y: CENTER.y },
];
const SEAT_NAME = {
  es: ['Tú', 'Rival derecha', 'Rival enfrente', 'Rival izquierda'],
  en: ['You', 'Right rival', 'Rival across', 'Left rival'],
  pt: ['Você', 'Rival à direita', 'Rival em frente', 'Rival à esquerda'],
};

const SIDE_LABEL = {
  es: ['Este (tú, el dealer)', 'Sur (a tu derecha)', 'Oeste (enfrente)', 'Norte (a tu izquierda)'],
  en: ['East (you, the dealer)', 'South (on your right)', 'West (across)', 'North (on your left)'],
  pt: ['Leste (você, o dealer)', 'Sul (à sua direita)', 'Oeste (em frente)', 'Norte (à sua esquerda)'],
};

const PIPS: Record<number, number[]> = {
  0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, rolling, style }: { value: number; rolling: boolean; style: React.CSSProperties }) {
  return (
    <span className={`table-die${rolling ? ' is-rolling' : ''}`} style={style} aria-hidden="true">
      {Array.from({ length: 9 }, (_, cell) => <i key={cell} className={PIPS[value].includes(cell) ? 'is-pip' : ''} />)}
    </span>
  );
}

function Compass() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect x="3" y="3" width="94" height="94" rx="15" className="compass-plate" />
      <rect x="9" y="9" width="82" height="82" rx="11" className="compass-inner" />
      <g className="compass-slots">
        <rect x="38" y="80" width="24" height="7" rx="2" />
        <rect x="38" y="13" width="24" height="7" rx="2" />
        <rect x="13" y="38" width="7" height="24" rx="2" />
        <rect x="80" y="38" width="7" height="24" rx="2" />
      </g>
      <g className="compass-letters">
        <text x="50" y="68">東</text>
        <text x="68" y="50" transform="rotate(-90 68 50)">南</text>
        <text x="50" y="32" transform="rotate(180 50 32)">西</text>
        <text x="32" y="50" transform="rotate(90 32 50)">北</text>
      </g>
      <circle cx="50" cy="50" r="8" className="compass-core" />
    </svg>
  );
}

type Drag = { item: 'compass' | 'plate'; dx: number; dy: number };

/**
 * The four finished walls seen from above. In "compass" mode the player drags the compass to the centre and the
 * round-wind plate to the edge; in "dice" mode they roll two dice and the walls show where the game opens.
 */
export function TableTopBoard({ mode, language, onStatus }: { mode: 'dealer' | 'compass' | 'dice'; language: TutorialLanguage; onStatus?: (status: TableTopStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [compassAt, setCompassAt] = useState(mode === 'dice' ? CENTER : { x: 12, y: 28 });
  const [plateAt, setPlateAt] = useState(mode === 'dice' ? PLATE_TARGET : { x: 12, y: 46 });
  const [compassOn, setCompassOn] = useState(mode === 'dice');
  const [plateOn, setPlateOn] = useState(mode === 'dice');
  const [grabbing, setGrabbing] = useState<Drag['item'] | null>(null);
  const [hot, setHot] = useState<Drag['item'] | null>(null);
  const [faces, setFaces] = useState<[number, number]>([3, 4]);
  const [rolling, setRolling] = useState(false);
  const [rolled, setRolled] = useState<number | null>(null);
  const [counted, setCounted] = useState(0);
  const timers = useRef<number[]>([]);
  const [seatFaces, setSeatFaces] = useState<number[]>([0, 0, 0, 0]);
  const [seatRolling, setSeatRolling] = useState<boolean[]>([false, false, false, false]);

  const rollSeat = (seat: number, delay: number) => {
    const start = window.setTimeout(() => {
      setSeatRolling((now) => now.map((value, index) => (index === seat ? true : value)));
      const spin = window.setInterval(() => setSeatFaces((now) => now.map((value, index) => (index === seat ? 1 + Math.floor(Math.random() * 6) : value))), 80);
      const stop = window.setTimeout(() => {
        window.clearInterval(spin);
        setSeatFaces((now) => now.map((value, index) => (index === seat ? SEAT_ROLLS[seat] : value)));
        setSeatRolling((now) => now.map((value, index) => (index === seat ? false : value)));
      }, 750);
      timers.current.push(spin, stop);
    }, delay);
    timers.current.push(start);
  };

  // the three rivals roll one after another when the lesson opens
  useEffect(() => {
    if (mode !== 'dealer') return;
    [1, 2, 3].forEach((seat, order) => rollSeat(seat, 700 + order * 1000));
  }, [mode]);

  const rivalsDone = seatFaces[1] > 0 && seatFaces[2] > 0 && seatFaces[3] > 0 && !seatRolling.some(Boolean);
  const dealerRoll = seatFaces[0] > 0 && !seatRolling[0] ? seatFaces[0] : null;
  const replay = () => {
    timers.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id); });
    setSeatFaces([0, 0, 0, 0]);
    setSeatRolling([false, false, false, false]);
    [1, 2, 3].forEach((seat, order) => rollSeat(seat, 500 + order * 1000));
  };

  const done = mode === 'dealer' ? dealerRoll !== null : mode === 'compass' ? compassOn && plateOn : rolled !== null && counted >= (rolled ?? 99);
  useEffect(() => { onStatus?.({ compass: compassOn, plate: plateOn, rolled, dealerRoll, done }); }, [compassOn, plateOn, rolled, dealerRoll, done, onStatus]);
  useEffect(() => () => timers.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id); }), []);

  const toUnits = (clientX: number, clientY: number) => {
    const rect = boardRef.current!.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.width) * 100 };
  };

  const near = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode !== 'compass') return;
    const point = toUnits(event.clientX, event.clientY);
    let item: Drag['item'] | null = null;
    if (!compassOn && near(point, compassAt) < COMPASS / 2) item = 'compass';
    else if (!plateOn && near(point, plateAt) < PLATE_W) item = 'plate';
    if (!item) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const at = item === 'compass' ? compassAt : plateAt;
    drag.current = { item, dx: at.x - point.x, dy: at.y - point.y };
    setGrabbing(item);
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current) return;
    const point = toUnits(event.clientX, event.clientY);
    const next = { x: clamp(point.x + current.dx, 3, 97), y: clamp(point.y + current.dy, 3, BOARD_H - 3) };
    if (current.item === 'compass') setCompassAt(next); else setPlateAt(next);
    const target = current.item === 'compass' ? CENTER : PLATE_TARGET;
    setHot(near(next, target) < SNAP ? current.item : null);
  };

  const onUp = () => {
    const current = drag.current;
    drag.current = null;
    setGrabbing(null);
    setHot(null);
    if (!current) return;
    if (current.item === 'compass') {
      if (near(compassAt, CENTER) < SNAP) { setCompassAt(CENTER); setCompassOn(true); }
    } else if (near(plateAt, PLATE_TARGET) < SNAP) { setPlateAt(PLATE_TARGET); setPlateOn(true); }
  };

  // Click alternative: put the next missing piece in its place.
  const placeNext = () => {
    if (!compassOn) { setCompassAt(CENTER); setCompassOn(true); } else if (!plateOn) { setPlateAt(PLATE_TARGET); setPlateOn(true); }
  };

  const roll = () => {
    if (rolling) return;
    timers.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id); });
    setRolling(true);
    setRolled(null);
    setCounted(0);
    const spin = window.setInterval(() => setFaces([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]), 80);
    const stop = window.setTimeout(() => {
      window.clearInterval(spin);
      const a = 1 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * 6);
      setFaces([a, b]);
      setRolling(false);
      setRolled(a + b);
      const count = window.setInterval(() => setCounted((value) => {
        if (value >= a + b) { window.clearInterval(count); return value; }
        return value + 1;
      }), 170);
      timers.current.push(count);
    }, 1000);
    timers.current.push(spin, stop);
  };

  const openSide = rolled === null ? null : (rolled - 1) % 4;
  const cut = openSide !== null && counted > 0
    ? (() => {
      const a = wallSlot(openSide, ROW - counted, 0);
      const b = wallSlot(openSide, ROW - counted - 1, 0);
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, rot: a.rot };
    })()
    : null;

  const tiles = Array.from({ length: 136 }, (_, index) => {
    const side = Math.floor(index / 34);
    const k = index % 34;
    const stack = k % ROW;
    const pose = wallSlot(side, stack, k < ROW ? 0 : 1);
    const counting = openSide === side && stack >= ROW - counted;
    return { index, pose, counting, open: openSide === side };
  });

  return (
    <div className="sort-stage deck-stage">
      <div
        className={`sort-board deck-board is-table is-${mode}${grabbing ? ' is-grabbing' : ''}${done ? ' is-sorted' : ''}`}
        ref={boardRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="deck-felt" aria-hidden="true"><span>{mode === 'dealer' ? t('Cada jugador lanza un dado', 'Each player rolls one die', 'Cada jogador lança um dado') : mode === 'compass' ? t('Los cuatro muros ya están armados', 'The four walls are built', 'Os quatro muros estão montados') : t('Los dados deciden dónde se abre', 'The dice decide where it opens', 'Os dados decidem onde abre')}</span></div>

        {tiles.map(({ index, pose, counting, open }) => (
          <span
            key={index}
            className={`deck-tile is-static${counting ? ' is-counting' : ''}${open ? ' is-open-side' : ''}`}
            style={{ width: `${TILE_W}%`, left: `${pose.x}%`, top: `${(pose.y / BOARD_H) * 100}%`, transform: `translate(-50%, -50%) rotate(${pose.rot}deg)`, zIndex: pose.z }}
          >
            <img src={TILE_BACK} alt="" draggable={false} />
          </span>
        ))}

        {mode === 'compass' && (
          <>
            {!compassOn && <i className={`table-target is-compass${hot === 'compass' ? ' is-hot' : ''}`} style={{ left: `${CENTER.x}%`, top: `${(CENTER.y / BOARD_H) * 100}%`, width: `${COMPASS + 2}%` }} />}
            {!plateOn && <i className={`table-target is-plate${hot === 'plate' ? ' is-hot' : ''}`} style={{ left: `${PLATE_TARGET.x}%`, top: `${(PLATE_TARGET.y / BOARD_H) * 100}%`, width: `${PLATE_W + 1.6}%` }} />}
            {!compassOn && <span className="deck-hint" style={{ left: `${compassAt.x}%`, top: `${((compassAt.y - COMPASS * 0.72) / BOARD_H) * 100}%` }}>{t('El compass', 'The compass', 'O compass')} →</span>}
            {!plateOn && <span className="deck-hint" style={{ left: `${plateAt.x}%`, top: `${((plateAt.y - PLATE_H * 1.5) / BOARD_H) * 100}%` }}>{t('Viento de ronda', 'Round wind', 'Vento da rodada')}</span>}
            {compassOn && !plateOn && <span className="deck-hint" style={{ left: `${PLATE_TARGET.x}%`, top: `${((PLATE_TARGET.y - PLATE_H * 2) / BOARD_H) * 100}%` }}>{t('A la derecha del dealer', 'Right of the dealer', 'À direita do dealer')} ↓</span>}
          </>
        )}

        {mode !== 'dealer' && <span
          className={`table-compass${compassOn ? ' is-placed' : ''}${grabbing === 'compass' ? ' is-dragging' : ''}`}
          style={{ left: `${compassAt.x}%`, top: `${(compassAt.y / BOARD_H) * 100}%`, width: `${COMPASS}%` }}
        >
          <Compass />
        </span>}
        {mode !== 'dealer' && <span
          className={`table-plate${plateOn ? ' is-placed' : ''}${grabbing === 'plate' ? ' is-dragging' : ''}`}
          style={{ left: `${plateAt.x}%`, top: `${(plateAt.y / BOARD_H) * 100}%`, width: `${PLATE_W}%` }}
        >
          <b>東</b>
        </span>}

        {mode === 'dealer' && SEAT_AT.map((at, seat) => {
          const value = seatFaces[seat];
          const winner = dealerRoll !== null && seat === 0;
          const die = <Die value={value} rolling={seatRolling[seat]} style={{ ['--tilt' as string]: `${(seat - 1.5) * 7}deg` }} />;
          return (
            <span key={seat} className={`table-seat${winner ? ' is-winner' : ''}`} style={{ left: `${at.x}%`, top: `${(at.y / BOARD_H) * 100}%` }}>
              {seat === 0 ? (
                <button type="button" className="table-seat-die" onClick={() => rollSeat(0, 0)} disabled={!rivalsDone || seatRolling[0] || dealerRoll !== null} aria-label={t('Lanzar mi dado', 'Roll my die', 'Lançar meu dado')}>{die}</button>
              ) : die}
              <small>{SEAT_NAME[language][seat]}{value > 0 && !seatRolling[seat] ? ` · ${value}` : ''}</small>
              {winner && <b>{t('¡Dealer!', 'Dealer!', 'Dealer!')}</b>}
            </span>
          );
        })}

        {mode === 'dice' && (
          <>
            <button type="button" className="table-dice" onClick={roll} disabled={rolling} aria-label={t('Lanzar los dados', 'Roll the dice', 'Lançar os dados')} style={{ left: `${CENTER.x}%`, top: `${((CENTER.y + COMPASS * 0.95) / BOARD_H) * 100}%` }}>
              <Die value={faces[0]} rolling={rolling} style={{ ['--tilt' as string]: '-8deg' }} />
              <Die value={faces[1]} rolling={rolling} style={{ ['--tilt' as string]: '11deg' }} />
            </button>
            {cut && <i className="table-cut" style={{ left: `${cut.x}%`, top: `${(cut.y / BOARD_H) * 100}%`, height: `${TILE_H * 1.9}%`, transform: `translate(-50%, -50%) rotate(${cut.rot}deg)` }} />}
          </>
        )}

        <div className="sort-actions deck-actions">
          {mode === 'dealer' ? (
            <>
              <span>{dealerRoll === null ? (rivalsDone ? t('Te toca', 'Your turn', 'Sua vez') : t('Lanzan los rivales…', 'Rivals are rolling…', 'Os rivais lançam…')) : t('Mayor: 6', 'Highest: 6', 'Maior: 6')}</span>
              {dealerRoll === null
                ? <button type="button" className="sort-button is-primary" onClick={() => rollSeat(0, 0)} disabled={!rivalsDone || seatRolling[0]}>{t('Lanzar mi dado', 'Roll my die', 'Lançar meu dado')}</button>
                : <button type="button" className="sort-button" onClick={replay}>{t('Repetir', 'Replay', 'Repetir')}</button>}
            </>
          ) : mode === 'compass' ? (
            <>
              <span>{Number(compassOn) + Number(plateOn)}/2</span>
              {!(compassOn && plateOn) && <button type="button" className="sort-button is-primary" onClick={placeNext}>{t('Colocar →', 'Place →', 'Colocar →')}</button>}
            </>
          ) : (
            <>
              {rolled !== null && <span>{faces[0]} + {faces[1]} = {rolled}</span>}
              <button type="button" className="sort-button is-primary" onClick={roll} disabled={rolling}>{rolled === null ? t('Lanzar dados', 'Roll dice', 'Lançar dados') : t('Lanzar otra vez', 'Roll again', 'Lançar de novo')}</button>
            </>
          )}
        </div>

        {mode === 'dice' && rolled !== null && openSide !== null && counted >= rolled && (
          <p className="sort-win" role="status">
            <b>{t(`Suma ${rolled}: se abre el muro de ${SIDE_LABEL.es[openSide]}`, `Total ${rolled}: the wall of ${SIDE_LABEL.en[openSide]} opens`, `Soma ${rolled}: abre o muro de ${SIDE_LABEL.pt[openSide]}`)}</b>
            <span>{t(`Se cuentan ${rolled} pilas desde la derecha de ese muro y ahí se corta.`, `Count ${rolled} stacks from the right end of that wall and cut there.`, `Contam-se ${rolled} pilhas a partir da direita desse muro e corta-se ali.`)}</span>
          </p>
        )}
        {mode === 'dealer' && dealerRoll !== null && (
          <p className="sort-win is-top" role="status">
            <b>{t('¡Sacaste 6, el más alto: eres el dealer!', 'You rolled a 6, the highest: you are the dealer!', 'Você tirou 6, o mais alto: é o dealer!')}</b>
            <span>{t('El dealer toma el asiento Este y juega primero. Los demás se sientan a su alrededor.', 'The dealer takes the East seat and plays first. The others sit around.', 'O dealer fica no assento Leste e joga primeiro. Os outros sentam ao redor.')}</span>
          </p>
        )}
        {mode === 'compass' && done && (
          <p className="sort-win" role="status">
            <b>{t('Mesa lista', 'Table ready', 'Mesa pronta')}</b>
            <span>{t('El compass al centro y la placa de ronda junto al dealer.', 'Compass in the centre, round-wind plate by the dealer.', 'Compass no centro, placa da rodada junto ao dealer.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
