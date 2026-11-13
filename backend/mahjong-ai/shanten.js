// @ts-check
/**
 * Shanten = how many tile swaps a hand is away from tenpai. -1 means the hand is already complete (agari),
 * 0 means tenpai. Rules reference: backend/docs/RIICHI_RULES.md (hand shapes: 4 sets + pair, chiitoitsu, kokushi).
 *
 * All functions take a 34-slot count array (see tiles.js). `openMelds` is the number of called sets
 * (chi/pon/kan) already fixed outside the hand: a hand with k calls holds 13 - 3k (or 14 - 3k) concealed tiles.
 */

/**
 * Regular shape: 4 sets + 1 pair. Classic formula 8 - 2*sets - partials - pair, with sets + partials capped at 4.
 * @param {number[]} counts
 * @param {number} [openMelds]
 */
export function regularShanten(counts, openMelds = 0) {
  const c = [...counts];
  let best = 8;

  /** @param {number} i @param {number} sets @param {number} partials @param {number} pair */
  const dfs = (i, sets, partials, pair) => {
    while (i < 34 && c[i] === 0) i += 1;
    if (i >= 34) {
      const total = sets + openMelds;
      const p = Math.min(partials, 4 - total);
      const s = 8 - 2 * total - p - pair;
      if (s < best) best = s;
      return;
    }
    const numbered = i < 27;
    const pos = i % 9;
    // Complete sets first.
    if (c[i] >= 3) { c[i] -= 3; dfs(i, sets + 1, partials, pair); c[i] += 3; }
    if (numbered && pos <= 6 && c[i + 1] > 0 && c[i + 2] > 0) {
      c[i] -= 1; c[i + 1] -= 1; c[i + 2] -= 1;
      dfs(i, sets + 1, partials, pair);
      c[i] += 1; c[i + 1] += 1; c[i + 2] += 1;
    }
    // Pair (as the head) and partial sets, only while they can still count.
    if (c[i] >= 2 && !pair) { c[i] -= 2; dfs(i, sets, partials, 1); c[i] += 2; }
    if (sets + openMelds + partials < 4) {
      if (c[i] >= 2) { c[i] -= 2; dfs(i, sets, partials + 1, pair); c[i] += 2; }
      if (numbered && pos <= 7 && c[i + 1] > 0) { c[i] -= 1; c[i + 1] -= 1; dfs(i, sets, partials + 1, pair); c[i] += 1; c[i + 1] += 1; }
      if (numbered && pos <= 6 && c[i + 2] > 0) { c[i] -= 1; c[i + 2] -= 1; dfs(i, sets, partials + 1, pair); c[i] += 1; c[i + 2] += 1; }
    }
    // Leave this tile as a floating tile.
    const saved = c[i];
    c[i] = 0;
    dfs(i + 1, sets, partials, pair);
    c[i] = saved;
  };

  dfs(0, 0, 0, 0);
  return best;
}

/** Seven pairs (closed hands only). Four copies of one tile count as one pair. @param {number[]} counts */
export function chiitoitsuShanten(counts) {
  let pairs = 0;
  let kinds = 0;
  for (const n of counts) {
    if (n > 0) kinds += 1;
    if (n >= 2) pairs += 1;
  }
  return 6 - pairs + Math.max(0, 7 - kinds);
}

const KOKUSHI = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

/** Thirteen orphans (closed hands only). @param {number[]} counts */
export function kokushiShanten(counts) {
  let kinds = 0;
  let pair = 0;
  for (const i of KOKUSHI) {
    if (counts[i] > 0) kinds += 1;
    if (counts[i] >= 2) pair = 1;
  }
  return 13 - kinds - pair;
}

/**
 * Best shanten over the three hand shapes. Seven pairs and thirteen orphans only apply to closed hands.
 * @param {number[]} counts
 * @param {number} [openMelds]
 * @returns {{ shanten: number, regular: number, chiitoitsu: number | null, kokushi: number | null }}
 */
export function shantenDetail(counts, openMelds = 0) {
  const regular = regularShanten(counts, openMelds);
  const closed = openMelds === 0;
  const chiitoitsu = closed ? chiitoitsuShanten(counts) : null;
  const kokushi = closed ? kokushiShanten(counts) : null;
  return { shanten: Math.min(regular, chiitoitsu ?? 99, kokushi ?? 99), regular, chiitoitsu, kokushi };
}

/** @param {number[]} counts @param {number} [openMelds] */
export const shanten = (counts, openMelds = 0) => shantenDetail(counts, openMelds).shanten;
