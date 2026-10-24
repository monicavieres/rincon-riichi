import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { clamp, wallSlot } from './DeckBoard';
import { FELT_Z, IsoCanvas, TILE_T, mix, picture, shade, type IsoHandle, type Painter } from './iso3d';

const ROW = 17;
const CENTER = { x: 50, y: 50 };
const COMPASS = 24;
const COMPASS_TRAY = { x: 14, y: 86 };
/** The wind plate stands against the table edge, to the right of the first dealer (bottom of the board). */
const PLATE_TARGET = { x: 89, y: 90 };
const PLATE_TRAY = { x: 89, y: 10 };
const PLATE_W = 8;
const PLATE_H = 5.8;
const SNAP = 9;
const SURFACE = FELT_Z + TILE_T;

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
  { glyph: '東', index: 0, x: 50, y: 96 },
  { glyph: '南', index: 1, x: 96, y: 50 },
  { glyph: '西', index: 2, x: 50, y: 4 },
  { glyph: '北', index: 3, x: 4, y: 50 },
];
const WIND_NAME = {
  es: ['Este · tú, el dealer', 'Sur · a tu derecha', 'Oeste · enfrente', 'Norte · a tu izquierda'],
  en: ['East · you, the dealer', 'South · on your right', 'West · across', 'North · on your left'],
  pt: ['Leste · você, o dealer', 'Sul · à sua direita', 'Oeste · em frente', 'Norte · à sua esquerda'],
};

type Drag = { item: 'compass' | 'plate'; dx: number; dy: number };
type Spot = { x: number; y: number };

/**
 * The four finished walls on the table. "dealer": each player rolls a die; "compass": the player drags the compass to
 * the centre and the round-wind plate to the edge; "dice": two dice open the wall.
 */
