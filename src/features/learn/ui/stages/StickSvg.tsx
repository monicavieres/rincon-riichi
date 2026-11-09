import { useId } from 'react';
import { STICK_LOOK, type StickValue } from './sticks';

const L = 150;
const W = 28;

/** A flat point stick, the same size whatever it is worth. */
export function StickSvg({ value, className = '' }: { value: StickValue; className?: string }) {
  const look = STICK_LOOK[value];
  const id = `stk${useId().replace(/:/g, '')}`;
  return (
    <svg className={`stick-svg ${className}`} viewBox={`0 0 ${L + 3} ${W + 3}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.top} />
          <stop offset=".62" stopColor={look.top} />
          <stop offset="1" stopColor={look.side} />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width={L} height={W} rx={W / 2.8} fill={`url(#${id})`} stroke="#23203f" strokeWidth="3" />
      <rect x="7" y="5" width={L - 12} height="2.6" rx="1.3" fill="#fff" opacity=".4" />
      {look.dots.map(([u, v], i) => <circle key={i} cx={1.5 + L * u} cy={1.5 + W * v} r={look.r} fill={look.dot} />)}
    </svg>
  );
}
