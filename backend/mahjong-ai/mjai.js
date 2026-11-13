// @ts-check
/**
 * Translation between the site's tile codes and the mjai protocol (https://mjai.app, used by Mortal and akochan).
 *
 * mjai tiles: "1m".."9m", "1p".."9p", "1s".."9s" (same as ours), red fives "5mr" "5pr" "5sr",
 * honors "E" "S" "W" "N" (winds) and "P" "F" "C" (white / haku, green / hatsu, red / chun), "?" for a hidden tile.
 * Seats ("actor") are 0-3 counted from the first dealer (East at the start of the game).
 */
import { isValidTile } from './tiles.js';

const HONORS = ['E', 'S', 'W', 'N', 'P', 'F', 'C'];

/** @param {string} code site code -> mjai tile */
export function toMjaiTile(code) {
  if (!isValidTile(code)) throw new TypeError(`Invalid tile code: ${JSON.stringify(code)}`);
  if (code[1] === 'z') return HONORS[Number(code[0]) - 1];
  if (code[0] === '0') return `5${code[1]}r`;
  return code;
}

/** @param {string} pai mjai tile -> site code */
export function fromMjaiTile(pai) {
  const h = HONORS.indexOf(pai);
  if (h >= 0) return `${h + 1}z`;
  if (/^5[mps]r$/.test(pai)) return `0${pai[1]}`;
  if (/^[1-9][mps]$/.test(pai)) return pai;
  throw new TypeError(`Not an mjai tile: ${JSON.stringify(pai)}`);
}

const WIND_TO_MJAI = { '1z': 'E', '2z': 'S', '3z': 'W', '4z': 'N' };

/**
 * Builds the minimal mjai event log that puts a bot in the position "seat 0 just drew `hand[13]`".
 * Opponents' hands are hidden ("?"). Their discards are not replayed (the site's state has no turn order),
 * which is enough for a discard suggestion but loses Mortal's defensive reads; a full game should send the real log.
 *
 * @param {{ hand: string[], seatWind?: string | null, roundWind?: string | null, doraIndicators?: string[],
 *   kyoku?: number, honba?: number, kyotaku?: number, scores?: number[] }} state
 *   `hand` holds 14 tiles: 13 dealt plus the drawn one last.
 */
export function buildMjaiEvents(state) {
  if (state.hand.length !== 14) throw new RangeError('buildMjaiEvents expects 14 tiles (13 + the drawn tile last)');
  const seat = 0;
  const seatWind = state.seatWind ?? '1z';
  // With actor 0 as the seat, the dealer (oya) is the player whose seat wind is East.
  const oya = (4 - (Number(seatWind[0]) - 1)) % 4;
  const tehais = [0, 1, 2, 3].map((p) => (p === seat ? state.hand.slice(0, 13).map(toMjaiTile) : new Array(13).fill('?')));
  const [firstIndicator = '1z'] = state.doraIndicators ?? [];
  return [
    { type: 'start_game', id: seat, names: ['rincon', 'cpu1', 'cpu2', 'cpu3'] },
    {
      type: 'start_kyoku',
      bakaze: WIND_TO_MJAI[/** @type {keyof typeof WIND_TO_MJAI} */ (state.roundWind ?? '1z')],
      dora_marker: toMjaiTile(firstIndicator),
      kyoku: state.kyoku ?? oya + 1,
      honba: state.honba ?? 0,
      kyotaku: state.kyotaku ?? 0,
      oya,
      scores: state.scores ?? [25000, 25000, 25000, 25000],
      tehais,
    },
    ...(state.doraIndicators ?? []).slice(1).map((ind) => ({ type: 'dora', dora_marker: toMjaiTile(ind) })),
    { type: 'tsumo', actor: seat, pai: toMjaiTile(state.hand[13]) },
  ];
}
