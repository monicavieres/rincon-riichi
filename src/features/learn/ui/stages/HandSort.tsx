import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { DEALT_HAND } from '../../domain/dealtHand';
import { wallSlot } from './DeckBoard';
import { ALONG, FIRST_DEAD, OPENED_SIDE, OUT, dealAssignments, gAt, handSlot } from './DealBoard';
import { FELT_Z, IsoCanvas, TILE_T, mix, picture, shade, type IsoHandle, type Painter } from './iso3d';

const ROW = 17;
const WIDTH = 3.6;
const HAND_Y = 94.4;
const HIT_Z = FELT_Z + 2.5;

type SuitId = 'man' | 'pin' | 'sou' | 'honor';
type Piece = { id: number; code: string };

export type HandSortStatus = { inRack: number; total: number; sorted: boolean };

const suitOf = (code: string): SuitId => ({ m: 'man', p: 'pin', s: 'sou', z: 'honor' } as const)[code[1] as 'm' | 'p' | 's' | 'z'];
const sortKey = (code: string) => ['man', 'pin', 'sou', 'honor'].indexOf(suitOf(code)) * 10 + (Number(code[0]) || 5);

/** Grouped when every suit sits together (in any order) and equal honors are side by side. */
function isGrouped(codes: string[]) {
  const together = (keyOf: (code: string) => string | null) => {
    const spots = new Map<string, number[]>();
    codes.forEach((code, i) => { const key = keyOf(code); if (key) spots.set(key, [...(spots.get(key) ?? []), i]); });
    return [...spots.values()].every((at) => at[at.length - 1] - at[0] + 1 === at.length);
  };
  return together((code) => suitOf(code)) && together((code) => (suitOf(code) === 'honor' ? code : null));
}

const SUIT_PILL: Record<SuitId, { bg: string; fg: string; name: { es: string; en: string; pt: string } }> = {
  man: { bg: '#f8c9d9', fg: '#8a1f4a', name: { es: 'Manzu', en: 'Manzu', pt: 'Manzu' } },
  pin: { bg: '#cfe3ff', fg: '#1d4f9a', name: { es: 'Pinzu', en: 'Pinzu', pt: 'Pinzu' } },
  sou: { bg: '#cdeedd', fg: '#14683f', name: { es: 'Souzu', en: 'Souzu', pt: 'Souzu' } },
  honor: { bg: '#fff0b8', fg: '#7a5a00', name: { es: 'Honores', en: 'Honors', pt: 'Honras' } },
};

