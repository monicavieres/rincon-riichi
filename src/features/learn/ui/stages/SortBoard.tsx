import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { localize, type TutorialLanguage } from '../../domain/tutorialContent';

export const tilePath = (code: string) => `../assets/tiles-fluffystuff-composite/${code}.svg`;
const TILE_BACK = '../assets/tile-back-rincon.svg';
const DECK_SIZE = 136;

/** The thirteen tiles of the first lesson: three sequences, two pairs. Sorted, they read 123m 456p 345s 11z 66z. */
const HAND = ['1m', '2m', '3m', '4p', '5p', '6p', '3s', '4s', '5s', '1z', '1z', '6z', '6z'];

// Everything is positioned in % of the board so it scales with the stage.
const TILE_W = 8;
const STEP = 7.1;
const RACK_X0 = (100 - (12 * STEP + TILE_W)) / 2;
const RACK_Y = 76;
const RACK_DROP_Y = 62;
const FELT_X = [3, 86];
const FELT_Y = [15, 48];

type SuitId = 'man' | 'pin' | 'sou' | 'honor';
type Tile = { id: number; code: string; x: number; y: number; rot: number; slot: number | null; z: number };
type ShuffleTile = { x: number; y: number; rot: number; delay: number };

export type SortStatus = { inRack: number; total: number; sorted: boolean };

const suitOf = (code: string): SuitId => ({ m: 'man', p: 'pin', s: 'sou', z: 'honor' } as const)[code[1] as 'm' | 'p' | 's' | 'z'];
const sortKey = (code: string) => ['man', 'pin', 'sou', 'honor'].indexOf(suitOf(code)) * 10 + (Number(code[0]) || 5);
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const SUIT_LABEL: Record<SuitId, { es: string; en: string; pt: string }> = {
  man: { es: 'Manzu', en: 'Manzu', pt: 'Manzu' },
  pin: { es: 'Pinzu', en: 'Pinzu', pt: 'Pinzu' },
  sou: { es: 'Souzu', en: 'Souzu', pt: 'Souzu' },
  honor: { es: 'Honores', en: 'Honors', pt: 'Honras' },
};

function scatter(tile: Tile, z: number): Tile {
  return { ...tile, x: rand(FELT_X[0], FELT_X[1]), y: rand(FELT_Y[0], FELT_Y[1]), rot: rand(-38, 38), slot: null, z };
}

function freshPile(): Tile[] {
  return HAND.map((code, id) => scatter({ id, code, x: 0, y: 0, rot: 0, slot: null, z: 0 }, id + 1));
}

const rackPos = (slot: number) => ({ x: RACK_X0 + slot * STEP, y: RACK_Y });

