export type TableArt = 'mesa' | 'muro' | 'riichi' | 'dealer' | 'dados' | 'palitos' | 'consola';
export type TableTheme = 'light' | 'dark' | 'cute' | 'samurai' | 'cyberpunk' | 'vaquero' | 'frutiger';

/** Pages under /aprender, /practicar and /recursos sit one folder deeper than the home page. */
const assetBase = () => (typeof window !== 'undefined' && /\/(aprender|practicar|recursos)\//.test(window.location.pathname) ? '../' : '');

/** Bump when the illustrations are regenerated: they keep their file names, and browsers cache SVGs hard. */
export const ILLUSTRATION_VERSION = '7';

export const tableArtPath = (art: TableArt, theme: TableTheme) => `${assetBase()}assets/illustrations/${art}-${theme}.svg?v=${ILLUSTRATION_VERSION}`;

/** A point on the table illustration, in the generator's table units (x, y on the felt, z up). */
export type TablePoint = [number, number, number];

/** An axis-aligned block on the table: a wall, a pond, a hand, the console. */
export type TableBox = { x: number; y: number; z: number; w: number; d: number; h: number };

export type TableFocus = {
  boxes: TableBox[];
  zoom: number;
};

/** A label tied to a point by a leader line; dx/dy is where the label sits, in screen px from the point. */
export type TableCallout = {
  label: string;
  at: TablePoint;
  dx: number;
  dy: number;
};

// Must match the viewBox that tools/design/generate-illustrations.py writes for mesa-*.svg.
export const TABLE_VIEWBOX = { x: -527.6, y: -126, w: 1055.2, h: 694 };
const COS30 = Math.cos(Math.PI / 6);

/** Isometric projection of a table point into % of the illustration. */
export function projectToPercent([x, y, z]: TablePoint): [number, number] {
  const sx = (x - y) * COS30;
  const sy = (x + y) / 2 - z;
  return [((sx - TABLE_VIEWBOX.x) / TABLE_VIEWBOX.w) * 100, ((sy - TABLE_VIEWBOX.y) / TABLE_VIEWBOX.h) * 100];
}

/** Outline of a box as seen on screen: the convex hull of its eight projected corners. */
export function boxOutline({ x, y, z, w, d, h }: TableBox): Array<[number, number]> {
  const corners: Array<[number, number]> = [];
  for (const cx of [x, x + w]) for (const cy of [y, y + d]) for (const cz of [z, z + h]) corners.push(projectToPercent([cx, cy, cz]));
  const pts = corners.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (seq: Array<[number, number]>) => {
    const out: Array<[number, number]> = [];
    for (const p of seq) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    return out.slice(0, -1);
  };
  return [...half(pts), ...half([...pts].reverse())];
}


/** Height of the felt in table units; objects on the table sit on top of it. */
export const FELT = 121;

/** Bounding box (in % of the illustration) of a focus zone, plus each box outline. */
export function zoneBounds(focus: TableFocus) {
  const outlines = focus.boxes.map(boxOutline);
  const pts = outlines.flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return { outlines, x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}
