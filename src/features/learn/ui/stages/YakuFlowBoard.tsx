import { useCallback, useEffect, useRef, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { FLOW_SCRIPTS, type Act } from '../../domain/yakuFlowScripts';
import { FIRST_DEAD, OUT, ROT, around, dealAssignments, drawOrder, gAt, handSlot } from './DealBoard';
import { DEALT, HAND_VIEW, HAND_Y, WIDE_VIEW, WIDTH, byKey, handX, pondPos, sleep, wallPos, type Fly, type Piece } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { drawStick } from './YakuBoard';
import { FELT_Z, IsoCanvas, picture, type IsoHandle, type Painter } from './iso3d';

const PRE_TAKEN = 12;
const PRE_PONDS = [['9s', '2p'], ['4z', '8s'], ['3z', '7p']];
const LIVE_END = 122; // tiles 0..121 make up the live wall; the rest is the dead wall
const FLIGHT = 650;

type Pond = { code: string; side?: boolean };
let nextId = 2000;

/** Plays a scripted game on the 3D table, with the whole hand in view, to show how a yaku happens. */
export function YakuFlowBoard({ flowId, language, replayLabel }: { flowId: string; language: TutorialLanguage; replayLabel: string }) {
  const script = FLOW_SCRIPTS[flowId];
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const order = useRef(drawOrder());
  const [hand, setHand] = useState<Piece[]>([]);
  const [extra, setExtra] = useState<Piece | null>(null);
  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [myPond, setMyPond] = useState<Pond[]>([]);
  const [ponds, setPonds] = useState<string[][]>(PRE_PONDS);
  const [meld, setMeld] = useState<{ codes: string[]; slots: number } | null>(null);
  const [rivalMeld, setRivalMeld] = useState<{ who: number; codes: string[] } | null>(null);
  const [stick, setStick] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [mark, setMark] = useState<number | null>(null);
  const [view, setView] = useState<'hand' | 'wide'>('hand');
  const [shout, setShout] = useState<{ text: string; bad: boolean } | null>(null);
  const [wallLeft, setWallLeft] = useState<number | null>(null);
  const [holding, setHolding] = useState<boolean[]>([false, false, false]);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const [run, setRun] = useState(0);
  const flights = useRef<Fly[]>([]);
  const motion = useRef<{ from: { x: number; y: number }; to: { x: number; y: number }; start: number; dur: number } | null>(null);
  const shown = useRef<Map<number, number>>(new Map());
  const revealT = useRef(0);
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 });
  const lastFrame = useRef(0);
  const alive = useRef(0);

  const fly = useCallback((entry: Omit<Fly, 'start'>) => {
    flights.current = [...flights.current.filter((f) => f.key !== entry.key), { ...entry, start: performance.now() }];
    scene.current?.invalidate();
    window.setTimeout(() => { flights.current = flights.current.filter((f) => f.key !== entry.key); scene.current?.invalidate(); }, entry.dur + 50);
  }, []);

  const play = useCallback(async () => {
    const id = ++alive.current;
    const live = () => alive.current === id;
    const wait = async (ms: number) => { await sleep(ms); return live(); };
    const o = order.current;
    let next = DEALT + PRE_TAKEN;
    let h: Piece[] = script.hand.map((code, i) => ({ id: 100 + i, code })).sort(byKey);
    let ex: Piece | null = null;
    let myMeld: { codes: string[]; slots: number } | null = null;
    let mine: Pond[] = [];
    const rivals = PRE_PONDS.map((l) => [...l]);
    flights.current = [];
    shown.current.clear();
    revealT.current = 0;
    setHand(h); setExtra(null); setMyPond([]); setPonds(PRE_PONDS.map((l) => [...l])); setMeld(null); setRivalMeld(null);
    setStick(false); setReveal(false); setMark(null); setShout(null); setWallLeft(null); setHolding([false, false, false]); setNote(null);
    setTaken(new Set(o.slice(DEALT, DEALT + PRE_TAKEN)));
    setView('hand');
    motion.current = null;

    const goal = () => {
      const n = h.length;
      if (myMeld) return groupX(myMeld.slots, myMeld.codes.length) + (n + 0.5) * WIDTH + 1.2;
      return handX(n - 1, n + 1) - WIDTH * 0.95 + WIDTH * 1.9;
    };
    const takeTile = (tile: number) => setTaken((now) => new Set(now).add(tile));
    const lastRivalTile = { who: 0, slot: 0 };

    for (const act of script.acts as Act[]) {
      if (!live()) return;
      switch (act.k) {
        case 'say': {
          setShout(null);
          setNote({ title: act.title[language], body: act.body[language] });
          if (!(await wait(act.ms ?? 5200))) return;
          break;
        }
        case 'view': { setView(act.v); if (!(await wait(900))) return; break; }
        case 'wall': {
          const keepFrom = LIVE_END - act.left;
          setTaken(new Set(o.slice(DEALT, keepFrom)));
          next = keepFrom;
          setWallLeft(act.left);
          if (!(await wait(600))) return;
          break;
        }
        case 'rival': {
          const slot = handSlot(act.who, 13, true);
          const to = pondPos(act.who, rivals[act.who - 1].length);
          if (act.fromWall !== false) {
            const tile = o[next]; next += 1;
            takeTile(tile);
            fly({ key: `d${tile}`, from: wallPos(tile), to: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, dur: 600, faceUp: false });
            if (!(await wait(650))) return;
          }
          setHolding((now) => now.map((v, i) => (i === act.who - 1 ? true : v)));
          if (!(await wait(250))) return;
          setHolding((now) => now.map((v, i) => (i === act.who - 1 ? false : v)));
          fly({ key: `t${act.who}-${rivals[act.who - 1].length}`, code: act.tile, from: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, to, dur: 550, faceUp: true });
          if (!(await wait(600))) return;
          rivals[act.who - 1].push(act.tile);
          setPonds(rivals.map((l) => [...l]));
          lastRivalTile.who = act.who; lastRivalTile.slot = rivals[act.who - 1].length - 1;
          break;
        }
        case 'draw': {
          const tile = o[next]; next += 1;
          setMark(tile);
          if (!(await wait(1500))) return;
          setMark(null);
          takeTile(tile);
          fly({ key: `m${tile}`, from: wallPos(tile), to: { x: goal(), y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1000, faceUp: false });
          if (!(await wait(950))) return;
          setView('hand');
          if (!(await wait(250))) return;
          ex = { id: nextId += 1, code: act.tile };
          setExtra(ex);
          if (!(await wait(900))) return;
          break;
        }
        case 'throw': {
          if (!ex) break;
          const from = shown.current.get(ex.id) ?? goal();
          fly({ key: `mt${ex.id}`, code: ex.code, from: { x: from, y: HAND_Y, z: FELT_Z + 1, rot: 0 }, to: pondPos(0, mine.length), dur: FLIGHT, faceUp: true });
          const code = ex.code; ex = null; setExtra(null);
          if (!(await wait(FLIGHT + 50))) return;
          mine = [...mine, { code }]; setMyPond(mine);
          break;
        }
        case 'riichi': {
          if (!ex) break;
          const from = shown.current.get(ex.id) ?? goal();
          const slotAt = pondPos(0, mine.length);
          fly({ key: `mt${ex.id}`, code: ex.code, from: { x: from, y: HAND_Y, z: FELT_Z + 1, rot: 0 }, to: { ...slotAt, x: slotAt.x + 0.6, rot: 90 }, dur: 900, faceUp: true });
          const code = ex.code; ex = null; setExtra(null);
          if (!(await wait(950))) return;
          mine = [...mine, { code, side: true }]; setMyPond(mine);
          motion.current = { from: { x: 50, y: 88 }, to: { x: 50, y: 60.6 }, start: performance.now(), dur: 900 };
          if (!(await wait(950))) return;
          motion.current = null; setStick(true);
          if (!(await wait(900))) return;
          break;
        }
        case 'shout': {
          setShout({ text: act.text, bad: !!act.bad });
          if (!(await wait(2600))) return;
          break;
        }
        case 'kanOwn': {
          if (!ex) break;
          const rest = [...h];
          let removed = 0;
          h = rest.filter((p) => { if (p.code === act.tile && removed < 3) { removed += 1; return false; } return true; });
          const slots = h.length + 1;
          const codes = [act.tile, act.tile, act.tile, act.tile];
          const from = shown.current.get(ex.id) ?? goal();
          const base = groupX(slots, codes.length) + slots * WIDTH + 3;
          codes.forEach((code, i) => fly({ key: `k${i}`, code, from: { x: from, y: HAND_Y, z: FELT_Z + 2, rot: 0 }, to: { x: base + 1.8 + i * WIDTH, y: 95.4, z: FELT_Z, rot: 0 }, dur: 1100, faceUp: true }));
          ex = null; setExtra(null); setHand(h);
          if (!(await wait(1150))) return;
          myMeld = { codes, slots }; setMeld(myMeld);
          break;
        }
        case 'dead': {
          const rin = gAt(FIRST_DEAD);
          const tile = rin.side * 34 + 17 + rin.stack;
          const home = wallPos(tile); const out = OUT[rin.side];
          setMark(tile);
          setView('wide');
          if (!(await wait(2600))) return;
          setMark(null); takeTile(tile);
          fly({ key: 'dead', from: { x: home.x + out[0] * 3.4, y: home.y + out[1] * 3.4, z: FELT_Z + 4, rot: home.rot }, to: { x: goal(), y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1200, faceUp: false });
          if (!(await wait(1250))) return;
          setView('hand');
          if (!(await wait(250))) return;
          ex = { id: nextId += 1, code: act.tile };
          setExtra(ex);
          if (!(await wait(800))) return;
          break;
        }
        case 'rivalPon': {
          const codes = [act.tile, act.tile, act.tile];
          setRivalMeld({ who: act.who, codes });
          if (!(await wait(900))) return;
          break;
        }
        case 'robKan': {
          const slot = handSlot(act.who, 13, true);
          const tile = o[next]; next += 1;
          takeTile(tile);
          fly({ key: `d${tile}`, from: wallPos(tile), to: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, dur: 650, faceUp: false });
          if (!(await wait(700))) return;
          const spot = meldSpot(act.who, 3);
          fly({ key: 'kanAdd', code: act.tile, from: { x: slot.x, y: slot.y, z: FELT_Z + 3, rot: slot.rot }, to: { x: spot.x, y: spot.y, z: FELT_Z, rot: spot.rot }, dur: 700, faceUp: true });
          if (!(await wait(750))) return;
          setRivalMeld({ who: act.who, codes: [act.tile, act.tile, act.tile, act.tile] });
          break;
        }
        case 'claim': {
          let from;
          if (act.from === 'pond') {
            const at = pondPos(act.who, lastRivalTile.slot);
            setPonds((now) => now.map((l, i) => (i === act.who - 1 ? l.slice(0, -1) : l)));
            rivals[act.who - 1] = rivals[act.who - 1].slice(0, -1);
            from = { ...at, z: FELT_Z };
          } else {
            const spot = meldSpot(act.who, 3);
            setRivalMeld({ who: act.who, codes: [act.tile, act.tile, act.tile] });
            from = { x: spot.x, y: spot.y, z: FELT_Z, rot: spot.rot };
          }
          setView('hand');
          fly({ key: 'claim', code: act.tile, from, to: { x: goal(), y: HAND_Y, z: FELT_Z + 3, rot: 0 }, dur: 1200, faceUp: true });
          if (!(await wait(1150))) return;
          ex = { id: nextId += 1, code: act.tile };
          setExtra(ex);
          if (!(await wait(900))) return;
          break;
        }
        case 'reveal': {
          if (act.merge && ex) { h = [...h, ex].sort(byKey); ex = null; setHand(h); setExtra(null); }
          setReveal(true);
          setShout(null);
          if (!(await wait(1500))) return;
          break;
        }
        default: break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId, language, fly]);

  useEffect(() => { void play(); return () => { alive.current += 1; }; }, [play, run]);

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
    const face = (code: string) => picture(`${p.faces}/${code}.svg`);

    myPond.forEach((tile, slot) => {
      const at = pondPos(0, slot);
      g.tile(at.x + (tile.side ? 0.6 : 0), at.y, tile.side ? 90 : 0, FELT_Z, { flip: 1, face: face(tile.code) });
    });
    ponds.forEach((list, i) => list.forEach((code, slot) => { const at = pondPos(i + 1, slot); g.tile(at.x, at.y, at.rot, FELT_Z, { flip: 1, face: face(code) }); }));
    if (rivalMeld) rivalMeld.codes.forEach((code, i) => { const spot = meldSpot(rivalMeld.who, i); g.tile(spot.x, spot.y, spot.rot, FELT_Z, { flip: 1, face: face(code) }); });
    if (stick) drawStick(g, 50, 60.6, 1.4);
    if (motion.current) {
      const m = motion.current;
      const k = Math.min(1, (performance.now() - m.start) / m.dur);
      const e = k * k * (3 - 2 * k);
      drawStick(g, m.from.x + (m.to.x - m.from.x) * e, m.from.y + (m.to.y - m.from.y) * e, 1.4 + Math.sin(k * Math.PI) * 7);
      if (k < 1) g.needsFrame = true;
    }
    holding.forEach((on, i) => { if (!on) return; const slot = handSlot(i + 1, 13, true); g.standTile(slot.x, slot.y, slot.rot, 90, { joined: true, capLeft: true, capRight: true }); });
    if (meld) {
      const base = groupX(meld.slots, meld.codes.length) + meld.slots * WIDTH + 3;
      meld.codes.forEach((code, i) => g.tile(base + 1.8 + i * WIDTH, 95.4, 0, FELT_Z, { flip: 1, face: face(code) }));
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
    revealT.current += ((reveal ? 1 : 0) - revealT.current) * (1 - Math.exp(-dt / 260));
    if (Math.abs((reveal ? 1 : 0) - revealT.current) > 0.01) g.needsFrame = true;
    const phi = 90 + 90 * revealT.current;
    const base = meld ? groupX(meld.slots, meld.codes.length) : 0;
    const total = hand.length + (extra ? 1 : 0);
    const spotX = (i: number) => (meld ? base + (i + 0.5) * WIDTH : handX(i, total) - (extra ? WIDTH * 0.95 : 0));
    const place = (piece: Piece, goalX: number) => {
      const cur = shown.current.get(piece.id) ?? goalX;
      const x = cur + (goalX - cur) * slide;
      if (Math.abs(goalX - x) > 0.03) moving = true;
      shown.current.set(piece.id, x);
      g.standTile(x, HAND_Y, 0, phi, { face: face(piece.code), joined: !reveal, order: HAND_Y * 100 + 50 });
    };
    hand.forEach((piece, i) => place(piece, spotX(i)));
    if (extra) place(extra, meld ? spotX(hand.length) + 1.2 : handX(hand.length - 1, total) - WIDTH * 0.95 + WIDTH * 1.9);
    if (moving) g.needsFrame = true;
    g.flush();

    if (wallLeft !== null) g.pill(g.W / 2, 22, `${{ es: 'Muro', en: 'Wall', pt: 'Muro' }[language]}: ${wallLeft}`, { bg: p.gold, fg: p.ink, size: 13, border: p.ink });
    if (mark !== null) {
      const at = wallPos(mark);
      const pos = g.project(at.x, at.y, FELT_Z + 9);
      g.pill(pos.x, pos.y, { es: 'Robas de aquí', en: 'You draw from here', pt: 'Você compra daqui' }[language], { bg: p.gold, fg: p.ink, size: 12, border: p.ink });
    }
  };

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-hand is-draw is-yaku${reveal ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} />
        <div className="sort-actions deck-actions">
          <button type="button" className="sort-button" onClick={() => setRun((n) => n + 1)}>↻ {replayLabel}</button>
        </div>
        {shout && (
          <div className="win-shout" key={shout.text} role="status">
            <span className="win-cat" aria-hidden="true">🐱</span>
            <b>{shout.text}!</b>
          </div>
        )}
        <p className={`sort-win is-top${reveal ? '' : ' is-note'}`} role="status">
          <b>{note?.title}</b>
          <span>{note?.body}</span>
        </p>
      </div>
    </div>
  );
}

/** Hand and meld sit side by side, centred as one group. */
const groupX = (slots: number, count: number) => 50 - (slots * WIDTH + 3 + count * WIDTH + 1.2) / 2;

/** Where a rival's open meld lies, next to their hand edge. */
const meldSpot = (player: number, index: number) => {
  const at = around({ x: 76 + index * WIDTH, y: 96.5 }, player);
  return { x: at.x, y: at.y, rot: ROT[player] };
};
