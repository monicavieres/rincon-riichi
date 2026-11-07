import type { Painter } from './iso3d';

export type StickValue = 100 | 500 | 1000 | 5000 | 10000;

/** One look for every point stick in the lessons: the colours of the drawer on the home table. */
export const STICK_LOOK: Record<StickValue, { top: string; side: string; dot: string; dots: number; stripes?: boolean }> = {
  100: { top: '#fffdf6', side: '#d8d6cf', dot: '#23203f', dots: 1, stripes: true },
  500: { top: '#37a56e', side: '#1f7a4d', dot: '#ffffff', dots: 3 },
  1000: { top: '#3a66d8', side: '#2447a5', dot: '#ffffff', dots: 5 },
  5000: { top: '#f2b42c', side: '#c98c14', dot: '#d9701c', dots: 3 },
  10000: { top: '#e04b45', side: '#b0302c', dot: '#ffffff', dots: 5 },
};

/** Paints a stick's top face: the dots along its middle, and two stripes on the plain white one. */
export function paintStickFace(g: Painter, value: StickValue) {
  const look = STICK_LOOK[value];
  const ctx = g.ctx;
  if (look.stripes) {
    ctx.strokeStyle = look.dot;
    ctx.lineWidth = 0.09;
    ctx.beginPath();
    ctx.moveTo(0.08, 0.2); ctx.lineTo(0.92, 0.2);
    ctx.moveTo(0.08, 0.8); ctx.lineTo(0.92, 0.8);
    ctx.stroke();
  }
  ctx.fillStyle = look.dot;
  for (let i = 0; i < look.dots; i += 1) {
    const x = look.dots === 1 ? 0.5 : 0.22 + (0.56 * i) / (look.dots - 1);
    ctx.beginPath();
    ctx.ellipse(x, 0.5, 0.032, 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
