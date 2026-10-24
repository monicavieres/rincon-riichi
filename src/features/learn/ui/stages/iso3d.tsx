import { forwardRef, useEffect, useImperativeHandle, useRef, type PointerEvent as ReactPointerEvent } from 'react';

/**
 * A small canvas renderer for the tutorial's table steps. The table is a square plane (x and y run 0–100) seen from
 * the player's seat: tilted back by TILT degrees with a little perspective. Everything is drawn back to front with
 * outlined, flat-lit faces so it reads like the illustrations on the home page.
 */
export const TILT = 52;
const SIN = Math.sin((TILT * Math.PI) / 180);
const COS = Math.cos((TILT * Math.PI) / 180);

/** Camera framing, as fractions of the canvas width. */
const CAM_SCALE = 0.62;
const CAM_LIFT = 0.05;
const CAM_PERSP = 1.7;

/** Height of the felt above the floor, in plane units. */
export const FELT_Z = 6;
export const TILE_T = 3.2;

export type Palette = { faces: string; back: string; cream: string; ink: string; rail: string; rim: string; felt: string; gold: string; emblem: string; compass: string };
export type Pt = { x: number; y: number };
type Cam = Pt & { f: number; X: number; Y: number; Z: number };

const hex = (color: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return [128, 128, 128];
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const rgb = (c: [number, number, number]) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
export const shade = (color: string, k: number) => {
  const c = hex(color);
  return rgb(k <= 1 ? [c[0] * k, c[1] * k, c[2] * k] : [c[0] + (255 - c[0]) * (k - 1), c[1] + (255 - c[1]) * (k - 1), c[2] + (255 - c[2]) * (k - 1)]);
};
export const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
};

const THEME_EMBLEM: Record<string, string> = {
  light: 'assets/rincon-mark.svg', dark: 'assets/emblems/neon.svg', cute: 'assets/emblems/cute.svg', samurai: 'assets/emblems/samurai.svg',
  cyberpunk: 'assets/emblems/cyberpunk.svg', vaquero: 'assets/emblems/vaquero.svg', frutiger: 'assets/emblems/frutiger.svg', fox: 'assets/emblems/fox.svg',
};

const FACE_DIR: Record<string, string> = {
  light: 'assets/tiles-fluffystuff-composite', dark: 'assets/tiles-neon', cute: 'assets/tiles-cute', samurai: 'assets/tiles-samurai',
  cyberpunk: 'assets/tiles-cyberpunk', vaquero: 'assets/tiles-vaquero', frutiger: 'assets/tiles-frutiger', fox: 'assets/tiles-fox',
};

const assetBase = () => (/\/(aprender|practicar|recursos)\//.test(window.location.pathname) ? '../' : '');

const images = new Map<string, HTMLImageElement>();
const bitmaps = new Map<string, HTMLCanvasElement>();
let onImage: (() => void) | null = null;

/** A picture rasterised once to a canvas, so it can be drawn many times cheaply and at any angle. */
export function picture(path: string): HTMLCanvasElement | null {
  const cached = bitmaps.get(path);
  if (cached) return cached;
  let img = images.get(path);
  if (!img) {
    img = new Image();
    img.onload = () => onImage?.();
    img.src = `${assetBase()}${path}`;
    images.set(path, img);
  }
  if (!img.complete || img.naturalWidth === 0) return null;
  const size = path.includes('illustrations') ? 1024 : path.includes('tiles-') ? 640 : 384;
  const bitmap = document.createElement('canvas');
  bitmap.width = size;
  bitmap.height = size;
  bitmap.getContext('2d')!.drawImage(img, 0, 0, size, size);
  bitmaps.set(path, bitmap);
  return bitmap;
}

const cssVar = (name: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return /^#/.test(value) ? value : fallback;
};

function readPalette(): Palette {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  return {
    faces: FACE_DIR[theme] ?? FACE_DIR.light,
    back: cssVar('--tile-back', '#f3c63d'),
    cream: cssVar('--tile-cream', '#fbf2df'),
    ink: cssVar('--tile-ink', '#3b2417'),
    rail: cssVar('--rail', '#b2713c'),
    rim: cssVar('--rail-rim', '#f2b42c'),
    felt: cssVar('--table-felt', '#1f8a78'),
    gold: cssVar('--gold', '#f2b42c'),
    emblem: THEME_EMBLEM[theme] ?? THEME_EMBLEM.light,
    compass: `assets/illustrations/consola-top-${THEME_EMBLEM[theme] ? theme : 'light'}.svg`,
  };
}

export type Face = { q: Pt[]; n: [number, number, number]; name: 'south' | 'north' | 'east' | 'west' };
export type BoxGeometry = { top: Pt[]; sides: Face[]; cx: number; cy: number };

const LIGHT = (() => {
  const v: [number, number, number] = [-0.35, 0.5, 0.78];
  const m = Math.hypot(...v);
  return v.map((c) => c / m) as [number, number, number];
})();
export const lit = (n: [number, number, number]) => 0.64 + 0.36 * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);

