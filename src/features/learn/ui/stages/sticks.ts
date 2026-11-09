import type { Painter } from './iso3d';

export type StickValue = 100 | 500 | 1000 | 5000 | 10000;

type Look = { top: string; side: string; dot: string; r: number; dots: Array<[number, number]> };
const grid = (us: number[], vs: number[]): Array<[number, number]> => vs.flatMap((v) => us.map((u): [number, number] => [u, v]));

/** One look for every point stick: the drawer's colours, the same size for all, only the colour and the dots change. */
export const STICK_LOOK: Record<StickValue, Look> = {
  10000: { top: '#e85a52', side: '#b0302c', dot: '#ffffff', r: 2.1, dots: [[0.5, 0.5], [0.34, 0.5], [0.42, 0.5], [0.58, 0.5], [0.66, 0.5], [0.45, 0.3], [0.55, 0.3], [0.45, 0.7], [0.55, 0.7]] },
  5000: { top: '#f6c340', side: '#c98c14', dot: '#d9331f', r: 2.4, dots: [[0.46, 0.3], [0.54, 0.3], [0.5, 0.5], [0.46, 0.7], [0.54, 0.7]] },
  1000: { top: '#4a78e8', side: '#2447a5', dot: '#ffffff', r: 3.2, dots: [[0.5, 0.5]] },
  500: { top: '#2fae86', side: '#1c7a5c', dot: '#ffffff', r: 1.9, dots: grid([0.4, 0.47, 0.54, 0.61], [0.32, 0.68]) },
  100: { top: '#fffdf6', side: '#cfcbbf', dot: '#23203f', r: 1.9, dots: grid([0.4, 0.47, 0.54, 0.61], [0.32, 0.68]) },
};
export const STICK_VALUES: StickValue[] = [10000, 5000, 1000, 500, 100];
export const STICK_LENGTH = 10;
export const STICK_THICK = 1.8;

/** Paints a stick's top face: its dots, sized so they stay round on the stretched face. */
export function paintStickFace(g: Painter, value: StickValue) {
  const look = STICK_LOOK[value];
  const ctx = g.ctx;
  ctx.fillStyle = look.dot;
  look.dots.forEach(([u, v]) => {
    ctx.beginPath();
    ctx.ellipse(u, v, look.r / 150, look.r / 28, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}
