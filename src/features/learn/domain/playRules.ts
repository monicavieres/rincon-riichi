/** Tile codes: "1m".."9m", "1p".."9p", "1s".."9s", "1z".."7z". Counts are indexed suit by suit (m, p, s, z). */
export const SUITS = ['m', 'p', 's', 'z'] as const;
export const ALL_TILES: string[] = SUITS.flatMap((suit, s) => Array.from({ length: s === 3 ? 7 : 9 }, (_, i) => `${i + 1}${suit}`));
const indexOf = (code: string) => ALL_TILES.indexOf(code);

export const toCounts = (codes: string[]) => {
  const counts = Array(34).fill(0) as number[];
  codes.forEach((code) => { counts[indexOf(code)] += 1; });
  return counts;
};

/** Can these counts be split into only sets (sequences and triplets)? */
function onlySets(c: number[], from = 0): boolean {
  let i = from;
  while (i < 34 && c[i] === 0) i += 1;
  if (i >= 34) return true;
  if (c[i] >= 3) { c[i] -= 3; const ok = onlySets(c, i); c[i] += 3; if (ok) return true; }
  const numbered = i < 27 && i % 9 <= 6;
  if (numbered && c[i + 1] > 0 && c[i + 2] > 0) {
    c[i] -= 1; c[i + 1] -= 1; c[i + 2] -= 1;
    const ok = onlySets(c, i);
    c[i] += 1; c[i + 1] += 1; c[i + 2] += 1;
    if (ok) return true;
  }
  return false;
}

/** A complete hand: 4 sets and 1 pair. */
export function isComplete(codes: string[]): boolean {
  if (codes.length !== 14) return false;
  const c = toCounts(codes);
  for (let i = 0; i < 34; i += 1) {
    if (c[i] >= 2) { c[i] -= 2; const ok = onlySets(c); c[i] += 2; if (ok) return true; }
  }
  return false;
}

/** The tiles that would complete a 13-tile hand. */
export const waitsOf = (hand: string[]) => ALL_TILES.filter((tile) => isComplete([...hand, tile]));

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(list: T[]) => list[rand(list.length)];

/** A random 13-tile hand one tile away from winning, built from a complete hand with one tile taken out. */
export function startingHand(): string[] {
  for (;;) {
    const tiles: string[] = [];
    for (let k = 0; k < 4; k += 1) {
      const suit = pick(['m', 'p', 's']);
      const n = 1 + rand(9);
      if (rand(3) === 0) tiles.push(`${n}${suit}`, `${n}${suit}`, `${n}${suit}`);
      else { const s = 1 + rand(7); tiles.push(`${s}${suit}`, `${s + 1}${suit}`, `${s + 2}${suit}`); }
    }
    const pairSuit = pick(['m', 'p', 's', 'z']);
    const pn = pairSuit === 'z' ? 1 + rand(7) : 1 + rand(9);
    tiles.push(`${pn}${pairSuit}`, `${pn}${pairSuit}`);
    if (Math.max(...toCounts(tiles)) > 4) continue;
    const hand = [...tiles];
    hand.splice(rand(hand.length), 1);
    if (waitsOf(hand).length > 0 && Math.max(...toCounts(hand)) <= 4) return sortHand(hand);
  }
}

export const sortHand = (hand: string[]) => [...hand].sort((a, b) => indexOf(a) - indexOf(b));
