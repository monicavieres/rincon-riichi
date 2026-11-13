import type { ReactNode } from 'react';
import { tilePath } from './SortBoard';

const CODE = /(?<![\w])([0-9][mpsz])(?![\w])/g;

/** Turns tile codes inside a sentence ("4p", "7s") into the tile picture, sized like the text around it. */
export function withTiles(text: ReactNode): ReactNode {
  if (typeof text !== 'string') return text;
  const parts = text.split(CODE);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 ? <img key={i} className="inline-tile" src={tilePath(part === '0p' ? '0p' : part)} alt={part} /> : part));
}