/** Shuffled tiles on the felt that can be dragged into a rack, then sorted by suit and number. */
export function SortBoard({ language, onStatus }: { language: TutorialLanguage; onStatus?: (status: SortStatus) => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const boardRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<Tile[]>(freshPile);
  const [shuffling, setShuffling] = useState(false);
  const [shuffleLayout, setShuffleLayout] = useState<ShuffleTile[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const zTop = useRef(HAND.length + 1);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);

  const rack = useMemo(() => tiles.filter((tile) => tile.slot !== null).sort((a, b) => (a.slot as number) - (b.slot as number)), [tiles]);
  const sorted = rack.length === HAND.length && rack.every((tile, i) => i === 0 || sortKey(rack[i - 1].code) <= sortKey(tile.code));

  useEffect(() => { onStatus?.({ inRack: rack.length, total: HAND.length, sorted }); }, [rack.length, sorted, onStatus]);

  useEffect(() => {
    if (!shuffling) return;
    const timer = window.setTimeout(() => setShuffling(false), 1150);
    return () => window.clearTimeout(timer);
  }, [shuffling]);

  const shuffle = useCallback(() => {
    if (shuffling) return;
    const layout = Array.from({ length: DECK_SIZE }, (_, index) => {
      const col = index % 17;
      const row = Math.floor(index / 17);
      return {
        x: 18 + col * 3.72 + rand(-0.45, 0.45),
        y: 3.5 + row * 6.9 + rand(-0.4, 0.4),
        rot: rand(-16, 16),
        delay: rand(-0.34, 0),
      };
    });
    setShuffleLayout(layout);
    setShuffling(true);
    zTop.current = HAND.length + 1;
    setTiles((current) => current.map((tile, index) => scatter(tile, index + 1)));
  }, [shuffling]);

  const autoSort = useCallback(() => {
    setTiles((current) => {
      const order = [...current].sort((a, b) => sortKey(a.code) - sortKey(b.code) || a.id - b.id);
      return current.map((tile) => ({ ...tile, slot: order.findIndex((item) => item.id === tile.id), rot: 0 }));
    });
  }, []);

  const toPercent = (clientX: number, clientY: number) => {
    const rect = boardRef.current!.getBoundingClientRect();
    return { px: ((clientX - rect.left) / rect.width) * 100, py: ((clientY - rect.top) / rect.height) * 100 };
  };

  const onDown = (event: ReactPointerEvent<HTMLButtonElement>, tile: Tile) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const { px, py } = toPercent(event.clientX, event.clientY);
    const at = tile.slot !== null ? rackPos(tile.slot) : { x: tile.x, y: tile.y };
    drag.current = { id: tile.id, dx: px - at.x, dy: py - at.y };
    setDragging(tile.id);
    setTiles((current) => {
      // lifting a tile out of the rack closes the gap it leaves
      const left = current.filter((item) => item.slot !== null && item.id !== tile.id).sort((a, b) => (a.slot as number) - (b.slot as number));
      return current.map((item) => {
        if (item.id === tile.id) return { ...item, x: at.x, y: at.y, rot: tile.slot !== null ? 0 : item.rot, slot: null, z: ++zTop.current };
        const index = left.findIndex((other) => other.id === item.id);
        return index >= 0 ? { ...item, slot: index } : item;
      });
    });
  };

  const onMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current) return;
    const { px, py } = toPercent(event.clientX, event.clientY);
    const x = Math.min(100 - TILE_W, Math.max(0, px - current.dx));
    const y = Math.min(86, Math.max(0, py - current.dy));
    setTiles((all) => all.map((item) => (item.id === current.id ? { ...item, x, y } : item)));
  };

  const onUp = () => {
    const current = drag.current;
    drag.current = null;
    setDragging(null);
    if (!current) return;
    setTiles((all) => {
      const tile = all.find((item) => item.id === current.id)!;
      const centreX = tile.x + TILE_W / 2;
      const centreY = tile.y + 8.5;
      if (centreY < RACK_DROP_Y) return all;
      const others = all.filter((item) => item.slot !== null && item.id !== tile.id).sort((a, b) => (a.slot as number) - (b.slot as number));
      const index = Math.min(others.length, Math.max(0, Math.round((centreX - RACK_X0 - TILE_W / 2) / STEP)));
      const order = [...others.map((item) => item.id)];
      order.splice(index, 0, tile.id);
      return all.map((item) => (order.includes(item.id) ? { ...item, slot: order.indexOf(item.id), rot: 0 } : item));
    });
  };

  // Runs of the same suit in the rack, to label them above the tiles.
  const runs = useMemo(() => {
    const out: Array<{ suit: SuitId; from: number; to: number }> = [];
    rack.forEach((tile, i) => {
      const suit = suitOf(tile.code);
      const last = out[out.length - 1];
      if (last && last.suit === suit && last.to === i - 1) last.to = i;
      else out.push({ suit, from: i, to: i });
    });
    return out;
  }, [rack]);

  return (
    <div className="sort-stage">
      <div className={`sort-board${sorted ? ' is-sorted' : ''}${shuffling ? ' is-shuffling' : ''}`} ref={boardRef}>
        <div className="sort-felt" aria-hidden="true"><span>{t('Fichas sobre el paño', 'Tiles on the felt', 'Peças sobre o pano')}</span></div>
        <div className="sort-actions">
          <span>{rack.length}/{HAND.length} {t('en tu mano', 'in your hand', 'na sua mão')}</span>
          <button type="button" className="sort-button" onClick={shuffle} disabled={shuffling} aria-busy={shuffling}>{t('Revolver', 'Shuffle', 'Embaralhar')}</button>
          <button type="button" className="sort-button is-primary" onClick={autoSort}>{t('Ordenar', 'Sort', 'Ordenar')}</button>
        </div>
        <div className="sort-rack" aria-hidden="true">
          <span className="sort-rack-title">{t('Tu mano', 'Your hand', 'Sua mão')}</span>
          {Array.from({ length: HAND.length }, (_, slot) => <i key={slot} className="sort-slot" style={{ left: `${rackPos(slot).x + 0.6}%` }} />)}
        </div>
        {shuffling && (
          <div className="sort-shuffle" aria-hidden="true">
            {shuffleLayout.map((tile, index) => (
              <span
                key={index}
                className="sort-shuffle-tile"
                style={{ left: `${tile.x}%`, top: `${tile.y}%`, animationDelay: `${tile.delay}s` }}
              >
                <img src={TILE_BACK} alt="" draggable={false} style={{ transform: `rotate(${tile.rot}deg)` }} />
              </span>
            ))}
          </div>
        )}
        {runs.map((run) => (
          <span
            key={`${run.suit}-${run.from}`}
            className={`sort-run is-${run.suit}`}
            style={{ left: `${rackPos(run.from).x + 0.8}%`, width: `${(run.to - run.from) * STEP + TILE_W - 1.6}%` }}
          >
            {localize(SUIT_LABEL[run.suit], language)}
          </span>
        ))}
        {tiles.map((tile) => {
          const at = tile.slot !== null ? rackPos(tile.slot) : { x: tile.x, y: tile.y };
          return (
            <button
              key={tile.id}
              type="button"
              className={`sort-tile${dragging === tile.id ? ' is-dragging' : ''}${tile.slot !== null ? ' is-racked' : ''}`}
              style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${TILE_W}%`, transform: `rotate(${tile.slot !== null ? 0 : tile.rot}deg)`, zIndex: tile.slot !== null ? 2 : tile.z + 2 }}
              aria-label={`${t('Ficha', 'Tile', 'Peça')} ${tile.code}`}
              onPointerDown={(event) => onDown(event, tile)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              <img src={tilePath(tile.code)} alt="" draggable={false} />
            </button>
          );
        })}
        {sorted && (
          <p className="sort-win" role="status">
            <b>{t('¡Mano ordenada!', 'Hand sorted!', 'Mão ordenada!')}</b>
            <span>{t('Ahora los grupos se ven de un vistazo.', 'Now the sets show at a glance.', 'Agora os grupos aparecem num relance.')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