/** Draws one frame. Boards call `add` for everything that must be depth-sorted and `flush` to paint it. */
export class Painter {
  ctx!: CanvasRenderingContext2D;
  W = 1;
  H = 1;
  k = 1;
  cx = 0;
  cy = 0;
  P = 1;
  lw = 1.5;
  now = 0;
  palette: Palette = readPalette();
  needsFrame = false;
  /** Camera focus: which plane point sits at the centre of the canvas and how far in we are. */
  view = { u: 50, v: 50, zoom: 1 };
  private queue: Array<{ key: number; fn: () => void }> = [];

  setup(ctx: CanvasRenderingContext2D, W: number, H: number, now: number) {
    this.ctx = ctx;
    this.W = W;
    this.H = H;
    this.k = (CAM_SCALE * W * this.view.zoom) / 100;
    this.cx = W / 2;
    this.cy = H / 2 - (CAM_LIFT * W) / this.view.zoom;
    this.P = CAM_PERSP * W;
    this.lw = Math.max(1.1, W * 0.0019);
    this.now = now;
    this.palette = readPalette();
    this.needsFrame = false;
    this.queue = [];
  }

  cam(u: number, v: number, z: number): Cam {
    const X = (u - this.view.u) * this.k;
    const Y = (v - this.view.v) * this.k;
    const Z = z * this.k;
    const Yp = Y * COS - Z * SIN;
    const Zp = Y * SIN + Z * COS;
    const f = this.P / (this.P - Zp);
    return { x: this.cx + X * f, y: this.cy + Yp * f, f, X, Y: Yp, Z: Zp };
  }

  project(u: number, v: number, z = 0): Pt & { f: number } {
    const c = this.cam(u, v, z);
    return { x: c.x, y: c.y, f: c.f };
  }

  /** Plane coordinates under a screen point, for a surface `z0` units above the table plane. */
  unproject(sx: number, sy: number, z0 = 0) {
    const a = sy - this.cy;
    const Z = z0 * this.k;
    const Y = (a * this.P - a * Z * COS + this.P * Z * SIN) / (a * SIN + this.P * COS);
    const Zp = Y * SIN + Z * COS;
    const f = this.P / (this.P - Zp);
    const X = (sx - this.cx) / f;
    return { x: this.view.u + X / this.k, y: this.view.v + Y / this.k };
  }

  add(key: number, fn: () => void) { this.queue.push({ key, fn }); }

  flush() {
    this.queue.sort((a, b) => a.key - b.key);
    this.queue.forEach((item) => item.fn());
    this.queue = [];
  }

