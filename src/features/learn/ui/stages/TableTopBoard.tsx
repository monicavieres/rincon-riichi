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
  const [phase, setPhase] = useState<'idle' | 'compass' | 'wall' | 'dead' | 'split' | 'dora' | 'done'>('idle');
  const [doraCount, setDoraCount] = useState(0);
  const [deadCount, setDeadCount] = useState(0);
  const flipStart = useRef(0);
  const splitStart = useRef(0);
  const viewNow = useRef({ u: 50, v: 50, zoom: 1 });
  const lastFrame = useRef(0);
  const timers = useRef<number[]>([]);
  const [seatFaces, setSeatFaces] = useState<number[]>([0, 0, 0, 0]);
  const [seatRolling, setSeatRolling] = useState<boolean[]>([false, false, false, false]);
  const spinStart = useRef(0);
  const dieMove = useRef({ from: { x: 50, y: 50 }, to: { x: 50, y: 50 }, start: 0 });
  const [dieShow, setDieShow] = useState(1);
  const [dieReady, setDieReady] = useState(false);

  const clearTimers = () => { timers.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id); }); timers.current = []; };

  const rollSeat = (seat: number, delay: number) => {
    const start = window.setTimeout(() => {
      spinStart.current = performance.now();
      setSeatRolling((now) => now.map((value, index) => (index === seat ? true : value)));
      const stop = window.setTimeout(() => {
        setDieShow(SEAT_ROLLS[seat]);
        setSeatFaces((now) => now.map((value, index) => (index === seat ? SEAT_ROLLS[seat] : value)));
        setSeatRolling((now) => now.map((value, index) => (index === seat ? false : value)));
      }, 900);
      timers.current.push(stop);
    }, delay);
    timers.current.push(start);
  };

  /** One die travels around the table: it goes to each rival, rolls there, and finally comes to you. */
  const runDie = (base: number) => {
    const later = (ms: number, action: () => void) => timers.current.push(window.setTimeout(action, ms));
    let at = base;
    [1, 2, 3].forEach((seat) => {
      later(at, () => { dieMove.current = { from: dieMove.current.to, to: SEAT_AT[seat], start: performance.now() }; scene.current?.invalidate(); });
      rollSeat(seat, at + 800);
      at += 800 + 900 + 700;
    });
    later(at, () => { dieMove.current = { from: dieMove.current.to, to: SEAT_AT[0], start: performance.now() }; scene.current?.invalidate(); });
    later(at + 800, () => setDieReady(true));
  };

  useEffect(() => {
    if (mode !== 'dealer') return;
    runDie(900);
  }, [mode]);

  const rivalsDone = dieReady && seatFaces[1] > 0 && seatFaces[2] > 0 && seatFaces[3] > 0 && !seatRolling.some(Boolean);
  const dealerRoll = seatFaces[0] > 0 && !seatRolling[0] ? seatFaces[0] : null;
  const replay = () => {
    clearTimers();
    setSeatFaces([0, 0, 0, 0]);
    setSeatRolling([false, false, false, false]);
    setDieReady(false);
    setDieShow(1);
    dieMove.current = { from: { x: 50, y: 50 }, to: { x: 50, y: 50 }, start: 0 };
    runDie(500);
  };

  const done = mode === 'dealer' ? dealerRoll !== null : mode === 'compass' ? compassOn && plateOn : phase === 'done';
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
    setPhase('idle');
    setDoraCount(0);
    setDeadCount(0);
    flipStart.current = 0;
    const later = (ms: number, action: () => void) => { timers.current.push(window.setTimeout(action, ms)); };
    later(1100, () => {
      const a = 1 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * 6);
      const total = a + b;
      setFaces([a, b]);
      setRolling(false);
      setRolled(total);
      // 1) zoom to the compass and light the number and its wind
      setPhase('compass');
      later(3000, () => {
        // 2) move to that player's wall and count the stacks from its right end
        setPhase('wall');
        let n = 0;
        const count = window.setInterval(() => {
          n += 1;
          setCounted(n);
          if (n >= total) {
            window.clearInterval(count);
            // 3) count seven stacks on from the break: that is where the dead wall ends
            later(1000, () => {
              setPhase('dead');
              let d = 0;
              const seven = window.setInterval(() => {
                d += 1;
                setDeadCount(d);
                if (d < 7) return;
                window.clearInterval(seven);
                // 4) cut at both ends and slide the dead wall apart
                later(1100, () => {
                  splitStart.current = performance.now();
                  setPhase('split');
                  // 5) count three stacks into the dead wall and turn the dora indicator face up
                  later(2300, () => {
                    setPhase('dora');
                    let c = 0;
                    const tally = window.setInterval(() => {
                      c += 1;
                      setDoraCount(c);
                      if (c < 3) return;
                      window.clearInterval(tally);
                      later(800, () => {
                        flipStart.current = performance.now();
                        later(2300, () => setPhase('done'));
                      });
                    }, 700);
                    timers.current.push(tally);
                  });
                });
              }, 380);
              timers.current.push(seven);
            });
          }
        }, 330);
        timers.current.push(count);
      });
    });
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

  /** Stacks are numbered around the loop starting at the opened wall's left end, so the dead wall can run on into the next wall. */
  const base = openSide ?? 0;
  const gAt = (G: number) => ({ side: (base + Math.floor(G / ROW)) % 4, stack: ((G % ROW) + ROW) % ROW });
  const firstDead = rolled === null ? 0 : ROW - rolled; // first stack right of the break
  const dead = new Set<string>();
  if (rolled !== null) for (let G = firstDead; G <= firstDead + 6; G += 1) { const at = gAt(G); dead.add(`${at.side}:${at.stack}`); }
  const OUT = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const ALONG = [[1, 0], [0, -1], [-1, 0], [0, 1]];
  const deadMid = (() => {
    if (openSide === null || rolled === null) return { x: 50, y: 50 };
    const list = [...dead].map((key) => key.split(':').map(Number)).map(([sd, st]) => wallSlot(sd, st, 0));
    const out = OUT[openSide];
    return { x: list.reduce((a, q) => a + q.x, 0) / list.length + out[0] * 3.4, y: list.reduce((a, q) => a + q.y, 0) / list.length + out[1] * 3.4 };
  })();
  // the dora indicator: the third stack from the break, its top tile turned face up
  const doraAt = gAt(firstDead + 2);
  const doraKey = openSide === null ? '' : `${doraAt.side}:${doraAt.stack}`;
  // the second cut, seven stacks on from the first
  const cut2 = rolled === null ? null : (() => {
    const a = gAt(firstDead + 6), b = gAt(firstDead + 7);
    const pa = wallSlot(a.side, a.stack, 0), pb = wallSlot(b.side, b.stack, 0);
    return { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2, rot: pa.rot };
  })();

  const draw = (g: Painter) => {
    const { palette: p, ctx } = g;

    // camera: zoom to the compass, then to the chosen wall, then back out
    const wallMid = openSide !== null ? wallSlot(openSide, 8, 0) : { x: 50, y: 50 };
    const target = mode === 'dealer' ? { u: 50, v: 54, zoom: 1.6 } : phase === 'compass' ? { u: 50, v: 50, zoom: 2.1 }
      : phase === 'wall' ? { u: wallMid.x, v: wallMid.y, zoom: 2 }
        : phase === 'dead' ? { u: deadMid.x - OUT[openSide ?? 0][0] * 3.4, v: deadMid.y - OUT[openSide ?? 0][1] * 3.4, zoom: 1.9 }
        : phase === 'split' ? { u: deadMid.x, v: deadMid.y, zoom: 1.5 }
          : phase === 'dora' ? { u: deadMid.x, v: deadMid.y, zoom: flipStart.current > 0 ? 2.9 : 2.2 }
            : { u: 50, v: 50, zoom: 1 };
    const v = viewNow.current;
    const dt = Math.min(200, g.now - lastFrame.current);
    lastFrame.current = g.now;
    const ease = 1 - Math.exp(-dt / 320); // time-based, so it looks the same at any frame rate
    v.u += (target.u - v.u) * ease;
    v.v += (target.v - v.v) * ease;
    v.zoom += (target.zoom - v.zoom) * ease;
    if (Math.abs(target.u - v.u) + Math.abs(target.v - v.v) + Math.abs(target.zoom - v.zoom) * 20 > 0.08) g.needsFrame = true;
    g.view = { ...v };
    g.table();

    // opening the wall: the dead wall slides outward, easing out
    const splitT = phase === 'split' ? Math.min(1, (g.now - splitStart.current) / 1600) : phase === 'dora' || phase === 'done' ? 1 : 0;
    const eased = 1 - Math.pow(1 - splitT, 3);
    if (phase === 'split' && splitT < 1) g.needsFrame = true;

    // the four finished walls
    let doraFx: { x: number; y: number; flipT: number; landT: number } | null = null;
    for (let index = 0; index < 136; index += 1) {
      const side = Math.floor(index / 34);
      const k = index % 34;
      const stack = k % ROW;
      const pose = wallSlot(side, stack, k < ROW ? 0 : 1);
      const G = ((side - base + 4) % 4) * ROW + stack;
      const isDead = dead.has(`${side}:${stack}`);
      let gold = false;
      if (phase === 'wall') gold = openSide === side && stack >= ROW - counted;
      else if (phase === 'dead') gold = G >= firstDead && G < firstDead + deadCount;
      else gold = splitT > 0 && isDead;
      // opening: the dead wall slides outward and the live wall eases away from both cuts
      let dx = 0;
      let dy = 0;
      if (rolled !== null && eased > 0) {
        if (isDead) { dx += OUT[side][0] * eased * 3.4; dy += OUT[side][1] * eased * 3.4; }
        else {
          const dist = G < firstDead ? firstDead - 1 - G : G - (firstDead + 7);
          const pull = Math.max(0, 1 - dist / 5) * eased * 1.8 * (G < firstDead ? -1 : 1);
          dx += ALONG[side][0] * pull;
          dy += ALONG[side][1] * pull;
        }
      }
      const isDora = k >= ROW && `${side}:${stack}` === doraKey;
      // the flip: lift with a little swing, turn over, then land with a bounce
      const flipT = isDora && flipStart.current > 0 ? Math.min(1, (g.now - flipStart.current) / 2000) : 0;
      const turnT = Math.min(1, flipT / 0.62);
      const flip = turnT < 0.5 ? 4 * turnT * turnT * turnT : 1 - Math.pow(-2 * turnT + 2, 3) / 2;
      const landT = flipT > 0.62 ? (flipT - 0.62) / 0.38 : 0;
      const hop = landT > 0 ? Math.abs(Math.sin(landT * Math.PI * 2)) * 2.2 * Math.exp(-3 * landT) : 0;
      const swing = flipT > 0 && flipT < 0.62 ? Math.sin(turnT * Math.PI) * 16 : 0;
      if (isDora && flipT > 0 && flipT < 1) g.needsFrame = true;
      if (isDora && flipT > 0) doraFx = { x: pose.x + dx, y: pose.y + dy, flipT, landT };
      g.tile(pose.x + dx, pose.y + dy, pose.rot + swing, FELT_Z + (pose.h ?? 0) * TILE_T + (isDead ? eased * 0.8 : 0), { gold, flip, hop, arc: 11, face: isDora ? picture(`${p.faces}/4p.svg`) : null, order: isDora && flipT > 0 ? 1e6 : undefined });
    }

    // dora reveal effects: spotlight, glow, shockwave ring and sparkles
    if (doraFx) {
      const { x, y, flipT, landT } = doraFx;
      const centre = g.project(x, y, FELT_Z + TILE_T);
      const spot = Math.min(1, flipT / 0.12) * (flipT > 0.9 ? Math.max(0, (1 - flipT) / 0.1) : 1);
      g.add(9.5e5, () => {
        const grad = ctx.createRadialGradient(centre.x, centre.y, g.W * 0.06, centre.x, centre.y, g.W * 0.42);
        grad.addColorStop(0, 'rgba(8,14,20,0)');
        grad.addColorStop(1, `rgba(8,14,20,${0.62 * spot})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, g.W, g.H);
      });
      g.add(9.6e5, () => {
        const pulse = 0.6 + 0.4 * Math.sin(g.now / 140);
        const glow = ctx.createRadialGradient(centre.x, centre.y + 6, 2, centre.x, centre.y + 6, g.W * 0.1);
        glow.addColorStop(0, `rgba(255,222,110,${0.75 * spot * pulse})`);
        glow.addColorStop(1, 'rgba(255,222,110,0)');
        ctx.save();
        ctx.translate(centre.x, centre.y + 8);
        ctx.scale(1, 0.55);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, g.W * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      if (landT > 0) {
        g.add(1.1e6, () => {
          // shockwave rings on the felt
          [0, 0.18].forEach((delay, ri) => {
            const q = Math.max(0, Math.min(1, (landT - delay) / 0.8));
            if (q <= 0 || q >= 1) return;
            const r = 2 + q * 15;
            const ring: Array<{ x: number; y: number }> = [];
            for (let a = 0; a < 36; a += 1) ring.push(g.project(x + Math.cos((a / 36) * Math.PI * 2) * r, y + Math.sin((a / 36) * Math.PI * 2) * r, FELT_Z + 0.3));
            g.poly(ring, null, `rgba(255,214,90,${(1 - q) * (ri ? 0.6 : 1)})`, g.lw * (3 - q * 2));
          });
          // sparkles bursting upward
          for (let n = 0; n < 16; n += 1) {
            const ang = (n * 2.399) % (Math.PI * 2);
            const q = Math.max(0, Math.min(1, landT * 1.2 - (n % 4) * 0.04));
            if (q <= 0 || q >= 1) continue;
            const reach = 4 + (n % 5) * 2.4;
            const at = g.project(x + Math.cos(ang) * reach * q, y + Math.sin(ang) * reach * q, FELT_Z + TILE_T + 2 + q * (6 + (n % 3) * 3) - q * q * 4);
            const size = (3 + (n % 3)) * (1 - q * 0.6);
            ctx.save();
            ctx.translate(at.x, at.y);
            ctx.rotate(q * 3 + n);
            ctx.fillStyle = `rgba(255,${210 + (n % 3) * 15},${110 + (n % 4) * 25},${1 - q})`;
            ctx.beginPath();
            for (let k = 0; k < 8; k += 1) {
              const rr = k % 2 ? size * 0.35 : size;
              const aa = (k / 8) * Math.PI * 2;
              ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        });
        g.needsFrame = true;
      }
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
        if (art) g.textured(art, c.x, c.y, COMPASS * 1.16, COMPASS * 1.16, 0, FELT_Z + lift + 3);
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
      // a single die, passed from player to player with a small hop
      const mv = dieMove.current;
      const q = mv.start === 0 ? 1 : Math.max(0, Math.min(1, (g.now - mv.start) / 800));
      const ease = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
      if (q < 1) g.needsFrame = true;
      const spinningNow = seatRolling.some(Boolean);
      g.die(mv.from.x + (mv.to.x - mv.from.x) * ease, mv.from.y + (mv.to.y - mv.from.y) * ease, FELT_Z + Math.sin(Math.PI * q) * 5, 4.4, { up: dieShow, yaw: 18, spin: spinningNow ? spin(g.now) : undefined, order: 7000 });
    }
    if (mode === 'dice') {
      const spinning = rolling ? spin(g.now) : undefined;
      g.die(CENTER.x - 6, CENTER.y + 24, FELT_Z, 6.5, { up: faces[0], yaw: -14, spin: spinning });
      g.die(CENTER.x + 6, CENTER.y + 24, FELT_Z, 6.5, { up: faces[1], yaw: 18, spin: spinning === undefined ? undefined : spinning + 7 });
      const bars = [phase !== 'idle' && phase !== 'compass' ? cut : null, ['dead', 'split', 'dora', 'done'].includes(phase) && (phase !== 'dead' || deadCount >= 7) ? cut2 : null];
      bars.forEach((bar0, bi) => {
        if (!bar0) return;
        g.add(bar0.y * 100 + 90 + bi, () => {
          const bar = g.box(bar0.x, bar0.y, FELT_Z + TILE_T * 2, 0.9, 7.5, 1.4, bar0.rot);
          bar.sides.forEach((face) => g.poly(face.q, shade(p.gold, 0.8), p.ink, g.lw));
          g.poly(bar.top, p.gold, p.ink, g.lw * 1.3);
        });
      });
    }
    g.flush();

    // compass phase: light the rolled number on the compass and its wind
    if (mode === 'dice' && openSide !== null && rolled !== null && phase === 'compass') {
      const sc = (COMPASS * 1.16) / 700;
      const at = [[350, 565], [560, 350], [350, 140], [140, 350]][openSide];
      const dir = [[1, 0], [0, -1], [-1, 0], [0, 1]][openSide];
      const idx = (rolled - (openSide + 1)) / 4;
      const off = (idx - 1) * 56;
      const cx = CENTER.x + (at[0] + dir[0] * off - 350) * sc;
      const cy = CENTER.y + (at[1] + dir[1] * off - 350) * sc;
      const horizontal = dir[0] !== 0;
      const pulse = 0.5 + 0.5 * Math.sin(g.now / 180);
      g.needsFrame = true;
      const zTop = FELT_Z + 3.15;
      g.poly(g.plane(cx - (horizontal ? 1.9 : 1.2), cy - (horizontal ? 1.2 : 1.9), cx + (horizontal ? 1.9 : 1.2), cy + (horizontal ? 1.2 : 1.9), 0.7, zTop), `rgba(255,214,90,${0.35 + pulse * 0.35})`, p.gold, g.lw * 2.4);
      g.pill(g.W / 2, 24, `${rolled}  →  ${WIND_NAME[language][openSide]}`, { bg: p.gold, fg: p.ink, size: 14 });
    }

    // wall phase: number each stack as it is counted from the right end
    if (mode === 'dice' && openSide !== null && phase === 'wall') {
      for (let i = 1; i <= counted; i += 1) {
        const pose = wallSlot(openSide, ROW - i, 0);
        const pos = g.project(pose.x, pose.y, FELT_Z + TILE_T * 2 + 3);
        g.pill(pos.x, pos.y, String(i), { bg: 'rgba(230,180,34,0.96)', fg: p.ink, size: 10 });
      }
    }

    // dead-wall phase: count seven stacks on from the break
    if (mode === 'dice' && openSide !== null && rolled !== null && phase === 'dead') {
      for (let i = 1; i <= deadCount; i += 1) {
        const at = gAt(firstDead + i - 1);
        const pose = wallSlot(at.side, at.stack, 0);
        const pos = g.project(pose.x, pose.y, FELT_Z + TILE_T * 2 + 3);
        g.pill(pos.x, pos.y, String(i), { bg: 'rgba(230,180,34,0.96)', fg: p.ink, size: 11 });
      }
      g.pill(g.W / 2, 24, t('7 pilas: el muro muerto', '7 stacks: the dead wall', '7 pilhas: o muro morto'), { bg: p.gold, fg: p.ink, size: 14 });
    }

    // dora phase: count three stacks in from the break
    if (mode === 'dice' && openSide !== null && rolled !== null && phase === 'dora') {
      const out = OUT[openSide];
      for (let i = 1; i <= doraCount; i += 1) {
        const at = gAt(firstDead + i - 1);
        const pose = wallSlot(at.side, at.stack, 0);
        const pos = g.project(pose.x + out[0] * 3.4, pose.y + out[1] * 3.4, FELT_Z + TILE_T * 2 + 3);
        g.pill(pos.x, pos.y, String(i), { bg: 'rgba(230,180,34,0.96)', fg: p.ink, size: 12 });
      }
      if (flipStart.current > 0) {
        const landed = (g.now - flipStart.current) / 2000 > 0.62;
        g.pill(g.W / 2, 24, landed ? t('Indicador 4 de círculos → la dora es el 5 de círculos', 'Indicator 4 of circles → the dora is the 5 of circles', 'Indicador 4 de círculos → a dora é o 5 de círculos') : t('Indicador de dora', 'Dora indicator', 'Indicador de dora'), { bg: p.gold, fg: p.ink, size: 14 });
      }
    }

    // after opening: name the dead wall and show where drawing starts
    if (mode === 'dice' && openSide !== null && rolled !== null && eased > 0.6 && phase !== 'dora') {
      const deadList = [...dead].map((key) => key.split(':').map(Number));
      const mid = deadList.map(([sd, st]) => wallSlot(sd, st, 0));
      const mx = mid.reduce((acc, q) => acc + q.x, 0) / mid.length;
      const my = mid.reduce((acc, q) => acc + q.y, 0) / mid.length;
      const out = OUT[openSide];
      const pos = g.project(mx - out[0] * 8, my - out[1] * 8, FELT_Z + TILE_T * 2 + 4);
      g.pill(pos.x, pos.y, t('Muro muerto · 14 fichas', 'Dead wall · 14 tiles', 'Muro morto · 14 peças'), { bg: p.gold, fg: p.ink, size: 12 });
      const live = wallSlot(openSide, Math.max(0, ROW - rolled - 1), 0);
      const lp = g.project(live.x - out[0] * 6, live.y - out[1] * 6, FELT_Z + TILE_T * 2 + 4);
      g.pill(lp.x, lp.y + 22, t('Se roba desde aquí ←', 'Drawing starts here ←', 'Compra-se daqui ←'), { bg: 'rgba(10,20,20,0.7)', size: 11 });
    }

    // labels, always facing the viewer
    if (mode !== 'dealer' && compassOn) {
      WIND_TAGS.forEach((tag) => {
        const pos = g.project(tag.x, tag.y, FELT_Z + 3);
        g.pill(pos.x, pos.y, `${tag.glyph}  ${WIND_NAME[language][tag.index]}`, { bg: mode === 'dice' && phase === 'compass' && openSide === tag.index ? p.gold : '#fff1c4', fg: p.ink, border: p.ink, size: 11 });
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
        {mode === 'dice' && rolled !== null && openSide !== null && phase === 'done' && (
          <p className="sort-win is-top" role="status">
            <b>{t(`Suma ${rolled}: se abre el muro de ${SIDE_LABEL.es[openSide]}`, `Total ${rolled}: the wall of ${SIDE_LABEL.en[openSide]} opens`, `Soma ${rolled}: abre o muro de ${SIDE_LABEL.pt[openSide]}`)}</b>
            <span>{t(`Se cuentan ${rolled} pilas desde la derecha y ahí se abre. Las 7 pilas a la derecha del corte son el muro muerto; en su 3ª pila se voltea la ficha de arriba: el indicador de dora.`, `Count ${rolled} stacks from the right and open there. The 7 stacks right of the cut are the dead wall; on its 3rd stack the top tile is flipped: the dora indicator.`, `Contam-se ${rolled} pilhas a partir da direita e abre-se ali. As 7 pilhas à direita do corte são o muro morto; na 3ª pilha vira-se a peça de cima: o indicador de dora.`)}</span>
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