/** Walls, dead wall, dora and the rivals' hands as the deal left them. */
export function paintDealtTable(g: Painter, assignments: ReturnType<typeof dealAssignments>, extra: { taken?: Set<number>; mark?: number | null } = {}) {
  const { palette: p, ctx } = g;
  const COMPASS = 24;
  g.add(50 * 100 + 50, () => {
    const box = g.box(50, 50, FELT_Z, COMPASS, COMPASS, 3, 0);
    box.sides.forEach((face) => g.poly(face.q, shade(mix(p.back, '#000000', 0.55), 0.9 + 0.3 * (face.n[0] === 0 ? 0 : 0.2)), p.ink, g.lw * 1.3));
    g.poly(box.top, p.back, p.ink, g.lw * 1.5);
    const art = picture(p.compass);
    if (art) g.textured(art, 50, 50, COMPASS * 1.16, COMPASS * 1.16, 0, FELT_Z + 3);
  });
  g.add(90 * 100 + 60, () => {
    const box = g.box(89, 90, FELT_Z, 8, 5.8, 2, 0);
    box.sides.forEach((face) => g.poly(face.q, shade('#e8742a', 0.78), p.ink, g.lw * 1.2));
    g.poly(box.top, '#f08a30', p.ink, g.lw * 1.4);
    g.onQuad(box.top, () => {
      ctx.save();
      ctx.scale(1 / 8, 1 / 5.8);
      ctx.fillStyle = '#fff6e5';
      ctx.font = `700 ${5.8 * 0.78}px 'Noto Serif JP', 'Hiragino Mincho ProN', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('東', 4, 2.9 + 0.2);
      ctx.restore();
    });
  });
    const doraAt = gAt(FIRST_DEAD + 2);
    const dead = new Set<string>();
    for (let G = FIRST_DEAD; G <= FIRST_DEAD + 6; G += 1) { const a = gAt(G); dead.add(`${a.side}:${a.stack}`); }

    // the table as the deal left it
    for (let index = 0; index < 136; index += 1) {
      const side = Math.floor(index / 34);
      const k = index % 34;
      const stack = k % ROW;
      const level = k < ROW ? 0 : 1;
      if (extra.taken?.has(index)) continue;
      const held = assignments.get(index);
      if (held) {
        if (held.player === 0) continue;
        const slot = handSlot(held.player, held.slot, held.extra);
        g.standTile(slot.x, slot.y, slot.rot, 90, { joined: true });
        continue;
      }
      const home = wallSlot(side, stack, level);
      const G = ((side - OPENED_SIDE + 4) % 4) * ROW + stack;
      const isDead = dead.has(`${side}:${stack}`);
      let dx = 0;
      let dy = 0;
      if (isDead) { dx = OUT[side][0] * 3.4; dy = OUT[side][1] * 3.4; }
      else {
        const dist = G < FIRST_DEAD ? FIRST_DEAD - 1 - G : G - (FIRST_DEAD + 7);
        const pull = Math.max(0, 1 - dist / 5) * 1.8 * (G < FIRST_DEAD ? -1 : 1);
        dx = ALONG[side][0] * pull;
        dy = ALONG[side][1] * pull;
      }
      const isDora = level === 1 && side === doraAt.side && stack === doraAt.stack;
      g.tile(home.x + dx, home.y + dy, home.rot, FELT_Z + level * TILE_T + (isDead ? 0.8 : 0), { gold: isDead || extra.mark === index, hop: extra.mark === index ? 1.6 + Math.sin(g.now / 160) * 0.9 : 0, flip: isDora ? 1 : 0, face: isDora ? picture(`${p.faces}/4p.svg`) : null });
    }

}

const slotX = (n: number) => 50 + (n - 6.5) * WIDTH;
const initial = (): Piece[] => DEALT_HAND.map((code, id) => ({ id, code }));

/**
 * The same table as the deal: the camera stays on your hand, standing in front of you, and you drag tiles to
 * group them. Everyone else's hands are where the deal left them.
 */
export function HandSort({ language, onStatus }: { language: TutorialLanguage; onStatus?: (status: HandSortStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const [rack, setRack] = useState<Piece[]>(initial);
  const shown = useRef<Map<number, { x: number; lift: number }>>(new Map());
  const drag = useRef<{ id: number; dx: number; x: number; to: number } | null>(null);
  const viewNow = useRef({ u: 50, v: 90, zoom: 2.3 }); // continues from where the deal left the camera
  const lastFrame = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  const sorted = isGrouped(rack.map((piece) => piece.code));
  useEffect(() => { onStatus?.({ inRack: rack.length, total: rack.length, sorted }); }, [rack, sorted, onStatus]);

  const at = (event: ReactPointerEvent<HTMLCanvasElement>) => scene.current!.unproject(event, HIT_Z);

  const onDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = at(event);
    if (Math.abs(point.y - (HAND_Y + 1)) > 7) return;
    const index = Math.round((point.x - 50) / WIDTH + 6.5);
    if (index < 0 || index >= rack.length) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const piece = rack[index];
    drag.current = { id: piece.id, dx: slotX(index) - point.x, x: slotX(index), to: index };
    setGrabbing(true);
    scene.current?.invalidate();
  };

  const onMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const current = drag.current;
    if (!current) return;
    const point = at(event);
    current.x = Math.max(slotX(0) - 3, Math.min(slotX(rack.length - 1) + 3, point.x + current.dx));
    current.to = Math.max(0, Math.min(rack.length - 1, Math.round((current.x - 50) / WIDTH + 6.5)));
    scene.current?.invalidate();
  };

  const onUp = () => {
    const current = drag.current;
    drag.current = null;
    setGrabbing(false);
    if (!current) return;
    setRack((now) => {
      const from = now.findIndex((piece) => piece.id === current.id);
      if (from < 0) return now;
      const next = [...now];
      const [moved] = next.splice(from, 1);
      next.splice(current.to, 0, moved);
      return next;
    });
  };

  const autoSort = useCallback(() => setRack((now) => [...now].sort((a, b) => sortKey(a.code) - sortKey(b.code) || a.id - b.id)), []);
  const shuffle = useCallback(() => setRack((now) => [...now].sort(() => Math.random() - 0.5)), []);

  const draw = (g: Painter) => {
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    const cam = viewNow.current;
    const dt = Math.min(200, g.now - lastFrame.current);
    lastFrame.current = g.now;
    const ease = 1 - Math.exp(-dt / 380);
    const target = { u: 50, v: 90, zoom: 2.3 };
    cam.u += (target.u - cam.u) * ease;
    cam.v += (target.v - cam.v) * ease;
    cam.zoom += (target.zoom - cam.zoom) * ease;
    if (Math.abs(target.zoom - cam.zoom) + Math.abs(target.v - cam.v) * 0.02 > 0.01) g.needsFrame = true;
    g.view = { ...cam };
    g.table();
    const { palette: p } = g;
    paintDealtTable(g, assignments.current);

    // your hand: standing, faces toward you, tiles slide to make room for the one being moved
    const current = drag.current;
    const others = rack.filter((piece) => piece.id !== current?.id);
    let moving = false;
    rack.forEach((piece) => {
      const isDragged = current?.id === piece.id;
      let goalX: number;
      if (isDragged) goalX = current!.x;
      else {
        const position = others.findIndex((other) => other.id === piece.id);
        const slot = current && position >= current.to ? position + 1 : position;
        goalX = slotX(slot);
      }
      const goalLift = isDragged ? 2.2 : 0;
      const st = shown.current.get(piece.id) ?? { x: goalX, lift: 0 };
      const rate = isDragged ? 1 : 0.28;
      st.x += (goalX - st.x) * rate;
      st.lift += (goalLift - st.lift) * 0.3;
      if (Math.abs(goalX - st.x) > 0.03 || Math.abs(goalLift - st.lift) > 0.02) moving = true;
      shown.current.set(piece.id, st);
      g.standTile(st.x, HAND_Y, 0, 90, { face: picture(`${p.faces}/${piece.code}.svg`), joined: true, order: HAND_Y * 100 + 50 + st.lift * 3 + (isDragged ? 500 : 0), lift: st.lift });
    });
    if (moving) g.needsFrame = true;
    g.flush();

    // a label over every run of the same suit
    let from = 0;
    while (from < rack.length) {
      const suit = suitOf(rack[from].code);
      let to = from;
      while (to + 1 < rack.length && suitOf(rack[to + 1].code) === suit) to += 1;
      const mid = (shown.current.get(rack[from].id)!.x + shown.current.get(rack[to].id)!.x) / 2;
      const pos = g.project(mid, HAND_Y, FELT_Z + 8);
      g.pill(pos.x, pos.y + 7, SUIT_PILL[suit].name[language], { bg: SUIT_PILL[suit].bg, fg: SUIT_PILL[suit].fg, size: 11, border: SUIT_PILL[suit].fg });
      from = to + 1;
    }
    g.pill(g.W / 2, 24, sorted ? t('¡Mano agrupada!', 'Hand grouped!', 'Mão agrupada!') : t('Arrastra las fichas para agrupar tu mano', 'Drag tiles to group your hand', 'Arraste as peças para agrupar sua mão'), { bg: sorted ? '#cdeedd' : p.gold, fg: sorted ? '#14683f' : p.ink, size: 14 });
  };

  return (
    <div className="sort-stage deck-stage">
      <div className={`sort-board deck-board is-table is-hand${grabbing ? ' is-grabbing' : ''}${sorted ? ' is-sorted' : ''}`}>
        <IsoCanvas ref={scene} draw={draw} handlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }} />
        <div className="sort-actions deck-actions">
          <span>{rack.length}/{rack.length} {t('en tu mano', 'in your hand', 'na sua mão')}</span>
          <button type="button" className="sort-button" onClick={shuffle}>{t('Desordenar', 'Scramble', 'Desordenar')}</button>
          <button type="button" className="sort-button is-primary" onClick={autoSort}>{t('Ordenar', 'Sort', 'Ordenar')}</button>
        </div>
        {sorted && (
          <p className="sort-win is-top" role="status">
            <b>{t('Ahora ves tus grupos de un vistazo', 'Now you see your groups at a glance', 'Agora você vê seus grupos num relance')}</b>
            <span>{t('«Ordenar» pone el orden sugerido: manzu, pinzu, souzu y honores.', '“Sort” gives the suggested order: manzu, pinzu, souzu, honors.', '«Ordenar» coloca a ordem sugerida: manzu, pinzu, souzu e honras.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