  poly(pts: Pt[], fill: string | null, stroke: string | null = null, width = this.lw) {
    const { ctx } = this;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  /** Corners of a rotated box and which of its sides face the viewer. */
  box(cx: number, cy: number, z0: number, w: number, l: number, t: number, rot = 0): BoxGeometry {
    const r = (rot * Math.PI) / 180;
    const co = Math.cos(r);
    const si = Math.sin(r);
    const at = (lx: number, ly: number, z: number) => this.cam(cx + lx * co - ly * si, cy + lx * si + ly * co, z);
    const hw = w / 2;
    const hl = l / 2;
    const top = [at(-hw, -hl, z0 + t), at(hw, -hl, z0 + t), at(hw, hl, z0 + t), at(-hw, hl, z0 + t)];
    const defs: Array<[Face['name'], [number, number, number], number[][]]> = [
      ['south', [0, 1, 0], [[-hw, hl], [hw, hl]]],
      ['north', [0, -1, 0], [[hw, -hl], [-hw, -hl]]],
      ['east', [1, 0, 0], [[hw, hl], [hw, -hl]]],
      ['west', [-1, 0, 0], [[-hw, -hl], [-hw, hl]]],
    ];
    const sides: Face[] = [];
    const camCentre = this.cam(cx, cy, z0 + t / 2);
    defs.forEach(([name, n, [a, b]]) => {
      const nw: [number, number, number] = [n[0] * co - n[1] * si, n[0] * si + n[1] * co, 0];
      const nc: [number, number, number] = [nw[0], nw[1] * COS, nw[1] * SIN];
      const mid = at((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z0 + t / 2);
      const view: [number, number, number] = [-mid.X, -mid.Y, this.P - mid.Z];
      if (nc[0] * view[0] + nc[1] * view[1] + nc[2] * view[2] <= 0) return;
      sides.push({ q: [at(a[0], a[1], z0), at(b[0], b[1], z0), at(b[0], b[1], z0 + t), at(a[0], a[1], z0 + t)], n: nw, name });
    });
    sides.sort((p, q) => p.q[0].y - q.q[0].y);
    return { top, sides, cx: camCentre.x, cy: camCentre.y };
  }

  /** Runs `fn` with the context mapped so the unit square covers `quad` (top-left, top-right, bottom-right, bottom-left). */
  onQuad(quad: Pt[], fn: () => void) {
    const { ctx } = this;
    ctx.save();
    ctx.transform(quad[1].x - quad[0].x, quad[1].y - quad[0].y, quad[3].x - quad[0].x, quad[3].y - quad[0].y, quad[0].x, quad[0].y);
    fn();
    ctx.restore();
  }

  /** A banded side face: bands run from the top edge down to the bottom edge. */
  bandedFace(face: Face, bands: Array<[number, number, string]>, factor: number, stroke: string) {
    const [bl, br, tr, tl] = face.q;
    const lerp = (a: Pt, b: Pt, k: number) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
    bands.forEach(([from, to, color]) => {
      this.poly([lerp(tl, bl, from), lerp(tr, br, from), lerp(tr, br, to), lerp(tl, bl, to)], shade(color, factor), null);
    });
    this.poly(face.q, null, stroke);
  }

  /** One tile lying face down: back colour and emblem on top, banded edges. */
  tile(x: number, y: number, rot: number, z0: number, opts: { counting?: boolean; w?: number; l?: number; t?: number; order?: number; flip?: number; face?: CanvasImageSource | null; gold?: boolean; arc?: number; hop?: number } = {}) {
    const { palette: p } = this;
    const w = opts.w ?? 3.6;
    const l = opts.l ?? 4.8;
    const t = opts.t ?? TILE_T;
    const back = opts.counting ? '#e6b422' : p.back;
    const cream = opts.counting ? '#fff1b8' : p.cream;
    // gold keeps the tile's own top and emblem and only warms its edges, so nothing flashes when it turns over
    const sideBack = opts.gold ? '#e6b422' : back;
    const sideCream = opts.gold ? '#fff1b8' : cream;
    // turning a tile over: it squeezes along its width, lifts, and lands face up
    const flip = opts.flip ?? 0;
    const squeeze = flip > 0 ? Math.max(0.06, Math.abs(Math.cos(flip * Math.PI))) : 1;
    const lift = (flip > 0 ? Math.sin(flip * Math.PI) * (opts.arc ?? 5) : 0) + (opts.hop ?? 0);
    const faceUp = flip >= 0.5 && !!opts.face;
    this.add(opts.order ?? y * 100 + z0 + lift, () => {
      const g = this.box(x, y, z0 + lift, w * squeeze, l, t, rot);
      g.sides.forEach((face) => {
        this.bandedFace(face, [[0, 0.3, sideBack], [0.3, 0.7, sideCream], [0.7, 1, sideBack]], lit(face.n), p.ink);
      });
      this.poly(g.top, faceUp ? '#fffdf6' : back, opts.gold ? p.gold : p.ink, opts.gold ? this.lw * 2 : this.lw);
      if (faceUp && opts.face) {
        this.textured(opts.face, x, y, w * squeeze, l, rot, z0 + lift + t, 6);
      } else {
        const emblem = picture(p.emblem);
        if (emblem && !opts.counting) {
          this.onQuad(g.top, () => {
            const s = 0.64;
            this.ctx.drawImage(emblem, 0.5 - s / 2, 0.5 - (s * w) / l / 2, s, (s * w) / l);
          });
        }
        this.onQuad(g.top, () => {
          const { ctx } = this;
          ctx.strokeStyle = 'rgba(255,255,255,0.32)';
          ctx.lineWidth = 0.04;
          ctx.strokeRect(0.1, 0.08, 0.8, 0.84);
        });
      }
    });
  }

  /** A die lying on the felt. `up` is the value on top (0 = blank); `spin` tumbles it instead. */
  die(x: number, y: number, z0: number, size: number, opts: { up: number; yaw: number; spin?: number; order?: number }) {
    const { palette: p } = this;
    type M = number[][];
    const mul = (a: M, b: M): M => a.map((row, i) => b[0].map((_, j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j] + (i < 0 ? 0 : 0)));
    const rx = (d: number): M => { const c = Math.cos((d * Math.PI) / 180); const s_ = Math.sin((d * Math.PI) / 180); return [[1, 0, 0], [0, c, -s_], [0, s_, c]]; };
    const ry = (d: number): M => { const c = Math.cos((d * Math.PI) / 180); const s_ = Math.sin((d * Math.PI) / 180); return [[c, 0, s_], [0, 1, 0], [-s_, 0, c]]; };
    const rz = (d: number): M => { const c = Math.cos((d * Math.PI) / 180); const s_ = Math.sin((d * Math.PI) / 180); return [[c, -s_, 0], [s_, c, 0], [0, 0, 1]]; };
    const up: Record<number, M> = { 0: rx(0), 1: rx(0), 2: rx(90), 3: ry(-90), 4: ry(90), 5: rx(-90), 6: rx(180) };
    const R: M = opts.spin !== undefined
      ? mul(rz(opts.yaw), mul(rx(opts.spin * 7.2), mul(ry(opts.spin * 10.8), rz(opts.spin * 4))))
      : mul(rz(opts.yaw), up[opts.up] ?? up[1]);
    const apply = (v: number[]) => [R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2], R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2], R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]];
    const h = size / 2;
    const hop = opts.spin !== undefined ? Math.abs(Math.sin(opts.spin * 0.5)) * 3 : 0;
    const zc = z0 + h + hop;
    // face: value, outward normal, two axes across it
    const faces: Array<{ value: number; n: number[]; eu: number[]; ev: number[] }> = [
      { value: 1, n: [0, 0, 1], eu: [1, 0, 0], ev: [0, 1, 0] },
      { value: 6, n: [0, 0, -1], eu: [1, 0, 0], ev: [0, -1, 0] },
      { value: 2, n: [0, 1, 0], eu: [1, 0, 0], ev: [0, 0, -1] },
      { value: 5, n: [0, -1, 0], eu: [-1, 0, 0], ev: [0, 0, -1] },
      { value: 3, n: [1, 0, 0], eu: [0, -1, 0], ev: [0, 0, -1] },
      { value: 4, n: [-1, 0, 0], eu: [0, 1, 0], ev: [0, 0, -1] },
    ];
    this.add(opts.order ?? y * 100 + z0 + 5, () => {
      this.needsFrame = this.needsFrame || opts.spin !== undefined;
      const drawn = faces.map((f) => {
        const n = apply(f.n);
        const eu = apply(f.eu);
        const ev = apply(f.ev);
        const centre = [x + n[0] * h, y + n[1] * h, zc + n[2] * h];
        const corner = (a: number, b: number) => this.cam(centre[0] + (eu[0] * a + ev[0] * b) * h, centre[1] + (eu[1] * a + ev[1] * b) * h, centre[2] + (eu[2] * a + ev[2] * b) * h);
        const mid = this.cam(centre[0], centre[1], centre[2]);
        const nc = [n[0], n[1] * COS - n[2] * SIN, n[1] * SIN + n[2] * COS];
        const visible = nc[0] * -mid.X + nc[1] * -mid.Y + nc[2] * (this.P - mid.Z) > 0;
        return { f, n, mid, visible, quad: [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)] };
      }).filter((d) => d.visible).sort((a, b) => a.mid.Z - b.mid.Z);
      drawn.forEach(({ f, n, quad }) => {
        const bone = shade('#efe6d6', lit(n as [number, number, number]) * 0.98 + 0.04);
        this.poly(quad, bone, p.ink, this.lw * 1.2);
        const value = opts.up === 0 && opts.spin === undefined ? 0 : f.value;
        this.onQuad(quad, () => {
          const { ctx } = this;
          if (value === 1) {
            ctx.fillStyle = shade(p.back, 0.86);
            ctx.beginPath();
            ctx.ellipse(0.5, 0.5, 0.17, 0.17, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = p.ink;
            [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]][value - 1]?.forEach((cell) => {
              ctx.beginPath();
              ctx.ellipse(0.24 + (cell % 3) * 0.26, 0.24 + Math.floor(cell / 3) * 0.26, 0.085, 0.1, 0, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        });
      });
    });
  }

  /** Paints a picture flat on the table, mapped piece by piece so the perspective stays true. */
  textured(img: CanvasImageSource, x: number, y: number, w: number, l: number, rot: number, z: number, cells = 12) {
    const { ctx } = this;
    const r = (rot * Math.PI) / 180;
    const co = Math.cos(r);
    const si = Math.sin(r);
    const at = (a: number, b: number) => {
      const lx = w * (a - 0.5);
      const ly = l * (b - 0.5);
      return this.cam(x + lx * co - ly * si, y + lx * si + ly * co, z);
    };
    const grid: Pt[][] = [];
    for (let j = 0; j <= cells; j += 1) {
      grid.push([]);
      for (let i = 0; i <= cells; i += 1) grid[j].push(at(i / cells, j / cells));
    }
    const triangle = (s0: Pt, s1: Pt, s2: Pt, d0: Pt, d1: Pt, d2: Pt) => {
      const det = (s1.x - s0.x) * (s2.y - s0.y) - (s2.x - s0.x) * (s1.y - s0.y);
      if (!det) return;
      const a = ((d1.x - d0.x) * (s2.y - s0.y) - (d2.x - d0.x) * (s1.y - s0.y)) / det;
      const c = ((d2.x - d0.x) * (s1.x - s0.x) - (d1.x - d0.x) * (s2.x - s0.x)) / det;
      const b = ((d1.y - d0.y) * (s2.y - s0.y) - (d2.y - d0.y) * (s1.y - s0.y)) / det;
      const d = ((d2.y - d0.y) * (s1.x - s0.x) - (d1.y - d0.y) * (s2.x - s0.x)) / det;
      const e = d0.x - a * s0.x - c * s0.y;
      const f = d0.y - b * s0.x - d * s0.y;
      const cx = (d0.x + d1.x + d2.x) / 3;
      const cy = (d0.y + d1.y + d2.y) / 3;
      const grow = (p: Pt) => ({ x: p.x + Math.sign(p.x - cx) * 0.45, y: p.y + Math.sign(p.y - cy) * 0.45 });
      ctx.save();
      ctx.beginPath();
      [d0, d1, d2].map(grow).forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.clip();
      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(img, 0, 0, 1, 1);
      ctx.restore();
    };
    for (let j = 0; j < cells; j += 1) {
      for (let i = 0; i < cells; i += 1) {
        const s00 = { x: i / cells, y: j / cells };
        const s10 = { x: (i + 1) / cells, y: j / cells };
        const s01 = { x: i / cells, y: (j + 1) / cells };
        const s11 = { x: (i + 1) / cells, y: (j + 1) / cells };
        triangle(s00, s10, s01, grid[j][i], grid[j][i + 1], grid[j + 1][i]);
        triangle(s10, s11, s01, grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]);
      }
    }
  }

  /** A flat slot on the felt, outlined where a tile will go. */
  ghost(x: number, y: number, rot: number, z0: number, opts: { next?: boolean; hot?: boolean; filled?: boolean; faint?: boolean; w?: number; l?: number } = {}) {
    if (opts.filled) return;
    const g = this.box(x, y, z0, opts.w ?? 3.6, opts.l ?? 4.8, 0, rot);
    const { ctx, palette: p } = this;
    ctx.save();
    if (opts.next) {
      this.needsFrame = true;
      const pulse = 0.5 + 0.5 * Math.sin(this.now / 260);
      this.poly(g.top, opts.hot ? 'rgba(255,255,255,0.55)' : `rgba(255,214,90,${0.28 + pulse * 0.3})`, p.gold, this.lw * 1.8);
    } else {
      ctx.setLineDash([this.k * 0.9, this.k * 0.7]);
      this.poly(g.top, opts.faint ? null : 'rgba(255,255,255,0.1)', opts.faint ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', this.lw * 1.2);
    }
    ctx.restore();
  }

  /** A text pill that always faces the viewer, drawn above everything. */
  pill(sx: number, sy: number, text: string, opts: { bg?: string; fg?: string; size?: number; border?: string } = {}) {
    const { ctx } = this;
    const size = (opts.size ?? 11) * Math.max(0.8, this.W / 860);
    ctx.save();
    ctx.font = `700 ${size}px 'Barlow Semi Condensed', 'Barlow', system-ui, sans-serif`;
    const label = text.toUpperCase();
    const tw = ctx.measureText(label).width + size * 0.9;
    const th = size * 1.9;
    ctx.beginPath();
    ctx.roundRect(sx - tw / 2, sy - th / 2, tw, th, th / 2);
    ctx.fillStyle = opts.bg ?? 'rgba(10,20,20,0.62)';
    ctx.fill();
    if (opts.border) { ctx.strokeStyle = opts.border; ctx.lineWidth = this.lw; ctx.stroke(); }
    ctx.fillStyle = opts.fg ?? '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, sx, sy + size * 0.04);
    ctx.restore();
  }

  /** Rounded rectangle on the plane as projected points. */
  plane(x0: number, y0: number, x1: number, y1: number, r: number, z: number, n = 6): Pt[] {
    const pts: Pt[] = [];
    const corners: Array<[number, number, number]> = [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]];
    corners.forEach(([cx, cy, a0]) => {
      for (let i = 0; i <= n; i += 1) {
        const a = ((a0 + (90 * i) / n) * Math.PI) / 180;
        pts.push(this.project(cx + r * Math.cos(a), cy + r * Math.sin(a), z));
      }
    });
    return pts;
  }

  /** The table: soft shadow, legs, wooden slab with a gold rail line, felt top. */
  table() {
    const { palette: p, ctx } = this;
    const ground = this.project(50, 50, -16);
    const gw = 62 * this.k;
    ctx.save();
    ctx.translate(ground.x, ground.y + 4 * this.k);
    ctx.scale(1, 0.46);
    const grad = ctx.createRadialGradient(0, 0, gw * 0.35, 0, 0, gw * 0.95);
    grad.addColorStop(0, 'rgba(60,30,10,0.34)');
    grad.addColorStop(1, 'rgba(60,30,10,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, gw * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const legColor = mix(p.rail, '#1a0b05', 0.72);
    [[9, 9], [91, 9], [9, 91], [91, 91]].forEach(([lx, ly], i) => {
      const g = this.box(lx, ly, -16, 8, 8, 16 + 0, 0);
      g.sides.forEach((face) => {
        this.poly(face.q, shade(legColor, lit(face.n) + 0.1), p.ink);
      });
      if (i > 1) this.poly(g.top, shade(legColor, 1.15), p.ink);
    });

    const slab = this.box(50, 50, 0, 106, 106, FELT_Z, 0);
    slab.sides.forEach((face) => {
      this.bandedFace(face, [[0, 0.66, p.rail], [0.66, 1, mix(p.rail, '#000000', 0.38)]], 0.95 * lit(face.n) + 0.05, p.ink);
    });
    const rail = this.plane(-3, -3, 103, 103, 4.5, FELT_Z);
    this.poly(rail, p.rail, p.ink, this.lw * 1.5);
    this.poly(this.plane(-1.6, -1.6, 101.6, 101.6, 3.4, FELT_Z), null, p.rim, this.lw * 2);
    this.poly(this.plane(-0.2, -0.2, 100.2, 100.2, 2.6, FELT_Z), null, p.ink, this.lw);
    const felt = this.plane(2.1, 2.1, 97.9, 97.9, 1.8, FELT_Z);
    const top = this.project(50, 2, FELT_Z);
    const bottom = this.project(50, 98, FELT_Z);
    const fg = ctx.createLinearGradient(0, top.y, 0, bottom.y);
    fg.addColorStop(0, shade(p.felt, 1.12));
    fg.addColorStop(1, shade(p.felt, 0.92));
    this.poly(felt, null, null);
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = this.lw;
    ctx.stroke();
    ctx.save();
    ctx.setLineDash([this.k * 2.4, this.k * 1.6]);
    this.poly(this.plane(4.6, 4.6, 95.4, 95.4, 1.2, FELT_Z), null, 'rgba(255,255,255,0.26)', this.lw * 0.9);
    ctx.restore();
  }
}

export type IsoHandle = {
  invalidate: () => void;
  unproject: (event: { clientX: number; clientY: number }, z0?: number) => { x: number; y: number };
  project: (u: number, v: number, z?: number) => { x: number; y: number; f: number };
  /** Canvas size in CSS pixels. */
  size: () => { w: number; h: number };
};

type Handlers = {
  onPointerDown?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
};

/** Fills its positioned parent. `draw` is called whenever the scene is invalidated or a frame is still needed. */
export const IsoCanvas = forwardRef<IsoHandle, { draw: (g: Painter) => void; handlers?: Handlers; className?: string }>(function IsoCanvas({ draw, handlers, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painter = useRef(new Painter());
  const drawRef = useRef(draw);
  const dirty = useRef(true);
  const frame = useRef(0);
  drawRef.current = draw;

  const run = useRef<() => void>(() => {});
  run.current = () => {
    frame.current = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W = Math.max(1, rect.width);
    const H = Math.max(1, rect.height);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const g = painter.current;
    g.setup(ctx, W, H, performance.now());
    dirty.current = false;
    drawRef.current(g);
    if (g.needsFrame || dirty.current) frame.current = requestAnimationFrame(() => run.current());
  };

  const invalidate = () => {
    dirty.current = true;
    if (!frame.current) frame.current = requestAnimationFrame(() => run.current());
  };

  useImperativeHandle(ref, () => ({
    invalidate,
    unproject: (event, z0 = 0) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      painter.current.setup(canvasRef.current!.getContext('2d')!, rect.width, rect.height, performance.now());
      return painter.current.unproject(event.clientX - rect.left, event.clientY - rect.top, z0);
    },
    project: (u, v, z = 0) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      painter.current.W = rect.width;
      painter.current.k = (CAM_SCALE * rect.width) / 100;
      painter.current.cx = rect.width / 2;
      painter.current.cy = rect.height / 2 - CAM_LIFT * rect.width;
      painter.current.P = CAM_PERSP * rect.width;
      return painter.current.project(u, v, z);
    },
    size: () => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    },
  }));

  useEffect(() => {
    onImage = invalidate;
    const canvas = canvasRef.current;
    const observer = new ResizeObserver(() => invalidate());
    if (canvas) observer.observe(canvas);
    const theme = new MutationObserver(() => invalidate());
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    invalidate();
    return () => {
      onImage = null;
      observer.disconnect();
      theme.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, []);

  // every render of the owning board repaints
  useEffect(() => { invalidate(); });

  return <canvas ref={canvasRef} className={`iso-canvas${className ? ` ${className}` : ''}`} {...handlers} />;
});
