import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { BOARD_H, TILE_BACK, TILE_W, clamp, wallSlot } from './DeckBoard';
import { Box, IsoWorld, TileBox, billboard, tileTransform, unitsOf } from './iso';

const ROW = 17;
const CENTER = { x: 50, y: 50 };
const COMPASS = 14;
const COMPASS_TRAY = { x: 12, y: 90 };
/** The wind plate stands against the table edge, to the right of the first dealer (bottom of the board). */
const PLATE_TARGET = { x: 89, y: 90 };
const PLATE_TRAY = { x: 89, y: 10 };
const PLATE_W = 8;
const PLATE_H = 5.8;
const SNAP = 9;

export type TableTopStatus = { compass: boolean; plate: boolean; rolled: number | null; dealerRoll: number | null; done: boolean };

/** Rivals always roll low and the player always rolls the 6, so the next lesson can start from the dealer's seat. */
const SEAT_ROLLS = [6, 1, 3, 4];
const SEAT_AT = [
  { x: CENTER.x, y: CENTER.y + 15 },
  { x: CENTER.x + 16, y: CENTER.y },
  { x: CENTER.x, y: CENTER.y - 15 },
  { x: CENTER.x - 16, y: CENTER.y },
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

/** Winds around the table once the compass is down: you are East and the dealer, then counter-clockwise. */
const WIND_TAGS = [
  { wind: 'E', glyph: '東', index: 0, x: 50, y: 93 },
  { wind: 'S', glyph: '南', index: 1, x: 93, y: 50 },
  { wind: 'W', glyph: '西', index: 2, x: 50, y: 7 },
  { wind: 'N', glyph: '北', index: 3, x: 7, y: 50 },
];
const WIND_NAME = {
  es: ['Este · tú, el dealer', 'Sur · a tu derecha', 'Oeste · enfrente', 'Norte · a tu izquierda'],
  en: ['East · you, the dealer', 'South · on your right', 'West · across', 'North · on your left'],
  pt: ['Leste · você, o dealer', 'Sul · à sua direita', 'Oeste · em frente', 'Norte · à sua esquerda'],
};

const PIPS: Record<number, number[]> = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

/** Cube orientation that brings each value to the top face. Faces: top 1, bottom 6, south 2, north 5, east 3, west 4. */
const FACE_UP: Record<number, string> = {
  0: '', 1: '', 2: 'rotateX(90deg)', 3: 'rotateY(-90deg)', 4: 'rotateY(90deg)', 5: 'rotateX(-90deg)', 6: 'rotateX(180deg)',
};
const FACES: Array<[string, number, string]> = [
  ['top', 1, 'translateZ(calc(var(--s) / 2))'],
  ['bottom', 6, 'rotateX(180deg) translateZ(calc(var(--s) / 2))'],
  ['south', 2, 'rotateX(-90deg) translateZ(calc(var(--s) / 2))'],
  ['north', 5, 'rotateX(90deg) translateZ(calc(var(--s) / 2))'],
  ['east', 3, 'rotateY(90deg) translateZ(calc(var(--s) / 2))'],
  ['west', 4, 'rotateY(-90deg) translateZ(calc(var(--s) / 2))'],
];

/** A die lying on the felt as a real cube; `rolling` tumbles it, otherwise it settles on `value`. */
function Die3D({ value, rolling, yaw, size = 7 }: { value: number; rolling: boolean; yaw: number; size?: number }) {
  const style = { ['--s' as string]: `calc(var(--u) * ${size})`, transform: `translateZ(calc(var(--s) / 2)) rotateZ(${yaw}deg)` } as CSSProperties;
  return (
    <span className={`die3d${rolling ? ' is-rolling' : ''}`} style={style} aria-hidden="true">
      <span className="die3d-in" style={rolling ? undefined : { transform: FACE_UP[value] }}>
        {FACES.map(([name, face, transform]) => (
          <span key={name} className="die3d-face" style={{ transform }}>
            {Array.from({ length: 9 }, (_, cell) => <i key={cell} className={value > 0 && PIPS[face].includes(cell) ? 'is-pip' : ''} />)}
          </span>
        ))}
      </span>
    </span>
  );
}

type Drag = { item: 'compass' | 'plate'; dx: number; dy: number };

const at = (point: { x: number; y: number }, lift = 0): CSSProperties => ({
  left: `${point.x}%`,
  top: `${(point.y / BOARD_H) * 100}%`,
  transform: `translate3d(-50%, -50%, calc(var(--u) * ${lift}))`,
});

/**
 * The four finished walls on an isometric table. "dealer": each player rolls a die; "compass": the player drags the
 * compass to the centre and the round-wind plate to the edge; "dice": two dice open the wall.
 */
export function TableTopBoard({ mode, language, onStatus }: { mode: 'dealer' | 'compass' | 'dice'; language: TutorialLanguage; onStatus?: (status: TableTopStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const planeRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [compassAt, setCompassAt] = useState(mode === 'compass' ? COMPASS_TRAY : CENTER);
  const [plateAt, setPlateAt] = useState(mode === 'compass' ? PLATE_TRAY : PLATE_TARGET);
  const [compassOn, setCompassOn] = useState(mode !== 'compass');
  const [plateOn, setPlateOn] = useState(mode !== 'compass');
  const [grabbing, setGrabbing] = useState<Drag['item'] | null>(null);
  const [hot, setHot] = useState<Drag['item'] | null>(null);
  const [faces, setFaces] = useState<[number, number]>([3, 4]);
  const [rolling, setRolling] = useState(false);
  const [rolled, setRolled] = useState<number | null>(null);
  const [counted, setCounted] = useState(0);
  const timers = useRef<number[]>([]);
  const [seatFaces, setSeatFaces] = useState<number[]>([0, 0, 0, 0]);
  const [seatRolling, setSeatRolling] = useState<boolean[]>([false, false, false, false]);

  const clearTimers = () => { timers.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id); }); timers.current = []; };

  const rollSeat = (seat: number, delay: number) => {
    const start = window.setTimeout(() => {
      setSeatRolling((now) => now.map((value, index) => (index === seat ? true : value)));
      const stop = window.setTimeout(() => {
        setSeatFaces((now) => now.map((value, index) => (index === seat ? SEAT_ROLLS[seat] : value)));
        setSeatRolling((now) => now.map((value, index) => (index === seat ? false : value)));
      }, 900);
      timers.current.push(stop);
    }, delay);
    timers.current.push(start);
  };

  // the three rivals roll one after another when the lesson opens
  useEffect(() => {
    if (mode !== 'dealer') return;
    [1, 2, 3].forEach((seat, order) => rollSeat(seat, 700 + order * 1100));
  }, [mode]);

  const rivalsDone = seatFaces[1] > 0 && seatFaces[2] > 0 && seatFaces[3] > 0 && !seatRolling.some(Boolean);
  const dealerRoll = seatFaces[0] > 0 && !seatRolling[0] ? seatFaces[0] : null;
  const replay = () => {
    clearTimers();
    setSeatFaces([0, 0, 0, 0]);
    setSeatRolling([false, false, false, false]);
    [1, 2, 3].forEach((seat, order) => rollSeat(seat, 500 + order * 1100));
  };

  const done = mode === 'dealer' ? dealerRoll !== null : mode === 'compass' ? compassOn && plateOn : rolled !== null && counted >= (rolled ?? 99);
  useEffect(() => { onStatus?.({ compass: compassOn, plate: plateOn, rolled, dealerRoll, done }); }, [compassOn, plateOn, rolled, dealerRoll, done, onStatus]);
  useEffect(() => clearTimers, []);

  const near = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode !== 'compass') return;
    const point = unitsOf(event);
    if (!point) return;
    let item: Drag['item'] | null = null;
    if (!compassOn && near(point, compassAt) < COMPASS / 2) item = 'compass';
    else if (!plateOn && near(point, plateAt) < PLATE_W * 0.7) item = 'plate';
    if (!item) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const from = item === 'compass' ? compassAt : plateAt;
    drag.current = { item, dx: from.x - point.x, dy: from.y - point.y };
    setGrabbing(item);
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    const point = unitsOf(event);
    if (!current || !point) return;
    const next = { x: clamp(point.x + current.dx, 4, 96), y: clamp(point.y + current.dy, 4, BOARD_H - 4) };
    if (current.item === 'compass') setCompassAt(next); else setPlateAt(next);
    setHot(near(next, current.item === 'compass' ? CENTER : PLATE_TARGET) < SNAP ? current.item : null);
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
    clearTimers();
    setRolling(true);
    setRolled(null);
    setCounted(0);
    const stop = window.setTimeout(() => {
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
    }, 1100);
    timers.current.push(stop);
  };

  const press = (action: () => void) => (event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); }
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

  const header = mode === 'dealer' ? t('Cada jugador lanza un dado', 'Each player rolls one die', 'Cada jogador lança um dado') : mode === 'compass' ? t('Los cuatro muros ya están armados', 'The four walls are built', 'Os quatro muros estão montados') : t('Los dados deciden dónde se abre', 'The dice decide where it opens', 'Os dados decidem onde abre');

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-${mode}${grabbing ? ' is-grabbing' : ''}${done ? ' is-sorted' : ''}`}>
        <IsoWorld planeRef={planeRef} handlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }}>
          {tiles.map(({ index, pose, counting, open }) => (
            <TileBox
              key={index}
              className={`is-static${counting ? ' is-counting' : ''}${open ? ' is-open-side' : ''}`}
              style={{ width: `${TILE_W}%`, left: `${pose.x}%`, top: `${(pose.y / BOARD_H) * 100}%`, transform: tileTransform(pose) }}
            />
          ))}

          {mode === 'compass' && (
            <>
              {!compassOn && <i className={`table-target is-compass${hot === 'compass' ? ' is-hot' : ''}`} style={{ ...at(CENTER, 0.05), width: `${COMPASS + 2}%` }} />}
              {!plateOn && <i className={`table-target is-plate${hot === 'plate' ? ' is-hot' : ''}`} style={{ ...at(PLATE_TARGET, 0.05), width: `${PLATE_W + 2}%`, aspectRatio: `${PLATE_W + 2} / ${PLATE_H + 2}` }} />}
              {!compassOn && <span className="deck-hint" style={{ left: `${COMPASS_TRAY.x}%`, top: `${COMPASS_TRAY.y - 13}%`, transform: billboard('-50%, -50%', 6) }}>{t('El compass', 'The compass', 'O compass')} → {t('al centro', 'to the centre', 'ao centro')}</span>}
              {!plateOn && <span className="deck-hint" style={{ left: `${PLATE_TRAY.x - 10}%`, top: `${PLATE_TRAY.y + 8}%`, transform: billboard('-50%, -50%', 4) }}>{t('Viento de ronda', 'Round wind', 'Vento da rodada')}</span>}
              {compassOn && !plateOn && <span className="deck-hint" style={{ left: `${PLATE_TARGET.x - 6}%`, top: `${PLATE_TARGET.y - 9}%`, transform: billboard('-50%, -50%', 4) }}>{t('A la derecha del dealer', 'Right of the dealer', 'À direita do dealer')} ↓</span>}
            </>
          )}

          {mode !== 'dealer' && (
            <>
              <Box
                className={`table-compass${grabbing === 'compass' ? ' is-dragging' : ''}`}
                style={{ ...at(compassAt, grabbing === 'compass' ? 3 : 0), width: `${COMPASS}%`, aspectRatio: '1' }}
              >
                <span className="compass-face">
                  <i className="compass-core" />
                  <b className="cw cw-e">東</b>
                  <b className="cw cw-s">南</b>
                  <b className="cw cw-w">西</b>
                  <b className="cw cw-n">北</b>
                </span>
              </Box>
              <Box
                className={`table-plate${grabbing === 'plate' ? ' is-dragging' : ''}`}
                style={{ ...at(plateAt, grabbing === 'plate' ? 3 : 0), width: `${PLATE_W}%`, aspectRatio: `${PLATE_W} / ${PLATE_H}` }}
              >
                <b>東</b>
              </Box>
            </>
          )}

          {mode !== 'dealer' && compassOn && WIND_TAGS.map((tag) => (
            <span key={tag.wind} className="deck-wind" style={{ left: `${tag.x}%`, top: `${tag.y}%`, transform: billboard('-50%, -50%', 3) }}>
              <b>{tag.glyph}</b> {WIND_NAME[language][tag.index]}
            </span>
          ))}

          {mode === 'dealer' && SEAT_AT.map((point, seat) => {
            const value = seatFaces[seat];
            const winner = dealerRoll !== null && seat === 0;
            const rollMine = () => { if (rivalsDone && !seatRolling[0] && dealerRoll === null) rollSeat(0, 0); };
            return (
              <span key={seat} className={`table-seat${winner ? ' is-winner' : ''}${seat === 0 && rivalsDone && dealerRoll === null ? ' is-ready' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                <span
                  className="table-seat-die"
                  role={seat === 0 ? 'button' : undefined}
                  tabIndex={seat === 0 ? 0 : undefined}
                  aria-label={seat === 0 ? t('Lanzar mi dado', 'Roll my die', 'Lançar meu dado') : undefined}
                  onClick={seat === 0 ? rollMine : undefined}
                  onKeyDown={seat === 0 ? press(rollMine) : undefined}
                >
                  <Die3D value={value} rolling={seatRolling[seat]} yaw={(seat - 1.5) * 24} size={4.6} />
                </span>
                <span className="table-seat-label" style={{ transform: billboard('-50%, 0', 2) }}>
                  {SEAT_NAME[language][seat]}{value > 0 && !seatRolling[seat] ? ` · ${value}` : ''}
                  {winner && <b>{t('¡Dealer!', 'Dealer!', 'Dealer!')}</b>}
                </span>
              </span>
            );
          })}

          {mode === 'dice' && (
            <>
              <span
                className="table-dice"
                role="button"
                tabIndex={0}
                aria-label={t('Lanzar los dados', 'Roll the dice', 'Lançar os dados')}
                onClick={roll}
                onKeyDown={press(roll)}
                style={{ left: `${CENTER.x}%`, top: `${CENTER.y + 24}%` }}
              >
                <span className="table-dice-one" style={{ left: '-5%' }}><Die3D value={faces[0]} rolling={rolling} yaw={-14} size={4.6} /></span>
                <span className="table-dice-one" style={{ left: '5%' }}><Die3D value={faces[1]} rolling={rolling} yaw={18} size={4.6} /></span>
              </span>
              {cut && <i className="table-cut" style={{ left: `${cut.x}%`, top: `${cut.y}%`, height: '8%', transform: `translate3d(-50%, -50%, calc(var(--u) * 4)) rotate(${cut.rot}deg)` }} />}
            </>
          )}
        </IsoWorld>

        <p className="deck-caption">{header}</p>

        <div className="sort-actions deck-actions">
          {mode === 'dealer' ? (
            <>
              <span>{dealerRoll === null ? (rivalsDone ? t('Te toca', 'Your turn', 'Sua vez') : t('Lanzan los rivales…', 'Rivals are rolling…', 'Os rivais lançam…')) : t('Mayor: 6', 'Highest: 6', 'Maior: 6')}</span>
              {dealerRoll === null
                ? <button type="button" className="sort-button is-primary" onClick={() => rivalsDone && !seatRolling[0] && rollSeat(0, 0)} disabled={!rivalsDone || seatRolling[0]}>{t('Lanzar mi dado', 'Roll my die', 'Lançar meu dado')}</button>
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

        {mode === 'dealer' && dealerRoll !== null && (
          <p className="sort-win is-top" role="status">
            <b>{t('¡Sacaste 6, el más alto: eres el dealer!', 'You rolled a 6, the highest: you are the dealer!', 'Você tirou 6, o mais alto: é o dealer!')}</b>
            <span>{t('El dealer toma el asiento Este y juega primero.', 'The dealer takes the East seat and plays first.', 'O dealer fica no assento Leste e joga primeiro.')}</span>
          </p>
        )}
        {mode === 'dice' && rolled !== null && openSide !== null && counted >= rolled && (
          <p className="sort-win is-top" role="status">
            <b>{t(`Suma ${rolled}: se abre el muro de ${SIDE_LABEL.es[openSide]}`, `Total ${rolled}: the wall of ${SIDE_LABEL.en[openSide]} opens`, `Soma ${rolled}: abre o muro de ${SIDE_LABEL.pt[openSide]}`)}</b>
            <span>{t(`Se cuentan ${rolled} pilas desde la derecha de ese muro y ahí se corta.`, `Count ${rolled} stacks from the right end of that wall and cut there.`, `Contam-se ${rolled} pilhas a partir da direita desse muro e corta-se ali.`)}</span>
          </p>
        )}
        {mode === 'compass' && done && (
          <p className="sort-win is-top" role="status">
            <b>{t('Tú eres el dealer: Este', 'You are the dealer: East', 'Você é o dealer: Leste')}</b>
            <span>{t('A tu derecha, Sur · enfrente, Oeste · a tu izquierda, Norte.', 'On your right, South · across, West · on your left, North.', 'À sua direita, Sul · em frente, Oeste · à sua esquerda, Norte.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
