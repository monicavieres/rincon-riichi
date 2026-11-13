// @ts-check
/**
 * Tile codes used by the whole site (see backend/docs/TILE_SET.md):
 *   "1m".."9m", "1p".."9p", "1s".."9s", "1z".."7z" (1z-4z = E S W N winds, 5z-7z = white, green, red dragons)
 *   "0m", "0p", "0s" = red fives (aka dora). For shape they are a 5; they only carry an extra dora mark.
 *
 * Internally the engine works with a 34-slot count array: index = suitOffset + rank - 1,
 * suit offsets m=0, p=9, s=18, z=27.
 */

export const SUITS = /** @type {const} */ (['m', 'p', 's', 'z']);

/** The 34 tile identities in index order. */
export const TILE_TYPES = SUITS.flatMap((suit, s) => Array.from({ length: s === 3 ? 7 : 9 }, (_, i) => `${i + 1}${suit}`));

const CODE_RE = /^([0-9])([mpsz])$/;

/** @param {string} code */
export function isValidTile(code) {
  const m = CODE_RE.exec(code);
  if (!m) return false;
  const rank = Number(m[1]);
  if (m[2] === 'z') return rank >= 1 && rank <= 7;
  return rank >= 0 && rank <= 9;
}

/** "0p" -> "5p"; every other valid code is returned as is. @param {string} code */
export function normalizeTile(code) {
  return code[0] === '0' ? `5${code[1]}` : code;
}

/** @param {string} code */
export const isRedFive = (code) => code[0] === '0';

/** @param {string} code */
export function tileIndex(code) {
  if (!isValidTile(code)) throw new TypeError(`Invalid tile code: ${JSON.stringify(code)}`);
  const n = normalizeTile(code);
  return SUITS.indexOf(/** @type {any} */ (n[1])) * 9 + Number(n[0]) - 1;
}

/** @param {number} index */
export const tileCode = (index) => TILE_TYPES[index];

/** Honors (winds and dragons). @param {number} i */
export const isHonor = (i) => i >= 27;
/** Ones and nines. @param {number} i */
export const isTerminal = (i) => i < 27 && (i % 9 === 0 || i % 9 === 8);
/** @param {number} i */
export const isSimple = (i) => !isHonor(i) && !isTerminal(i);

/**
 * Accepts either an array of codes or a compact string such as "123m406p55z" (digits followed by their suit).
 * Spaces and commas are ignored in the compact form.
 * @param {string[] | string} input
 * @returns {string[]}
 */
export function parseTiles(input) {
  if (Array.isArray(input)) {
    for (const code of input) {
      if (typeof code !== 'string' || !isValidTile(code)) throw new TypeError(`Invalid tile code: ${JSON.stringify(code)}`);
    }
    return [...input];
  }
  if (typeof input !== 'string') throw new TypeError('Tiles must be an array of codes or a compact string');
  const out = [];
  let digits = '';
  for (const ch of input.replace(/[\s,]/g, '')) {
    if (/[0-9]/.test(ch)) digits += ch;
    else if (/[mpsz]/.test(ch)) {
      if (!digits) throw new TypeError(`Suit "${ch}" without ranks in ${JSON.stringify(input)}`);
      for (const d of digits) {
        const code = `${d}${ch}`;
        if (!isValidTile(code)) throw new TypeError(`Invalid tile code: ${JSON.stringify(code)}`);
        out.push(code);
      }
      digits = '';
    } else throw new TypeError(`Unexpected character "${ch}" in ${JSON.stringify(input)}`);
  }
  if (digits) throw new TypeError(`Ranks "${digits}" without a suit in ${JSON.stringify(input)}`);
  return out;
}

/** @param {string[]} codes @returns {number[]} */
export function toCounts(codes) {
  const counts = new Array(34).fill(0);
  for (const code of codes) counts[tileIndex(code)] += 1;
  return counts;
}

/** Sorts codes m, p, s, z and by rank (red five sits with the fives). @param {string[]} codes */
export function sortTiles(codes) {
  return [...codes].sort((a, b) => tileIndex(a) - tileIndex(b) || (isRedFive(a) ? -1 : 0) - (isRedFive(b) ? -1 : 0));
}

/**
 * The dora a given indicator points to (next tile in the suit; winds E>S>W>N>E, dragons white>green>red>white).
 * @param {string} indicator
 */
export function doraFromIndicator(indicator) {
  const i = tileIndex(indicator);
  if (i < 27) return tileCode(Math.floor(i / 9) * 9 + ((i % 9) + 1) % 9);
  if (i < 31) return tileCode(27 + ((i - 27 + 1) % 4));
  return tileCode(31 + ((i - 31 + 1) % 3));
}