export function TableTopBoard({ mode, language, onStatus }: { mode: 'dealer' | 'compass' | 'dice'; language: TutorialLanguage; onStatus?: (status: TableTopStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const drag = useRef<Drag | null>(null);
  const [compassAt, setCompassAt] = useState<Spot>(mode === 'compass' ? COMPASS_TRAY : CENTER);
  const [plateAt, setPlateAt] = useState<Spot>(mode === 'compass' ? PLATE_TRAY : PLATE_TARGET);
  const shown = useRef({ compass: { ...(mode === 'compass' ? COMPASS_TRAY : CENTER) }, plate: { ...(mode === 'compass' ? PLATE_TRAY : PLATE_TARGET) } });
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
  const spinStart = useRef(0);

  const clearTimers = () => { timers.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id); }); timers.current = []; };

  const rollSeat = (seat: number, delay: number) => {
    const start = window.setTimeout(() => {
      spinStart.current = performance.now();
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

  const near = (a: Spot, b: Spot) => Math.hypot(a.x - b.x, a.y - b.y);
  const at = (event: ReactPointerEvent<HTMLCanvasElement>) => scene.current!.unproject(event, SURFACE);

  const onDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = at(event);
    if (mode === 'dealer') {
      if (rivalsDone && !seatRolling[0] && dealerRoll === null && near(point, SEAT_AT[0]) < 7) rollSeat(0, 0);
      return;
    }
    if (mode === 'dice') {
      if (near(point, { x: CENTER.x, y: CENTER.y + 24 }) < 10) roll();
      return;
    }
    let item: Drag['item'] | null = null;
    if (!compassOn && near(point, compassAt) < COMPASS / 2) item = 'compass';
    else if (!plateOn && near(point, plateAt) < PLATE_W * 0.7) item = 'plate';
    if (!item) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const from = item === 'compass' ? compassAt : plateAt;
    drag.current = { item, dx: from.x - point.x, dy: from.y - point.y };
    setGrabbing(item);
  };

  const onMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const current = drag.current;
    if (!current) return;
    const point = at(event);
    const next = { x: clamp(point.x + current.dx, 4, 96), y: clamp(point.y + current.dy, 4, 96) };
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
    spinStart.current = performance.now();
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

  const header = mode === 'dealer' ? t('Cada jugador lanza un dado', 'Each player rolls one die', 'Cada jogador lança um dado') : mode === 'compass' ? t('Los cuatro muros ya están armados', 'The four walls are built', 'Os quatro muros estão montados') : t('Los dados deciden dónde se abre', 'The dice decide where it opens', 'Os dados decidem onde abre');

  const draw = (g: Painter) => {
    const { palette: p, ctx } = g;
    // the four finished walls
    for (let index = 0; index < 136; index += 1) {
      const side = Math.floor(index / 34);
      const k = index % 34;
      const stack = k % ROW;
      const pose = wallSlot(side, stack, k < ROW ? 0 : 1);
      g.tile(pose.x, pose.y, pose.rot, FELT_Z + (pose.h ?? 0) * TILE_T, { counting: openSide === side && stack >= ROW - counted });
    }

    // goals while the player is placing pieces
    if (mode === 'compass') {
      if (!compassOn) g.ghost(CENTER.x, CENTER.y, 0, FELT_Z, { next: true, hot: hot === 'compass', w: COMPASS + 2, l: COMPASS + 2 });
      if (!plateOn) g.ghost(PLATE_TARGET.x, PLATE_TARGET.y, 0, FELT_Z, { next: true, hot: hot === 'plate', w: PLATE_W + 2, l: PLATE_H + 2 });
    }

    // compass and plate ease toward where they belong
    let moving = false;
    (['compass', 'plate'] as const).forEach((item) => {
      const goal = item === 'compass' ? compassAt : plateAt;
      const cur = shown.current[item];
      const ease = grabbing === item ? 1 : 0.22;
      cur.x += (goal.x - cur.x) * ease;
      cur.y += (goal.y - cur.y) * ease;
      if (Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) > 0.05) moving = true;
    });
    if (moving) g.needsFrame = true;

    if (mode !== 'dealer') {
      const c = shown.current.compass;
      const lift = grabbing === 'compass' ? 3 : 0;
      g.add(c.y * 100 + 50, () => {
        const box = g.box(c.x, c.y, FELT_Z + lift, COMPASS, COMPASS, 3, 0);
        box.sides.forEach((face) => g.poly(face.q, shade(mix(p.back, '#000000', 0.55), 0.9 + 0.3 * (face.n[0] === 0 ? 0 : 0.2)), p.ink, g.lw * 1.3));
        g.poly(box.top, p.back, p.ink, g.lw * 1.5);
        const art = picture(p.compass);
        if (art) g.onQuad(box.top, () => ctx.drawImage(art, -0.08, -0.08, 1.16, 1.16));
      });
      const pl = shown.current.plate;
      const plLift = grabbing === 'plate' ? 3 : 0;
      g.add(pl.y * 100 + 60, () => {
        const box = g.box(pl.x, pl.y, FELT_Z + plLift, PLATE_W, PLATE_H, 2, 0);
        box.sides.forEach((face) => g.poly(face.q, shade('#e8742a', 0.78), p.ink, g.lw * 1.2));
        g.poly(box.top, '#f08a30', p.ink, g.lw * 1.4);
        g.onQuad(box.top, () => {
          ctx.save();
          ctx.scale(1 / PLATE_W, 1 / PLATE_H);
          ctx.fillStyle = '#fff6e5';
          ctx.font = `700 ${PLATE_H * 0.78}px 'Noto Serif JP', 'Hiragino Mincho ProN', serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('東', PLATE_W / 2, PLATE_H / 2 + 0.2);
          ctx.restore();
        });
      });
    }

    // dice
    const spin = (now: number) => (now - spinStart.current) / 60;
    if (mode === 'dealer') {
      SEAT_AT.forEach((seat, index) => {
        g.die(seat.x, seat.y, FELT_Z, 6.5, { up: seatFaces[index], yaw: (index - 1.5) * 24, spin: seatRolling[index] ? spin(g.now) : undefined });
      });
    }
    if (mode === 'dice') {
      const spinning = rolling ? spin(g.now) : undefined;
      g.die(CENTER.x - 6, CENTER.y + 24, FELT_Z, 6.5, { up: faces[0], yaw: -14, spin: spinning });
      g.die(CENTER.x + 6, CENTER.y + 24, FELT_Z, 6.5, { up: faces[1], yaw: 18, spin: spinning === undefined ? undefined : spinning + 7 });
      if (cut) {
        g.add(cut.y * 100 + 90, () => {
          const bar = g.box(cut.x, cut.y, FELT_Z + TILE_T * 2, 0.9, 7.5, 1.4, cut.rot);
          bar.sides.forEach((face) => g.poly(face.q, shade(p.gold, 0.8), p.ink, g.lw));
          g.poly(bar.top, p.gold, p.ink, g.lw * 1.3);
        });
      }
    }
    g.flush();

    // labels, always facing the viewer
    if (mode !== 'dealer' && compassOn) {
      WIND_TAGS.forEach((tag) => {
        const pos = g.project(tag.x, tag.y, FELT_Z + 3);
        g.pill(pos.x, pos.y, `${tag.glyph}  ${WIND_NAME[language][tag.index]}`, { bg: '#fff1c4', fg: p.ink, border: p.ink, size: 11 });
      });
    }
    if (mode === 'dealer') {
      SEAT_AT.forEach((seat, index) => {
        const pos = g.project(seat.x, seat.y + 6, FELT_Z + 2);
        const value = seatFaces[index];
        g.pill(pos.x, pos.y + 8, `${SEAT_NAME[language][index]}${value > 0 && !seatRolling[index] ? ` · ${value}` : ''}${dealerRoll !== null && index === 0 ? ` · ${t('¡Dealer!', 'Dealer!', 'Dealer!')}` : ''}`, {
          bg: dealerRoll !== null && index === 0 ? p.gold : 'rgba(10,20,20,0.62)', fg: dealerRoll !== null && index === 0 ? p.ink : '#fff', size: 10,
        });
      });
    }
    if (mode === 'compass') {
      if (!compassOn) {
        const pos = g.project(COMPASS_TRAY.x + 6, COMPASS_TRAY.y - 15, FELT_Z + 6);
        g.pill(pos.x, pos.y, `${t('El compass', 'The compass', 'O compass')} → ${t('al centro', 'to the centre', 'ao centro')}`);
      }
      if (!plateOn) {
        const pos = g.project(PLATE_TRAY.x - 4, PLATE_TRAY.y + 9, FELT_Z + 4);
        g.pill(pos.x, pos.y, t('Viento de ronda', 'Round wind', 'Vento da rodada'));
      } else if (compassOn) {
        // nothing more to place
      }
      if (compassOn && !plateOn) {
        const pos = g.project(PLATE_TARGET.x - 8, PLATE_TARGET.y - 9, FELT_Z + 4);
        g.pill(pos.x, pos.y, `${t('A la derecha del dealer', 'Right of the dealer', 'À direita do dealer')} ↓`);
      }
    }
  };

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-${mode}${grabbing ? ' is-grabbing' : ''}${done ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} handlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }} />

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
              <button type="button" className="sort-button is-primary" onClick={roll} onKeyDown={press(roll)} disabled={rolling}>{rolled === null ? t('Lanzar dados', 'Roll dice', 'Lançar dados') : t('Lanzar otra vez', 'Roll again', 'Lançar de novo')}</button>
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
